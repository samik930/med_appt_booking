from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import Doctor, Appointment, Patient

doctor_bp = Blueprint('doctor', __name__)

@doctor_bp.route('', methods=['GET'])
def get_doctors():
    try:
        doctors = Doctor.query.all()
        return jsonify([doctor.to_dict() for doctor in doctors]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@doctor_bp.route('/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    try:
        doctor = Doctor.query.get_or_404(doctor_id)
        return jsonify(doctor.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@doctor_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_doctor_profile():
    try:
        doctor_id = get_jwt_identity()
        doctor = Doctor.query.get_or_404(doctor_id)
        return jsonify({
            'doctor': doctor.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@doctor_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_doctor_profile():
    try:
        doctor_id = get_jwt_identity()
        doctor = Doctor.query.get_or_404(doctor_id)
        
        data = request.get_json()
        
        # Update allowed fields
        updatable_fields = ['name', 'phone', 'specialization', 'experience_years', 'education', 'consultation_fee']
        for field in updatable_fields:
            if field in data:
                setattr(doctor, field, data[field])
        
        from models import db
        with db.session.begin():
            db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'doctor': doctor.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@doctor_bp.route('/patients', methods=['GET'])
def get_doctor_patients():
    try:
        # Get doctor_id from JWT token (temporary fix)
        doctor_id = request.args.get('doctor_id') or 1  # Default to doctor ID 1 for testing
        
        # Get all patients who have appointments with this doctor
        appointments = Appointment.query.filter_by(doctor_id=doctor_id).all()
        patient_ids = list(set([apt.patient_id for apt in appointments]))
        patients = Patient.query.filter(Patient.id.in_(patient_ids)).all()
        
        return jsonify({
            'patients': [patient.to_dict() for patient in patients]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@doctor_bp.route('/appointments', methods=['GET'])
@jwt_required()
def get_doctor_appointments():
    try:
        doctor_id = get_jwt_identity()
        
        # Get query parameters for filtering
        status = request.args.get('status')
        date = request.args.get('date')
        
        query = Appointment.query.filter_by(doctor_id=doctor_id)
        
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

