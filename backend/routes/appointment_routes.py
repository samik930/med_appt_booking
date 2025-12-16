from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, time

from models import Appointment, Doctor, Patient, db

appointment_bp = Blueprint('appointment', __name__)

@appointment_bp.route('/', methods=['POST'])
def create_appointment():
    try:
        # Get patient_id from request data for now (temporary fix)
        data = request.get_json()
        patient_id = data.get('patient_id') or 1  # Default to patient ID 1 for testing
        
        # Validate required fields
        required_fields = ['doctor_id', 'appointment_date', 'appointment_time']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if doctor exists
        doctor = Doctor.query.get(data['doctor_id'])
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        
        # Parse date and time
        appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
        
        # Handle different time formats
        time_str = data['appointment_time']
        try:
            # Try HH:MM format first
            appointment_time = datetime.strptime(time_str, '%H:%M').time()
        except ValueError:
            try:
                # Try HH:MM:SS format
                appointment_time = datetime.strptime(time_str, '%H:%M:%S').time()
            except ValueError:
                return jsonify({'error': f'Invalid time format: {time_str}. Expected HH:MM or HH:MM:SS'}), 400
        
        # Check if appointment time is in the future
        appointment_datetime = datetime.combine(appointment_date, appointment_time)
        if appointment_datetime <= datetime.now():
            return jsonify({'error': 'Appointment must be scheduled for a future date and time'}), 400
        
        # Check if appointment slot is already taken
        existing_appointment = Appointment.query.filter_by(
            doctor_id=data['doctor_id'],
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            status='scheduled'
        ).first()
        
        if existing_appointment:
            return jsonify({'error': 'This appointment slot is already booked'}), 400
        
        # Create new appointment
        appointment = Appointment(
            patient_id=patient_id,
            doctor_id=data['doctor_id'],
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            duration_minutes=data.get('duration_minutes', 30),
            notes=data.get('notes', '')
        )
        
        from models import db
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment booked successfully',
            'appointment': appointment.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/<int:appointment_id>', methods=['GET'])
@jwt_required()
def get_appointment(appointment_id):
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.get_or_404(appointment_id)
        
        # Check if user is authorized to view this appointment
        if appointment.patient_id != user_id and appointment.doctor_id != user_id:
            return jsonify({'error': 'Unauthorized to view this appointment'}), 403
        
        return jsonify({
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.get_or_404(appointment_id)
        
        # Check if user is authorized to update this appointment
        if appointment.patient_id != user_id and appointment.doctor_id != user_id:
            return jsonify({'error': 'Unauthorized to update this appointment'}), 403
        
        data = request.get_json()
        
        # Update allowed fields
        updatable_fields = ['status', 'notes']
        for field in updatable_fields:
            if field in data:
                setattr(appointment, field, data[field])
        
        from models import db
        with db.session.begin():
            db.session.commit()
        
        return jsonify({
            'message': 'Appointment updated successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def cancel_appointment(appointment_id):
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.get_or_404(appointment_id)
        
        # Check if user is authorized to cancel this appointment
        if appointment.patient_id != user_id and appointment.doctor_id != user_id:
            return jsonify({'error': 'Unauthorized to cancel this appointment'}), 403
        
        # Only allow cancellation of scheduled appointments
        if appointment.status != 'scheduled':
            return jsonify({'error': 'Cannot cancel an appointment that is not scheduled'}), 400
        
        appointment.status = 'cancelled'
        
        from models import db
        with db.session.begin():
            db.session.commit()
        
        return jsonify({
            'message': 'Appointment cancelled successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/doctor', methods=['GET'])
def get_doctor_appointments():
    try:
        # Get doctor_id from query parameter (temporary fix)
        doctor_id = request.args.get('doctor_id') or 1  # Default to doctor ID 1 for testing
        
        # Get query parameters for filtering
        status = request.args.get('status')
        date = request.args.get('date')
        
        query = Appointment.query.options(db.joinedload(Appointment.patient)).filter_by(doctor_id=doctor_id)
        
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

@appointment_bp.route('/doctor/<int:doctor_id>/available-slots', methods=['GET'])
def get_available_slots(doctor_id):
    try:
        # Check if doctor exists
        doctor = Doctor.query.get_or_404(doctor_id)
        
        # Get date from query parameters
        date_str = request.args.get('date')
        if not date_str:
            return jsonify({'error': 'Date parameter is required'}), 400
        
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        # Get all appointments for this doctor on this date
        booked_appointments = Appointment.query.filter_by(
            doctor_id=doctor_id,
            appointment_date=date,
            status='scheduled'
        ).all()
        
        # Generate available time slots (9 AM to 5 PM, 30-minute intervals)
        booked_times = {appt.appointment_time for appt in booked_appointments}
        
        available_slots = []
        start_time = time(9, 0)  # 9:00 AM
        end_time = time(17, 0)   # 5:00 PM
        
        current_time = start_time
        while current_time < end_time:
            if current_time not in booked_times:
                available_slots.append(current_time.strftime('%H:%M'))
            
            # Add 30 minutes
            minutes = current_time.minute + 30
            hours = current_time.hour
            if minutes >= 60:
                minutes -= 60
                hours += 1
            current_time = time(hours, minutes)
        
        return jsonify({
            'available_slots': available_slots
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
