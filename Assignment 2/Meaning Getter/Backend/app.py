from dash import Dash
from flask import jsonify
import requests
from transformers import pipeline
import threading

app = Dash(__name__)
server = app.server

# Global variable for the LLM
global_llm = None
llm_lock = threading.Lock()

def get_llm():
    global global_llm
    with llm_lock:
        if global_llm is None:
            print("Initializing LLM model...")
            global_llm = pipeline(
                "text2text-generation",
                model="google/flan-t5-small",
                max_length=200
            )
            print("LLM model initialized")
    return global_llm

@server.route('/api/meaning/<word>')
def get_meaning(word):
    try:
        # Get the singleton LLM instance
        llm = get_llm()
        
        # First attempt: Local LLM
        try:
            prompt = f"Define the word '{word}' concisely with its part of speech."
            llm_response = llm(prompt)[0]['generated_text']
            
            if llm_response and len(llm_response) > 10:  # Basic validation
                return jsonify({
                    "word": word,
                    "meanings": [{
                        "partOfSpeech": "definition",
                        "definitions": [{
                            "definition": llm_response
                        }]
                    }]
                })
        except Exception as llm_error:
            print(f"LLM error: {llm_error}")
            # Continue to fallback if LLM fails
        
        # Fallback: Dictionary API
        api_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
        response = requests.get(api_url)
        
        if response.ok:
            return jsonify(response.json()[0])
        else:
            return jsonify({
                "error": "Word not found",
                "message": "No definition available in both local LLM and dictionary API"
            }), 404

    except Exception as e:
        return jsonify({
            "error": "Service error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    # Initialize the model when the server starts
    get_llm()
    app.run_server(debug=True, port=8050) 