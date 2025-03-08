#!/usr/bin/env python3
"""
Simple HTTP server for running the Gemini Console application locally.
Includes CORS support and basic security headers.
"""

import http.server
import socketserver
import webbrowser
from urllib.parse import urlparse
import os

PORT = 8081

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Security headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Content-Security-Policy', "default-src 'self' https://cdn.tailwindcss.com https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;")
        
        # CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization')
        
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def run_server():
    try:
        # Change to the directory containing this script
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        handler = CORSRequestHandler
        httpd = socketserver.TCPServer(("", PORT), handler)
        
        print(f"""
╔════════════════════════════════════════════════════════════════╗
║                      Gemini Console Server                      ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Server running at:                                            ║
║  http://localhost:{PORT}                                          ║
║                                                                ║
║  Press Ctrl+C to stop the server                              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
""")
        
        # Open the browser automatically
        webbrowser.open(f'http://localhost:{PORT}')
        
        # Start the server
        httpd.serve_forever()
        
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()
        print("Server stopped")
    except Exception as e:
        print(f"Error: {e}")
        
if __name__ == '__main__':
    run_server()
