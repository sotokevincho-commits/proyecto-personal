class TaskManager {
    constructor(currentId = 0) {
        this.tasks = [];
        this.currentId = currentId;
    }
    addTask(name, description, startDate, dueDate, priority) {
        this.currentId++;
        const newTask = {
            id: this.currentId,
            name: name,
            description: description,
            startDate: startDate,
            dueDate: dueDate,
            priority: priority,
            status: 'PORHACER'
        };
        this.tasks.push(newTask);
        this.save();
    }
    deleteTask(taskId) {
        const newTasks = [];
        for (let task of this.tasks) {
            if (task.id !== taskId) {
                newTasks.push(task);
            }
        }
        this.tasks = newTasks;
        this.save(); // Guarda el arreglo actualizado en localStorage
    }
    save() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('currentId', String(this.currentId));
    }
    load() {
        if (localStorage.getItem('tasks')) {
            this.tasks = JSON.parse(localStorage.getItem('tasks'));
        }
        if (localStorage.getItem('currentId')) {
            this.currentId = Number(localStorage.getItem('currentId'));
        }
    }
    render() {
        const taskListContainer = document.querySelector('#main-task-list');
        if (!taskListContainer) return;
        taskListContainer.innerHTML = '';
        if (this.tasks.length === 0) {
            taskListContainer.innerHTML = `
                <div class="text-center text-white-50 py-4">
                    <p class="mb-0">No hay tareas creadas todavía.</p>
                </div>
            `;
            return;
        }
        this.tasks.forEach(task => {
            const isCompleted = task.status === 'Completada';
            let badgeClass = 'bg-warning text-dark';
            if (isCompleted) {
                badgeClass = 'bg-success';
            } else if (task.priority === 'alta') {
                badgeClass = 'bg-danger';
            } else if (task.priority === 'media') {
                badgeClass = 'bg-primary';
            } else if (task.priority === 'baja') {
                badgeClass = 'bg-secondary';
            }
            const taskHtml = `
                <div class="task-card mb-3 ${isCompleted ? 'task-completed' : ''}" data-task-id="${task.id}">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6>${task.name}</h6>
                        <button type="button" class="btn-close btn-close-white delete-button" aria-label="Eliminar" title="Eliminar tarea"></button>
                    </div>
                    <p>${task.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small>${task.dueDate}</small>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge ${badgeClass} status-badge">
                                ${task.status}
                            </span>
                            <button type="button" class="btn btn-sm ${isCompleted ? 'btn-success' : 'btn-outline-light'} toggle-complete-btn" title="Marcar como completada">
                                ✓
                            </button>
                        </div>
                    </div>
                </div>
            `;

            taskListContainer.innerHTML += taskHtml;
        });
    }
}