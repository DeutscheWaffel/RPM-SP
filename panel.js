// Проверяем, авторизован ли пользователь
const userData = JSON.parse(localStorage.getItem('userData'));
if (!userData) {
    window.location.href = 'auth.html';
}

// Обновляем информацию о пользователе в шапке
document.querySelector('.user-name').textContent = userData.full_name;

// Обработчик выхода
document.querySelector('.dropdown-menu a[href="login.html"]').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('userData');
    window.location.href = 'auth.html';
});

// Преобразуем структуру main-content для всех пользователей
const mainContent = document.querySelector('.main-content');
mainContent.style.display = 'flex';

// Если пользователь администратор, добавляем панели администратора
if (userData.is_admin) {
    console.log('Пользователь является администратором, добавляем административные панели');
    
    // Очищаем существующие административные панели, если они есть
    const existingPanels = document.querySelector('.admin-panels-container');
    if (existingPanels) {
        existingPanels.remove();
    }
    
    // Создаем контейнер для панелей администратора
    const adminPanelsContainer = document.createElement('div');
    adminPanelsContainer.className = 'admin-panels-container';
    
    // Создаем панель для одобрения изменений профилей
    const profileChangesPanel = document.createElement('div');
    profileChangesPanel.className = 'admin-panel profile-changes-panel';
    profileChangesPanel.innerHTML = `
        <div class="control-panel">
            <h2>Запросы на изменение профиля</h2>
            <div class="profile-changes">
                <h3>Ожидающие подтверждения</h3>
                <div class="profile-changes-list">
                    <div class="loading">Загрузка данных...</div>
                </div>
            </div>
        </div>
    `;
    
    // Создаем панель одобрения пользователей
    const usersPanel = document.createElement('div');
    usersPanel.className = 'admin-panel users-panel';
    usersPanel.innerHTML = `
        <div class="control-panel">
            <h2>Заявки на регистрацию</h2>
            <div class="pending-users">
                <h3>Ожидающие подтверждения</h3>
                <div class="users-list">
                    <div class="loading">Загрузка данных...</div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем панели в контейнер
    adminPanelsContainer.appendChild(profileChangesPanel);
    adminPanelsContainer.appendChild(usersPanel);
    
    // Добавляем контейнер на страницу после основной панели
    mainContent.appendChild(adminPanelsContainer);
    
    console.log('Административные панели добавлены в DOM');

    // Функция для загрузки списка неподтвержденных пользователей
    async function loadPendingUsers() {
        console.log('Загрузка списка неподтвержденных пользователей...');
        try {
            const response = await fetch('http://localhost:8000/pending-users');
            if (!response.ok) throw new Error('Ошибка загрузки пользователей');
            
            const users = await response.json();
            console.log('Получены данные о неподтвержденных пользователях:', users);
            
            const usersList = document.querySelector('.users-list');
            usersList.innerHTML = '';
            
            if (users.length === 0) {
                usersList.innerHTML = '<div class="empty-list">Нет заявок на рассмотрении</div>';
                return;
            }
            
            users.forEach(user => {
                const userElement = document.createElement('div');
                userElement.className = 'user-item';
                userElement.innerHTML = `
                    <div class="user-info">
                        <span class="user-name">${user.full_name}</span>
                        <span class="user-login">(${user.login})</span>
                    </div>
                    <div class="user-actions">
                        <button class="approve-btn" data-id="${user.id}">Подтвердить</button>
                        <button class="reject-btn" data-id="${user.id}">Отклонить</button>
                    </div>
                `;
                usersList.appendChild(userElement);
            });

            // Добавляем обработчики для кнопок
            document.querySelectorAll('.users-list .approve-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const userId = btn.dataset.id;
                    try {
                        const response = await fetch(`http://localhost:8000/approve-user/${userId}`, {
                            method: 'POST'
                        });
                        if (!response.ok) throw new Error('Ошибка подтверждения пользователя');
                        loadPendingUsers(); // Перезагружаем список
                    } catch (error) {
                        console.error('Ошибка:', error);
                    }
                });
            });

            document.querySelectorAll('.users-list .reject-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const userId = btn.dataset.id;
                    try {
                        const response = await fetch(`http://localhost:8000/reject-user/${userId}`, {
                            method: 'POST'
                        });
                        if (!response.ok) throw new Error('Ошибка отклонения пользователя');
                        loadPendingUsers(); // Перезагружаем список
                    } catch (error) {
                        console.error('Ошибка:', error);
                    }
                });
            });
        } catch (error) {
            console.error('Ошибка при загрузке списка неподтвержденных пользователей:', error);
            document.querySelector('.users-list').innerHTML = 
                '<div class="error">Ошибка при загрузке данных. Пожалуйста, обновите страницу.</div>';
        }
    }
    
    // Функция для загрузки списка запросов на изменение профиля
    async function loadProfileChangeRequests() {
        console.log('Загрузка списка запросов на изменение профиля...');
        try {
            const response = await fetch('http://localhost:8000/profile_change_requests');
            if (!response.ok) throw new Error('Ошибка загрузки запросов на изменение профиля');
            
            const requests = await response.json();
            console.log('Получены данные о запросах на изменение профиля:', requests);
            
            const requestsList = document.querySelector('.profile-changes-list');
            requestsList.innerHTML = '';
            
            if (requests.length === 0) {
                requestsList.innerHTML = '<div class="empty-list">Нет запросов на рассмотрении</div>';
                return;
            }
            
            requests.forEach(request => {
                const requestElement = document.createElement('div');
                requestElement.className = 'change-request-item';
                
                // Получаем имя и фамилию
                const oldNameParts = request.old_full_name.split(' ');
                const newNameParts = request.new_full_name.split(' ');
                
                const oldLastName = oldNameParts[0] || '';
                const oldFirstName = oldNameParts[1] || '';
                
                const newLastName = newNameParts[0] || '';
                const newFirstName = newNameParts[1] || '';
                
                requestElement.innerHTML = `
                    <div class="request-info">
                        <div class="user-info">
                            <span class="user-login">${request.user_login}</span>
                        </div>
                        <div class="change-details">
                            <div class="old-data">
                                <span class="label">Старые данные:</span>
                                <span>Фамилия: <b>${oldLastName}</b>, Имя: <b>${oldFirstName}</b></span>
                            </div>
                            <div class="new-data">
                                <span class="label">Новые данные:</span>
                                <span>Фамилия: <b>${newLastName}</b>, Имя: <b>${newFirstName}</b></span>
                            </div>
                        </div>
                    </div>
                    <div class="request-actions">
                        <button class="approve-change-btn" data-id="${request.id}">Подтвердить</button>
                        <button class="reject-change-btn" data-id="${request.id}">Отклонить</button>
                    </div>
                `;
                requestsList.appendChild(requestElement);
            });

            // Добавляем обработчики для кнопок
            document.querySelectorAll('.approve-change-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const requestId = btn.dataset.id;
                    try {
                        const response = await fetch(`http://localhost:8000/approve_profile_change/${requestId}`, {
                            method: 'POST'
                        });
                        if (!response.ok) throw new Error('Ошибка подтверждения изменения профиля');
                        loadProfileChangeRequests(); // Перезагружаем список
                    } catch (error) {
                        console.error('Ошибка:', error);
                    }
                });
            });

            document.querySelectorAll('.reject-change-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const requestId = btn.dataset.id;
                    try {
                        const response = await fetch(`http://localhost:8000/reject_profile_change/${requestId}`, {
                            method: 'POST'
                        });
                        if (!response.ok) throw new Error('Ошибка отклонения изменения профиля');
                        loadProfileChangeRequests(); // Перезагружаем список
                    } catch (error) {
                        console.error('Ошибка:', error);
                    }
                });
            });
        } catch (error) {
            console.error('Ошибка при загрузке запросов на изменение профиля:', error);
            document.querySelector('.profile-changes-list').innerHTML = 
                '<div class="error">Ошибка при загрузке данных. Пожалуйста, обновите страницу.</div>';
        }
    }

    // Загружаем списки при загрузке страницы
    console.log('Инициализация загрузки данных');
    loadPendingUsers();
    loadProfileChangeRequests();
    
    // Обновляем списки каждые 30 секунд
    setInterval(loadPendingUsers, 30000);
    setInterval(loadProfileChangeRequests, 30000);
} else {
    console.log('Пользователь не является администратором, административные панели не будут отображены');
} 