// Упрощенная версия React-компонента профиля
document.addEventListener('DOMContentLoaded', function() {
    console.log('Простой React компонент загружен');
    
    // Пробуем получить данные пользователя
    let userData = null;
    try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            userData = JSON.parse(storedUserData);
            console.log('Данные получены:', userData);
        }
    } catch (e) {
        console.error('Ошибка при чтении данных:', e);
    }
    
    // Создаем React-элементы без JSX
    const element = React.createElement(
        'div', 
        { className: 'profile-wrapper' },
        React.createElement('h1', null, 'Профиль пользователя'),
        React.createElement(
            'div', 
            { className: 'user-info-block' },
            React.createElement('p', null, 'Имя: ' + (userData ? userData.full_name : 'Нет данных')),
            React.createElement('p', null, 'Логин: ' + (userData ? userData.login : 'Нет данных')),
            React.createElement(
                'a', 
                { href: 'panel.html', className: 'back-link' }, 
                'Вернуться назад'
            )
        )
    );
    
    // Рендерим элемент
    try {
        console.log('Пытаемся отрендерить React-элемент');
        ReactDOM.render(element, document.getElementById('root'));
        console.log('React-элемент успешно отрендерен');
    } catch (e) {
        console.error('Ошибка при рендеринге React:', e);
    }
}); 