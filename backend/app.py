from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash
import os

from config import Config
from models import db, Patient, Doctor, Appointment

from routes.auth_routes import auth_bp
from routes.doctor_routes import doctor_bp
from routes.patient_routes import patient_bp
from routes.appointment_routes import appointment_bp
from routes.availability_routes import availability_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080', 'http://127.0.0.1:8080'], supports_credentials=True)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(doctor_bp, url_prefix='/api/doctors')
    app.register_blueprint(patient_bp, url_prefix='/api/patients')
    app.register_blueprint(appointment_bp, url_prefix='/api/appointments')
    app.register_blueprint(availability_bp, url_prefix='/api/doctor/availability')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
