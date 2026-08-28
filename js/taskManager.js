class TaskManager {
    constructor(currentId = 0) {
        this.tasks = [];
        this.currentId = currentId;
    }

addTask(name, description, startDate, dueDate, priority) {
    const newTask = {
        id: this.currentId++,
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
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.save(); 
    }

    save() {
        const tasksJson = JSON.stringify(this.tasks);
        localStorage.setItem('tasks', tasksJson);
        localStorage.setItem('currentId', String(this.currentId));
    }

    load() {
        if (localStorage.getItem('tasks')) {
            const tasksJson = localStorage.getItem('tasks');
            this.tasks = JSON.parse(tasksJson);
        }

        if (localStorage.getItem('currentId')) {
            const currentId = localStorage.getItem('currentId');
            this.currentId = Number(currentId);
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

            let badgeClass = 'bg-warning text-dark'; // PORHACER / Baja (Naranja)

            if (isCompleted) {
                badgeClass = 'bg-success'; // Completada (Verde)
            } else if (task.priority === 'alta') {
                badgeClass = 'bg-danger'; // Urgente / Alta (Rojo)
            } else if (task.priority === 'media') {
                badgeClass = 'bg-primary'; // En proceso / Media (Azul)
            } else if (task.priority === 'baja') {
                badgeClass = 'bg-secondary'; // Programada / Baja (Gris)
            }

            const taskHtml = `
                <div class="task-card mb-3 ${isCompleted ? 'task-completed' : ''}" data-task-id="${task.id}" data-completed="${isCompleted}">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6>${task.name}</h6>
                        <button type="button" class="btn-close btn-close-white delete-btn" aria-label="Eliminar" title="Eliminar tarea"></button>
                    </div>
                    <p>${task.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small>${task.dueDate}</small>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge ${badgeClass} status-badge">
                                ${isCompleted ? 'Completada' : task.status}
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