from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import logging
import json

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

def get_available_models():
    """Get list of available Ollama models"""
    try:
        response = requests.get('http://localhost:11434/api/tags')
        if response.ok:
            models = response.json()['models']
            return [model['name'] for model in models]
        return []
    except Exception as e:
        logger.error(f"Error fetching models: {str(e)}")
        return []

def query_ollama(prompt, model=None):
    """Query Ollama model running locally"""
    if not model:
        models = get_available_models()
        model = models[0] if models else "mistral"
    
    try:
        logger.debug(f"Querying Ollama model '{model}' with prompt: {prompt}")
        
        response = requests.post('http://localhost:11434/api/generate', 
            json={
                "model": model,
                "prompt": prompt,
                "stream": False
            }
        )
        
        if response.ok:
            logger.debug("Ollama response received successfully")
            return response.json()['response']
        else:
            logger.error(f"Ollama API error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Error querying Ollama: {str(e)}")
        return None

@app.route('/api/models', methods=['GET'])
def list_models():
    """Endpoint to list available models"""
    models = get_available_models()
    return jsonify({"models": models})

@app.route('/api/meaning/<word>', methods=['GET'])
def get_meaning(word):
    logger.info(f"Received request for word: {word}")
    model = request.args.get('model', None)
    
    try:
        # First attempt: Local Ollama
        prompt = f"""Define the word '{word}' and specify its part of speech. 
Format the response in markdown with:
- Word as heading
- Part of speech in *italics*
- Definition in a clear, concise manner
- Example usage if relevant"""
        
        logger.debug(f"Attempting Ollama definition for: {word} using model: {model}")
        
        llm_response = query_ollama(prompt, model)
        
        if llm_response and len(llm_response) > 10:
            logger.debug(f"Ollama definition received: {llm_response}")
            # Format response to match expected structure
            formatted_response = {
                "word": word,
                "meanings": [{
                    "partOfSpeech": "definition",
                    "definitions": [{
                        "definition": llm_response.strip()
                    }]
                }]
            }
            logger.debug(f"Formatted response: {formatted_response}")
            return jsonify(formatted_response)
        else:
            logger.warning(f"No valid Ollama response for word: {word}")
        
        # Fallback: Dictionary API
        logger.info(f"Falling back to Dictionary API for word: {word}")
        api_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
        response = requests.get(api_url)
        
        if response.ok:
            logger.debug("Dictionary API response received successfully")
            api_response = response.json()[0]
            logger.debug(f"API Response: {api_response}")
            return jsonify(api_response)
        else:
            logger.error(f"Dictionary API error: {response.status_code}")
            return jsonify({
                "error": "Word not found",
                "message": "No definition available in both Ollama and dictionary API"
            }), 404

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Service error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("Starting Meaning Getter backend server")
    logger.info(f"Available models: {get_available_models()}")
    app.run(debug=True, port=8050) 