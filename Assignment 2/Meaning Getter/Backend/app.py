from dash import Dash
from flask import jsonify
import requests
import logging
import json

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Dash(__name__)
server = app.server

def query_ollama(prompt, model="mistral"):
    """Query Ollama model running locally"""
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

@server.route('/api/meaning/<word>')
def get_meaning(word):
    logger.info(f"Received request for word: {word}")
    
    try:
        # First attempt: Local Ollama
        prompt = f"Define the word '{word}' and specify its part of speech. Format the response as a brief dictionary definition."
        logger.debug(f"Attempting Ollama definition for: {word}")
        
        llm_response = query_ollama(prompt)
        
        if llm_response and len(llm_response) > 10:
            logger.debug(f"Ollama definition received: {llm_response}")
            return jsonify({
                "word": word,
                "meanings": [{
                    "partOfSpeech": "definition",
                    "definitions": [{
                        "definition": llm_response
                    }]
                }]
            })
        else:
            logger.warning(f"No valid Ollama response for word: {word}")
        
        # Fallback: Dictionary API
        logger.info(f"Falling back to Dictionary API for word: {word}")
        api_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
        response = requests.get(api_url)
        
        if response.ok:
            logger.debug("Dictionary API response received successfully")
            return jsonify(response.json()[0])
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
    app.run_server(debug=True, port=8050) 