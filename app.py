from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/pull-airtable', methods=['POST'])
def pull_from_airtable():
    """Stub endpoint for pulling data from Airtable"""
    # TODO: Implement Airtable API integration
    return jsonify({
        'status': 'success',
        'message': 'Airtable pull functionality not yet implemented',
        'data': []
    })

@app.route('/api/push-grist', methods=['POST'])
def push_to_grist():
    """Stub endpoint for pushing data to Grist"""
    # TODO: Implement Grist API integration
    return jsonify({
        'status': 'success',
        'message': 'Grist push functionality not yet implemented'
    })

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
    app.run(debug=True, host='0.0.0.0', port=5000)