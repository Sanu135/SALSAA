import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import axios from "axios";
import "./StructureBuilder.css";
import API_BASE_URL from './config';

// ─── Constants ───────────────────────────────────────────────────────────────
const SHAPES = ["Pyramid", "Cube", "Cuboid", "Sphere", "Cylinder", "Cone"];
const STRUCTURE_TYPES = ["Solid", "Honeycomb", "Bone", "Mesh"];

const SHAPE_COLORS = {
  Pyramid: { primary: 0x00e5ff, secondary: 0xff2d55, wireframe: 0x00bcd4 },
  Cube: { primary: 0x7c4dff, secondary: 0xff6d00, wireframe: 0x651fff },
  Cuboid: { primary: 0x00e676, secondary: 0xff1744, wireframe: 0x00c853 },
  Sphere: { primary: 0xff9100, secondary: 0x00e5ff, wireframe: 0xff6d00 },
  Cylinder: { primary: 0xe040fb, secondary: 0x69f0ae, wireframe: 0xce93d8 },
  Cone: { primary: 0xffd740, secondary: 0xff4081, wireframe: 0xffc400 },
};

// ─── Geometry Builders ────────────────────────────────────────────────────────
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

// ─── Crack Texture Generator ──────────────────────────────────────────────────
function buildCrackTexture(isFailed) {
  const SIZE = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, SIZE, SIZE);

  const crackCount = isFailed ? 16 : 7;
  const cx = SIZE / 2, cy = SIZE * 0.35;

  const drawBranch = (x0, y0, angle, length, depth, alpha) => {
    if (depth <= 0 || length < 6) return;
    const steps = Math.max(3, Math.floor(length / 15));
    const points = [[x0, y0]];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const nx = x0 + Math.cos(angle) * length * t + (Math.random() - 0.5) * 18;
      const ny = y0 + Math.sin(angle) * length * t + (Math.random() - 0.5) * 18;
      points.push([nx, ny]);
    }
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.strokeStyle = `rgba(255,50,0,${alpha * 0.28})`;
    ctx.lineWidth = (depth + 2) * 3.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "#ff3300";
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.strokeStyle = `rgba(200,20,0,${alpha * 0.88})`;
    ctx.lineWidth = Math.max(0.8, depth * 1.1);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.strokeStyle = `rgba(255,220,120,${alpha * 0.55})`;
    ctx.lineWidth = Math.max(0.3, depth * 0.4);
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    const numBranches = depth >= 3 ? 2 : 1;
    for (let b = 0; b < numBranches; b++) {
      if (Math.random() < 0.72) {
        const spread = (Math.PI / 6) + Math.random() * (Math.PI / 5);
        const dir = Math.random() < 0.5 ? 1 : -1;
        const branchAt = points[Math.floor(points.length * (0.5 + Math.random() * 0.4))];
        drawBranch(branchAt[0], branchAt[1], angle + dir * spread, length * (0.4 + Math.random() * 0.3), depth - 1, alpha * 0.72);
      }
    }
  };

  for (let i = 0; i < crackCount; i++) {
    const baseAngle = (i / crackCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const len = (isFailed ? 200 : 110) + Math.random() * (isFailed ? 130 : 60);
    drawBranch(cx, cy, baseAngle, len, isFailed ? 5 : 3, isFailed ? 1.0 : 0.78);
  }

  if (isFailed) {
    for (let ring = 0; ring < 3; ring++) {
      const radius = 55 + ring * 65 + Math.random() * 25;
      const segments = 12 + ring * 4;
      ctx.save();
      ctx.strokeStyle = `rgba(180,30,0,${0.28 - ring * 0.06})`;
      ctx.lineWidth = 1.2 - ring * 0.3;
      ctx.setLineDash([8 + ring * 3, 10 + ring * 4]);
      ctx.shadowColor = "#ff2200";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let s = 0; s <= segments; s++) {
        const a = (s / segments) * Math.PI * 2;
        const r = radius + (Math.random() - 0.5) * 20;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  const epicR = isFailed ? 60 : 36;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, epicR);
  grad.addColorStop(0, "rgba(255,255,210,0.95)");
  grad.addColorStop(0.18, "rgba(255,120,0,0.75)");
  grad.addColorStop(0.5, "rgba(220,30,0,0.35)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath();
  ctx.arc(cx, cy, epicR, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ─── Gauge Component ─────────────────────────────────────────────────────────
function Gauge({ value, max, label, color }) {
  const pct = Math.min(1, value / max);
  const r = 38, cx = 50, cy = 50;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", maxWidth: 120 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2a3a" strokeWidth="6" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x={cx} y={cy - 1} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">{Math.round(value)}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#7090a0" fontSize="7">{label}</text>
    </svg>
  );
}

// ─── 3D Viewer ───────────────────────────────────────────────────────────────
function StructureViewer({ shape, diameter, structureType, loadRatio, dropTrigger, onDropComplete }) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    renderer: null, scene: null, camera: null, mesh: null,
    weightMesh: null, weightVelocity: 0, weightY: 3.5,
    dropping: false, settled: false, failed: false,
    raf: null, shapeY: 0, shapeVibration: 0,
    squishScale: 1, particles: [], particleSystem: null,
    crackMesh: null,
  });

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const st = stateRef.current;
    if (st.raf) cancelAnimationFrame(st.raf);
    if (st.renderer) {
      st.renderer.dispose();
      if (el.contains(st.renderer.domElement)) el.removeChild(st.renderer.domElement);
    }

    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x112233, 1.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(3, 5, 3); dirLight.castShadow = true;
    scene.add(dirLight);
    const rimLight2 = new THREE.PointLight(0x00e5ff, 2, 10);
    rimLight2.position.set(-2, 0, -2);
    scene.add(rimLight2);

    const grid = new THREE.GridHelper(8, 24, 0x0a2030, 0x0a2030);
    grid.position.y = -1.1; scene.add(grid);

    const colors = SHAPE_COLORS[shape];
    const geo = buildGeometry(shape, diameter);
    const mat = new THREE.MeshPhysicalMaterial({
      color: colors.primary,
      emissive: new THREE.Color(colors.primary).multiplyScalar(0.08),
      metalness: structureType === "Solid" ? 0.6 : 0.3,
      roughness: structureType === "Mesh" ? 0.9 : 0.4,
      transparent: structureType === "Mesh",
      opacity: structureType === "Mesh" ? 0.7 : 1,
      wireframe: structureType === "Mesh",
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true; mesh.receiveShadow = true;
    scene.add(mesh);

    const crackGeo = geo.clone();
    const crackMat = new THREE.MeshBasicMaterial({
      transparent: true, opacity: 0, depthWrite: false, side: THREE.FrontSide,
    });
    const crackMesh = new THREE.Mesh(crackGeo, crackMat);
    crackMesh.scale.set(1.003, 1.003, 1.003);
    mesh.add(crackMesh);

    const weightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.5), new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.9 }));
    weightMesh.castShadow = true;
    weightMesh.position.set(0, 3.5, 0); weightMesh.visible = false;
    scene.add(weightMesh);

    const pCount = 80;
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pCount * 3), 3));
    const pMat = new THREE.PointsMaterial({ color: 0xff5500, size: 0.07, transparent: true, opacity: 0.9 });
    const particleSystem = new THREE.Points(pGeo, pMat);
    particleSystem.visible = false; scene.add(particleSystem);
    const particles = Array.from({ length: pCount }, () => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0 }));

    Object.assign(stateRef.current, {
      renderer, scene, camera, mesh, weightMesh, crackMesh,
      particles, particleSystem,
    });

    let time = 0;
    const animate = () => {
      stateRef.current.raf = requestAnimationFrame(animate);
      time += 0.016;
      const st = stateRef.current;

      if (!st.dropping && !st.settled) {
        mesh.rotation.y += 0.006;
        mesh.position.y = Math.sin(time * 0.8) * 0.04;
      }

      if (st.dropping) {
        st.weightVelocity += 0.018;
        st.weightY -= st.weightVelocity;
        const targetY = st.shapeTopY + 0.125;
        if (st.weightY <= targetY) {
          st.weightY = targetY;
          st.weightVelocity = 0;
          st.dropping = false;
          st.settled = true;
          const isFailed = st.stats?.failed;
          st.failed = isFailed;
          st.shapeVibration = isFailed ? 0.14 : 0.07;
          st.squishScale = isFailed ? 0.58 : 0.86;

          const crackTex = buildCrackTexture(isFailed);
          st.crackMesh.material.map = crackTex;
          st.crackMesh.material.opacity = isFailed ? 1.0 : 0.85;
          st.crackMesh.material.needsUpdate = true;

          if (isFailed) {
            mat.color.set(0x774422);
            mat.emissive.set(0x220800);
          }

          particleSystem.visible = true;
          st.particles.forEach(p => {
            p.x = 0; p.y = targetY; p.z = 0;
            p.vx = (Math.random() - 0.5) * (isFailed ? 0.24 : 0.12);
            p.vy = Math.random() * (isFailed ? 0.2 : 0.1) + 0.03;
            p.vz = (Math.random() - 0.5) * (isFailed ? 0.24 : 0.12);
            p.life = 1.0;
          });
          if (onDropComplete) onDropComplete(isFailed ? "failure" : "pass");
        }
        weightMesh.position.y = st.weightY;
      }

      if (st.settled) {
        st.squishScale += (1.0 - st.squishScale) * 0.08;
        if (st.shapeVibration > 0.001) {
          mesh.position.x = Math.sin(time * 40) * st.shapeVibration;
          mesh.position.z = Math.cos(time * 37) * st.shapeVibration * 0.5;
          st.shapeVibration *= 0.88;
        } else { mesh.position.x = 0; mesh.position.z = 0; }
        mesh.scale.y = st.squishScale;
        weightMesh.position.y = st.shapeTopY + 0.125;
      }

      if (particleSystem.visible) {
        const pos = pGeo.attributes.position;
        let anyAlive = false;
        st.particles.forEach((p, i) => {
          if (p.life > 0) {
            anyAlive = true;
            p.x += p.vx; p.y += p.vy; p.z += p.vz; p.vy -= 0.006; p.life -= 0.022;
            pos.setXYZ(i, p.x, p.y, p.z);
          } else { pos.setXYZ(i, 0, -10, 0); }
        });
        pos.needsUpdate = true;
        if (!anyAlive) particleSystem.visible = false;
      }
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => { renderer.setSize(el.clientWidth, el.clientHeight); camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix(); };
    window.addEventListener("resize", resize);
    return () => {
      if(st.raf) cancelAnimationFrame(st.raf);
      window.removeEventListener("resize", resize);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [shape, diameter, structureType, onDropComplete]);

  useEffect(() => {
    if (!dropTrigger) return;
    const st = stateRef.current;
    if (!st.weightMesh || !st.mesh) return;
    const colors = SHAPE_COLORS[shape];
    if (st.mesh.material) {
      st.mesh.material.color.set(colors.primary);
      st.mesh.material.emissive.set(new THREE.Color(colors.primary).multiplyScalar(0.08));
    }
    if (st.crackMesh) { st.crackMesh.material.opacity = 0; st.crackMesh.material.map = null; st.crackMesh.material.needsUpdate = true; }
    st.mesh.scale.set(1, 1, 1); st.mesh.position.set(0, 0, 0);
    const geo = st.mesh.geometry;
    if (!geo.boundingBox) geo.computeBoundingBox();
    st.shapeTopY = geo.boundingBox ? geo.boundingBox.max.y : 0.7;
    st.stats = dropTrigger.stats;
    st.weightMesh.visible = true; st.weightMesh.position.set(0, 3.5, 0); st.weightY = 3.5; st.weightVelocity = 0;
    st.dropping = true; st.settled = false; st.failed = false; st.squishScale = 1; st.shapeVibration = 0;
  }, [dropTrigger, shape]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StructureBuilder() {
  const [shape, setShape] = useState("Pyramid");
  const [diameter, setDiameter] = useState(200);
  const [weight, setWeight] = useState(10);
  const [structureType, setStructureType] = useState("Solid");
  const [stats, setStats] = useState(null);
  const [simResult, setSimResult] = useState(null);
  const [dropping, setDropping] = useState(false);
  const [dropTrigger, setDropTrigger] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${API_BASE_URL}/analyze-structure`, {
        shape,
        structure_type: structureType,
        diameter,
        weight,
      });
      setStats(res.data.stats);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to analysis engine.");
      setLoading(false);
    }
  }, [shape, diameter, weight, structureType]);

  useEffect(() => {
    fetchStats();
    setSimResult(null);
    setDropTrigger(null);
  }, [fetchStats]);

  const handleDropLoad = () => {
    if (dropping || !stats) return;
    setDropping(true); setSimResult(null);
    setDropTrigger({ stats, ts: Date.now() });
  };

  const handleDropComplete = useCallback((result) => { setSimResult(result); setDropping(false); }, []);

  const gaugeColor = (v, max) => { const p = v / max; return p > 0.75 ? "#00e676" : p > 0.4 ? "#ffd740" : "#ff1744"; };

  if (error) return (
    <div className="structure-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
      <div><h2 style={{ color: '#ff5252' }}>CONNECTION ERROR</h2><p style={{ color: '#ff174490', marginTop: 10 }}>{error}</p></div>
    </div>
  );

  if (loading && !stats) return (
    <div className="structure-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p style={{ letterSpacing: 4, color: '#00e5ff' }}>INITIALIZING ENGINE...</p>
    </div>
  );

  return (
    <div className="structure-page">
      <div className="section-header">
        <div className="section-title">Structure Builder</div>
        {/* advanced structural simulation & analysis engine */}
        <div className="section-sub"></div>
      </div>

      <div className="viewer-container">
        <div className="corner-dot" style={{ top: 8, left: 8 }} /><div className="corner-dot" style={{ top: 8, right: 8 }} />
        <div className="corner-dot" style={{ bottom: 8, left: 8 }} /><div className="corner-dot" style={{ bottom: 8, right: 8 }} />
        <div className="viewer-label">3D SIMULATION VIEWER</div>
        <div className="load-display">LOAD: {weight}kg</div>
        <div className="shape-indicator">{shape} · {structureType} · ⌀{diameter}px</div>
        {dropping && <div className="drop-indicator" style={{ color: "#ffd740", position: 'absolute', bottom: 14, right: 20, zIndex: 10, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>⬇ DROPPING...</div>}
        {simResult === "failure" && !dropping && <div className="drop-indicator" style={{ color: "#ff1744", position: 'absolute', bottom: 14, right: 20, zIndex: 10, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>⚠ FAILED</div>}
        {simResult === "pass" && !dropping && <div className="drop-indicator" style={{ color: "#00e676", position: 'absolute', bottom: 14, right: 20, zIndex: 10, fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 }}>✓ STABLE</div>}
        <StructureViewer shape={shape} diameter={diameter} structureType={structureType} loadRatio={stats?.load_ratio} dropTrigger={dropTrigger} onDropComplete={handleDropComplete} />
      </div>

      <div className="panels-row">
        <div className="panel">
          <div className="panel-title">Control Panel</div>
          <div className="control-group">
            <div className="control-label">Shape <span className="control-value">{shape}</span></div>
            <select value={shape} onChange={e => setShape(e.target.value)}>{SHAPES.map(s => <option key={s}>{s}</option>)}</select>
          </div>
          <div className="control-group">
            <div className="control-label">Diameter <span className="control-value">{diameter}px</span></div>
            <input type="range" min={80} max={400} value={diameter} onChange={e => setDiameter(Number(e.target.value))} style={{ "--pct": `${((diameter - 80) / 320) * 100}%` }} />
          </div>
          <div className="control-group">
            <div className="control-label">Weight / Load <span className="control-value">{weight}kg</span></div>
            <input type="range" min={1} max={150} value={weight} onChange={e => setWeight(Number(e.target.value))} style={{ "--pct": `${((weight - 1) / 149) * 100}%` }} />
          </div>
          <div className="control-group">
            <div className="control-label">Structure Type <span className="control-value">{structureType}</span></div>
            <select value={structureType} onChange={e => setStructureType(e.target.value)}>{STRUCTURE_TYPES.map(t => <option key={t}>{t}</option>)}</select>
          </div>
          <button className="drop-btn" onClick={handleDropLoad} disabled={dropping || loading}>{loading ? "Updating..." : dropping ? "● Simulating..." : "⬇ Drop Load"}</button>
          {simResult === "failure" && (<div className="failure-badge"><span style={{ color: "#ff1744", fontSize: 16 }}>⚠</span><div><div style={{ color: "#ff5252", fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>STRUCTURAL FAILURE</div><div style={{ color: "#ff174490", fontSize: 11, fontFamily: "monospace" }}>load exceeds failure threshold</div></div></div>)}
          {simResult === "pass" && (<div className="pass-badge"><span style={{ color: "#00e676", fontSize: 16 }}>✓</span><div><div style={{ color: "#00e676", fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>STRUCTURE STABLE</div><div style={{ color: "#00e67690", fontSize: 11, fontFamily: "monospace" }}>within load tolerance</div></div></div>)}
        </div>

        <div className="panel">
          <div className="panel-title">Statistics Panel</div>
          <div className="gauge-row">
            {[{ v: stats.strength, max: 100, label: "STR", name: "STRENGTH" }, { v: stats.efficiency, max: 100, label: "EFF", name: "EFFICIENCY" }, { v: Math.round((1 - stats.load_ratio) * 100), max: 100, label: "INT", name: "INTEGRITY" }].map(g => (
              <div key={g.name} style={{ textAlign: "center" }}>
                <Gauge value={g.v} max={g.max} label={g.label} color={gaugeColor(g.v, g.max)} />
                <div style={{ fontSize: 10, color: "#4a8099", letterSpacing: 2, marginTop: 2 }}>{g.name}</div>
              </div>
            ))}
          </div>
          {[
            { name: "Strength", val: `${stats.strength}%`, bar: stats.strength, max: 100, color: "#00e676" },
            { name: "Max Load", val: `${(stats.max_load / 1000).toFixed(1)} t`, bar: stats.max_load, max: 10000, color: "#00e5ff" },
            { name: "Material", val: `${stats.material} m³`, bar: stats.material, max: 4, color: "#7c4dff" },
            { name: "Efficiency", val: `${stats.efficiency}%`, bar: stats.efficiency, max: 150, color: "#ffd740" },
            { name: "Failure Point", val: `${(stats.failure_point / 1000).toFixed(1)} t`, bar: stats.failure_point, max: 10000, color: "#ff9100" },
          ].map(s => (
            <div className="stat-row" key={s.name}>
              <span className="stat-name">{s.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="stat-bar-wrap"><div className="stat-bar" style={{ width: `${Math.min(100, (s.bar / s.max) * 100)}%`, background: s.color }} /></div>
                <span className="stat-val">{s.val}</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, color: "#4a8099", letterSpacing: 1 }}>
              <span>CURRENT LOAD RATIO</span>
              <span style={{ color: stats.load_ratio > 0.8 ? "#ff1744" : "#00e5ff", fontFamily: "monospace" }}>{Math.round(stats.load_ratio * 100)}%</span>
            </div>
            <div style={{ height: 6, background: "#0a1e2e", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${stats.load_ratio * 100}%`, background: stats.load_ratio > 0.8 ? "linear-gradient(90deg,#ff1744,#ff5722)" : stats.load_ratio > 0.5 ? "linear-gradient(90deg,#ffd740,#ff9100)" : "linear-gradient(90deg,#00e5ff,#00e676)", borderRadius: 3, transition: "all 0.4s ease" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
