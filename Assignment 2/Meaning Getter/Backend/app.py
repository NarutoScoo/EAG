from dash import Dash, html
from flask import jsonify
import requests
from transformers import pipeline

app = Dash(__name__)
server = app.server

# Initialize the LLM pipeline
llm = pipeline(
    "text2text-generation",
    model="google/flan-t5-small",  # Using a smaller model for quick responses
    max_length=200
)

@server.route('/api/meaning/<word>')
def get_meaning(word):
    try:
        # First attempt: Local LLM
        prompt = f"Define the word '{word}' concisely with its part of speech."
        llm_response = llm(prompt)[0]['generated_text']
        
        if llm_response and len(llm_response) > 10:  # Basic validation
            return jsonify({
                "word": word,
                "meanings": [{
                    "partOfSpeech": "definition",  # Simplified for LLM response
                    "definitions": [{
                        "definition": llm_response
                    }]
                }]
            })
        
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
    app.run_server(debug=True, port=8050) 