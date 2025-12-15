from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date, time
from models import Availability, db

availability_bp = Blueprint('availability', __name__)

@availability_bp.route('', methods=['GET'])
def get_availability():
    try:
        # Get doctor_id from request header or query parameter
        doctor_id = request.headers.get('X-Doctor-ID') or request.args.get('doctor_id')
        if not doctor_id:
            return jsonify({'error': 'Doctor ID required'}), 400
        doctor_id = int(doctor_id)
        
        # Get query parameters for filtering
        date_filter = request.args.get('date')
        
        query = Availability.query.filter_by(doctor_id=doctor_id, is_booked=False)
        
        if date_filter:
            try:
                filter_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
                query = query.filter_by(date=filter_date)
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        availability = query.order_by(Availability.date.asc(), Availability.time.asc()).all()
        
        return jsonify([slot.to_dict() for slot in availability]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@availability_bp.route('', methods=['POST'])
def add_availability():
    try:
        # Get doctor_id from request header or data
        doctor_id = request.headers.get('X-Doctor-ID') or request.json.get('doctor_id')
        if not doctor_id:
            return jsonify({'error': 'Doctor ID required'}), 400
        doctor_id = int(doctor_id)
        data = request.get_json()
        
        # Validate required fields
        if not data or 'date' not in data or 'time' not in data:
            return jsonify({'error': 'Date and time are required'}), 400
        
        # Parse date and time
        try:
            slot_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            slot_time = datetime.strptime(data['time'], '%H:%M').time()
        except ValueError:
            return jsonify({'error': 'Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time'}), 400
        
        # Check if slot already exists
        existing_slot = Availability.query.filter_by(
            doctor_id=doctor_id,
            date=slot_date,
            time=slot_time
        ).first()
        
        if existing_slot:
            return jsonify({'error': 'This time slot already exists'}), 400
        
        # Check if date is in the past
        if slot_date < date.today():
            return jsonify({'error': 'Cannot add availability for past dates'}), 400
        
        # Create new availability slot
        availability = Availability(
            doctor_id=doctor_id,
            date=slot_date,
            time=slot_time
        )
        
        db.session.add(availability)
        db.session.commit()
        
        return jsonify({
            'message': 'Availability slot added successfully',
            'availability': availability.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@availability_bp.route('/<int:slot_id>', methods=['DELETE'])
def remove_availability(slot_id):
    try:
        # Get doctor_id from request header
        doctor_id = request.headers.get('X-Doctor-ID')
        if not doctor_id:
            return jsonify({'error': 'Doctor ID required'}), 400
        doctor_id = int(doctor_id)
        
        # Find the availability slot
        slot = Availability.query.filter_by(id=slot_id, doctor_id=doctor_id).first()
        
        if not slot:
            return jsonify({'error': 'Availability slot not found'}), 404
        
        # Check if slot is already booked
        if slot.is_booked:
            return jsonify({'error': 'Cannot remove a booked time slot'}), 400
        
        # Delete the slot
        db.session.delete(slot)
        db.session.commit()
        
        return jsonify({'message': 'Availability slot removed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
