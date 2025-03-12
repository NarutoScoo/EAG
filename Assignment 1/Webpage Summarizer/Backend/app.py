import dash
from dash import html, dcc, callback, Input, Output, State, ClientsideFunction
import dash_mantine_components as dmc
from dash_iconify import DashIconify
import requests
import json
from flask import Flask
from flask import request, jsonify
import markdown2
from flask_cors import CORS
import logging

# Set up logging with WARNING level
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

# Create Flask server
server = Flask(__name__)

# Enable CORS for all routes
CORS(server)

# Initialize Dash app with the Flask server
app = dash.Dash(__name__, server=server)

# Add CORS headers to all responses
@server.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Add client-side callback for keyboard shortcuts
app.clientside_callback(
    ClientsideFunction(
        namespace='clientside',
        function_name='handleKeyPress'
    ),
    Output('submit-button', 'n_clicks'),
    Input('query-input', 'n_submit'),
    State('submit-button', 'n_clicks'),
)

# Add the JavaScript function to handle keyboard events
app.index_string = '''
<!DOCTYPE html>
<html>
    <head>
        {%metas%}
        <title>{%title%}</title>
        {%favicon%}
        {%css%}
        <script>
            if (!window.dash_clientside) {
                window.dash_clientside = {};
            }
            window.dash_clientside.clientside = {
                handleKeyPress: function(n_submit, current_clicks) {
                    return current_clicks + 1;
                }
            };

            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    const textarea = document.querySelector('textarea');
                    const submitButton = document.querySelector('#submit-button');
                    
                    if (textarea && submitButton) {
                        textarea.addEventListener('keydown', function(e) {
                            if (e.key === 'Enter' && !e.shiftKey && !submitButton.disabled) {
                                e.preventDefault();
                                submitButton.click();
                            }
                        });
                    }
                }, 1000);
            });
        </script>
    </head>
    <body>
        {%app_entry%}
        <footer>
            {%config%}
            {%scripts%}
            {%renderer%}
        </footer>
    </body>
</html>
'''

# Function to get available models from Ollama
def get_ollama_models():
    try:
        logger.info("Fetching models from Ollama API...")
        response = requests.get('http://localhost:11434/api/tags')
        logger.info(f"Ollama API response status: {response.status_code}")
        
        if response.status_code == 200:
            models = response.json()
            model_list = [{'label': model['name'], 'value': model['name']} for model in models['models']]
            logger.info(f"Found {len(model_list)} models")
            return model_list, model_list[0]['value'] if model_list else None
        logger.error(f"Failed to fetch models: {response.status_code}")
        return [], None
    except Exception as e:
        logger.error(f"Error fetching models: {str(e)}")
        return [], None

# Layout
app.layout = dmc.MantineProvider(
    theme={
        'colorScheme': 'dark',
        'primaryColor': 'blue',
        'components': {
            'MantineProvider': {
                'defaultProps': {
                    'withGlobalStyles': True,
                    'withNormalizeCSS': True,
                }
            }
        }
    },
    id='theme-provider',
    withGlobalStyles=True,
    children=[
        dmc.Container([
            # Theme toggle
            dmc.Group(
                position="right",
                children=[
                    dmc.ActionIcon(
                        DashIconify(icon="radix-icons:moon", width=20),
                        variant="outline",
                        id="theme-toggle",
                        size="lg",
                        radius="md",
                        color="blue",
                    ),
                ],
                mt=10,
                mb=20,
            ),
            
            dmc.Paper(
                children=[
                    dmc.Title("Ollama Chat Interface", order=1, align="center", mb=30),
                    
                    # Model selection dropdown with refresh button
                    dmc.Group([
                        dmc.Select(
                            id='model-dropdown',
                            label="Select Model",
                            data=get_ollama_models()[0],
                            value=get_ollama_models()[1],
                            style={'width': 'calc(100% - 50px)'},  # Leave space for refresh button
                            clearable=False,
                        ),
                        dmc.ActionIcon(
                            DashIconify(icon="radix-icons:update", width=16),
                            id='refresh-models',
                            variant="outline",
                            size="md",
                            n_clicks=0,
                            mt=25,
                            style={'maxWidth': '30px'},
                        ),
                    ], position="apart", mb=20, style={'width': '100%'}),
                    
                    # Advanced Settings section with temperature
                    dmc.Accordion(
                        children=[
                            dmc.AccordionItem(
                                children=[
                                    dmc.AccordionControl("Advanced Settings"),
                                    dmc.AccordionPanel([
                                        dmc.Text("Temperature:", size="sm", mb=5),
                                        dmc.Slider(
                                            id='temperature-slider',
                                            min=0,
                                            max=1,
                                            step=0.1,
                                            value=0.7,
                                            marks=[{"value": i/10, "label": f"{i/10:.1f}"} for i in range(0, 11)],
                                            mb=20,
                                        ),
                                    ]),
                                ],
                                value="advanced-settings",
                            ),
                        ],
                        mb=20,
                    ),
                    
                    # Query input
                    dmc.Textarea(
                        id='query-input',
                        label=[
                            "Enter your query ",
                            dmc.Text("(Press Enter to submit, Shift+Enter for new line)", 
                                   size="xs", color="dimmed", span=True)
                        ],
                        placeholder="Type your message here...",
                        minRows=4,
                        mb=20,
                    ),
                    
                    # Submit button
                    dmc.Group(
                        children=[
                            dmc.Button(
                                "Submit Query",
                                id='submit-button',
                                leftIcon=DashIconify(icon="radix-icons:paper-plane"),
                                variant="filled",
                                size="md",
                                loading=False,
                                n_clicks=0,
                            ),
                        ],
                        position="center",
                        mb=20,
                    ),
                    
                    # Response display
                    dmc.Text("Response:", weight=500, mb=10),
                    dmc.Paper(
                        children=[
                            dcc.Markdown(
                                id='response-output',
                                style={
                                    'padding': '1rem',
                                    'backgroundColor': 'transparent',
                                    'color': 'inherit',
                                    'fontSize': '1rem',
                                },
                                className='markdown-body'
                            ),
                        ],
                        withBorder=True,
                        style={'minHeight': '150px'},
                    ),
                ],
                p="xl",
                radius="md",
                withBorder=True,
                style={'maxWidth': '800px', 'margin': '0 auto'},
            ),
        ], size="xl", pt=20, pb=40),
    ]
)

@callback(
    Output('theme-provider', 'theme'),
    Input('theme-toggle', 'n_clicks'),
    State('theme-provider', 'theme'),
    prevent_initial_call=True
)
def toggle_theme(n_clicks, current_theme):
    if not current_theme:
        current_theme = {'colorScheme': 'light'}
    
    new_theme = {'colorScheme': 'dark' if current_theme.get('colorScheme') == 'light' else 'light'}
    return new_theme

@callback(
    [Output('model-dropdown', 'data'),
     Output('model-dropdown', 'value')],
    Input('refresh-models', 'n_clicks'),
    prevent_initial_call=True
)
def refresh_models(n_clicks):
    models, default_model = get_ollama_models()
    return models, default_model

@callback(
    [Output('response-output', 'children'),
     Output('submit-button', 'loading'),
     Output('submit-button', 'disabled')],
    Input('submit-button', 'n_clicks'),
    [State('model-dropdown', 'value'),
     State('query-input', 'value'),
     State('temperature-slider', 'value')],
    prevent_initial_call=True
)
def generate_response(n_clicks, model, query, temperature):
    if not model or not query:
        return "Please select a model and enter a query.", False, False
    
    try:
        # Set loading state
        ctx = dash.callback_context
        if not ctx.triggered:
            return dash.no_update, dash.no_update, dash.no_update
            
        # Make request to Ollama API
        response = requests.post(
            'http://localhost:11434/api/generate',
            json={
                'model': model,
                'prompt': query,
                'temperature': temperature
            }
        )
        
        if response.status_code == 200:
            # Parse the response
            response_text = ""
            for line in response.text.strip().split('\n'):
                try:
                    data = json.loads(line)
                    if 'response' in data:
                        response_text += data['response']
                except json.JSONDecodeError:
                    continue
            
            # Format the response text
            formatted_text = response_text if response_text else "No response generated."
            # Clean up the text by ensuring proper markdown formatting
            formatted_text = formatted_text.strip()
            
            # Ensure code blocks are properly formatted
            if '```' in formatted_text:
                # Make sure code blocks have newlines
                formatted_text = formatted_text.replace('```', '\n```\n')
                # Remove any excessive newlines
                formatted_text = '\n'.join(line for line in formatted_text.split('\n') if line.strip())
            
            return formatted_text, False, False
        else:
            return f"Error: {response.status_code}", False, False
            
    except Exception as e:
        return f"Error: {str(e)}", False, False

# Add a callback to set initial loading state
@callback(
    [Output('submit-button', 'loading', allow_duplicate=True),
     Output('submit-button', 'disabled', allow_duplicate=True)],
    Input('submit-button', 'n_clicks'),
    prevent_initial_call=True
)
def set_loading_state(n_clicks):
    return True, True

@callback(
    Output('temperature-slider', 'value'),
    Input('temperature-slider', 'value'),
    prevent_initial_call=True
)
def format_temperature(value):
    return round(value, 1)

# Update the API endpoints
@server.route('/api/models', methods=['GET'])
def list_models():
    """API endpoint to list available models"""
    try:
        logger.info("API: Fetching models list")
        models, _ = get_ollama_models()
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

@server.route('/api/generate', methods=['POST'])
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
        
        # Make request to Ollama API
        logger.info(f"Making request to Ollama API with model: {data['model']}")
        response = requests.post(
            'http://localhost:11434/api/generate',
            json={
                'model': data['model'],
                'prompt': data['prompt'],
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
            
            logger.info("Successfully generated response")
            return jsonify({
                'status': 'success',
                'response': response_text
            })
        else:
            logger.error(f"Ollama API error: {response.status_code}")
            return jsonify({
                'status': 'error',
                'message': f'Ollama API error: {response.status_code}'
            }), response.status_code
            
    except Exception as e:
        logger.error(f"API Error in generate: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run_server(debug=True) 