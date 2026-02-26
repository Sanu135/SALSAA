from fastapi import APIRouter, UploadFile, File
import os
import json
from app.converters.json_parser import parse_json_blueprint
from app.structures.bone_structure import BoneStructureGenerator
from app.structures.honeycomb_structure import HoneycombStructureGenerator
from app.analysis.material_analyzer import MaterialAnalyzer
from app.exporters.exporter import StructureExporter

router = APIRouter()

@router.post("/analyze-blueprint")
async def analyze_blueprint_endpoint(file: UploadFile = File(...)):
    # Save the uploaded file temporarily
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Run the analysis
    results = run_analysis(temp_file_path)

    # Clean up the temporary file
    os.remove(temp_file_path)

    return results

def run_analysis(file_path):
    blueprint = parse_json_blueprint(file_path)
    analyzer = MaterialAnalyzer(blueprint)
    base = analyzer.analyze_solid()

    bone_gen = BoneStructureGenerator(blueprint, strut_thickness=1.5, density=0.3)
    bone_data = bone_gen.generate()
    bone_analysis = analyzer.analyze_structure(bone_data, 'bone')

    hc_gen = HoneycombStructureGenerator(blueprint, cell_size=6.0, density=0.3)
    hc_data = hc_gen.generate()
    hc_analysis = analyzer.analyze_structure(hc_data, 'honeycomb')

    def savings(base_a, struct_a):
        mat_saved = round(((base_a['volume'] - struct_a['volume']) / base_a['volume']) * 100, 2) if base_a['volume'] > 0 else 0
        wt_saved = round(((base_a['weight'] - struct_a['weight']) / base_a['weight']) * 100, 2) if base_a['weight'] > 0 else 0
        str_change = round(struct_a['strength_index'] - 100, 2)
        sw_change = round(
            (struct_a['strength_index'] / struct_a['weight']) /
            (base_a['strength_index'] / base_a['weight']) * 100 - 100, 2
        ) if struct_a['weight'] > 0 and base_a['weight'] > 0 else 0
        return mat_saved, wt_saved, str_change, sw_change

    bone_mat, bone_wt, bone_str, bone_sw = savings(base, bone_analysis)
    hc_mat, hc_wt, hc_str, hc_sw = savings(base, hc_analysis)

    results = {
        'bone': {'structure': bone_data, 'analysis': bone_analysis,
                 'savings': {'material_saved_percent': bone_mat, 'weight_saved_percent': bone_wt,
                             'strength_change_percent': bone_str, 'strength_to_weight_ratio_change': bone_sw}},
        'honeycomb': {'structure': hc_data, 'analysis': hc_analysis,
                      'savings': {'material_saved_percent': hc_mat, 'weight_saved_percent': hc_wt,
                                  'strength_change_percent': hc_str, 'strength_to_weight_ratio_change': hc_sw}},
    }
    
    return results
