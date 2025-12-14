from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime

from models import Patient, Doctor

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/patient/register', methods=['POST'])
def patient_register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'phone', 'dateOfBirth', 'gender']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if patient already exists
        if Patient.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Patient with this email already exists'}), 400
        
        # Create new patient
        patient = Patient(
            name=data['name'],
            email=data['email'],
            password=generate_password_hash(data['password']),
            phone=data['phone'],
            date_of_birth=datetime.strptime(data['dateOfBirth'], '%Y-%m-%d').date(),
            gender=data['gender']
        )
        
        from models import db
        db.session.add(patient)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=patient.id)
        
        return jsonify({
            'message': 'Patient registered successfully',
            'access_token': access_token,
            'patient': patient.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/patient/login', methods=['POST'])
def patient_login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        patient = Patient.query.filter_by(email=data['email']).first()
        
        if not patient or not check_password_hash(patient.password, data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        access_token = create_access_token(identity=patient.id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'patient': patient.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/doctor/register', methods=['POST'])
def doctor_register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'specialization', 'phone', 'experienceYears', 'education', 'consultationFee']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if doctor already exists
        if Doctor.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Doctor with this email already exists'}), 400
        
        # Create new doctor
        doctor = Doctor(
            name=data['name'],
            email=data['email'],
            password=generate_password_hash(data['password']),
            specialization=data['specialization'],
            phone=data['phone'],
            experience_years=int(data['experienceYears']),
            education=data['education'],
            consultation_fee=float(data['consultationFee'])
        )
        
        from models import db
        db.session.add(doctor)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=doctor.id)
        
        return jsonify({
            'message': 'Doctor registered successfully',
            'access_token': access_token,
            'doctor': doctor.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/doctor/login', methods=['POST'])
def doctor_login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        doctor = Doctor.query.filter_by(email=data['email']).first()
        
        if not doctor or not check_password_hash(doctor.password, data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        access_token = create_access_token(identity=doctor.id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'doctor': doctor.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        
        # Try to find user in both tables
        patient = Patient.query.get(user_id)
        doctor = Doctor.query.get(user_id)
        
        if patient:
            return jsonify({
                'user_type': 'patient',
                'user': patient.to_dict()
            }), 200
        elif doctor:
            return jsonify({
                'user_type': 'doctor',
                'user': doctor.to_dict()
            }), 200
        else:
            return jsonify({'error': 'User not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
