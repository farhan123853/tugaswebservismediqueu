from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    nama = data.get('nama')
    email = data.get('email')
    password = data.get('password')
    no_hp = data.get('no_hp')
    role = data.get('role', 'pasien')
    
    if not all([nama, email, password, no_hp]):
        return jsonify({"message": "Semua field harus diisi"}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email sudah terdaftar"}), 400
        
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(nama=nama, email=email, password=hashed_password, no_hp=no_hp, role=role)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "Registrasi berhasil"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity={'id': user.id, 'role': user.role, 'nama': user.nama})
        return jsonify({
            "message": "Login berhasil",
            "token": access_token,
            "user": {
                "id": user.id,
                "nama": user.nama,
                "role": user.role
            }
        }), 200
    else:
        return jsonify({"message": "Email atau password salah"}), 401
