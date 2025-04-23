from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models import User, ProfileChangeRequest, create_tables
import hashlib
import datetime
from typing import Optional, List

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создание таблиц при запуске
create_tables()

class UserRegistration(BaseModel):
    full_name: str
    login: str
    password: str

class UserLogin(BaseModel):
    login: str
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    login: str
    is_teacher: bool
    is_admin: bool
    is_approved: bool

class ProfileUpdate(BaseModel):
    user_id: int
    full_name: str

class ProfileChangeRequestResponse(BaseModel):
    id: int
    user_id: int
    user_login: str
    old_full_name: str
    new_full_name: str
    created_at: datetime.datetime

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@app.post("/register", response_model=UserResponse)
async def register(user: UserRegistration):
    # Проверка существования пользователя
    if User.select().where(User.login == user.login).exists():
        raise HTTPException(status_code=400, detail="Логин уже занят")
    
    # Создание нового пользователя
    hashed_password = hash_password(user.password)
    new_user = User.create(
        full_name=user.full_name,
        login=user.login,
        password=hashed_password,
        is_teacher=True  # По умолчанию все регистрирующиеся - преподаватели
    )
    
    return {
        "id": new_user.id,
        "full_name": new_user.full_name,
        "login": new_user.login,
        "is_teacher": new_user.is_teacher,
        "is_admin": new_user.is_admin,
        "is_approved": new_user.is_approved
    }

@app.post("/login")
async def login(user: UserLogin):
    # Поиск пользователя
    try:
        db_user = User.get(User.login == user.login)
    except User.DoesNotExist:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    
    # Проверка пароля
    if hash_password(user.password) != db_user.password:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    
    # Проверка одобрения аккаунта
    if not db_user.is_approved and not db_user.is_admin:
        raise HTTPException(status_code=403, detail="Аккаунт не одобрен администратором")
    
    return {
        "id": db_user.id,
        "full_name": db_user.full_name,
        "login": db_user.login,
        "is_teacher": db_user.is_teacher,
        "is_admin": db_user.is_admin,
        "is_approved": db_user.is_approved
    }

@app.post("/request_profile_update")
async def request_profile_update(profile_data: ProfileUpdate):
    try:
        # Получаем пользователя по ID
        user = User.get_by_id(profile_data.user_id)
        
        # Создаем запрос на изменение профиля
        change_request = ProfileChangeRequest.create(
            user_id=user.id,
            old_full_name=user.full_name,
            new_full_name=profile_data.full_name
        )
        
        return {"message": "Запрос на изменение профиля отправлен на рассмотрение", "request_id": change_request.id}
    except User.DoesNotExist:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

@app.post("/update_profile", response_model=UserResponse)
async def update_profile(profile_data: ProfileUpdate):
    try:
        # Получаем пользователя по ID
        user = User.get_by_id(profile_data.user_id)
        
        # Проверяем, является ли пользователь админом
        if not user.is_admin:
            # Если не админ, то создаем запрос на изменение
            await request_profile_update(profile_data)
            return {
                "id": user.id,
                "full_name": user.full_name,  # Возвращаем старое имя, т.к. изменение еще не подтверждено
                "login": user.login,
                "is_teacher": user.is_teacher,
                "is_admin": user.is_admin,
                "is_approved": user.is_approved
            }
        
        # Если админ, то обновляем данные сразу
        user.full_name = profile_data.full_name
        user.save()
        
        # Возвращаем обновленные данные
        return {
            "id": user.id,
            "full_name": user.full_name,
            "login": user.login,
            "is_teacher": user.is_teacher,
            "is_admin": user.is_admin,
            "is_approved": user.is_approved
        }
    except User.DoesNotExist:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

@app.get("/profile_change_requests", response_model=List[ProfileChangeRequestResponse])
async def get_profile_change_requests():
    # Получаем все неподтвержденные запросы на изменение профиля
    requests = ProfileChangeRequest.select().where(
        (ProfileChangeRequest.is_approved == False) & 
        (ProfileChangeRequest.is_rejected == False)
    )
    
    result = []
    for request in requests:
        try:
            user = User.get_by_id(request.user_id)
            result.append({
                "id": request.id,
                "user_id": request.user_id,
                "user_login": user.login,
                "old_full_name": request.old_full_name,
                "new_full_name": request.new_full_name,
                "created_at": request.created_at
            })
        except User.DoesNotExist:
            # Если пользователь не найден, пропускаем
            continue
    
    return result

@app.post("/approve_profile_change/{request_id}")
async def approve_profile_change(request_id: int):
    try:
        # Получаем запрос по ID
        change_request = ProfileChangeRequest.get_by_id(request_id)
        
        # Получаем пользователя
        user = User.get_by_id(change_request.user_id)
        
        # Обновляем имя пользователя
        user.full_name = change_request.new_full_name
        user.save()
        
        # Отмечаем запрос как подтвержденный
        change_request.is_approved = True
        change_request.reviewed_at = datetime.datetime.now()
        change_request.save()
        
        return {"message": "Изменение профиля подтверждено"}
    except ProfileChangeRequest.DoesNotExist:
        raise HTTPException(status_code=404, detail="Запрос не найден")
    except User.DoesNotExist:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

@app.post("/reject_profile_change/{request_id}")
async def reject_profile_change(request_id: int):
    try:
        # Получаем запрос по ID
        change_request = ProfileChangeRequest.get_by_id(request_id)
        
        # Отмечаем запрос как отклоненный
        change_request.is_rejected = True
        change_request.reviewed_at = datetime.datetime.now()
        change_request.save()
        
        return {"message": "Изменение профиля отклонено"}
    except ProfileChangeRequest.DoesNotExist:
        raise HTTPException(status_code=404, detail="Запрос не найден")

@app.get("/pending-users", response_model=List[UserResponse])
async def get_pending_users():
    # Получаем всех неподтвержденных пользователей
    users = User.select().where(User.is_approved == False)
    return [{
        "id": user.id,
        "full_name": user.full_name,
        "login": user.login,
        "is_teacher": user.is_teacher,
        "is_admin": user.is_admin,
        "is_approved": user.is_approved
    } for user in users]

@app.post("/approve-user/{user_id}")
async def approve_user(user_id: int):
    try:
        user = User.get_by_id(user_id)
        user.is_approved = True
        user.save()
        return {"message": "Пользователь успешно подтвержден"}
    except User.DoesNotExist:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

@app.post("/reject-user/{user_id}")
async def reject_user(user_id: int):
    try:
        user = User.get_by_id(user_id)
        user.delete_instance()
        return {"message": "Пользователь успешно отклонен"}
    except User.DoesNotExist:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 