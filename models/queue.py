from . import db
from datetime import datetime

class Queue(db.Model):
    __tablename__ = 'queues'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    nomor_antrian = db.Column(db.String(20), nullable=False)
    poli = db.Column(db.String(50), nullable=False)
    keluhan = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum('menunggu', 'dipanggil', 'selesai'), default='menunggu', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
