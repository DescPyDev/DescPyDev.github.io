// script.js

let ownershipCount = 0;
let incomeCount = 0;
let liabilityCount = 0;

function addOwnershipItem() {
    ownershipCount++;
    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.innerHTML = `
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
        <div class="form-grid">
            <div class="form-group">
                <label>Наименование имущества</label>
                <input type="text" name="ownership[${ownershipCount}][name]" placeholder="Например: Автомобиль">
            </div>
            <div class="form-group">
                <label>Стоимость</label>
                <input type="number" name="ownership[${ownershipCount}][cost]" placeholder="0">
            </div>
            <div class="form-group">
                <label class="checkbox-group">
                    <input type="checkbox" name="ownership[${ownershipCount}][is_jointly]">
                    Совместно нажитое
                </label>
            </div>
        </div>
    `;
    document.getElementById('ownershipItems').appendChild(item);
}

function addIncomeItem() {
    incomeCount++;
    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.innerHTML = `
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
        <div class="form-grid">
            <div class="form-group">
                <label>Источник дохода</label>
                <input type="text" name="income[${incomeCount}][name]" placeholder="Например: Подработка">
            </div>
            <div class="form-group">
                <label>Сумма в месяц</label>
                <input type="number" name="income[${incomeCount}][salary]" placeholder="0">
            </div>
        </div>
    `;
    document.getElementById('incomeItems').appendChild(item);
}

function addLiabilityItem() {
    liabilityCount++;
    const item = document.createElement('div');
    item.className = 'dynamic-item';
    item.innerHTML = `
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
        <div class="form-grid">
            <div class="form-group">
                <label>Вид обязательства</label>
                <input type="text" name="liabilities[${liabilityCount}][name]" placeholder="Например: Ипотека">
            </div>
            <div class="form-group">
                <label>Ежемесячный платеж</label>
                <input type="number" name="liabilities[${liabilityCount}][monthly_payment]" placeholder="0" class="monthly-payment-input">
            </div>
            <div class="form-group">
                <label>Общая сумма</label>
                <input type="number" name="liabilities[${liabilityCount}][total_liability]" placeholder="0" class="total-liability-input">
            </div>
        </div>
    `;
    document.getElementById('liabilityItems').appendChild(item);
    
    const monthlyPaymentInput = item.querySelector('.monthly-payment-input');
    const totalLiabilityInput = item.querySelector('.total-liability-input');
    
    monthlyPaymentInput.addEventListener('input', calculateTotals);
    totalLiabilityInput.addEventListener('input', calculateTotals);
}

function calculateTotals() {
    let totalLiabilities = 0;
    let totalMonthlyPayment = 0;
    
    const monthlyPaymentInputs = document.querySelectorAll('.monthly-payment-input');
    const totalLiabilityInputs = document.querySelectorAll('.total-liability-input');
    
    monthlyPaymentInputs.forEach(input => {
        const value = parseFloat(input.value) || 0;
        totalMonthlyPayment += value;
    });
    
    totalLiabilityInputs.forEach(input => {
        const value = parseFloat(input.value) || 0;
        totalLiabilities += value;
    });
    
    document.getElementById('totalLiabilities').textContent = totalLiabilities.toLocaleString('ru-RU');
    document.getElementById('totalMonthlyPayment').textContent = totalMonthlyPayment.toLocaleString('ru-RU');
}

function showDebugInfo(info) {
    const debugDiv = document.getElementById('debugInfo');
    debugDiv.innerHTML = `<strong>Отладочная информация:</strong><br>${info}`;
    debugDiv.style.display = 'block';
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    document.getElementById('errorText').textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
}

function serializeFormData(formData) {
    // Получаем значения из формы
    const lastName = formData.get('last_name') || '';
    const firstName = formData.get('first_name') || '';
    const middleName = formData.get('middle_name') || '';
    
    // Преобразуем значения семейного положения
    const maritalStatusValue = formData.get('marital_status') || '';
    const maritalStatusMap = {
        'married': 'Женат/Замужем',
        'single': 'Холост/Не замужем', 
        'divorced': 'Разведен(а)',
        'widowed': 'Вдовец/Вдова'
    };
    const maritalStatus = maritalStatusMap[maritalStatusValue] || maritalStatusValue;
    
    // Преобразуем значения пола
    const genderValue = formData.get('gender') || '';
    const genderMap = {
        'male': 'Мужской',
        'female': 'Женский'
    };
    const gender = genderMap[genderValue] || genderValue;
    
    // Получаем количество детей на иждивении
    const numberOfDependents = parseInt(formData.get('dependents_children')) || 0;
    
    // Собираем данные по категориям
    const ownershipData = {};
    const incomeData = {};
    const liabilitiesData = {};

    formData.forEach((value, key) => {
        const match = key.match(/(\w+)\[(\d+)\]\[(\w+)\]/);
        if (match) {
            const [, type, index, field] = match;
            
            let targetObject;
            if (type === 'ownership') targetObject = ownershipData;
            else if (type === 'income') targetObject = incomeData;
            else if (type === 'liabilities') targetObject = liabilitiesData;
            else return;
            
            if (!targetObject[index]) {
                targetObject[index] = {};
            }
            
            if (field === 'is_jointly') {
                targetObject[index][field] = value === 'on';
            } else if (field === 'salary' || field === 'cost' || 
                       field === 'monthly_payment' || field === 'total_liability') {
                targetObject[index][field] = parseInt(value) || 0;
            } else {
                targetObject[index][field] = value;
            }
        }
    });

    const property = Object.values(ownershipData)
        .filter(item => item.name && item.name.trim() !== '')
        .map(item => ({
            'Наименование': item.name || '',
            'Доля': "",
            'Совм': item.is_jointly ? "Да" : "Нет",
            'Стоимость руб.': item.cost || 0
        }));

    const sources_of_official_income = Object.values(incomeData)
        .filter(item => item.name && item.name.trim() !== '')
        .map(item => ({
            'Источник получения дохода': item.name || '',
            'Сумма в месяц, руб.': item.salary || 0
        }));

    const houseExpenses = parseInt(formData.get('house_expenses')) || 0;
    const foodExpenses = parseInt(formData.get('food_expenses')) || 0;
    const transportExpenses = parseInt(formData.get('transport_expenses')) || 0;
    
    const monthly_expenses = [];
    if (houseExpenses > 0) {
        monthly_expenses.push({
            'Вид расходов': 'Расходы на аренду жилья',
            'Сумма в месяц, руб.': houseExpenses
        });
    }
    if (foodExpenses > 0) {
        monthly_expenses.push({
            'Вид расходов': 'Расходы на продукты питания',
            'Сумма в месяц, руб.': foodExpenses
        });
    }
    if (transportExpenses > 0) {
        monthly_expenses.push({
            'Вид расходов': 'Расходы на транспорт и гсм',
            'Сумма в месяц, руб.': transportExpenses
        });
    }

    const liabilities = Object.values(liabilitiesData)
        .filter(item => item.name && item.name.trim() !== '')
        .map(item => ({
            'Вид обязательства': item.name || '',
            'Ежемесячный платеж': item.monthly_payment || 0,
            'Общая сумма обязательства': item.total_liability || 0
        }));

    const payload = {
        type: "liability",
        fullname: {
            name: firstName,
            secondname: lastName,
            surname: middleName
        },
        marital_status: maritalStatus,
        gender: gender,
        number_of_dependence: numberOfDependents, // Добавлен новый ключ
        property: property,
        sources_of_official_income: sources_of_official_income,
        monthly_expenses: monthly_expenses,
        liabilities: liabilities
    };

    return payload;
};

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;

    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    try {
        // Сериализуем данные формы
        const formData = new FormData(this);
        const serializedData = serializeFormData(formData);
        
        // Вызываем функцию из pdfEdit.js для создания PDF
        const pdfBytes = await main_function(serializedData);
        
        // Создаем Blob из байтов PDF
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Находим кнопку для скачивания PDF
        const downloadBtn = document.getElementById('downloadPdf');
        
        // Настраиваем кнопку для скачивания
        downloadBtn.href = url;
        downloadBtn.download = 'анкета_заемщика.pdf';
        downloadBtn.classList.remove('hidden');
        
        // Показываем сообщение об успехе
        document.getElementById('successMessage').style.display = 'block';
        
    } catch (error) {
        console.error('Ошибка при создании PDF:', error);
        
        // Получаем информацию о строке ошибки
        let errorLocation = 'Неизвестное место';
        if (error.stack) {
            // Парсим stack trace чтобы получить строку
            const stackLines = error.stack.split('\n');
            if (stackLines.length > 1) {
                // Берем вторую строку (первая - сообщение, вторая - место ошибки)
                const locationLine = stackLines[1].trim();
                // Упрощаем вывод для пользователя
                errorLocation = locationLine.split('/').pop() || locationLine;
            }
        }
        
        document.getElementById('errorText').textContent = 
            `Произошла ошибка при создании PDF документа. 
             Ошибка: ${error.message}
             Место: ${errorLocation}
             Пожалуйста, попробуйте еще раз.`;
        document.getElementById('errorMessage').style.display = 'block';
        
    } finally {
        // Восстанавливаем кнопку отправки
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loanForm').addEventListener('submit', handleFormSubmit);
    
    const existingMonthlyInputs = document.querySelectorAll('.monthly-payment-input');
    const existingTotalInputs = document.querySelectorAll('.total-liability-input');
    
    existingMonthlyInputs.forEach(input => {
        input.addEventListener('input', calculateTotals);
    });
    
    existingTotalInputs.forEach(input => {
        input.addEventListener('input', calculateTotals);
    });
});


