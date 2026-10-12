// Получаем элементы формы и контейнеры
const messageInput = document.getElementById('messageInput');
const fromInput = document.getElementById('fromInput');
const toInput = document.getElementById('toInput');
const themeSelect = document.getElementById('themeSelect');
const sendBtn = document.getElementById('sendBtn');
const historyContainer = document.getElementById('historyContainer');
const clearAllBtn = document.getElementById('clearAllBtn');

// Получаем элементы премпросмотра
const livePreview = document.getElementById('livePreview');
const previewMessage = document.getElementById('previewMessage');
const previewFrom = document.getElementById('previewFrom');
const previewTo = document.getElementById('previewTo');

// А тут храненим ID открытки (null, если создаем новую)
let editingCardId = null;

// Функция обновления превью и валидации
function updatePreviewAndValidation() {
    const message = messageInput.value.trim();
    const from = fromInput.value.trim();
    const to = toInput.value.trim();

    previewMessage.textContent = message !== '' ? message : 'Текст открытки появится здесь...';
    previewFrom.textContent = 'От: ' + (from !== '' ? from : '...');
    previewTo.textContent = 'Кому: ' + (to !== '' ? to : '...');

    // Убираем атрибут disabled у кнопки отправки, если все поля заполнены
    if (message !== '' && from !== '' && to !== '') {
        sendBtn.removeAttribute('disabled');
    } else {
        sendBtn.setAttribute('disabled', 'true');
    }
}

// Обработчик изменения темы
themeSelect.addEventListener('change', function () {
    livePreview.className = 'postcard ' + themeSelect.value;
});

// Соответственно, обновляем превью и валидацию при вводе текста
messageInput.addEventListener('input', updatePreviewAndValidation);
fromInput.addEventListener('input', updatePreviewAndValidation);
toInput.addEventListener('input', updatePreviewAndValidation);

// Загрузка истории из localStorage при старте
function loadHistory() {
    const savedPostcards = localStorage.getItem('postcardsHistory');

    if (savedPostcards) {
        const postcardsArray = JSON.parse(savedPostcards);
        historyContainer.innerHTML = '';

        postcardsArray.forEach(function (item) {
            renderPostcard(item, false);
        });
    }
}

// Отрисовка открытки в истории
function renderPostcard(data, saveToStorage = true) {
    if (!data.id) {
        data.id = Date.now() + Math.random();
    }

    const postcardDiv = document.createElement('div');
    postcardDiv.classList.add('postcard', data.theme);
    postcardDiv.dataset.id = data.id;

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('postcard-message');
    messageDiv.textContent = data.message;

    const footerDiv = document.createElement('div');
    footerDiv.classList.add('postcard-footer');

    const fromSpan = document.createElement('span');
    fromSpan.textContent = 'От: ' + data.from;

    const toSpan = document.createElement('span');
    toSpan.textContent = 'Кому: ' + data.to;

    footerDiv.append(fromSpan);
    footerDiv.append(toSpan);

    // Кнопка редактирования на открытке (в истории, а не превью)
    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-btn');
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editBtn.title = 'Редактировать открытку';

    editBtn.addEventListener('click', function (event) {
        event.stopPropagation();

        messageInput.value = data.message;
        fromInput.value = data.from;
        toInput.value = data.to;
        themeSelect.value = data.theme;

        livePreview.className = 'postcard ' + data.theme;
        updatePreviewAndValidation();

        editingCardId = data.id;
        sendBtn.textContent = 'Сохранить';

        window.scrollTo({ top: 0, behavior: 'smooth' });
        messageInput.focus();
    });

    // Кнопка удаления
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    deleteBtn.title = 'Удалить открытку';

    deleteBtn.addEventListener('click', function (event) {
        event.stopPropagation();

        if (editingCardId === data.id) {
            resetForm();
        }

        postcardDiv.remove();
        deleteCardFromLocalStorage(data.id);
    });

    postcardDiv.append(messageDiv);
    postcardDiv.append(footerDiv);
    postcardDiv.append(editBtn);
    postcardDiv.append(deleteBtn);

    historyContainer.prepend(postcardDiv);

    if (saveToStorage) {
        saveCardToLocalStorage(data);
    }
}

// Сохранение в localStorage
function saveCardToLocalStorage(data) {
    let postcardsArray = [];
    const saved = localStorage.getItem('postcardsHistory');

    if (saved) {
        postcardsArray = JSON.parse(saved);
    }

    postcardsArray.push(data);
    localStorage.setItem('postcardsHistory', JSON.stringify(postcardsArray));
}

// Удаление одной открытки по ID из localStorage
function deleteCardFromLocalStorage(id) {
    const saved = localStorage.getItem('postcardsHistory');
    if (saved) {
        let postcardsArray = JSON.parse(saved);
        postcardsArray = postcardsArray.filter(item => item.id !== id);
        localStorage.setItem('postcardsHistory', JSON.stringify(postcardsArray));
    }
}

// Очистка всей-всей истории
clearAllBtn.addEventListener('click', function () {
    if (confirm('Точно хотите удалить всю историю открыток?')) {
        localStorage.removeItem('postcardsHistory');
        historyContainer.innerHTML = '';
        resetForm();
    }
});

// Сброс формы в начальное состояние
function resetForm() {
    editingCardId = null;
    sendBtn.textContent = 'Отправить';
    messageInput.value = '';
    fromInput.value = '';
    toInput.value = '';
    themeSelect.selectedIndex = 0;
    livePreview.className = 'postcard theme-classic';
    updatePreviewAndValidation();
}

// Сохранение (отправка) открытки
sendBtn.addEventListener('click', function () {
    const postcardData = {
        id: editingCardId !== null ? editingCardId : Date.now(),
        message: messageInput.value.trim(),
        from: fromInput.value.trim(),
        to: toInput.value.trim(),
        theme: themeSelect.value
    };

    if (editingCardId !== null) {
        deleteCardFromLocalStorage(editingCardId);
        const oldCardElement = historyContainer.querySelector(`[data-id="${editingCardId}"]`);
        if (oldCardElement) {
            oldCardElement.remove();
        }
    }

    renderPostcard(postcardData, true);
    resetForm();
    messageInput.focus();
});

// Инициализация при старте
loadHistory();
updatePreviewAndValidation();