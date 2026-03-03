import json

def parse_json_blueprint(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)
