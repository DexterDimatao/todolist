class TodoListApp {
  constructor() {
    // Base storage keys (we'll suffix by username)
    this.STORAGE_NAME = 'todo_current_name';
    this.KEY_PREFIX_TASKS = 'todo_tasks__';
    this.KEY_PREFIX_ACTIVITY = 'todo_activity__';

    // State
    this.currentUser = '';
    this.tasks = [];
    this.activity = [];
    this.editingId = null;
    this.currentFilter = 'all';

    // DOM
    this.loginSection = document.getElementById('loginSection');
    this.todoSection = document.getElementById('todoSection');
    this.allTodosView = document.getElementById('allUsersView');

    this.usernameInput = document.getElementById('username');
    this.loginButton = document.getElementById('loginButton');
    this.logoutButton = document.getElementById('logoutButton');

    this.userGreeting = document.getElementById('userGreeting');
    this.allTasksName = document.getElementById('allTasksName');

    this.myTasksBtn = document.getElementById('myTasksBtn');
    this.allTodosBtn = document.getElementById('allTodosBtn');
    this.backToTasksBtn = document.getElementById('backToTasksBtn');

    this.todoInput = document.getElementById('todoInput');
    this.addButton = document.getElementById('addButton');
    this.todoList = document.getElementById('todoList');

    this.taskCount = document.getElementById('taskCount');
    this.emptyStateText = document.getElementById('emptyStateText');

    this.filterAll = document.getElementById('filterAll');
    this.filterActive = document.getElementById('filterActive');
    this.filterCompleted = document.getElementById('filterCompleted');

    this.activityLog = document.getElementById('activityLog');

    // “All Todos” view container (now shows only current user's full list)
    this.allUsersContent = document.getElementById('allUsersContent');

    // Init
    this.bindEvents();
    this.showLogin();

    // Optional: if you want auto-restore last logged user, uncomment:
    // const last = localStorage.getItem(this.STORAGE_NAME);
    // if (last) { this.usernameInput.value = last; }
  }

  // ---------- Key helpers ----------
  normalizeName(name) {
    return name.trim().toLowerCase();
  }

  tasksKey(name) {
    return this.KEY_PREFIX_TASKS + encodeURIComponent(this.normalizeName(name));
  }

  activityKey(name) {
    return this.KEY_PREFIX_ACTIVITY + encodeURIComponent(this.normalizeName(name));
  }

  // ---------- Storage (per user) ----------
  loadUserFromStorage(name) {
    const tKey = this.tasksKey(name);
    const aKey = this.activityKey(name);

    const tasksRaw = localStorage.getItem(tKey);
    const activityRaw = localStorage.getItem(aKey);

    this.tasks = tasksRaw ? JSON.parse(tasksRaw) : [];
    this.activity = activityRaw ? JSON.parse(activityRaw) : [];
  }

  saveUserToStorage() {
    if (!this.currentUser) return;

    localStorage.setItem(this.tasksKey(this.currentUser), JSON.stringify(this.tasks));
    localStorage.setItem(this.activityKey(this.currentUser), JSON.stringify(this.activity));
  }

  // ---------- UI Flow ----------
  showLogin() {
    this.loginSection.style.display = 'block';
    this.todoSection.style.display = 'none';
    this.allTodosView.style.display = 'none';

    // Reset view state (UI only)
    this.currentFilter = 'all';
    this.editingId = null;
    this.addButton.textContent = 'Add Task';
    this.todoInput.value = '';
    this.todoList.innerHTML = '';
    this.taskCount.textContent = '0 tasks';
    this.emptyStateText.classList.add('d-none');

    // Reset filter button UI
    [this.filterAll, this.filterActive, this.filterCompleted].forEach(b => b.classList.remove('active'));
    this.filterAll.classList.add('active');
  }

  showMyTasks() {
    this.todoSection.style.display = 'block';
    this.allTodosView.style.display = 'none';

    this.myTasksBtn.classList.add('active');
    this.allTodosBtn.classList.remove('active');

    this.renderMyTasks();
    this.renderActivity();
  }

  showAllTodos() {
    this.todoSection.style.display = 'none';
    this.allTodosView.style.display = 'block';

    this.myTasksBtn.classList.remove('active');
    this.allTodosBtn.classList.add('active');

    this.renderAllTodos();
  }

  // ---------- Activity ----------
  addActivity(message) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.activity.unshift({ message, time });
    if (this.activity.length > 10) this.activity = this.activity.slice(0, 10);
    this.saveUserToStorage();
  }

  renderActivity() {
    this.activityLog.innerHTML = '';
    if (this.activity.length === 0) {
      this.activityLog.innerHTML = '<div class="activity-item text-muted">No activity yet.</div>';
      return;
    }
    this.activity.forEach(item => {
      const div = document.createElement('div');
      div.className = 'activity-item';
      div.innerHTML = `<div>${item.message}</div><div class="activity-time">${item.time}</div>`;
      this.activityLog.appendChild(div);
    });
  }

  // ---------- Tasks ----------
  addOrUpdateTask() {
    const text = this.todoInput.value.trim();
    if (!text || !this.currentUser) return;

    if (this.editingId === null) {
      const task = {
        id: Date.now() + Math.random(),
        text,
        completed: false,
        createdAt: new Date().toLocaleString()
      };
      this.tasks.push(task);
      this.addActivity(`➕ Added task: "${this.preview(text)}"`);
    } else {
      const task = this.tasks.find(t => t.id === this.editingId);
      if (task) {
        task.text = text;
        this.addActivity(`✏️ Updated task: "${this.preview(text)}"`);
      }
      this.editingId = null;
      this.addButton.textContent = 'Add Task';
    }

    this.saveUserToStorage();
    this.todoInput.value = '';
    this.todoInput.focus();
    this.renderMyTasks();
  }

  toggleDone(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    this.addActivity(
      task.completed
        ? `✅ Completed: "${this.preview(task.text)}"`
        : `🔄 Reopened: "${this.preview(task.text)}"`
    );

    this.saveUserToStorage();
    this.renderMyTasks();
  }

  startEdit(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.todoInput.value = task.text;
    this.editingId = taskId;
    this.addButton.textContent = 'Update Task';
    this.todoInput.focus();
  }

  deleteTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    this.tasks = this.tasks.filter(t => t.id !== taskId);

    if (task) this.addActivity(`🗑️ Deleted: "${this.preview(task.text)}"`);
    this.saveUserToStorage();
    this.renderMyTasks();
  }

  // ---------- Rendering ----------
  renderMyTasks() {
    let visibleTasks = this.tasks;
    if (this.currentFilter === 'active') visibleTasks = this.tasks.filter(t => !t.completed);
    if (this.currentFilter === 'completed') visibleTasks = this.tasks.filter(t => t.completed);

    const total = this.tasks.length;
    this.taskCount.textContent = total === 1 ? '1 task' : `${total} tasks`;
    this.emptyStateText.classList.toggle('d-none', total !== 0);

    this.todoList.innerHTML = '';

    visibleTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = 'list-group-item todo-item d-flex justify-content-between align-items-start gap-2';
      li.dataset.taskId = String(task.id);

      li.innerHTML = `
        <div class="task-content flex-grow-1">
          <span class="task-text d-block ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</span>
          <small class="text-muted d-block mt-1">Date Added: ${task.createdAt}</small>
        </div>

        <div class="btn-group btn-group-sm" role="group">
          <button class="btn ${task.completed ? 'btn-secondary' : 'btn-success'} doneButton">
            ${task.completed ? 'Undo' : 'Done'}
          </button>
          <button class="btn btn-warning editButton">Edit</button>
          <button class="btn btn-danger removeButton">Delete</button>
        </div>
      `;

      this.todoList.appendChild(li);
    });

    this.renderActivity();
  }

  renderAllTodos() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;

    this.allUsersContent.innerHTML = `
      <div class="user-card">
        <div class="user-header">
          <h6>👤 ${this.escapeHtml(this.currentUser || 'User')}</h6>
          <div class="user-stats">
            <span>Total: ${total}</span>
            <span>Done: ${completed}</span>
          </div>
        </div>
        <div class="user-tasks">
          ${
            total
              ? this.tasks.map(t => `
                <div class="user-task ${t.completed ? 'completed' : ''}">
                  <span>📝 ${this.escapeHtml(t.text)}</span>
                </div>
              `).join('')
              : '<div class="user-task"><span>No tasks yet.</span></div>'
          }
        </div>
      </div>
    `;
  }

  // ---------- Filters ----------
  setFilter(filter) {
    this.currentFilter = filter;
    [this.filterAll, this.filterActive, this.filterCompleted].forEach(b => b.classList.remove('active'));
    if (filter === 'all') this.filterAll.classList.add('active');
    if (filter === 'active') this.filterActive.classList.add('active');
    if (filter === 'completed') this.filterCompleted.classList.add('active');
    this.renderMyTasks();
  }

  // ---------- Events ----------
  bindEvents() {
    this.loginButton.addEventListener('click', () => this.login());
    this.usernameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.login();
    });

    this.logoutButton.addEventListener('click', () => this.logout());

    this.myTasksBtn.addEventListener('click', () => this.showMyTasks());
    this.allTodosBtn.addEventListener('click', () => this.showAllTodos());
    this.backToTasksBtn.addEventListener('click', () => this.showMyTasks());

    this.addButton.addEventListener('click', () => this.addOrUpdateTask());
    this.todoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.addOrUpdateTask();
      }
    });

    this.filterAll.addEventListener('click', () => this.setFilter('all'));
    this.filterActive.addEventListener('click', () => this.setFilter('active'));
    this.filterCompleted.addEventListener('click', () => this.setFilter('completed'));

    this.todoList.addEventListener('click', (e) => {
      const li = e.target.closest('li.todo-item');
      if (!li) return;

      const taskId = Number(li.dataset.taskId);
      if (e.target.classList.contains('doneButton')) this.toggleDone(taskId);
      if (e.target.classList.contains('editButton')) this.startEdit(taskId);
      if (e.target.classList.contains('removeButton')) this.deleteTask(taskId);
    });
  }

  // ---------- Login/Logout ----------
  login() {
    const name = this.usernameInput.value.trim();
    if (!name) {
      alert('Please enter your name.');
      return;
    }

    // Save & set current user
    this.currentUser = name;
    localStorage.setItem(this.STORAGE_NAME, name);

    // Load THIS user's saved tasks/logs (separate keys per user)
    this.loadUserFromStorage(name);

    this.userGreeting.textContent = name;
    this.allTasksName.textContent = name;

    this.addActivity(`👋 ${name} logged in`);

    this.loginSection.style.display = 'none';
    this.showMyTasks();
    this.todoInput.focus();
  }

  logout() {
    if (this.currentUser) {
      this.addActivity(`👋 ${this.currentUser} logged out`);
      this.saveUserToStorage();
    }

    this.currentUser = '';
    this.showLogin();
  }

  // ---------- Helpers ----------
  preview(text) {
    return text.length > 30 ? text.slice(0, 30) + '...' : text;
  }

  escapeHtml(str) {
    return str
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TodoListApp();
});
