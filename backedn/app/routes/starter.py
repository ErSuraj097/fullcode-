# app/routes/starter.py
from flask import Blueprint, jsonify, send_from_directory
from datetime import datetime
import os

starter_bp = Blueprint("starter", __name__)

# ---- Health check -----------------------------------------------------------
@starter_bp.route("/api/v1/health")
def health_check():
    """Simple uptime endpoint."""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    })


# ---- Frontend / SPA ---------------------------------------------------------
# Folder where your built frontend lives, e.g. frontend/dist
DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
DIST_DIR = os.path.abspath(DIST_DIR)


@starter_bp.route("/", defaults={"path": ""})
@starter_bp.route("/<path:path>")
def serve_spa(path: str):
    """
    Serve static files if present; otherwise return index.html
    so the frontend router can handle the URL.
    """
    # Requested asset (e.g. js/app.js)
    requested = os.path.join(DIST_DIR, path)

    if path and os.path.isfile(requested):
        # Exact file exists -> serve it
        return send_from_directory(DIST_DIR, path)

    # Fallback -> main index.html
    return send_from_directory(DIST_DIR, "index.html")
