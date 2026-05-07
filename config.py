import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super-secret-key-mediqueue')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql+pymysql://root:@localhost/mediqueue_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-super-secret-mediqueue')
    JWT_ACCESS_TOKEN_EXPIRES = 86400 # 1 hari
