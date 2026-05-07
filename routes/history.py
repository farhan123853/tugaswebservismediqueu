from flask import Blueprint, jsonify
from models import db
from models.queue import Queue
from flask_jwt_extended import jwt_required, get_jwt_identity

history_bp = Blueprint('history', __name__)

@history_bp.route('/', methods=['GET'])
@jwt_required()
def get_history():
    current_user = get_jwt_identity()
    if current_user['role'] != 'pasien':
        return jsonify({"message": "Akses ditolak"}), 403
        
    history = Queue.query.filter_by(user_id=current_user['id']).order_by(Queue.created_at.desc()).all()
    
    result = []
    for h in history:
        result.append({
            "id": h.id,
            "nomor_antrian": h.nomor_antrian,
            "poli": h.poli,
            "status": h.status,
            "tanggal": h.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
        
    return jsonify({"data": result}), 200
