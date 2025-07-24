function main() {
    // КНОПКИ НА ПАНЕЛИ ЗАДАЧ
    // Обработка кнопки добавления задачи
    document.getElementById('add-btn').addEventListener('click', function() {
        let newTaskInput = document.getElementById('new-task');
        let taskText = newTaskInput.value.trim();
        
        if (taskText) addNewTask(taskText);
    });

    // Обработка кнопок фильтрации
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            this.classList.add('active');
            filterTasks(this.dataset.filter);
        });
    });


    // КНОПКИ МОДАЛЬНОГО ОКНА
    // Кнопка изменения статуса
    document.getElementById("change-status-btn").addEventListener('click', () => {
        changeTask();
    })

    // Кнопка удаления задачи
    document.getElementById("delete-task-btn").addEventListener('click', () => {
        if (confirm("Вы уверены, что хотите удалить эту задачу?")) {
            deleteTask();
        }
    })

    // Кнопка закрытия модального окна
    document.getElementById("close-btn").addEventListener('click', function() {
        document.getElementById("task-modal").style.display = "none";
    })
}

// Функция фильтрации задач
function filterTasks(filter) {
    let tasks = document.querySelectorAll('.task');
    
    tasks.forEach(task => {
        task.classList.remove('hidden');
        
        if (filter === 'completed' && !task.classList.contains('completed')) {
            task.classList.add('hidden');
        } else if (filter === 'active' && task.classList.contains('completed')) {
            task.classList.add('hidden');
        }
    });
}

// функция открытия модального окна
function openModal() {
    let modal = document.getElementById("task-modal");
    modal.style.display = "flex";

    document.getElementById("task-text").textContent = ct.text;


    let changeBtn = document.getElementById("change-status-btn");

    if (ct.status == 0) {
        if (changeBtn.classList.contains('inactive')) {
            changeBtn.classList.remove('inactive')
        }
    } else {
        if (!changeBtn.classList.contains('inactive')) {
            changeBtn.classList.add('inactive')
        }
    }
}

// Функция отправки AJAX запросов
async function sendRequest(method, data = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (method !== 'GET' && data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch('php/tasks.php', options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
}


// ФУНКЦИОНАЛ ПРЕЛОАДЕРА
// Показать прелоадер
function showPreloader() {
    document.getElementById("preloader").style.display = "flex";
}

// Убрать прелоадер
function hidePreloader() {
    document.getElementById("preloader").style.display = "none";
}


// ФУНКЦИОНАЛ ЗАДАЧ
// Функция получения задач
async function getTasks(){
    try {
        const tasks = await sendRequest('GET');
        if (tasks && Array.isArray(tasks)) {
            document.getElementById('task-list').innerHTML = '';
            
            tasks.forEach(task => renderTask(task));
        }
    } catch (error) {
        console.error('Ошибка при получении задач:', error);
        alert("Ошибка при получении задач");
    }
}

// Функция вывода задачи
function renderTask(task) {
    const taskList = document.getElementById('task-list');
    
    const taskElement = document.createElement('li');
    taskElement.className = `task ${task.status === "1" ? 'completed' : ''}`;
    taskElement.setAttribute('data-id', task.id);
    taskElement.setAttribute('data-status', task.status);
    
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.task;
    
    taskElement.appendChild(taskText);
    taskList.appendChild(taskElement);
    
    taskElement.addEventListener('click', function() {
        ct.id = this.getAttribute('data-id');
        ct.status = this.getAttribute('data-status');
        ct.text = this.querySelector('.task-text').textContent;
        openModal();
    });
    
    return taskElement;
}

// Функция добавления задачи
async function addNewTask(taskText) {
    try {
        const response = await sendRequest('POST', { text: taskText });
        if (response && response.id) {
            renderTask({
                id: response.id,
                task: taskText,
                status: "0"
            });
            document.getElementById('new-task').value = '';

        } else {
            alert("Не удалось добавить задачу");
        }

    } catch (error) {
        console.error('Ошибка при добавлении задачи:', error);
        alert("Ошибка при добавлении задачи");
    }
}

// Функция изменения статуса задачи
async function changeTask() {
    try {
        const response = await sendRequest('PUT', { id: ct.id });
        
        if (response && response.status === 'success') {
            const taskElement = document.querySelector(`.task[data-id="${ct.id}"]`);
            if (taskElement) {
                taskElement.classList.add('completed');
                taskElement.setAttribute('data-status', '1');
                ct.status = '1';
            }
            
            alert("Статус задачи изменён");
            document.getElementById("task-modal").style.display = "none";

            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            filterTasks(activeFilter);
        } else {
            alert("Не удалось изменить статус задачи");
        }
    } catch (error) {
        console.error('Ошибка при изменении статуса задачи:', error);
        alert("Ошибка при изменении статуса задачи");
    }
}

// Функция удаления задачи
async function deleteTask() {
    try {
        const response = await sendRequest('DELETE', { id: ct.id });
        
        if (response && response.status === 'success') {
            const taskElement = document.querySelector(`.task[data-id="${ct.id}"]`);
            if (taskElement) {
                taskElement.remove();
            }
            
            alert("Задача удалена");
            document.getElementById("task-modal").style.display = "none";

        } else {
            alert("Не удалось удалить задачу");
        }

    } catch (error) {
        console.error('Ошибка при удалении задачи:', error);
        alert("Ошибка при удалении задачи");
    }
}

// Класс для хранения выбранной задачи
class CurentTask {
    id = 0;
    status = 0;
    text = '';
}
let ct = new CurentTask;

document.addEventListener('DOMContentLoaded', async () => {
    await getTasks();
    hidePreloader();
    main();
});