import dash
from dash import html, dcc
import dash_mantine_components as dmc
from dash_iconify import DashIconify
from llm_service import llm_service

def create_layout():
    """Create the main application layout"""
    return dmc.MantineProvider(
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
                                data=llm_service.get_available_models()[0],
                                value=llm_service.get_available_models()[1],
                                style={'width': 'calc(100% - 50px)'},
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

def get_keyboard_js():
    """Return JavaScript for keyboard shortcuts"""
    return '''
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
    ''' 