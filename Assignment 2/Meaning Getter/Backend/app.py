from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import logging
import json
from google.generativeai import GenerativeModel  # for Gemini
import openai  # for OpenAI
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# Configure logging - only show INFO and above by default
logging.basicConfig(
    level=logging.INFO,
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
        response = requests.post('http://localhost:11434/api/generate', 
            json={
                "model": model,
                "prompt": prompt,
                "stream": False
            }
        )
        
        if response.ok:
            return response.json()['response']
        else:
            logger.error(f"Ollama API error for model {model}")
            return None
            
    except Exception as e:
        logger.error(f"Error querying Ollama: {str(e)}")
        return None

def query_gemini(prompt, model_name, api_key):
    """Query Gemini model with appropriate configuration"""
    try:
        genai.configure(api_key=api_key)
        
        # Configure safety settings
        safety_settings = {
            HarmCategory.HARASSMENT: HarmBlockThreshold.MEDIUM_AND_ABOVE,
            HarmCategory.HATE_SPEECH: HarmBlockThreshold.MEDIUM_AND_ABOVE,
            HarmCategory.SEXUALLY_EXPLICIT: HarmBlockThreshold.MEDIUM_AND_ABOVE,
            HarmCategory.DANGEROUS_CONTENT: HarmBlockThreshold.MEDIUM_AND_ABOVE,
        }

        # Initialize model with appropriate configuration
        generation_config = {
            'temperature': 0.7,
            'top_p': 0.8,
            'top_k': 40
        }

        model = genai.GenerativeModel(model_name=model_name,
                                    safety_settings=safety_settings,
                                    generation_config=generation_config)
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error with Gemini API: {str(e)}")
        return None

@app.route('/api/models', methods=['GET'])
def list_models():
    """Endpoint to list available models"""
    models = get_available_models()
    return jsonify({"models": models})

@app.route('/api/meaning/<word>', methods=['GET'])
def get_meaning(word):
    provider = request.args.get('provider', 'ollama')
    model = request.args.get('model', None)
    api_key = request.args.get('api_key', None)
    
    try:
        prompt = f"""Define the word '{word}' and specify its part of speech. 
Format the response in markdown with:
- Word as heading
- Part of speech in *italics*
- Definition in a clear, concise manner
- Example usage if relevant"""

        response = None
        
        if provider == 'ollama':
            response = query_ollama(prompt, model)
        elif provider == 'openai' and api_key:
            openai.api_key = api_key
            completion = openai.ChatCompletion.create(
                model=model or "gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            response = completion.choices[0].message.content
        elif provider == 'gemini' and api_key:
            response = query_gemini(prompt, model or 'gemini-pro', api_key)
        
        if response and len(response) > 10:
            logger.info(f"Definition from {provider} for '{word}': {response.strip()}")
            return jsonify({
                "word": word,
                "meanings": [{
                    "partOfSpeech": "definition",
                    "definitions": [{
                        "definition": response.strip()
                    }]
                }]
            })
        
        # Fallback to Dictionary API
        logger.info(f"Falling back to Dictionary API for '{word}'")
        api_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
        response = requests.get(api_url)
        
        if response.ok:
            api_response = response.json()[0]
            logger.info(f"Dictionary API definition found for '{word}'")
            return jsonify(api_response)
        else:
            logger.error(f"No definition found for '{word}'")
            return jsonify({
                "error": "Word not found",
                "message": "No definition available in both Ollama and dictionary API"
            }), 404

    except Exception as e:
        logger.error(f"Error processing '{word}': {str(e)}")
        return jsonify({
            "error": "Service error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    available_models = get_available_models()
    logger.info("Starting Meaning Getter backend server")
    logger.info(f"Available models: {available_models}")
    app.run(debug=True, port=8050) 