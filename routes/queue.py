from flask import Blueprint, request, jsonify
from models import db
from models.queue import Queue
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date

queue_bp = Blueprint('queue', __name__)

def generate_nomor_antrian(poli):
    prefix = poli[0].upper()
    today = date.today()
    count = Queue.query.filter(Queue.poli == poli, db.func.date(Queue.created_at) == today).count()
    return f"{prefix}-{count + 1:03d}"

@queue_bp.route('/take', methods=['POST'])
@jwt_required()
def take_queue():
    current_user = get_jwt_identity()
    if current_user['role'] != 'pasien':
        return jsonify({"message": "Akses ditolak"}), 403
        
    data = request.get_json()
    poli = data.get('poli')
    keluhan = data.get('keluhan')
    
    if not all([poli, keluhan]):
        return jsonify({"message": "Poli dan keluhan harus diisi"}), 400
        
    today = date.today()
    existing_queue = Queue.query.filter(
        Queue.user_id == current_user['id'],
        Queue.status.in_(['menunggu', 'dipanggil']),
        db.func.date(Queue.created_at) == today
    ).first()
    
    if existing_queue:
        return jsonify({"message": "Anda masih memiliki antrian aktif"}), 400

    nomor = generate_nomor_antrian(poli)
    new_queue = Queue(user_id=current_user['id'], nomor_antrian=nomor, poli=poli, keluhan=keluhan)
    
    db.session.add(new_queue)
    db.session.commit()
    
    return jsonify({
        "message": "Berhasil mengambil antrian",
        "data": {
            "nomor_antrian": nomor,
            "poli": poli,
            "status": "menunggu"
        }
    }), 201

@queue_bp.route('/status', methods=['GET'])
@jwt_required()
def queue_status():
    current_user = get_jwt_identity()
    today = date.today()
    
    active_queue = Queue.query.filter(
        Queue.user_id == current_user['id'],
        Queue.status.in_(['menunggu', 'dipanggil']),
        db.func.date(Queue.created_at) == today
    ).first()
    
    if not active_queue:
        return jsonify({"message": "Tidak ada antrian aktif", "data": None}), 200
        
    antrian_didepan = Queue.query.filter(
        Queue.poli == active_queue.poli,
        Queue.status == 'menunggu',
        Queue.id < active_queue.id,
        db.func.date(Queue.created_at) == today
    ).count()
    
    return jsonify({
        "message": "Status antrian",
        "data": {
            "id": active_queue.id,
            "nomor_antrian": active_queue.nomor_antrian,
            "poli": active_queue.poli,
            "status": active_queue.status,
            "antrian_di_depan": antrian_didepan,
            "estimasi_waktu": f"{antrian_didepan * 15} menit"
        }
    }), 200

@queue_bp.route('/all', methods=['GET'])
@jwt_required()
def all_queues():
    current_user = get_jwt_identity()
    if current_user['role'] != 'petugas':
        return jsonify({"message": "Akses ditolak"}), 403
        
    today = date.today()
    queues = Queue.query.filter(
        db.func.date(Queue.created_at) == today
    ).order_by(Queue.id.asc()).all()
    
    result = []
    for q in queues:
        result.append({
            "id": q.id,
            "nomor_antrian": q.nomor_antrian,
            "poli": q.poli,
            "keluhan": q.keluhan,
            "status": q.status,
            "nama_pasien": q.user.nama if q.user else "Unknown"
        })
        
    return jsonify({"data": result}), 200

@queue_bp.route('/next', methods=['PUT'])
@jwt_required()
def next_queue():
    current_user = get_jwt_identity()
    if current_user['role'] != 'petugas':
        return jsonify({"message": "Akses ditolak"}), 403
        
    data = request.get_json() or {}
    poli = data.get('poli')
    today = date.today()
    
    query = Queue.query.filter(
        Queue.status == 'menunggu',
        db.func.date(Queue.created_at) == today
    )
    if poli:
        query = query.filter(Queue.poli == poli)
        
    next_q = query.order_by(Queue.id.asc()).first()
    
    if not next_q:
        return jsonify({"message": "Tidak ada antrian menunggu"}), 404
        
    next_q.status = 'dipanggil'
    db.session.commit()
    
    return jsonify({
        "message": f"Antrian {next_q.nomor_antrian} dipanggil",
        "data": {
            "id": next_q.id,
            "nomor_antrian": next_q.nomor_antrian,
            "poli": next_q.poli
        }
    }), 200

@queue_bp.route('/done/<int:id>', methods=['PUT'])
@jwt_required()
def done_queue(id):
    current_user = get_jwt_identity()
    if current_user['role'] != 'petugas':
        return jsonify({"message": "Akses ditolak"}), 403
        
    q = Queue.query.get(id)
    if not q:
        return jsonify({"message": "Antrian tidak ditemukan"}), 404
        
    q.status = 'selesai'
    db.session.commit()
    
    return jsonify({"message": "Antrian selesai"}), 200
