// 1. Selección de elementos del DOM por su ID
const taskForm = document.querySelector('#task-form');
const taskTitle = document.querySelector('#task-title');
const taskDetails = document.querySelector('#task-details');
const startDate = document.querySelector('#start-date');
const endDate = document.querySelector('#end-date');
const taskPriority = document.querySelector('#task-priority');

const startDateFeedback = document.querySelector('#start-date-feedback');
const endDateFeedback = document.querySelector('#end-date-feedback');

// Configurar fecha mínima permitida en el selector (día actual)
const today = new Date().toISOString().split('T')[0];
if (startDate) startDate.setAttribute('min', today);
if (endDate) endDate.setAttribute('min', today);

// Limpiar la marca de error en tiempo real cuando el usuario interactúa con el campo
[taskTitle, taskDetails, startDate, endDate, taskPriority].forEach(input => {
    if (input) {
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
        });
    }
});

/**
 * Función auxiliar para aplicar o remover clases de validación en los inputs
 */
function setFieldStatus(inputElement, isValid) {
    if (isValid) {
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
    } else {
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
    }
}

/**
 * Limpia los estilos de validación del formulario
 */
function resetFormValidation() {
    [taskTitle, taskDetails, startDate, endDate, taskPriority].forEach(input => {
        if (input) {
            input.classList.remove('is-invalid', 'is-valid');
        }
    });
}

/**
 * 2. Función de validación del formulario
 * @param {Object} data - Objeto con los datos capturados del formulario
 * @returns {boolean} - true si la información es válida, false de lo contrario
 */
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

    // Normalización de fechas para comparaciones
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const start = data.startDate ? new Date(data.startDate + 'T00:00:00') : null;
    const end = data.dueDate ? new Date(data.dueDate + 'T00:00:00') : null;

    // 4. Validar Fecha de inicio
    let isStartValid = Boolean(data.startDate);
    if (!isStartValid) {
        startDateFeedback.textContent = 'Selecciona una fecha de inicio.';
    } else if (start < currentDate) {
        isStartValid = false;
        startDateFeedback.textContent = 'La fecha de inicio no puede ser anterior a hoy.';
    }
    setFieldStatus(startDate, isStartValid);
    if (!isStartValid) isFormValid = false;

    // 5. Validar Fecha límite y coherencia entre fechas
    let isEndValid = Boolean(data.dueDate);
    if (!isEndValid) {
        endDateFeedback.textContent = 'Selecciona una fecha límite.';
    } else if (end < currentDate) {
        isEndValid = false;
        endDateFeedback.textContent = 'La fecha límite no puede ser anterior a hoy.';
    } else if (start && end < start) {
        isEndValid = false;
        endDateFeedback.textContent = 'La fecha límite no puede ser anterior al inicio.';
    }
    setFieldStatus(endDate, isEndValid);
    if (!isEndValid) isFormValid = false;

    return isFormValid;
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
        // Alerta SweetAlert2 general si hay campos con error
        Swal.fire({
            icon: 'error',
            title: 'Entrada inválida',
            text: 'Por favor, revisa los campos marcados en el formulario.',
            confirmButtonColor: '#ffc107',
            confirmButtonText: 'Entendido'
        });
    } else {
        // Mensaje de éxito
        Swal.fire({
            icon: 'success',
            title: '¡Tarea validada!',
            text: 'Todos los campos cumplen con los requisitos.',
            timer: 2000,
            showConfirmButton: false
        });

        console.log("Formulario procesado exitosamente.");

        // Reinicio del formulario y de las marcas de validación
        taskForm.reset();
        resetFormValidation();

        if (startDate) startDate.setAttribute('min', today);
        if (endDate) endDate.setAttribute('min', today);
    }
});