from flask_sqlalchemy import SQLAlchemy

# Create shared database instance
db = SQLAlchemy()

# Import all models to ensure they're registered
from .patient import Patient
from .doctor import Doctor
from .appointment import Appointment
from .availability import Availability

__all__ = ['db', 'Patient', 'Doctor', 'Appointment', 'Availability']
