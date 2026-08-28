const taskManager = new TaskManager();

taskManager.load();
taskManager.render();

console.log("TaskManager inicializado con tareas guardadas:", taskManager.tasks);

const taskForm = document.querySelector('#task-form');
const taskTitle = document.querySelector('#task-title');
const taskDetails = document.querySelector('#task-details');
const startDate = document.querySelector('#start-date');
const endDate = document.querySelector('#end-date');
const taskPriority = document.querySelector('#task-priority');
const mainTaskList = document.querySelector('#main-task-list'); 

const startDateFeedback = document.querySelector('#start-date-feedback');
const endDateFeedback = document.querySelector('#end-date-feedback');

[taskTitle, taskDetails, startDate, endDate, taskPriority].forEach(input => {
    if (input) {
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
        });
    }
});


function setFieldStatus(inputElement, isValid) {
    if (isValid) {
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
    } else {
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
    }
}


function resetFormValidation() {
    [taskTitle, taskDetails, startDate, endDate, taskPriority].forEach(input => {
        if (input) {
            input.classList.remove('is-invalid', 'is-valid');
        }
    });
}


function validFormFieldInput(data) {
    console.log("Validando datos del formulario:", data);
    let isFormValid = true;

    const isNameValid = data.name.trim() !== '';
    setFieldStatus(taskTitle, isNameValid);
    if (!isNameValid) isFormValid = false;

    const isDetailsValid = data.description.trim() !== '';
    setFieldStatus(taskDetails, isDetailsValid);
    if (!isDetailsValid) isFormValid = false;

    const isPriorityValid = Boolean(data.priority);
    setFieldStatus(taskPriority, isPriorityValid);
    if (!isPriorityValid) isFormValid = false;

    const start = data.startDate ? new Date(data.startDate + 'T00:00:00') : null;
    const end = data.dueDate ? new Date(data.dueDate + 'T00:00:00') : null;

    let isStartValid = Boolean(data.startDate);
    if (!isStartValid && startDateFeedback) {
        startDateFeedback.textContent = 'Selecciona una fecha de inicio.';
    }
    setFieldStatus(startDate, isStartValid);
    if (!isStartValid) isFormValid = false;

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

if (mainTaskList) {
    mainTaskList.addEventListener('click', (event) => {
        const taskCard = event.target.closest('.task-card');
        if (!taskCard) return;

        const taskId = Number(taskCard.getAttribute('data-task-id'));

        if (event.target.classList.contains('delete-btn')) {
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
                    taskManager.render();

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

        const toggleBtn = event.target.closest('.toggle-complete-btn');
        if (toggleBtn) {
            const task = taskManager.tasks.find(t => t.id === taskId);
            if (task) {
                task.status = task.status === 'Completada' ? 'POR HACER' : 'Completada';
                taskManager.save(); 
                taskManager.render();
            }
        }
    });
}

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
        Swal.fire({
            icon: 'success',
            title: '¡Tarea agregada!',
            text: 'La tarea ha sido guardada con éxito.',
            timer: 1500,
            showConfirmButton: false
        });

        taskManager.addTask(formData.name, formData.description, formData.startDate, formData.dueDate, formData.priority);

        taskManager.render();

        console.log("Tareas actuales:", taskManager.tasks);

        taskForm.reset();
        resetFormValidation();
    }
});