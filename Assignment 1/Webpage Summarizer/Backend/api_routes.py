from flask import jsonify, request
import logging
from llm_service import llm_service
from markdown import markdown

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
            
            if not data:
                return jsonify({'status': 'error', 'message': 'No data provided'}), 400
            
            # Validate required fields
            if 'prompt' not in data:
                return jsonify({'status': 'error', 'message': 'No prompt provided'}), 400
            if 'model' not in data:
                return jsonify({'status': 'error', 'message': 'No model selected'}), 400
            
            # Log the request
            logger.info(f"API: Generate request using model: {data['model']}")
            
            temperature = data.get('temperature', 0.7)
            output_format = data.get('format', 'markdown')  # Default to markdown
            
            # Generate response using LLM service
            result = llm_service.generate_response(data['model'], data['prompt'], temperature)
            
            if result['status'] == 'success':
                response = result['response']
                
                # Convert markdown to HTML if requested
                if output_format == 'html':
                    try:
                        logger.debug("Converting markdown to HTML...")
                        logger.debug(f"Input markdown: {response[:200]}...")
                        
                        response = markdown(response, 
                                         extensions=['extra', 'nl2br', 'sane_lists'],
                                         output_format='html5')
                        
                        logger.debug(f"Converted HTML: {response[:200]}...")
                    except Exception as e:
                        logger.error(f"Error converting markdown to HTML: {str(e)}")
                        logger.debug(f"Problematic markdown content: {response[:500]}")
                        # Return original response if conversion fails
                        logger.debug("Falling back to original markdown response")
                
                return jsonify({
                    'status': 'success',
                    'response': response,
                    'format': output_format
                })
            else:
                return jsonify(result), 400
                
        except Exception as e:
            logger.error(f"Error in generate endpoint: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500 