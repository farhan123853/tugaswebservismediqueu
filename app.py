from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes.auth import auth_bp
from routes.queue import queue_bp
from routes.history import history_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    db.init_app(app)
    JWTManager(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(queue_bp, url_prefix='/api/queue')
    app.register_blueprint(history_bp, url_prefix='/api/history')
    
    with app.app_context():
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
