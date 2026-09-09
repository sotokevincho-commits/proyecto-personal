const taskManager = new TaskManager();
taskManager.load();
taskManager.render();
console.log("TaskManager inicializado con tareas guardadas:", taskManager.tasks);
let currentEditingTaskId = null;
// 2. Selección de elementos del DOM por su ID
const taskForm = document.querySelector('#task-form');
const taskTitle = document.querySelector('#task-title');
const taskDetails = document.querySelector('#task-details');
const startDate = document.querySelector('#start-date');
const endDate = document.querySelector('#end-date');
const taskPriority = document.querySelector('#task-priority');
const mainTaskList = document.querySelector('#main-task-list');
const startDateFeedback = document.querySelector('#start-date-feedback');
const endDateFeedback = document.querySelector('#end-date-feedback');
const formPanelTitle = document.querySelector('.panel-card .panel-title');
const submitBtn = taskForm ? taskForm.querySelector('button[type="submit"]') : null;
// Limpiar la marca de error en tiempo real cuando el usuario interactúa con el campo
[taskTitle, taskDetails, startDate, endDate, taskPriority].forEach(input => {
    if (input) {
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
        });
    }
});

// Función auxiliar para aplicar o remover clases de validación en los inputs
function setFieldStatus(inputElement, isValid) {
    if (isValid) {
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
    } else {
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
    }
}
//Limpia los estilos de validación del formulario
function resetFormValidation() {
    [taskTitle, taskDetails, startDate, endDate, taskPriority].forEach(input => {
        if (input) {
            input.classList.remove('is-invalid', 'is-valid');
        }
    });
}

function resetFormToCreateMode() {
    currentEditingTaskId = null;
    taskForm.reset();
    resetFormValidation();
    if (formPanelTitle) formPanelTitle.textContent = 'Crear nueva tarea';
    if (submitBtn) submitBtn.textContent = 'Agregar tarea';
}

//Función de validación del formulario
function validFormFieldInput(data) {
    console.log("Validando datos del formulario:", data);
    let isFormValid = true;
    // 1. Validar Nombre
    const isNameValid = data.name.trim() !== '';
    setFieldStatus(taskTitle, isNameValid);
    if (!isNameValid) isFormValid = false;
    // 2. Validar Descripción
    const isDetailsValid = data.description.trim() !== '';
    setFieldStatus(taskDetails, isDetailsValid);
    if (!isDetailsValid) isFormValid = false;
    // 3. Validar Prioridad
    const isPriorityValid = Boolean(data.priority);
    setFieldStatus(taskPriority, isPriorityValid);
    if (!isPriorityValid) isFormValid = false;
    const start = data.startDate ? new Date(data.startDate + 'T00:00:00') : null;
    const end = data.dueDate ? new Date(data.dueDate + 'T00:00:00') : null;
    // 4. Validar Fecha de inicio
    let isStartValid = Boolean(data.startDate);
    if (!isStartValid && startDateFeedback) {
        startDateFeedback.textContent = 'Selecciona una fecha de inicio.';
    }
    setFieldStatus(startDate, isStartValid);
    if (!isStartValid) isFormValid = false;
    // 5. Validar Fecha límite (No puede ser anterior a la fecha de inicio)
    let isEndValid = Boolean(data.dueDate);
    if (!isEndValid && endDateFeedback) {
        endDateFeedback.textContent = 'Selecciona una fecha límite.';
    } else if (start && end < start) {
        isEndValid = false;
        if (endDateFeedback) {
            endDateFeedback.textContent = 'La fecha límite no puede ser anterior a la fecha de inicio.';
        }
    }
    setFieldStatus(endDate, isEndValid);
    if (!isEndValid) isFormValid = false;
    return isFormValid;
}
// Escuchador de clics para la lista de tareas
if (mainTaskList) {
    mainTaskList.addEventListener('click', (event) => {
        // 1. Obtenemos el elemento padre y el taskId desde el inicio para TODOS los eventos
        const parentTask = event.target.closest('.task-card');
        if (!parentTask) return;
        const taskId = Number(parentTask.dataset.taskId);

        // 2. Opción Eliminar
        if (event.target.classList.contains('delete-button') || event.target.closest('.delete-button')) {
            Swal.fire({
                title: '¿Eliminar tarea?',
                text: 'Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#e2707c',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    taskManager.deleteTask(taskId);
                    taskManager.save();
                    taskManager.render();
                    renderCalendar();
                    if (currentEditingTaskId === taskId) {
                        resetFormToCreateMode();
                    }
                    Swal.fire({
                        icon: 'success',
                        title: 'Tarea eliminada',
                        timer: 1200,
                        showConfirmButton: false
                    });
                }
            });
            return;
        }

        // editar tarea
        if (event.target.classList.contains('edit-button') || event.target.closest('.edit-button')) {
            const taskToEdit = taskManager.tasks.find(t => t.id === taskId);
            if (taskToEdit) {
                currentEditingTaskId = taskToEdit.id;
                taskTitle.value = taskToEdit.name;
                taskDetails.value = taskToEdit.description;
                startDate.value = taskToEdit.startDate;
                endDate.value = taskToEdit.dueDate;
                taskPriority.value = taskToEdit.priority;
                
                if (formPanelTitle) formPanelTitle.textContent = 'Editar tarea';
                if (submitBtn) submitBtn.textContent = 'Guardar cambios';
                
                resetFormValidation();
                taskForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // 4. Opción Cambiar Estado
        const toggleBtn = event.target.closest('.toggle-complete-btn');
        if (toggleBtn) {
            const task = taskManager.tasks.find(t => t.id === taskId);
            if (task) {
                task.status = task.status === 'Completada' ? 'PORHACER' : 'Completada';
                taskManager.save();
                taskManager.render();
                renderCalendar();
            }
        }
    });
}
// 3. Escuchador de envío del formulario
taskForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = {
        name: taskTitle.value,
        description: taskDetails.value,
        startDate: startDate.value,
        dueDate: endDate.value,
        priority: taskPriority.value
    };
    const isValid = validFormFieldInput(formData);
    if (!isValid) {
        Swal.fire({
            icon: 'error',
            title: 'Entrada inválida',
            text: 'Por favor, revisa los campos marcados en el formulario.',
            confirmButtonColor: '#ffc107',
            confirmButtonText: 'Entendido'
        });
    } else {
        // Si la variable guarda un ID, estamos EDITANDO
        if (currentEditingTaskId !== null) {
            taskManager.updateTask({
                id: currentEditingTaskId,
                name: formData.name,
                description: formData.description,
                startDate: formData.startDate,
                dueDate: formData.dueDate,
                priority: formData.priority
            });

            Swal.fire({
                icon: 'success',
                title: '¡Tarea actualizada!',
                text: 'Los cambios se han guardado con éxito.',
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            taskManager.addTask(formData.name, formData.description, formData.startDate, formData.dueDate, formData.priority);

            Swal.fire({
                icon: 'success',
                title: '¡Tarea agregada!',
                text: 'La tarea ha sido guardada con éxito.',
                timer: 1500,
                showConfirmButton: false
            });
        }

        taskManager.render();
        renderCalendar();
        resetFormToCreateMode();
    }
});
const taskColors = ['#e2707c', '#7ba7e0', '#6fd9a8', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#e84393', '#00cec9', '#fd79a8'];
let currentDate = new Date();
const calendarGrid = document.querySelector('.calendar-grid');
const monthYearText = document.querySelector('#calendar-month-year');
const prevMonthBtn = document.querySelectorAll('.calendar-header-badge').length ? document.querySelectorAll('.btn-outline-light')[0] : null;
const nextMonthBtn = document.querySelectorAll('.calendar-header-badge').length ? document.querySelectorAll('.btn-outline-light')[1] : null;
function renderCalendar() {
    if (!calendarGrid) return;
    const dayNames = `
        <div class="day-name">D</div><div class="day-name">L</div><div class="day-name">M</div>
        <div class="day-name">M</div><div class="day-name">J</div><div class="day-name">V</div><div class="day-name">S</div>
    `; 
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    if (monthYearText) monthYearText.textContent = `${monthNames[month]} ${year}`;
    let html = dayNames;
    for (let i = 0; i < firstDay; i++) html += `<div></div>`;
    for (let i = 1; i <= daysInMonth; i++) {
        const currentDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const tasksToday = taskManager.tasks.filter(task => {
            return task.startDate === currentDayStr || task.dueDate === currentDayStr;
        });
        let dayStyles = "";
        let isTaskDay = tasksToday.length > 0;
        if (isTaskDay) {
            let dayColors = [...new Set(tasksToday.map(t => taskColors[t.id % taskColors.length]))];
            let baseStyles = "font-weight: 700; transform: scale(1.06); cursor: pointer;";
            if (dayColors.length === 1) {
                dayStyles = `border: 2px solid ${dayColors[0]}; box-shadow: 0 0 12px ${dayColors[0]}60; ${baseStyles}`;
            } else if (dayColors.length === 2) {
                dayStyles = `
                    border-style: solid; border-width: 2px; 
                    border-top-color: ${dayColors[0]}; border-left-color: ${dayColors[0]}; 
                    border-bottom-color: ${dayColors[1]}; border-right-color: ${dayColors[1]}; 
                    box-shadow: -3px -3px 12px ${dayColors[0]}60, 3px 3px 12px ${dayColors[1]}60; 
                    ${baseStyles}
                `;
            } else if (dayColors.length === 3) {
                dayStyles = `
                    border-style: solid; border-width: 2px; 
                    border-top-color: ${dayColors[0]}; border-left-color: ${dayColors[0]}; 
                    border-right-color: ${dayColors[1]}; border-bottom-color: ${dayColors[2]}; 
                    box-shadow: -3px -3px 12px ${dayColors[0]}60, 3px -3px 12px ${dayColors[1]}60, 0px 3px 12px ${dayColors[2]}60; 
                    ${baseStyles}
                `;
            } else {
                dayStyles = `
                    border-style: solid; border-width: 2px; 
                    border-top-color: ${dayColors[0]}; border-right-color: ${dayColors[1]}; 
                    border-bottom-color: ${dayColors[2]}; border-left-color: ${dayColors[3]}; 
                    box-shadow: 0px -3px 12px ${dayColors[0]}60, 3px 0px 12px ${dayColors[1]}60, 0px 3px 12px ${dayColors[2]}60, -3px 0px 12px ${dayColors[3]}60; 
                    ${baseStyles}
                `;
            }
        } 
        html += `<div class="calendar-day ${isTaskDay ? 'has-tasks' : ''}" style="${dayStyles}" data-date="${currentDayStr}">${i}</div>`;
    }
    calendarGrid.innerHTML = html;
}
if (prevMonthBtn && nextMonthBtn) {
    prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
}
calendarGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('has-tasks')) {
        const dateStr = e.target.dataset.date;
        const tasksToday = taskManager.tasks.filter(task => {
            const start = task.startDate || task.dueDate;
            const end = task.dueDate || task.startDate;
            return dateStr >= start && dateStr <= end;
        });
        if (tasksToday.length > 0) {
            let tasksHtml = '<div class="text-start mt-3">';
            tasksToday.forEach(task => {
                let statusColor = task.status === 'Completada' ? 'success' : 'warning text-dark';
                let taskColor = taskColors[task.id % taskColors.length]; 
                tasksHtml += `
                    <div class="mb-3 p-3 border rounded shadow-sm" style="background: rgba(35, 31, 65, 0.48); border-color: ${taskColor}40 !important; border-left: 4px solid ${taskColor} !important;">
                        <h6 class="fw-bold mb-2" style="color: ${taskColor};">${task.name}</h6>
                        <p class="mb-2 small text-white-50">
                            <strong class="text-white">Rango:</strong> ${task.startDate || 'N/A'} al ${task.dueDate}
                        </p>
                        <span class="badge bg-${statusColor}">${task.status}</span>
                    </div>
                `;
            });
            tasksHtml += '</div>';
            Swal.fire({
                title: `<span style="color: #f2f0fb; font-size: 1.25rem;">Tareas programadas</span><br><small style="color: #8f85b8; font-size: 0.9rem;">${dateStr}</small>`,
                html: tasksHtml,
                background: '#090817', 
                confirmButtonColor: '#9d8fef',
                confirmButtonText: 'Cerrar ventana'
            });
        }
    }
});
renderCalendar();