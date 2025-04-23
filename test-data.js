// Тестовые данные для отладки страницы профиля
// Подключите этот скрипт в profile.html перед profile.js для тестирования
// с заполненными данными

document.addEventListener('DOMContentLoaded', function() {
    console.log('Заполнение тестовых данных...');
    
    // Создаем тестовые данные
    const testUserData = {
        full_name: 'Иванов Иван',
        login: 'ivanov',
        email: 'ivan@example.com',
        role: 'Преподаватель',
        registration_date: '01.05.2023'
    };
    
    // Сохраняем в localStorage
    localStorage.setItem('userData', JSON.stringify(testUserData));
    console.log('Тестовые данные сохранены в localStorage');
}); 