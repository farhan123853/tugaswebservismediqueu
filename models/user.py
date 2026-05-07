from . import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    no_hp = db.Column(db.String(20), nullable=False)
    role = db.Column(db.Enum('pasien', 'petugas'), default='pasien', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    queues = db.relationship('Queue', backref='user', lazy=True)
