import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app
import os

class EmailService:
    def __init__(self):
        self.smtp_server = os.environ.get('MAIL_SERVER')
        self.smtp_port = int(os.environ.get('MAIL_PORT') or 587)
        self.use_tls = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
        self.username = os.environ.get('MAIL_USERNAME')
        self.password = os.environ.get('MAIL_PASSWORD')
        self.default_sender = os.environ.get('DEFAULT_MAIL_SENDER') or 'noreply@medcenter.com'
    
    def send_appointment_confirmation(self, recipient_email, patient_name, doctor_name, appointment_date, appointment_time):
        """Send appointment confirmation email to patient"""
        try:
            if not self.smtp_server or not self.username or not self.password:
                print("Email service not configured. Skipping email.")
                return True
            
            subject = f"Appointment Confirmation - {doctor_name}"
            
            body = f"""
Dear {patient_name},

Your appointment has been successfully confirmed!

Appointment Details:
- Doctor: {doctor_name}
- Date: {appointment_date}
- Time: {appointment_time}

Please arrive 15 minutes before your scheduled appointment time.

If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Best regards,
Medical Center Team
            """
            
            return self._send_email(recipient_email, subject, body)
            
        except Exception as e:
            print(f"Failed to send appointment confirmation: {str(e)}")
            return False
    
    def send_appointment_reminder(self, recipient_email, patient_name, doctor_name, appointment_date, appointment_time):
        """Send appointment reminder email to patient"""
        try:
            if not self.smtp_server or not self.username or not self.password:
                print("Email service not configured. Skipping email.")
                return True
            
            subject = f"Appointment Reminder - {doctor_name}"
            
            body = f"""
Dear {patient_name},

This is a friendly reminder about your upcoming appointment:

Appointment Details:
- Doctor: {doctor_name}
- Date: {appointment_date}
- Time: {appointment_time}

Please remember to:
- Arrive 15 minutes before your scheduled time
- Bring your ID and insurance card
- Bring any relevant medical records

We look forward to seeing you!

Best regards,
Medical Center Team
            """
            
            return self._send_email(recipient_email, subject, body)
            
        except Exception as e:
            print(f"Failed to send appointment reminder: {str(e)}")
            return False
    
    def send_appointment_cancellation(self, recipient_email, patient_name, doctor_name, appointment_date, appointment_time):
        """Send appointment cancellation confirmation"""
        try:
            if not self.smtp_server or not self.username or not self.password:
                print("Email service not configured. Skipping email.")
                return True
            
            subject = f"Appointment Cancelled - {doctor_name}"
            
            body = f"""
Dear {patient_name},

Your appointment has been cancelled as requested.

Cancelled Appointment Details:
- Doctor: {doctor_name}
- Date: {appointment_date}
- Time: {appointment_time}

If you would like to reschedule, please visit our website or contact us directly.

Best regards,
Medical Center Team
            """
            
            return self._send_email(recipient_email, subject, body)
            
        except Exception as e:
            print(f"Failed to send appointment cancellation: {str(e)}")
            return False
    
    def _send_email(self, recipient_email, subject, body):
        """Internal method to send email"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.default_sender
            msg['To'] = recipient_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            if self.use_tls:
                server.starttls()
            
            server.login(self.username, self.password)
            text = msg.as_string()
            server.sendmail(self.default_sender, recipient_email, text)
            server.quit()
            
            print(f"Email sent successfully to {recipient_email}")
            return True
            
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False

# Create a singleton instance
email_service = EmailService()
