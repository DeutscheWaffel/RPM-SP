const { useState } = React;

function AuthComponent() {
    const [isLogin, setIsLogin] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const firstName = e.target.elements.first_name.value.trim();
        const lastName = e.target.elements.last_name.value.trim();
        const full_name = `${lastName} ${firstName}`;

        const formData = {
            full_name: full_name,
            login: e.target.elements.login.value,
            password: e.target.elements.password.value
        };

        try {
            const response = await fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка регистрации');
            }

            setSuccess('Заявка успешно отправлена! Ожидайте подтверждения администратора.');
            e.target.reset();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const formData = {
            login: e.target.elements.login.value,
            password: e.target.elements.password.value
        };

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка входа');
            }

            const userData = await response.json();
            // Сохраняем данные пользователя
            localStorage.setItem('userData', JSON.stringify(userData));
            setSuccess('Успешный вход!');
            
            // Перенаправляем на панель управления
            window.location.href = 'panel.html';
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <header className="navbar">
                <div className="logo">Панель управления</div>
                <nav className="nav-links"></nav>
            </header>
            <div className="main-content">
                <div className={`registration-container ${isLogin ? 'slide-left' : ''}`}>
                    <div className="registration-box">
                        <h2>Регистрация преподавателя</h2>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        <form onSubmit={handleRegister}>
                            <input type="text" name="last_name" placeholder="Фамилия" required />
                            <input type="text" name="first_name" placeholder="Имя" required />
                            <input type="text" name="login" placeholder="Логин" required />
                            <input type="password" name="password" placeholder="Пароль" required />
                            <button type="submit">Подать заявку</button>
                        </form>
                        <p className="login-link">
                            Уже есть аккаунт?{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>
                                Войти
                            </a>
                        </p>
                        <div className="info-box">
                            <h3>Заявка будет проверена и после проверки, что вы преподаватель, аккаунт будет создан</h3>
                        </div>
                    </div>
                </div>

                <div className={`login-container ${isLogin ? 'slide-in' : ''}`}>
                    <div className="login-box">
                        <h2>Вход в систему</h2>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        <form onSubmit={handleLogin}>
                            <input type="text" name="login" placeholder="Логин" required />
                            <input type="password" name="password" placeholder="Пароль" required />
                            <button type="submit">Войти</button>
                        </form>
                        <p className="login-link">
                            Нет аккаунта?{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>
                                Зарегистрироваться
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

ReactDOM.render(<AuthComponent />, document.getElementById('root')); 