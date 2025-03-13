from flask import jsonify, request
import logging
from llm_service import llm_service

# Set up logging
logger = logging.getLogger(__name__)

def register_routes(app):
    """Register API routes with the Flask app"""
    
    @app.route('/api/models', methods=['GET'])
    def list_models():
        """API endpoint to list available models"""
        try:
            logger.info("API: Fetching models list")
            models, _ = llm_service.get_available_models()
            response = jsonify({
                'status': 'success',
                'models': [model['value'] for model in models]
            })
            return response
        except Exception as e:
            logger.error(f"API Error in list_models: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500

    @app.route('/api/generate', methods=['POST'])
    def generate():
        """API endpoint to generate response from a model"""
        try:
            data = request.get_json()
            logger.info(f"API: Generate request received for model: {data.get('model', 'unknown')}")
            
            # Validate required fields
            if not data or 'model' not in data or 'prompt' not in data:
                logger.error("API: Missing required fields in generate request")
                return jsonify({
                    'status': 'error',
                    'message': 'Missing required fields: model and prompt'
                }), 400
                
            # Get optional parameters with defaults
            temperature = data.get('temperature', 0.7)
            
            # Generate response using LLM service
            result = llm_service.generate_response(
                model=data['model'],
                prompt=data['prompt'],
                temperature=temperature
            )
            
            if result['status'] == 'success':
                return jsonify(result)
            else:
                return jsonify(result), 500
                
        except Exception as e:
            logger.error(f"API Error in generate: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500 