class TodoList {
    constructor() {
        this.editingIndex = -1;
        this.addButton = document.getElementById('addButton');
        this.todoInput = document.getElementById('todoInput');
        this.todoList = document.getElementById('todoList');

        this.addButton.addEventListener('click', () => this.addOrUpdateTask());
        this.todoList.addEventListener('click', (e) => this.handleActions(e));
    }

    handleActions(e) {
        if (e.target.classList.contains('removeButton')) this.removeTask(e);
        if (e.target.classList.contains('editButton')) this.editTask(e);
        if (e.target.classList.contains('doneButton')) this.doneTask(e);
    }

    // 1. Accept input
    addOrUpdateTask() {
        const taskText = this.todoInput.value.trim();
        if (!taskText) return;

        if (this.editingIndex === -1) {
            this.addTask(taskText);
        } else {
            this.updateTask(taskText);
        }

        this.todoInput.value = '';
        this.resetEditing();
    }

    // 2. View inputs
    addTask(taskText) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item todo-item d-flex justify-content-between align-items-start gap-2';

        listItem.innerHTML = `
            <div class="task-content flex-grow-1">
                <span class="task-text d-block">${taskText}</span>
                <small class="text-muted d-block mt-1">
                    Date Added: ${new Date().toLocaleString()}
                </small>
            </div>

            <div class="btn-group btn-group-sm" role="group">
                <button class="btn btn-success doneButton">Done</button>
                <button class="btn btn-warning editButton">Edit</button>
                <button class="btn btn-danger removeButton">Delete</button>
            </div>
        `;

        this.todoList.appendChild(listItem);
    }

    // Mark done
    doneTask(event) {
        const taskItem = event.target.closest('.todo-item');
        const text = taskItem.querySelector('.task-text');
        const btn = event.target;

        text.classList.toggle('completed');

        if (text.classList.contains('completed')) {
            btn.textContent = 'Undo';
            btn.classList.remove('btn-success');
            btn.classList.add('btn-secondary');
        } else {
            btn.textContent = 'Done';
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-success');
        }
    }

    // 3. Update input
    editTask(event) {
        const taskItem = event.target.closest('.todo-item');
        this.todoInput.value = taskItem.querySelector('.task-text').textContent;

        this.editingIndex = Array.from(this.todoList.children).indexOf(taskItem);
        this.addButton.textContent = 'Update Task';
    }

    updateTask(taskText) {
        this.todoList.children[this.editingIndex]
            .querySelector('.task-text').textContent = taskText;
    }

    resetEditing() {
        this.editingIndex = -1;
        this.addButton.textContent = 'Add Task';
    }

    // 4. Delete input
    removeTask(event) {
        const taskItem = event.target.closest('.todo-item');
        this.todoList.removeChild(taskItem);
    }
}

document.addEventListener('DOMContentLoaded', () => new TodoList());
