// Простой скрипт для отображения профиля без использования React
document.addEventListener('DOMContentLoaded', function() {
    console.log('Запасной скрипт загружен');
    
    // Проверяем, был ли уже отрендерен профиль через React
    const rootElement = document.getElementById('root');
    if (rootElement.children.length > 1) {
        console.log('Профиль уже отрендерен другим скриптом');
        return;
    }
    
    console.log('Рендерим профиль через запасной скрипт');
    
    // Получаем данные из localStorage
    const storedUserData = localStorage.getItem('userData');
    let userData = null;
    
    try {
        if (storedUserData) {
            userData = JSON.parse(storedUserData);
            console.log('Данные пользователя из localStorage:', userData);
        }
    } catch (err) {
        console.error('Ошибка при разборе данных:', err);
    }
    
    // Создаем HTML для профиля
    let profileHTML = `
        <div>
            <header class="navbar">
                <div class="logo">Профиль</div>
                <nav class="nav-links"></nav>
                <div class="user-panel">
                    <div class="user-info">
                        <img src="${userData && userData.avatar ? userData.avatar : 'avatar-placeholder.png'}" alt="Аватар" class="user-avatar">
                        <span class="user-name">${userData ? userData.full_name : 'Пользователь'}</span>
                        <div class="dropdown-arrow">▼</div>
                    </div>
                    <div class="dropdown-menu">
                        <a href="profile.html" class="dropdown-item">Профиль</a>
                        <a href="settings.html" class="dropdown-item">Настройки</a>
                        <button class="dropdown-item" id="logout-btn">Выйти</button>
                    </div>
                </div>
            </header>

            <div class="profile-container" style="justify-content: flex-start; padding-left: 40px;">
                <div class="profile-panel">
                    <div class="profile-header">
                        <h2>Профиль пользователя</h2>
                        <a href="panel.html" class="back-btn">Назад</a>
                    </div>
                    <div class="profile-content">
                        <div class="profile-info">
                            <div class="avatar-section">
                                <img src="${userData && userData.avatar ? userData.avatar : 'avatar-placeholder.png'}" alt="Аватар" class="profile-avatar">
                                <button class="change-avatar-btn" id="change-avatar-btn">Изменить фото</button>
                            </div>
                            <div class="info-section">
                                <div class="info-item">
                                    <span class="info-label">Имя:</span>
                                    <span class="info-value" id="firstName">${userData && userData.full_name ? userData.full_name.split(' ')[1] || 'Не указано' : 'Не указано'}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Фамилия:</span>
                                    <span class="info-value" id="lastName">${userData && userData.full_name ? userData.full_name.split(' ')[0] || 'Не указано' : 'Не указано'}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Логин:</span>
                                    <span class="info-value">${userData && userData.login ? userData.login : 'Не указано'}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Роль:</span>
                                    <span class="info-value">${userData && userData.is_admin ? 'Администратор' : (userData && userData.role ? userData.role : 'Преподаватель')}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Дата регистрации:</span>
                                    <span class="info-value">${userData && userData.registration_date ? userData.registration_date : new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div class="profile-actions">
                            <button class="edit-profile-btn" id="edit-profile-btn">Редактировать профиль</button>
                            <button class="change-password-btn">Изменить пароль</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Модальное окно для редактирования профиля -->
            <div id="edit-profile-modal" class="modal">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Редактирование профиля</h2>
                    <div id="edit-error-message" class="error-message" style="display: none;"></div>
                    <div id="edit-success-message" class="success-message" style="display: none;"></div>
                    <form id="edit-profile-form">
                        <div class="form-group">
                            <input type="text" id="edit-lastName" name="lastName" placeholder="Фамилия" required>
                        </div>
                        <div class="form-group">
                            <input type="text" id="edit-firstName" name="firstName" placeholder="Имя" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="save-btn">Сохранить</button>
                            <button type="button" class="cancel-btn">Отмена</button>
                        </div>
                    </form>
                    <div class="info-text">
                        Заявка будет проверена администратором прежде чем изменения будут применены
                    </div>
                </div>
            </div>

            <!-- Модальное окно для загрузки и обрезки аватарки -->
            <div id="avatar-modal" class="modal">
                <div class="modal-content avatar-modal-content">
                    <span class="close-modal" id="close-avatar-modal">&times;</span>
                    <h2>Загрузка аватарки</h2>
                    <div id="avatar-error-message" class="error-message" style="display: none;"></div>
                    <div id="avatar-success-message" class="success-message" style="display: none;"></div>
                    
                    <div class="avatar-upload-container">
                        <div class="file-upload-wrapper">
                            <input type="file" id="avatar-upload" accept="image/*" style="display: none;">
                            <button class="upload-btn" id="select-avatar-btn">Выбрать файл</button>
                            <span class="file-name" id="file-name">Файл не выбран</span>
                        </div>
                        
                        <div class="cropper-container" id="cropper-container" style="display: none;">
                            <div class="img-container">
                                <img id="image-to-crop" src="" alt="Изображение для обрезки">
                            </div>
                            <div class="cropper-controls">
                                <button class="rotate-btn" id="rotate-left">↺</button>
                                <button class="rotate-btn" id="rotate-right">↻</button>
                                <button class="zoom-btn" id="zoom-in">+</button>
                                <button class="zoom-btn" id="zoom-out">-</button>
                            </div>
                        </div>
                        
                        <div class="avatar-actions" style="display: none;" id="avatar-actions">
                            <button class="save-btn" id="save-avatar-btn">Сохранить</button>
                            <button class="cancel-btn" id="cancel-avatar-btn">Отмена</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем стили для модального окна
    const modalStyles = `
        <style>
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.4);
            }
            
            .modal-content {
                background-color: rgb(66, 66, 66);
                margin: 15% auto;
                padding: 30px;
                border-radius: 10px;
                width: 100%;
                max-width: 400px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                text-align: center;
            }
            
            .avatar-modal-content {
                max-width: 500px;
                margin: 5% auto;
            }
            
            .close-modal {
                color: #ffffff;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
            }
            
            .form-group {
                margin-bottom: 15px;
                text-align: left;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #ffffff;
            }
            
            .form-group input {
                width: 100%;
                padding: 12px;
                box-sizing: border-box;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
            }
            
            .modal-content h2 {
                margin-bottom: 20px;
                color: #ffffff;
                text-align: center;
            }
            
            .form-actions {
                margin-top: 20px;
                display: flex;
                justify-content: space-between;
                gap: 10px;
            }
            
            .save-btn, .cancel-btn, .upload-btn {
                padding: 12px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                flex: 1;
            }
            
            .save-btn, .upload-btn {
                background-color: #f1701f;
                color: white;
            }
            
            .save-btn:hover, .upload-btn:hover {
                background-color: #e05a0c;
            }
            
            .cancel-btn {
                background-color: #888;
                color: white;
            }
            
            .cancel-btn:hover {
                background-color: #777;
            }
            
            .avatar-upload-container {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .file-upload-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .file-name {
                color: #ccc;
                font-size: 14px;
                margin-top: 5px;
            }
            
            .cropper-container {
                width: 100%;
                max-height: 300px;
                margin: 20px 0;
            }
            
            .img-container {
                max-width: 100%;
                height: 250px;
                background-color: #444;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .img-container img {
                max-width: 100%;
                max-height: 250px;
                display: block;
            }
            
            .cropper-controls {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 10px;
            }
            
            .rotate-btn, .zoom-btn {
                background-color: #555;
                color: white;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                font-size: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .rotate-btn:hover, .zoom-btn:hover {
                background-color: #666;
            }
            
            .avatar-actions {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                margin-top: 15px;
            }
            
            /* Информационное сообщение для плашки */
            .info-text {
                background: rgb(66, 66, 66);
                padding: 12px;
                border-radius: 10px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                width: 100%;
                text-align: center;
                margin-top: 20px;
                color: #ffffff;
                font-size: 14px;
            }
            
            /* Стили для сообщений */
            .error-message {
                color: #ff4444;
                background-color: rgba(255, 68, 68, 0.1);
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                font-size: 14px;
            }
            
            .success-message {
                color: #00C851;
                background-color: rgba(0, 200, 81, 0.1);
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                font-size: 14px;
            }
        </style>
    `;
    
    // Подключаем библиотеку Cropper.js
    const cropperScript = document.createElement('script');
    cropperScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.js';
    document.head.appendChild(cropperScript);
    
    // Подключаем стили для Cropper.js
    const cropperStyle = document.createElement('link');
    cropperStyle.rel = 'stylesheet';
    cropperStyle.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.css';
    document.head.appendChild(cropperStyle);
    
    // Обновляем содержимое страницы
    rootElement.innerHTML = profileHTML + modalStyles;
    
    // Добавляем обработчик для кнопки выхода
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('userData');
        window.location.href = 'auth.html';
    });
    
    // Обработчики для модального окна редактирования профиля
    const modal = document.getElementById('edit-profile-modal');
    const editBtn = document.getElementById('edit-profile-btn');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const form = document.getElementById('edit-profile-form');
    
    // Открываем модальное окно и заполняем текущими данными
    editBtn.addEventListener('click', function() {
        const firstName = document.getElementById('firstName').textContent;
        const lastName = document.getElementById('lastName').textContent;
        
        document.getElementById('edit-firstName').value = firstName === 'Не указано' ? '' : firstName;
        document.getElementById('edit-lastName').value = lastName === 'Не указано' ? '' : lastName;
        
        modal.style.display = 'block';
    });
    
    // Закрываем модальное окно при клике на крестик или кнопку отмены
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Закрываем модальное окно при клике вне его
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Обрабатываем отправку формы
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Скрываем предыдущие сообщения
        document.getElementById('edit-error-message').style.display = 'none';
        document.getElementById('edit-success-message').style.display = 'none';
        
        const firstName = document.getElementById('edit-firstName').value.trim();
        const lastName = document.getElementById('edit-lastName').value.trim();
        
        if (!firstName || !lastName) {
            const errorMsg = document.getElementById('edit-error-message');
            errorMsg.textContent = 'Пожалуйста, заполните все поля';
            errorMsg.style.display = 'block';
            return;
        }
        
        // Обновляем данные пользователя
        updateUserProfile(lastName, firstName);
    });
    
    // Функция для обновления профиля пользователя
    async function updateUserProfile(lastName, firstName) {
        try {
            // Скрываем предыдущие сообщения
            document.getElementById('edit-error-message').style.display = 'none';
            document.getElementById('edit-success-message').style.display = 'none';
            
            // Проверяем, есть ли данные пользователя
            if (!userData || !userData.id) {
                throw new Error('Отсутствуют данные пользователя');
            }
            
            // Формируем новое полное имя
            const fullName = `${lastName} ${firstName}`;
            
            // Отправляем запрос на сервер
            const response = await fetch('http://localhost:8000/update_profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userData.id,
                    full_name: fullName
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка обновления профиля');
            }
            
            // Получаем ответ
            const responseData = await response.json();
            
            // Если это админ, то обновляем данные сразу
            if (userData.is_admin) {
                // Обновляем данные в localStorage
                userData.full_name = fullName;
                localStorage.setItem('userData', JSON.stringify(userData));
                
                // Обновляем отображение на странице
                document.getElementById('firstName').textContent = firstName;
                document.getElementById('lastName').textContent = lastName;
                document.querySelector('.user-name').textContent = fullName;
                
                // Показываем сообщение об успешном обновлении
                const successMsg = document.getElementById('edit-success-message');
                successMsg.textContent = 'Профиль успешно обновлен!';
                successMsg.style.display = 'block';
                
                // Закрываем модальное окно через 2 секунды
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 2000);
            } else {
                // Если это обычный пользователь, показываем сообщение о ожидании подтверждения
                const successMsg = document.getElementById('edit-success-message');
                successMsg.textContent = 'Запрос на изменение профиля отправлен. Ожидается подтверждение администратором.';
                successMsg.style.display = 'block';
            }
            
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            const errorMsg = document.getElementById('edit-error-message');
            errorMsg.textContent = 'Ошибка при обновлении профиля: ' + error.message;
            errorMsg.style.display = 'block';
        }
    }
    
    // Обработчики для модального окна загрузки аватарки
    const avatarModal = document.getElementById('avatar-modal');
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const closeAvatarBtn = document.getElementById('close-avatar-modal');
    const selectAvatarBtn = document.getElementById('select-avatar-btn');
    const avatarUpload = document.getElementById('avatar-upload');
    const fileName = document.getElementById('file-name');
    const cropperContainer = document.getElementById('cropper-container');
    const avatarActions = document.getElementById('avatar-actions');
    const saveAvatarBtn = document.getElementById('save-avatar-btn');
    const cancelAvatarBtn = document.getElementById('cancel-avatar-btn');
    const rotateLeftBtn = document.getElementById('rotate-left');
    const rotateRightBtn = document.getElementById('rotate-right');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    
    let cropper;
    
    // Открываем модальное окно загрузки аватарки
    changeAvatarBtn.addEventListener('click', function() {
        avatarModal.style.display = 'block';
    });
    
    // Закрываем модальное окно при клике на крестик
    closeAvatarBtn.addEventListener('click', function() {
        avatarModal.style.display = 'none';
        resetAvatarUpload();
    });
    
    // Закрываем модальное окно при клике вне его
    window.addEventListener('click', function(event) {
        if (event.target === avatarModal) {
            avatarModal.style.display = 'none';
            resetAvatarUpload();
        }
    });
    
    // Обработчик для кнопки выбора файла
    selectAvatarBtn.addEventListener('click', function() {
        avatarUpload.click();
    });
    
    // Обработчик изменения выбранного файла
    avatarUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Проверяем тип файла
        if (!file.type.match('image.*')) {
            showAvatarError('Пожалуйста, выберите изображение');
            return;
        }
        
        // Показываем имя файла
        fileName.textContent = file.name;
        
        // Создаем URL для изображения
        const imageURL = URL.createObjectURL(file);
        const image = document.getElementById('image-to-crop');
        image.src = imageURL;
        
        // Показываем контейнер для обрезки
        cropperContainer.style.display = 'block';
        avatarActions.style.display = 'flex';
        
        // Инициализируем Cropper.js после загрузки изображения
        image.onload = function() {
            if (cropper) {
                cropper.destroy();
            }
            
            cropper = new Cropper(image, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 0.8,
                responsive: true
            });
        };
    });
    
    // Обработчики для кнопок управления обрезкой
    rotateLeftBtn.addEventListener('click', function() {
        if (cropper) cropper.rotate(-90);
    });
    
    rotateRightBtn.addEventListener('click', function() {
        if (cropper) cropper.rotate(90);
    });
    
    zoomInBtn.addEventListener('click', function() {
        if (cropper) cropper.zoom(0.1);
    });
    
    zoomOutBtn.addEventListener('click', function() {
        if (cropper) cropper.zoom(-0.1);
    });
    
    // Обработчик для кнопки отмены
    cancelAvatarBtn.addEventListener('click', function() {
        resetAvatarUpload();
    });
    
    // Обработчик для кнопки сохранения
    saveAvatarBtn.addEventListener('click', async function() {
        if (!cropper) {
            showAvatarError('Сначала загрузите изображение');
            return;
        }
        
        try {
            // Получаем обрезанное изображение как Blob
            const croppedCanvas = cropper.getCroppedCanvas({
                width: 150,
                height: 150
            });
            
            // Конвертируем Canvas в Blob
            croppedCanvas.toBlob(async function(blob) {
                // Сохраняем в localStorage как Data URL
                const reader = new FileReader();
                reader.onload = async function(e) {
                    const base64Image = e.target.result;
                    
                    try {
                        // Обновляем аватарку в localStorage
                        if (userData) {
                            userData.avatar = base64Image;
                            localStorage.setItem('userData', JSON.stringify(userData));
                            
                            // Если есть ID пользователя, пытаемся отправить на сервер
                            if (userData.id) {
                                try {
                                    // Преобразуем Base64 в Blob для отправки
                                    const fetchResponse = await fetch(base64Image);
                                    const imageBlob = await fetchResponse.blob();
                                    
                                    // Создаем FormData для отправки
                                    const formData = new FormData();
                                    formData.append('user_id', userData.id);
                                    formData.append('avatar', imageBlob, 'avatar.jpg');
                                    
                                    // Отправляем запрос на сервер
                                    await fetch('http://localhost:8000/update_avatar', {
                                        method: 'POST',
                                        body: formData
                                    });
                                    
                                    console.log('Аватарка успешно отправлена на сервер');
                                } catch (serverError) {
                                    console.warn('Не удалось отправить аватарку на сервер, но она сохранена локально', serverError);
                                    // Не прерываем процесс, если сервер недоступен - аватарка уже сохранена локально
                                }
                            }
                            
                            // Обновляем отображение аватарки
                            const avatars = document.querySelectorAll('.profile-avatar, .user-avatar');
                            avatars.forEach(avatar => {
                                avatar.src = base64Image;
                            });
                            
                            // Показываем сообщение об успехе
                            showAvatarSuccess('Аватарка успешно обновлена!');
                            
                            // Закрываем модальное окно через 2 секунды
                            setTimeout(function() {
                                avatarModal.style.display = 'none';
                                resetAvatarUpload();
                            }, 2000);
                        } else {
                            throw new Error('Данные пользователя не найдены');
                        }
                    } catch (error) {
                        console.error('Ошибка при сохранении аватарки:', error);
                        showAvatarError('Не удалось сохранить аватарку. Пожалуйста, попробуйте еще раз.');
                    }
                };
                reader.readAsDataURL(blob);
            }, 'image/jpeg', 0.9);
        } catch (error) {
            console.error('Ошибка при обрезке изображения:', error);
            showAvatarError('Ошибка при обрезке изображения');
        }
    });
    
    // Функция для сброса состояния загрузки аватарки
    function resetAvatarUpload() {
        avatarUpload.value = '';
        fileName.textContent = 'Файл не выбран';
        cropperContainer.style.display = 'none';
        avatarActions.style.display = 'none';
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        document.getElementById('avatar-error-message').style.display = 'none';
        document.getElementById('avatar-success-message').style.display = 'none';
    }
    
    // Функция для отображения ошибки
    function showAvatarError(message) {
        const errorMsg = document.getElementById('avatar-error-message');
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
        document.getElementById('avatar-success-message').style.display = 'none';
    }
    
    // Функция для отображения сообщения об успехе
    function showAvatarSuccess(message) {
        const successMsg = document.getElementById('avatar-success-message');
        successMsg.textContent = message;
        successMsg.style.display = 'block';
        document.getElementById('avatar-error-message').style.display = 'none';
    }
    
    console.log('Профиль отрендерен через запасной скрипт');
}); 