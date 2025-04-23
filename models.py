from peewee import *
import datetime

db = SqliteDatabase('users.db')

class BaseModel(Model):
    class Meta:
        database = db

class User(BaseModel):
    full_name = CharField()
    login = CharField(unique=True)
    password = CharField()
    is_teacher = BooleanField(default=False)
    is_admin = BooleanField(default=False)
    is_approved = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.datetime.now)

class ProfileChangeRequest(BaseModel):
    user_id = IntegerField()
    old_full_name = CharField()
    new_full_name = CharField()
    created_at = DateTimeField(default=datetime.datetime.now)
    is_approved = BooleanField(default=False)
    is_rejected = BooleanField(default=False)
    reviewed_at = DateTimeField(null=True)

def create_tables():
    with db:
        db.create_tables([User, ProfileChangeRequest]) 