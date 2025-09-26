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
    const data = {
        personal_info: {
            last_name: formData.get('last_name') || '',
            first_name: formData.get('first_name') || '',
            middle_name: formData.get('middle_name') || '',
            marital_status: formData.get('marital_status') === 'on',
            gender: formData.get('gender') || ''
        },
        monthly_expenses: {
            house_expenses: parseInt(formData.get('house_expenses')) || 0,
            food_expenses: parseInt(formData.get('food_expenses')) || 0,
            transport_expenses: parseInt(formData.get('transport_expenses')) || 0
        },
        ownership: [],
        sources_of_official_income: [],
        liabilities: [],
        totals: {
            total_liabilities: parseFloat(document.getElementById('totalLiabilities').textContent.replace(/\s/g, '')) || 0,
            monthly_payment: parseFloat(document.getElementById('totalMonthlyPayment').textContent.replace(/\s/g, '')) || 0
        }
    };

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

    data.ownership = Object.values(ownershipData).filter(item => item.name && item.name.trim() !== '');
    data.sources_of_official_income = Object.values(incomeData).filter(item => item.name && item.name.trim() !== '');
    data.liabilities = Object.values(liabilitiesData).filter(item => item.name && item.name.trim() !== '');

    return data;
}

// Обработка отправки формы
/*
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;

    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    try {
        const url = "https://t9jqp2-95-26-207-148.ru.tuna.am/test";
        const payload = {
            name: "Хуесос",
            age: 16
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            mode: 'cors'
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Успешный ответ:', data);
            document.getElementById('successMessage').style.display = 'block';
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

    } catch (error) {
        console.error('Ошибка:', error);
        showError(`❌ Ошибка отправки: ${error.message}`);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
};
*/
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;

    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    try {
        // Используем публичный сервис для тестирования
        const url = "https://httpbin.org/post";
        
        // Собираем реальные данные из формы
        const formData = new FormData(document.getElementById('loanForm'));
        const payload = serializeFormData(formData);

        console.log('Отправляемые данные:', payload); // Для отладки

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            mode: 'cors'
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Успешный ответ:', data);
            document.getElementById('successMessage').style.display = 'block';
            
            // Показываем ответ для отладки
            showDebugInfo(`Запрос успешно отправлен. Ответ: ${JSON.stringify(data.json, null, 2)}`);
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

    } catch (error) {
        console.error('Ошибка:', error);
        showError(`❌ Ошибка отправки: ${error.message}`);
    } finally {
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
