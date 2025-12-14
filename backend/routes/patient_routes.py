from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import Patient, Appointment

patient_bp = Blueprint('patient', __name__)

@patient_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_patient_profile():
    try:
        patient_id = get_jwt_identity()
        patient = Patient.query.get_or_404(patient_id)
        return jsonify({
            'patient': patient.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@patient_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_patient_profile():
    try:
        patient_id = get_jwt_identity()
        patient = Patient.query.get_or_404(patient_id)
        
        data = request.get_json()
        
        # Update allowed fields
        updatable_fields = ['name', 'phone', 'date_of_birth', 'gender']
        for field in updatable_fields:
            if field in data:
                if field == 'date_of_birth':
                    setattr(patient, field, datetime.strptime(data[field], '%Y-%m-%d').date())
                else:
                    setattr(patient, field, data[field])
        
        from models import db
        with db.session.begin():
            db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'patient': patient.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@patient_bp.route('/appointments', methods=['GET'])
@jwt_required()
def get_patient_appointments():
    try:
        patient_id = get_jwt_identity()
        
        # Get query parameters for filtering
        status = request.args.get('status')
        date = request.args.get('date')
        
        query = Appointment.query.filter_by(patient_id=patient_id)
        
        if status:
            query = query.filter_by(status=status)
        
        if date:
            query = query.filter_by(appointment_date=datetime.strptime(date, '%Y-%m-%d').date())
        
        appointments = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc()).all()
        
        return jsonify({
            'appointments': [appointment.to_dict() for appointment in appointments]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
