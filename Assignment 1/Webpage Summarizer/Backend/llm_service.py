import requests
import logging
import json

# Set up logging with a cleaner format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self, base_url="http://localhost:11434"):
        self.base_url = base_url
        logger.info(f"LLM Service initialized at {base_url}")

    def get_available_models(self):
        """Fetch available models from Ollama"""
        try:
            logger.debug("Connecting to Ollama for models list...")
            response = requests.get(f'{self.base_url}/api/tags')
            
            if response.status_code == 200:
                models = response.json()
                model_list = [{'label': model['name'], 'value': model['name']} 
                            for model in models['models']]
                logger.debug(f"Found {len(model_list)} models")
                return model_list, model_list[0]['value'] if model_list else None
            logger.error(f"Ollama connection failed: {response.status_code}")
            return [], None
        except Exception as e:
            logger.error(f"Ollama connection error: {str(e)}")
            return [], None

    def generate_response(self, model, prompt, temperature=0.7):
        """Generate response using specified model"""
        try:
            logger.debug(f"Connecting to Ollama with model: {model}")
            response = requests.post(
                f'{self.base_url}/api/generate',
                json={
                    'model': model,
                    'prompt': prompt,
                    'temperature': temperature
                }
            )
            
            if response.status_code == 200:
                # Parse the response
                response_text = ""
                for line in response.text.strip().split('\n'):
                    try:
                        line_data = json.loads(line)
                        if 'response' in line_data:
                            response_text += line_data['response']
                    except json.JSONDecodeError:
                        continue
                
                logger.debug("Response generated successfully")
                return {
                    'status': 'success',
                    'response': response_text
                }
            else:
                logger.error(f"Ollama request failed: {response.status_code}")
                return {
                    'status': 'error',
                    'message': f'Ollama API error: {response.status_code}'
                }
                
        except Exception as e:
            logger.error(f"Ollama connection error: {str(e)}")
            return {
                'status': 'error',
                'message': str(e)
            }

# Create a global instance
llm_service = LLMService() 