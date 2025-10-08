// script.js

let ownershipCount = 1;
let incomeCount = 1;
let liabilityCount = 0;

// Вспомогательные функции.
async function pdfToBase64(pdfBytes) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // Убираем data:application/pdf;base64, префикс
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.readAsDataURL(blob);
    });
};

// Функция для переключения поля "Другое" в источниках дохода
function toggleIncomeOtherInput(selectElement) {
    const otherInput = selectElement.parentElement.querySelector('.other-input');
    if (selectElement.value === 'other') {
        otherInput.style.display = 'block';
    } else {
        otherInput.style.display = 'none';
        otherInput.value = '';
    }
};

// Функция для переключения поля "Другое" в обязательствах
function toggleLiabilityOtherInput(selectElement) {
    const otherInput = selectElement.parentElement.querySelector('.other-input');
    if (selectElement.value === 'other') {
        otherInput.style.display = 'block';
    } else {
        otherInput.style.display = 'none';
        otherInput.value = '';
    }
};

function addOwnershipItem() {
    const ownershipItems = document.getElementById('ownershipItems');
    const newItem = document.createElement('div');
    newItem.className = 'dynamic-item';
    newItem.innerHTML = `
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
        <div class="form-grid">
            <div class="form-group">
                <label>Наименование имущества</label>
                <input type="text" name="ownership[${ownershipCount}][name]" placeholder="Например: Квартира">
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
            <div class="form-group">
                <label class="checkbox-group">
                    <input type="checkbox" name="ownership[${ownershipCount}][is_pledged]">
                    В залоге
                </label>
            </div>
        </div>
    `;
    ownershipItems.appendChild(newItem);
    ownershipCount++;
};

// Функция для добавления нового источника дохода
function addIncomeItem() {
    const incomeItems = document.getElementById('incomeItems');
    const newItem = document.createElement('div');
    newItem.className = 'dynamic-item';
    newItem.innerHTML = `
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
        <div class="form-grid">
            <div class="form-group">
                <label>Источник дохода</label>
                <select name="income[${incomeCount}][name]" onchange="toggleIncomeOtherInput(this)">
                    <option value="">Выберите источник дохода</option>
                    <option value="ЗП">Зарплата</option>
                    <option value="Пособие">Пособие</option>
                    <option value="Пенсия">Пенсия</option>
                    <option value="Неофициальный доход">Неофициальный доход</option>
                    <option value="Алименты">Алименты</option>
                    <option value="other">Другое</option>
                </select>
                <input type="text" name="income[${incomeCount}][other_name]" placeholder="Укажите источник дохода" class="other-input">
            </div>
            <div class="form-group">
                <label>Сумма в месяц</label>
                <input type="number" name="income[${incomeCount}][salary]" placeholder="0">
            </div>
        </div>
    `;
    incomeItems.appendChild(newItem);
    incomeCount++;
};

function addLiabilityItem() {
    const liabilityItems = document.getElementById('liabilityItems');
    const newItem = document.createElement('div');
    newItem.className = 'dynamic-item';
    newItem.innerHTML = `
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
        <div class="form-grid">
            <div class="form-group">
                <label>Вид обязательства</label>
                <select name="liabilities[${liabilityCount}][name]" onchange="toggleLiabilityOtherInput(this)">
                    <option value="">Выберите вид обязательства</option>
                    <option value="МФО">МФО</option>
                    <option value="Автокредит">Автокредит</option>
                    <option value="Ипотека">Ипотека</option>
                    <option value="Кредитная карта">Кредитная карта</option>
                    <option value="other">Другое</option>
                </select>
                <input type="text" name="liabilities[${liabilityCount}][other_name]" placeholder="Укажите вид обязательства" class="other-input">
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
    liabilityItems.appendChild(newItem);
    liabilityCount++;
    
    // Инициализируем новое поле
    const newSelect = newItem.querySelector('select[name^="liabilities"]');
    toggleLiabilityOtherInput(newSelect);
};

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
    const dealId = formData.get('deal_id') || '';
    const lastName = formData.get('last_name') || '';
    const firstName = formData.get('first_name') || '';
    const middleName = formData.get('middle_name') || '';
    
    // Получаем данные менеджера
    const managerLastName = formData.get('manager_last_name') || '';
    const managerFirstName = formData.get('manager_first_name') || '';
    const managerMiddleName = formData.get('manager_middle_name') || '';
    
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
    
    // Обрабатываем новый чекбокс и выбор типа организации
    const isBusinessOwner = formData.get('is_business_owner') === 'on';
    const businessTypeValue = formData.get('business_type') || '';
    let businessType = "Нет";
    
    if (isBusinessOwner && businessTypeValue) {
        // Если чекбокс выбран и выбран тип организации
        if (businessTypeValue === 'ИП') {
            businessType = businessTypeValue;
        } else if (businessTypeValue === 'ООО') {
            businessType = businessTypeValue;
        }
    }
    
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
            
            if (field === 'is_jointly' || field === 'is_pledged') {
                targetObject[index][field] = value === 'on';
            } else if (field === 'salary' || field === 'cost' || 
                       field === 'monthly_payment' || field === 'total_liability') {
                targetObject[index][field] = parseInt(value) || 0;
            } else {
                targetObject[index][field] = value;
            }
        }
    });

    // Обрабатываем имущество
    const property = Object.values(ownershipData)
        .filter(item => item.name && item.name.trim() !== '')
        .map(item => ({
            'Наименование': item.name || '',
            'Залог': item.is_pledged ? "Да" : "Нет",
            'Совм': item.is_jointly ? "Да" : "Нет",
            'Стоимость': item.cost || 0
        }));

    // Обрабатываем источники дохода - заменяем "other" на значение из поля ввода
    const sources_of_official_income = Object.values(incomeData)
        .filter(item => item.name && item.name.trim() !== '')
        .map(item => {
            // Если выбрано "Другое", используем значение из поля other_name
            let incomeName = item.name;
            if (item.name === 'other' && item.other_name) {
                incomeName = item.other_name;
            }
            
            return {
                'Источник получения дохода': incomeName || '',
                'Сумма в месяц': item.salary || 0
            };
        });

    // Получаем все ежемесячные расходы
    const houseExpenses = parseInt(formData.get('house_expenses')) || 0;
    const foodExpenses = parseInt(formData.get('food_expenses')) || 0;
    const transportExpenses = parseInt(formData.get('transport_expenses')) || 0;
    const medicalExpenses = parseInt(formData.get('medical_expenses')) || 0;
    const mobileExpenses = parseInt(formData.get('mobile_expenses')) || 0;
    const childrenExpenses = parseInt(formData.get('children_expenses')) || 0;
    const fspExpenses = parseInt(formData.get('fsp_expenses')) || 0;
    const utilitiesExpenses = parseInt(formData.get('utilities_expenses')) || 0;
    
    // Создаем массив всех ежемесячных расходов
    const monthly_expenses = [];
    
    if (houseExpenses > 0) {
        monthly_expenses.push({
            'Вид расходов': 'Расходы на аренду жилья',
            'Сумма в месяц': houseExpenses
        });
    }
    if (foodExpenses > 0) {
        monthly_expenses.push({
            'Вид расходов': 'Расходы на продукты питания',
            'Сумма в месяц': foodExpenses
        });
    }
    if (transportExpenses > 0) {
        monthly_expenses.push({
            'Вид расходов': 'Расходы на транспорт и ГСМ',
            'Сумма в месяц': transportExpenses
        });
    }
    if (medicalExpenses > 0) {
        monthly_expenses.push({
            'Вид расходов': 'Расходы на медицину',
            'Сумма в месяц': medicalExpenses
        });
    }
    if (mobileExpenses > 0) {
        monthly_expenses.push({
            'Вид расходов': 'Расходы на мобильную связь',
            'Сумма в месяц': mobileExpenses
        });
    }
    if (childrenExpenses > 0) {
        monthly_expenses.push({
            'Вид расходов': 'Содержание детей',
            'Сумма в месяц': childrenExpenses
        });
    }
    if (fspExpenses > 0) {
        monthly_expenses.push({
            'Вид расходов': 'Удержания от ФСП',
            'Сумма в месяц': fspExpenses
        });
    }
    if (utilitiesExpenses > 0) {
        monthly_expenses.push({
            'Вид расходов': 'Коммунальные платежи',
            'Сумма в месяц': utilitiesExpenses
        });
    }

    // Обрабатываем финансовые обязательства - заменяем "other" на значение из поля ввода
    const liabilities = Object.values(liabilitiesData)
        .filter(item => item.name && item.name.trim() !== '')
        .map(item => {
            // Если выбрано "Другое", используем значение из поля other_name
            let liabilityName = item.name;
            if (item.name === 'other' && item.other_name) {
                liabilityName = item.other_name;
            }
            
            return {
                'Вид обязательства': liabilityName || '',
                'Ежемесячный платеж': item.monthly_payment || 0,
                'Общая сумма обязательства': item.total_liability || 0
            };
        });

    // Получаем дополнительные флаги и преобразуем их в "Да"/"Нет"
    const isCoBorrower = formData.get('is_co_borrower') === 'on' ? "Да" : "Нет";
    const hasTransactions = formData.get('has_transactions') === 'on' ? "Да" : "Нет";
    const hasOverdues = formData.get('has_overdues') === 'on' ? "Да" : "Нет";

    const payload = {
        type: "liability",
        dealId: dealId,
        fullname: {
            name: firstName,
            secondname: lastName,
            surname: middleName
        },
        manager_fullname: {
            name: managerFirstName,
            secondname: managerLastName,
            surname: managerMiddleName
        },
        marital_status: maritalStatus,
        gender: gender,
        number_of_dependence: numberOfDependents,
        property: property,
        liabilities: liabilities,
        sources_of_official_income: sources_of_official_income,
        monthly_expenses: monthly_expenses,
        isCoBorrower: isCoBorrower,
        hasTransactions: hasTransactions,
        hasOverdues: hasOverdues,
        business_type: businessType
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

        // Добавляем полученный PDF файл в сделку в битриксе.
        await addComment(serializedData.dealId, await pdfToBase64(pdfBytes));
        
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
            errorLocation = error.stack;
            // Парсим stack trace чтобы получить строку
            const stackLines = error.stack.split('\n');
            if (stackLines.length > 1) {
                // Берем вторую строку
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

    // Инициализация полей "Другое" для существующих элементов
    const incomeSelects = document.querySelectorAll('select[name^="income"][name$="[name]"]');
    incomeSelects.forEach(select => {
        toggleIncomeOtherInput(select);
    });

    const liabilitySelects = document.querySelectorAll('select[name^="liabilities"][name$="[name]"]');
    liabilitySelects.forEach(select => {
        toggleLiabilityOtherInput(select);
    });
    
    existingMonthlyInputs.forEach(input => {
        input.addEventListener('input', calculateTotals);
    });
    
    existingTotalInputs.forEach(input => {
        input.addEventListener('input', calculateTotals);
    });
});
