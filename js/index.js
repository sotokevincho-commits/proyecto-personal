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
        resetFormToCreateMode();
    }
});