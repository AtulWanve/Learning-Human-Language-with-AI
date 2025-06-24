import secrets
import datetime
from .db import db

sessions_collection = db["sessions"]

def create_session(user_id):
    token = secrets.token_hex(32)
    now = datetime.datetime.utcnow()
    session_data = {
        "user_id": user_id,
        "token": token,
        "created_at": now,
        "expires_at": now + datetime.timedelta(days=7)

    }
    sessions_collection.insert_one(session_data)
    return token

def get_user_by_token(token):
    session = sessions_collection.find_one({"token": token})
    if session and session["expires_at"] > datetime.datetime.utcnow():
        return session["user_id"]
    return None

def delete_session(token):
    sessions_collection.delete_one({"token": token})
