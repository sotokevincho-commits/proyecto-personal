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
    updateTask(updatedTask) {
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
            this.tasks[index] = { ...this.tasks[index], ...updatedTask };
            this.save();
        }
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
            
            // 1. Color exclusivo para el estado
            let statusClass = isCompleted ? 'bg-success' : 'bg-warning text-dark';
            
            // 2. Colores exclusivos para la prioridad (Rojo, Azul, Verde)
            let priorityColor = '#6fd9a8'; // Verde (Baja por defecto)
            let priorityText = 'Baja';
            
            if (task.priority === 'alta') {
                priorityColor = '#e2707c'; // Rojo
                priorityText = 'Alta';
            } else if (task.priority === 'media') {
                priorityColor = '#7ba7e0'; // Azul
                priorityText = 'Media';
            }

            const taskHtml = `
                <div class="task-card mb-3 ${isCompleted ? 'task-completed' : ''}" data-task-id="${task.id}">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6>${task.name}</h6>
                        <div class="d-flex align-items-center gap-2">
                            <button type="button" class="btn btn-sm btn-outline-info edit-button py-0 px-1" title="Editar tarea"> EDITAR </button>
                            <button type="button" class="btn-close btn-close-white delete-button" aria-label="Eliminar" title="Eliminar tarea"></button>
                        </div>
                    </div>
                    <p class="mb-2">${task.description}</p>
                    
                    <!-- Nueva etiqueta de prioridad -->
                    <div class="mb-3">
                        <span style="font-size: 0.75rem; border: 1px solid ${priorityColor}; color: ${priorityColor}; padding: 3px 10px; border-radius: 12px; background: ${priorityColor}1A; font-weight: 600;">
                            Prioridad: ${priorityText}
                        </span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <small> ${task.startDate || 'Sin inicio'} ➔ ${task.dueDate}</small>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge ${statusClass} status-badge">
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