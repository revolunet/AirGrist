from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv
from airtable_handler import pull_from_airtable
from grist_handler import push_to_grist

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/pull-airtable', methods=['POST'])
def api_pull_airtable():
    """Endpoint for pulling data from Airtable"""
    config = request.get_json()
    data = pull_from_airtable(config)
    return jsonify(data)

@app.route('/api/push-grist', methods=['POST'])
def api_push_grist():
    """Endpoint for pushing data to Grist"""
    config = request.get_json()
    data = push_to_grist(config)
    return jsonify(data)

@app.route('/api/save-config', methods=['POST'])
def save_config():
    """Stub endpoint for saving configuration"""
    config = request.get_json()
    # TODO: Implement secure config storage
    return jsonify({
        'status': 'success',
        'message': 'Configuration saved (not persisted yet)',
        'config': config
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=4040)