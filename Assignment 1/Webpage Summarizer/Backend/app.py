import dash
from dash import callback, Input, Output, State, ClientsideFunction
from flask import Flask
from flask_cors import CORS
import logging

# Import our modules
from llm_service import llm_service
from ui_components import create_layout, get_keyboard_js
from api_routes import register_routes

# Set up logging with a cleaner format
logging.basicConfig(
    level=logging.DEBUG,  # Set to INFO in production
    format='%(asctime)s - %(levelname)s: %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# Create Flask server
server = Flask(__name__)

# Enable CORS for all routes
CORS(server)

# Initialize Dash app with the Flask server
app = dash.Dash(__name__, server=server)

# Register API routes
register_routes(server)

# Set up the layout
app.layout = create_layout()

# Add keyboard shortcuts JavaScript
app.index_string = f'''
<!DOCTYPE html>
<html>
    <head>
        {'{%metas%}'}
        <title>{'{%title%}'}</title>
        {'{%favicon%}'}
        {'{%css%}'}
        <script>
            {get_keyboard_js()}
        </script>
    </head>
    <body>
        {'{%app_entry%}'}
        <footer>
            {'{%config%}'}
            {'{%scripts%}'}
            {'{%renderer%}'}
        </footer>
    </body>
</html>
'''

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
    models, default_model = llm_service.get_available_models()
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
            
        # Generate response using LLM service
        result = llm_service.generate_response(model, query, temperature)
        
        if result['status'] == 'success':
            return result['response'], False, False
        else:
            return f"Error: {result['message']}", False, False
            
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

if __name__ == '__main__':
    app.run_server(debug=True) 