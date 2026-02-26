import json

class StructureExporter:
    def __init__(self, output_dir, blueprint_name):
        self.output_dir = output_dir
        self.blueprint_name = blueprint_name

    def export(self, results, blueprint):
        output = {
            'blueprint': blueprint,
            'results': results,
        }
        output_path = f"{self.output_dir}/analysis_results.json"
        with open(output_path, 'w') as f:
            json.dump(output, f, indent=2)
        
        return {
            'results_json': output_path
        }
