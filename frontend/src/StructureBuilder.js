import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import axios from "axios";
import "./StructureBuilder.css";
import API_BASE_URL from './config';

const SHAPES = ["Pyramid", "Cube", "Cuboid", "Sphere", "Cylinder", "Cone"];
const STRUCTURE_TYPES = ["Solid", "Honeycomb", "Bone", "Mesh"];

const SHAPE_COLORS = {
  Pyramid: { primary: 0x00e5ff },
  Cube: { primary: 0x7c4dff },
  Cuboid: { primary: 0x00e676 },
  Sphere: { primary: 0xff9100 },
  Cylinder: { primary: 0xe040fb },
  Cone: { primary: 0xffd740 },
};

function buildGeometry(shape, diameter) {
  const r = diameter / 200;
  switch (shape) {
    case "Pyramid": return new THREE.ConeGeometry(r, r * 1.6, 4);
    case "Cube": return new THREE.BoxGeometry(r * 1.4, r * 1.4, r * 1.4);
    case "Cuboid": return new THREE.BoxGeometry(r * 1.8, r * 1.1, r * 1.1);
    case "Sphere": return new THREE.SphereGeometry(r * 0.8, 32, 32);
    case "Cylinder": return new THREE.CylinderGeometry(r * 0.6, r * 0.6, r * 1.5, 32);
    case "Cone": return new THREE.ConeGeometry(r * 0.8, r * 1.8, 32);
    default: return new THREE.BoxGeometry(r, r, r);
  }
}

function buildCrackTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  ctx.strokeStyle = "rgba(255,0,0,0.8)";
  ctx.lineWidth = 4;

  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo(512, 300);
    ctx.lineTo(
      512 + Math.cos(i) * (200 + Math.random() * 200),
      300 + Math.sin(i) * (200 + Math.random() * 200)
    );
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

function Gauge({ value, max, label, color }) {
  const pct = Math.min(1, value / max);
  const angle = pct * 220 - 110;
  const r = 38, cx = 50, cy = 54;
  const toXY = (deg) => {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const start = toXY(-110), end = toXY(angle);
  const large = pct > 0.5 ? 1 : 0;
  return (
    <svg viewBox="0 0 100 70" style={{ width: "100%", maxWidth: 120 }}>
      <path d={`M ${toXY(-110).x} ${toXY(-110).y} A ${r} ${r} 0 1 1 ${toXY(110).x} ${toXY(110).y}`} fill="none" stroke="#1a2a3a" strokeWidth="6"/>
      <path d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`} fill="none" stroke={color} strokeWidth="6"/>
      <text x={cx} y={cy} textAnchor="middle" fill="#fff">{Math.round(value)}</text>
      <text x={cx} y={cy+12} textAnchor="middle" fill="#7090a0">{label}</text>
    </svg>
  );
}

function StructureViewer({ shape, diameter, structureType, dropTrigger, onDropComplete }) {

  const mountRef = useRef();
  const stateRef = useRef({});

  useEffect(() => {

    const el = mountRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, el.clientWidth/el.clientHeight, 0.1, 100);
    camera.position.set(0,1.5,5);

    scene.add(new THREE.AmbientLight(0xffffff,1));

    const light = new THREE.DirectionalLight(0xffffff,2);
    light.position.set(3,5,3);
    scene.add(light);

    const colors = SHAPE_COLORS[shape];

    const geo = buildGeometry(shape, diameter);

    const damageUniform = { value: 0 };

    const mat = new THREE.MeshPhysicalMaterial({
      color: colors.primary,
      metalness: 0.5,
      roughness: 0.4
    });

    mat.onBeforeCompile = shader => {

      shader.uniforms.damageLevel = damageUniform;

      shader.vertexShader =
        "varying float vHeight;\n" + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>
        vHeight = position.y;
        `
      );

      shader.fragmentShader =
        "uniform float damageLevel;\n varying float vHeight;\n" + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `
        float spread = smoothstep(-0.5,0.8,vHeight);
        float damage = damageLevel * spread;

        vec3 red = vec3(0.8,0.1,0.1);

        gl_FragColor.rgb = mix(gl_FragColor.rgb, red, damage);

        #include <dithering_fragment>
        `
      );

      mat.userData.shader = shader;
    };

    mat.userData.damageUniform = damageUniform;

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const crackMesh = new THREE.Mesh(
      geo.clone(),
      new THREE.MeshBasicMaterial({
        transparent:true,
        opacity:0
      })
    );

    mesh.add(crackMesh);

    const weightMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5,0.25,0.5),
      new THREE.MeshStandardMaterial({color:0x888888})
    );

    weightMesh.position.y = 3.5;
    weightMesh.visible = false;
    scene.add(weightMesh);

    stateRef.current = {
      renderer,
      scene,
      camera,
      mesh,
      weightMesh,
      crackMesh,
      mat
    };

    function animate(){
      requestAnimationFrame(animate);
      renderer.render(scene,camera);
    }

    animate();

    return ()=>{
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };

  },[shape,diameter]);

  useEffect(()=>{

    if(!dropTrigger) return;

    const st = stateRef.current;

    const ratio = dropTrigger.stats.load_ratio;

    const damageLevel =
      THREE.MathUtils.clamp((ratio-0.8)/0.2,0.25,1);

    if(st.mat.userData.damageUniform)
      st.mat.userData.damageUniform.value = damageLevel;

    if(ratio>=1){
      st.crackMesh.material.map = buildCrackTexture();
      st.crackMesh.material.opacity = damageLevel;
      st.crackMesh.material.needsUpdate = true;
      onDropComplete("failure");
    }
    else{
      onDropComplete("pass");
    }

  },[dropTrigger]);

  return <div ref={mountRef} style={{width:"100%",height:"100%"}} />;
}

export default function StructureBuilder(){

  const [shape,setShape]=useState("Cube");
  const [diameter,setDiameter]=useState(200);
  const [weight,setWeight]=useState(10);
  const [structureType,setStructureType]=useState("Solid");
  const [stats,setStats]=useState(null);
  const [dropTrigger,setDropTrigger]=useState(null);
  const [simResult,setSimResult]=useState(null);

  const fetchStats = async()=>{
    const res = await axios.post(`${API_BASE_URL}/api/analyze-structure`,{
      shape,
      structure_type:structureType,
      diameter,
      weight
    });
    setStats(res.data.stats);
  };

  useEffect(()=>{
    fetchStats();
  },[shape,diameter,weight,structureType]);

  const handleDrop=()=>{
    setDropTrigger({
      stats,
      ts:Date.now()
    });
  };

  return (
    <div className="structure-page">

      <StructureViewer
        shape={shape}
        diameter={diameter}
        structureType={structureType}
        dropTrigger={dropTrigger}
        onDropComplete={setSimResult}
      />

      <button onClick={handleDrop}>
        Drop Load
      </button>

      {simResult==="failure" && <div>FAILED</div>}
      {simResult==="pass" && <div>STABLE</div>}

    </div>
  );
}