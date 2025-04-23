const { useState, useEffect } = React;

function ProfileComponent() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('ProfileComponent загружен');
        // Получаем данные пользователя из localStorage
        const storedUserData = localStorage.getItem('userData');
        console.log('Данные из localStorage:', storedUserData);
        
        if (storedUserData) {
            try {
                const parsedUserData = JSON.parse(storedUserData);
                console.log('Разобранные данные пользователя:', parsedUserData);
                setUserData(parsedUserData);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка при разборе данных пользователя:', err);
                setError('Ошибка при загрузке данных пользователя');
                setLoading(false);
            }
        } else {
            console.log('Данные пользователя не найдены, остаёмся на странице профиля с пустыми данными');
            // Вместо перенаправления, просто покажем пустые данные
            setLoading(false);
            // Раскомментируйте строку ниже, если нужно перенаправление
            // window.location.href = 'auth.html';
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userData');
        window.location.href = 'auth.html';
    };

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    // Безопасно получаем значения из userData
    const fullName = userData && userData.full_name ? userData.full_name : 'Пользователь';
    const firstName = userData && userData.full_name ? userData.full_name.split(' ')[1] || 'Не указано' : 'Не указано';
    const lastName = userData && userData.full_name ? userData.full_name.split(' ')[0] || 'Не указано' : 'Не указано';
    const email = userData && userData.email ? userData.email : (userData && userData.login ? userData.login : 'Не указано');
    const role = userData && userData.role ? userData.role : 'Преподаватель';
    const registrationDate = userData && userData.registration_date ? userData.registration_date : new Date().toLocaleDateString();

    return (
        <div>
            <header className="navbar">
                <div className="logo">Профиль</div>
                <nav className="nav-links"></nav>
                <div className="user-panel">
                    <div className="user-info">
                        <img src="avatar-placeholder.png" alt="Аватар" className="user-avatar" />
                        <span className="user-name">{fullName}</span>
                        <div className="dropdown-arrow">▼</div>
                    </div>
                    <div className="dropdown-menu">
                        <a href="profile.html" className="dropdown-item">Профиль</a>
                        <a href="settings.html" className="dropdown-item">Настройки</a>
                        <button className="dropdown-item" onClick={handleLogout}>Выйти</button>
                    </div>
                </div>
            </header>

            <div className="profile-container">
                <div className="profile-panel">
                    <div className="profile-header">
                        <h2>Профиль пользователя</h2>
                        <a href="panel.html" className="back-btn">Назад</a>
                    </div>
                    <div className="profile-content">
                        <div className="profile-info">
                            <div className="avatar-section">
                                <img src="avatar-placeholder.png" alt="Аватар" className="profile-avatar" />
                                <button className="change-avatar-btn">Изменить фото</button>
                            </div>
                            <div className="info-section">
                                <div className="info-item">
                                    <span className="info-label">Имя:</span>
                                    <span className="info-value">{firstName}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Фамилия:</span>
                                    <span className="info-value">{lastName}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{email}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Роль:</span>
                                    <span className="info-value">{role}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Дата регистрации:</span>
                                    <span className="info-value">{registrationDate}</span>
                                </div>
                            </div>
                        </div>
                        <div className="profile-actions">
                            <button className="edit-profile-btn">Редактировать профиль</button>
                            <button className="change-password-btn">Изменить пароль</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Функция для проверки загрузки React и ReactDOM
function checkReactLoaded() {
    console.log('Проверка загрузки React и ReactDOM');
    if (typeof React === 'undefined') {
        console.error('React не загружен!');
        return false;
    }
    if (typeof ReactDOM === 'undefined') {
        console.error('ReactDOM не загружен!');
        return false;
    }
    console.log('React и ReactDOM загружены успешно');
    return true;
}

// Рендерим React компонент
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен');
    
    if (!checkReactLoaded()) {
        document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">Ошибка: React не загружен</div>';
        return;
    }
    
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        console.error('Элемент с id "root" не найден!');
        return;
    }
    
    console.log('Рендеринг компонента...');
    ReactDOM.render(<ProfileComponent />, rootElement);
    console.log('Рендеринг завершен');
}); 