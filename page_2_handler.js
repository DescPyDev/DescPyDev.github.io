// Вспомогательные функции.
async function calculateTableHeight(tableData, headerRowHeight = 25, dataRowHeight = 15) {
    return headerRowHeight + (tableData.length * dataRowHeight);
};

async function drawMonthlyIncomeText(page, amount, rectangleArea, regularFont, boldFont, color, symbol) {
    const texts = [
        {
            text: "Ваш ежемесячный доход",
            fontSize: 14,
            font: boldFont,
            yOffset: 2,
            textColor: rgb(0, 0, 0) // Черный цвет для первого текста
        },
        {
            text: "на основании данных анкетирования",
            fontSize: 10,
            font: regularFont,
            yOffset: 5,
            textColor: rgb(0, 0, 0) // Черный цвет для второго текста
        },
        {
            text: `${symbol}${amount}`,
            fontSize: 28,
            font: boldFont,
            yOffset: 5,
            textColor: color // Оригинальный цвет для цифры
        }
    ];
    
    let currentY = rectangleArea.y + rectangleArea.height - 4; // Начинаем от верхнего края с отступом 4px
    
    const results = [];
    
    for (const textConfig of texts) {
        const textWidth = textConfig.font.widthOfTextAtSize(textConfig.text, textConfig.fontSize);
        const textHeight = textConfig.fontSize * 0.8;
        
        // Центрируем по горизонтали
        const x = rectangleArea.x + (rectangleArea.width - textWidth) / 2;
        
        // Позиционируем по вертикали с учетом отступа
        const y = currentY - textConfig.yOffset - textHeight;
        
        page.drawText(textConfig.text, {
            x: x,
            y: y,
            size: textConfig.fontSize,
            font: textConfig.font,
            color: textConfig.textColor // Используем индивидуальный цвет для каждого текста
        });
        
        results.push({
            x,
            y,
            textWidth,
            textHeight,
            text: textConfig.text,
            fontSize: textConfig.fontSize,
            color: textConfig.textColor
        });
        
        // Обновляем текущую позицию Y для следующего текста
        currentY = y;
    }
    
    return results; // Возвращаем массив результатов для каждого текстового блока
};

async function drawCenteredText(page, text, rectangleArea, font, fontSize, color, align = 'center', symbol = "", is_monthly_income = false, boldFont) {
    // Если это ежемесячный доход, используем специальное форматирование
    if (is_monthly_income) {
        return await drawMonthlyIncomeText(page, text, rectangleArea, font, boldFont, color, symbol);
    }
    
    // Стандартное форматирование для остальных случаев
    // Добавляем математический символ.
    text = `${symbol}${text}`;

    // Рассчитываем ширину текста
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    // Рассчитываем высоту текста (примерно)
    const textHeight = fontSize * 0.8;
    
    // Вычисляем позицию в зависимости от выравнивания
    let x;
    switch (align) {
        case 'left':
            x = rectangleArea.x + 4;
            break;
        case 'right':
            x = rectangleArea.x + rectangleArea.width - textWidth - 5;
            break;
        case 'center':
        default:
            x = rectangleArea.x + (rectangleArea.width - textWidth) / 2;
            break;
    }
    
    const y = rectangleArea.y + (rectangleArea.height - textHeight) / 2;
    
    // Рисуем текст
    page.drawText(text, {
        x: x,
        y: y,
        size: fontSize,
        font: font,
        color: color
    });
    
    return { x, y, textWidth, textHeight, align };
};

async function drawRectangleWithCheckmarks(page, text, rectangleArea, color, textColor, custom_font, custom_bold_font, is_monthly_income = false, symbol="") {
    const { x, y, width, height } = rectangleArea;

    // Рисуем основной прямоугольник
    page.drawRectangle({
        x: x,
        y: y,
        width: width,
        height: height,
        color: color
    });

    // 1) Левый верхний угол
    // Вертикальная линия галочки
    page.drawLine({
        start: { x: x - 25, y: y + height + 21 },
        end: { x: x - 25, y: y + height + 1 },
        color: rgb(0, 0, 0),
        thickness: 1,
    });
    // Горизонтальная линия галочки
    page.drawLine({
        start: { x: x - 25, y: y + height + 21 },
        end: { x: x, y: y + height + 21 },
        color: rgb(0, 0, 0),
        thickness: 1,
    });

    // 2) Правый верхний угол
    // Вертикальная линия галочки
    page.drawLine({
        start: { x: x + width + 25, y: y + height + 21 },
        end: { x: x + width + 25, y: y + height + 1 },
        color: rgb(0, 0, 0),
        thickness: 1,
    });
    // Горизонтальная линия галочки
    page.drawLine({
        start: { x: x + width + 25, y: y + height + 21 },
        end: { x: x + width, y: y + height + 21 },
        color: rgb(0, 0, 0),
        thickness: 1,
    });

    // 3) Левый нижний угол
    // Вертикальная линия галочки
    page.drawLine({
        start: { x: x - 25, y: y - 21 },
        end: { x: x - 25, y: y - 1 },
        color: rgb(0, 0, 0),
        thickness: 1,
    });
    // Горизонтальная линия галочки
    page.drawLine({
        start: { x: x - 25, y: y - 21 },
        end: { x: x, y: y - 21 },
        color: rgb(0, 0, 0),
        thickness: 1,
    });

    // 4) Правый нижний угол
    // Вертикальная линия галочки
    page.drawLine({
        start: { x: x + width + 25, y: y - 21 },
        end: { x: x + width + 25, y: y - 1 },
        color: rgb(0, 0, 0),
        thickness: 1,
    });
    // Горизонтальная линия галочки
    page.drawLine({
        start: { x: x + width + 25, y: y - 21 },
        end: { x: x + width, y: y - 21 },
        color: rgb(0, 0, 0),
        thickness: 1,
    });

    // Пишем текст внутри.
    await drawCenteredText(page, text, rectangleArea, custom_font, 28, textColor, "center", symbol, is_monthly_income, custom_bold_font);

    return y - 21;
};

// Основные функции.
//_______________________________________________________________________________________________________________________________________________________________
// Обрабатываем зарисовку 2 страницы.
async function draw_title_page(page, pdfDoc, font, bold) {
    // Скачиваем лого.
    const url = "https://i.ibb.co/sxY5H22/mfpc-logo-for-pdf.png";
    const pngImageBytes = await fetch(url).then((res) => res.arrayBuffer())
    const pngImage = await pdfDoc.embedPng(pngImageBytes);

    // Рисуем лого.
    page.drawImage(pngImage, {
        x: 460,
        y: 768,
        width: 101,
        height: 46
    });

    // Рисуем прямоугольники с надписью "Раздел №1".
    // 1 прямоугольник.
    page.drawRectangle({
        x: 40,
        y: 792,
        width: 12,
        height: 21,
        color: rgb(1, 0.85, 0.18)
    });

    // 2 прямоугольник.
    page.drawRectangle({
        x: 49,
        y: 792,
        width: 386,
        height: 21,
        color: rgb(1, 0.92, 0)
    });

    // Линия под прямоугольниками.
    page.drawLine({
        start: { x: 28, y: 845},
        end: { x: 434, y: 845},
        color: rgb(0, 0, 0)
    });

    // Текст.
    page.drawText("Раздел № 1", {
        x: 60,
        y: 799,
        font: bold,
        size: 16,
        color: rgb(0, 0, 0),
    });

    // Второй текст.
    page.drawText("Анализ материального положения заёмщика", {
        x: 48,
        y: 776,
        font: font,
        size: 16,
        color: rgb(0, 0, 0),

    });

    // Текст номер запроса.
    page.drawText("Номер запроса: 1HPDK4", {
        x: 45,
        y: 751,
        font: font,
        size: 10,
        color: rgb(0, 0, 0)
    });

    // Текст Кол клиента.
    page.drawText("Код клиента: 613326", {
        x: 45,
        y: 738,
        font: font,
        size: 10,
        color: rgb(0, 0, 0)
    });

    // Текст Дата и время рассмотрения: 1HPDK4.
    page.drawText("Дата и время рассмотрения: 1HPDK4", {
        x: 302,
        y: 751,
        font: font,
        size: 10,
        color: rgb(0, 0, 0)
    });

};

async function draw_personal_data(page, font, bold, data) {
    // Рисуем линию.
    page.drawLine({
        start: { x: 43, y: 708},
        end: { x: 554, y: 708},
        color: rgb(0.85, 0.85, 0.85)
    });

    // Рисуем текст Персональные данные заёмщика.
    page.drawText("Персональные данные заёмщика", {
        x: 51,
        y: 712,
        font: bold,
        size: 11,
        color: rgb(0, 0, 0)
    });

    // Рисуем текст фамилия.
    page.drawText("Фамилия", {
        x: 46,
        y: 690,
        font: font,
        size: 11,
        color: rgb(0.52, 0.52, 0.51)
    });

    // Рисуем текст имя.
    page.drawText("Имя", {
        x: 46,
        y: 675,
        font: font,
        size: 11,
        color: rgb(0.52, 0.52, 0.51)
    });

    // Рисуем текст Отчество.
    page.drawText("Отчество", {
        x: 46,
        y: 660,
        font: font,
        size: 11,
        color: rgb(0.52, 0.52, 0.51)
    });

    // Рисуем текст Прежняя фамилия .
    page.drawText("Прежняя фамилия", {
        x: 46,
        y: 645,
        font: font,
        size: 11,
        color: rgb(0.52, 0.52, 0.51)
    });

    // Рисуем текст (при наличии)
    page.drawText("(при наличии)", {
        x: 46,
        y: 630,
        font: font,
        size: 11,
        color: rgb(0.52, 0.52, 0.51)
    });

    // Рисуем прямоугольник для Прежняя фамилия.
    page.drawRectangle({
        x: 152,
        y: 629,
        width: 148,
        height: 25,
        color: rgb(0.85, 0.85, 0.85)
    });

    // Рисуем текст Дата рождения
    page.drawText("Дата рождения", {
        x: 319,
        y: 690,
        font: font,
        size: 11,
        color: rgb(0.52, 0.52, 0.51)
    });

    // Рисуем текст Полных лет
    page.drawText("Полных лет", {
        x: 319,
        y: 675,
        font: font,
        size: 11,
        color: rgb(0.52, 0.52, 0.51)
    });

    // Рисуем текст Семейное положение
    page.drawText("Семейное положение", {
        x: 319,
        y: 660,
        font: font,
        size: 11,
        color: rgb(0.52, 0.52, 0.51)
    });

    // Рисуем текст Пол
    page.drawText("Пол", {
        x: 319,
        y: 639,
        font: font,
        size: 11,
        color: rgb(0.52, 0.52, 0.51)
    });

    // Рисуем текст Дети на иждивении
    page.drawText("Дети на иждивении", {
        x: 319,
        y: 618,
        font: font,
        size: 11,
        color: rgb(0.52, 0.52, 0.51)
    });

    // Рисуем прямоугольник Дети на иждивении.
    page.drawRectangle({
        x: 434,
        y: 613,
        width: 148,
        height: 14,
        color: rgb(1, 1, 1)
    });

    // ######### Вписываем данные в прямоугольники #########.
    // Вписываем фамилию.
    page.drawRectangle({
        x: 152,
        y: 685,
        width: 148,
        height: 14,
        color: rgb(1, 1, 1)
    });
    page.drawText(data.fullname.secondname, {
        x: 155,
        y: 690,
        font: bold,
        size: 11,
        color: rgb(0, 0, 0)
    });

    // Вписываем имя.
    page.drawRectangle({
        x: 152,
        y: 672,
        width: 148,
        height: 14,
        color: rgb(0.85, 0.85, 0.85)
    });
    page.drawText(data.fullname.name, {
        x: 155,
        y: 675,
        font: bold,
        size: 11,
        color: rgb(0, 0, 0)
    });

    // Вписываем отчество.
    page.drawRectangle({
        x: 152,
        y: 659,
        width: 148,
        height: 14,
        color: rgb(1, 1, 1)
    });
    page.drawText(data.fullname.surname, {
        x: 155,
        y: 660,
        font: bold,
        size: 11,
        color: rgb(0, 0, 0)
    });

    // Вводим семейное положение.
    page.drawRectangle({
        x: 434,
        y: 657,
        width: 148,
        height: 14,
        color: rgb(1, 1, 1)
    });
    page.drawText(data.marital_status, {
        x: 437,
        y: 660,
        font: bold,
        size: 11,
        color: rgb(0, 0, 0)
    });

    // Вводим пол.
    page.drawRectangle({
        x: 434,
        y: 630,
        width: 148,
        height: 25,
        color: rgb(0.85, 0.85, 0.85)
    });
    page.drawText(data.gender, {
        x: 437,
        y: 639,
        font: bold,
        size: 11,
        color: rgb(0, 0, 0)
    });

    // Вписываем полных лет.
    page.drawRectangle({
        x: 434,
        y: 671,
        width: 148,
        height: 14,
        color: rgb(0.85, 0.85, 0.85)
    });
    page.drawText("---", {
        x: 437,
        y: 678,
        font: bold,
        size: 11,
        color: rgb(0, 0, 0)
    });

    // ######### Рисуем окантовку прямоугольников #########.

};

async function drawTables(page, pdfDoc, propertyTableArea, incomeTableArea, data, drawTableFunc, custom_font, custom_bold_font) {
    // Рисуем таблицу имущества.
    let current_y;
    data.type = "property";
    const newHeightTableProperty = await calculateTableHeight(data.property, 25, 15);
    const newTableCoordinatesProperty = { x: propertyTableArea.x, y: propertyTableArea.y2 - newHeightTableProperty, width: propertyTableArea.width, height: newHeightTableProperty};
    current_y = await drawTableFunc(page, data.property, propertyTableArea.x, propertyTableArea.y1, custom_font, custom_bold_font, data, propertyTableArea, newTableCoordinatesProperty);

    // Рисуем таблицу доходов.
    data.type = "income";
    const newStartY = current_y - 45;
    const newHeightTableIncome = await calculateTableHeight(data.sources_of_official_income, 25, 15);
    const newTableCoordinatesIncome = { x: incomeTableArea.x, y: incomeTableArea.y2 - (newHeightTableIncome + newStartY), width: incomeTableArea.width, height: newHeightTableIncome};
    current_y = await drawTableFunc(page, data.sources_of_official_income, incomeTableArea.x, newStartY, custom_font, custom_bold_font, data, incomeTableArea, newTableCoordinatesIncome);

    // Рисуем пропущенные элементы.
    await draw_missing_elements(page, pdfDoc, newTableCoordinatesProperty, newTableCoordinatesIncome, custom_font, custom_bold_font, newStartY);

    // Рисуем нижний контент.
    await draw_dawn_content_page(page, data, current_y, drawTableFunc, custom_font, custom_bold_font);
};

async function draw_dawn_content_page(page, data, startY, drawTableFunc, custom_font, custom_bold_font) {
    // Рисуем прямоугольник с галками.
    const monthly_income_data = {
    rectangleArea: { x: 161, y: 408, width: 276, height: 66}, // y: 492
    color: rgb(0.94, 1, 0.94),
    textColor: rgb(0, 0.58, 0.27)
    };

    const monthly_expenses_data = {
        rectangleArea: { x: 63, y: 210, width: 190, height: 40}, // y: 690
        color: rgb(1, 0.89, 0.87),
        textColor: rgb(0.7, 0.12, 0.12)
    };

    const remaining_balance_data = {
        rectangleArea: { x: 339, y: 210, width: 190, height: 40}, // y: 690,
        color: rgb(0.94, 1, 0.94),
        textColor: rgb(0, 0.58, 0.27)
    };

    // Рисуем.
    let newRectangleArea;
    newRectangleArea = {
        x: monthly_income_data.rectangleArea.x,
        y: startY - (35 + 58),
        width: monthly_income_data.rectangleArea.width,
        height: monthly_income_data.rectangleArea.height
    };

    // Рисуем прямоугольник месячных заработков.
    // Считаем доход в месяц.
    const totalSum = data.sources_of_official_income.reduce((acc, item) => acc + item["Сумма в месяц, руб."], 0);
    let lastY;
    lastY = await drawRectangleWithCheckmarks(page, `${totalSum}`, newRectangleArea, monthly_income_data.color, monthly_income_data.textColor, custom_font, custom_bold_font, true, "+");

    // Рисуем табличку.
    console.log(`lastY: ${lastY}`);
    expensesTableArea = {
        x: 74,
        y: lastY - 32,
        width: 482,
        height: 52
    };
    data.type = "expenses";
    const newHeightTableExpenses = await calculateTableHeight(data.monthly_expenses, 12, 12);
    newTableCoordinatesExpenses = { x: newHeightTableExpenses.x, y: newHeightTableExpenses.y2 - (newHeightTableExpenses + lastY), width: newHeightTableExpenses.width, height: newHeightTableExpenses};
    lastY = await drawTableFunc(page, data.monthly_expenses, expensesTableArea.x, expensesTableArea.y, custom_font, custom_bold_font, data, expensesTableArea, newTableCoordinatesExpenses);
    

    // Рисуем остальные 2 прямоугольника.
    // Рисуем прямоугольник месячных трат.
    const totalExpenses = data.monthly_expenses.reduce((acc, item) => acc + item["Сумма в месяц, руб."], 0);
    newRectangleArea = {
        x: monthly_expenses_data.rectangleArea.x,
        y: monthly_expenses_data.rectangleArea.y - lastY,
        width: monthly_expenses_data.rectangleArea.width,
        height: monthly_expenses_data.rectangleArea.height
    };

    await drawRectangleWithCheckmarks(page, `${totalExpenses}`, newRectangleArea, monthly_expenses_data.color, monthly_expenses_data.textColor, custom_font, custom_bold_font, false, "-");

    // Рисуем прямоугольник ежемесячного профицита.
    const remaining_balance_Value = totalSum - totalExpenses;
    newRectangleArea = {
        x: remaining_balance_data.rectangleArea.x,
        y: remaining_balance_data.rectangleArea.y - lastY,
        width: remaining_balance_data.rectangleArea.width,
        height: remaining_balance_data.rectangleArea.height
    };
    await drawRectangleWithCheckmarks(page, remaining_balance_Value, newRectangleArea, remaining_balance_data.color, remaining_balance_data.textColor, custom_font, custom_bold_font);
};

async function draw_missing_elements(page, pdfDoc, newTableCoordinatesProperty, newTableCoordinatesIncome, font, bold, newStartY) {
    // Скачиваем картирнки.
    const car_url = "https://i.ibb.co/N2wtbprH/car-image-mfpc.png";
    const bage_url = "https://i.ibb.co/jZx02yRz/bage-image-mfpc.png";

    const pngImageBytes_car = await fetch(car_url).then((res) => res.arrayBuffer())
    const pngImage_car = await pdfDoc.embedPng(pngImageBytes_car);

    const pngImageBytes_bage = await fetch(bage_url).then((res) => res.arrayBuffer())
    const pngImage_bage = await pdfDoc.embedPng(pngImageBytes_bage);

    // Размещаем картинку с машиной.
    page.drawImage(pngImage_car, {
        x: 44,
        y: newTableCoordinatesProperty.y + 3,
        width: 24,
        height: 15
    });

    // Рисуем линию для таблицы с имуществом.
    page.drawLine({
        start: { x: 43, y: 588},
        end: {x: 555, y: 588},
        color: rgb(0, 0, 0)
    });
    // Рисуем текст таблицы с имуществом.
    page.drawText("Информация об имуществе в собственности заемщика", {
        x: 51,
        y: 592,
        font: bold,
        size: 11,
        color: rgb(0, 0, 0)
    });

    // Рисуем линию для таблицы с доходами.
    page.drawLine({
        start: { x: 43, y: newStartY + 5},
        end: { x: 555, y: newStartY + 5},
        color: rgb(0, 0, 0)
    });
    // Рисуем текст таблицы с доходами.
    page.drawText("Информация об источниках официального дохода заемщика", {
        x: 51,
        y: newStartY + 10,
        font: bold,
        size: 11,
        color: rgb(0, 0, 0)
    });

    // Размещаем картинку с бейджем.
    page.drawImage(pngImage_bage, {
        x: 44,
        y: newStartY - newTableCoordinatesIncome.height,
        width: 24,
        height: 18
    });
};

async function clear_page(page) {
    const { width, height } = page.getSize();
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(1, 1, 1),
      opacity: 1,
    });
};

async function main_draw_2_page(page, pdfDoc, font, bold, propertyTableArea, incomeTableArea, data, drawTableFunc) {
    // Стираем всю страницу.
    await clear_page(page);

    // Рисуем заголовки второй страницы.
    await draw_title_page(page, pdfDoc, font, bold);

    // Рисуем персональные данные заёмщика.
    await draw_personal_data(page, font, bold, data);

    // Рисуем таблицы.
    await drawTables(page, pdfDoc, propertyTableArea, incomeTableArea, data, drawTableFunc, font, bold);
};
