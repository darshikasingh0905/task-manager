// Task Manager JavaScript

class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.currentSort = 'date';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
        this.restoreSidebarState();
    }

    initializeElements() {
        // Form elements
        this.taskForm = document.getElementById('taskForm');
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.categorySelect = document.getElementById('categorySelect');
        this.dueDateInput = document.getElementById('dueDateInput');
        
        // Task list
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        
        // Controls
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sortSelect');
        
        // Stats
        this.totalTasksEl = document.getElementById('totalTasks');
        this.activeTasksEl = document.getElementById('activeTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        
        // Bulk actions
        this.bulkActions = document.getElementById('bulkActions');
        this.completeAllBtn = document.getElementById('completeAllBtn');
        this.deleteCompletedBtn = document.getElementById('deleteCompletedBtn');
    }

    bindEvents() {
        // Form submission
        this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
        
        // Sort select
        this.sortSelect.addEventListener('change', (e) => this.handleSort(e));
        
        // Bulk actions
        this.completeAllBtn.addEventListener('click', () => this.completeAllTasks());
        this.deleteCompletedBtn.addEventListener('click', () => this.deleteCompletedTasks());
        
        // Navigation events
        this.bindNavigationEvents();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    bindNavigationEvents() {
        // Navigation buttons
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.getAttribute('title');
                
                // Add click animation
                btn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 150);
                
                // Handle different actions
                switch(action) {
                    case 'Toggle Sidebar':
                        this.toggleSidebar();
                        break;
                    case 'Profile':
                        this.showProfileMenu();
                        break;
                }
            });
        });

        // Brand click
        const navBrand = document.querySelector('.nav-brand');
        navBrand.addEventListener('click', () => {
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Sidebar functionality
        this.bindSidebarEvents();
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContainer = document.querySelector('.main-container');
        const toggleBtn = document.getElementById('sidebarToggleNav');
        
        console.log('Toggle sidebar called');
        console.log('Sidebar:', sidebar);
        console.log('Main container:', mainContainer);
        console.log('Toggle button:', toggleBtn);
        
        if (sidebar && mainContainer) {
            sidebar.classList.toggle('collapsed');
            mainContainer.classList.toggle('sidebar-collapsed');
            
            console.log('Sidebar collapsed:', sidebar.classList.contains('collapsed'));
            console.log('Main container collapsed:', mainContainer.classList.contains('sidebar-collapsed'));
            
            // Update button icon
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('i');
                if (sidebar.classList.contains('collapsed')) {
                    icon.className = 'fas fa-bars';
                } else {
                    icon.className = 'fas fa-chevron-left';
                }
            }
            
            // Save state to localStorage
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }
    }

    restoreSidebarState() {
        const sidebar = document.querySelector('.sidebar');
        const mainContainer = document.querySelector('.main-container');
        const toggleBtn = document.getElementById('sidebarToggleNav');
        
        if (sidebar && mainContainer) {
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
                mainContainer.classList.add('sidebar-collapsed');
                
                // Update button icon
                if (toggleBtn) {
                    const icon = toggleBtn.querySelector('i');
                    icon.className = 'fas fa-bars';
                }
            } else {
                // Update button icon for expanded state
                if (toggleBtn) {
                    const icon = toggleBtn.querySelector('i');
                    icon.className = 'fas fa-chevron-left';
                }
            }
        }
    }

    bindSidebarEvents() {
        // Sidebar navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                // Get the section data
                const section = item.getAttribute('data-section');
                
                // Handle different sections
                this.handleSidebarSection(section);
                
                // Close sidebar on mobile
                const sidebar = document.querySelector('.sidebar');
                if (window.innerWidth <= 768 && sidebar) {
                    sidebar.classList.add('collapsed');
                    document.querySelector('.main-container').classList.add('sidebar-collapsed');
                }
            });
        });
    }

    handleSidebarSection(section) {
        // Update current filter based on sidebar selection
        switch(section) {
            case 'all':
                this.currentFilter = 'all';
                break;
            case 'today':
                this.currentFilter = 'today';
                break;
            case 'upcoming':
                this.currentFilter = 'upcoming';
                break;
            case 'work':
            case 'personal':
            case 'health':
                this.currentFilter = 'category';
                this.currentCategory = section;
                break;
            case 'high':
            case 'medium':
            case 'low':
                this.currentFilter = 'priority';
                this.currentPriority = section;
                break;
        }
        
        // Update filter buttons to match
        this.updateFilterButtons(section);
        
        // Re-render tasks
        this.renderTasks();
        
        // Show visual feedback
        this.showFilterFeedback(section);
    }

    showFilterFeedback(section) {
        // Create a temporary notification to show the active filter
        const filterNames = {
            'all': 'All Tasks',
            'today': 'Today\'s Tasks',
            'upcoming': 'Upcoming Tasks',
            'work': 'Work Tasks',
            'personal': 'Personal Tasks',
            'health': 'Health Tasks',
            'high': 'High Priority Tasks',
            'medium': 'Medium Priority Tasks',
            'low': 'Low Priority Tasks'
        };
        
        const filterName = filterNames[section] || 'Filtered Tasks';
        
        // Create a subtle notification
        const notification = document.createElement('div');
        notification.className = 'filter-notification';
        notification.innerHTML = `
            <i class="fas fa-filter"></i>
            <span>Showing: ${filterName}</span>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .filter-notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                padding: 12px 18px;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 2000;
                animation: slideInRight 0.3s ease;
                font-size: 0.9rem;
                color: #666;
            }
            .filter-notification i {
                color: #d63384;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 2 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                notification.style.animationFillMode = 'forwards';
                
                // Add slideOutRight animation
                const slideOutStyle = document.createElement('style');
                slideOutStyle.textContent = `
                    @keyframes slideOutRight {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                `;
                document.head.appendChild(slideOutStyle);
                
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 2000);
    }

    updateFilterButtons(section) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => btn.classList.remove('active'));
        
        // Find matching filter button
        const matchingBtn = Array.from(filterBtns).find(btn => {
            const filter = btn.getAttribute('data-filter');
            return filter === 'all' && (section === 'all' || section === 'today' || section === 'upcoming');
        });
        
        if (matchingBtn) {
            matchingBtn.classList.add('active');
        }
    }



    showProfileMenu() {
        // Simple profile menu
        const menu = document.createElement('div');
        menu.className = 'profile-menu';
        menu.innerHTML = `
            <div class="profile-menu-content">
                <div class="profile-header">
                    <i class="fas fa-user-circle"></i>
                    <span>User Profile</span>
                </div>
                <div class="profile-options">
                    <a href="#" class="profile-option">
                        <i class="fas fa-user"></i>
                        <span>My Profile</span>
                    </a>
                    <a href="#" class="profile-option">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </a>
                    <a href="#" class="profile-option">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </a>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .profile-menu {
                position: absolute;
                top: 70px;
                right: 20px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 10px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                z-index: 2000;
                animation: fadeInUp 0.3s ease;
            }
            .profile-menu-content {
                padding: 15px;
                min-width: 200px;
            }
            .profile-header {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 0;
                border-bottom: 1px solid #e0e0e0;
                margin-bottom: 10px;
            }
            .profile-header i {
                font-size: 1.5rem;
                color: #d63384;
            }
            .profile-options {
                display: flex;
                flex-direction: column;
            }
            .profile-option {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                text-decoration: none;
                color: #666;
                border-radius: 5px;
                transition: all 0.3s ease;
            }
            .profile-option:hover {
                background: rgba(214, 51, 132, 0.1);
                color: #d63384;
            }
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        // Position relative to profile button
        const profileBtn = document.querySelector('.profile-btn');
        profileBtn.style.position = 'relative';
        profileBtn.appendChild(menu);
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !profileBtn.contains(e.target)) {
                if (menu.parentNode) {
                    menu.parentNode.removeChild(menu);
                }
            }
        });
    }

    handleAddTask(e) {
        e.preventDefault();
        
        const taskText = this.taskInput.value.trim();
        const priority = this.prioritySelect.value;
        const category = this.categorySelect.value;
        const dueDate = this.dueDateInput.value;
        
        if (!taskText) return;
        
        if (this.editingTaskId) {
            // Update existing task
            this.updateTask(this.editingTaskId, taskText, priority, category, dueDate);
            this.editingTaskId = null;
            this.taskForm.querySelector('.add-btn').innerHTML = '<i class="fas fa-plus"></i> Add Task';
        } else {
            // Add new task
            const task = {
                id: Date.now(),
                text: taskText,
                priority: priority,
                category: category,
                dueDate: dueDate,
                completed: false,
                createdAt: new Date().toISOString(),
                completedAt: null
            };
            
            this.tasks.unshift(task);
        }
        
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.taskInput.value = '';
        this.prioritySelect.value = 'medium';
        this.categorySelect.value = 'personal';
        this.dueDateInput.value = '';
        this.taskInput.focus();
    }

    updateTask(taskId, text, priority, category, dueDate) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].text = text;
            this.tasks[taskIndex].priority = priority;
            this.tasks[taskIndex].category = category;
            this.tasks[taskIndex].dueDate = dueDate;
        }
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            this.taskInput.value = task.text;
            this.prioritySelect.value = task.priority;
            this.categorySelect.value = task.category || 'personal';
            this.taskForm.querySelector('.add-btn').innerHTML = '<i class="fas fa-save"></i> Update Task';
            this.taskInput.focus();
            this.taskInput.select();
        }
    }

    handleFilter(e) {
        const filter = e.target.dataset.filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.currentFilter = filter;
        this.renderTasks();
    }

    handleSort(e) {
        this.currentSort = e.target.value;
        this.renderTasks();
    }

    completeAllTasks() {
        const hasActiveTasks = this.tasks.some(task => !task.completed);
        if (hasActiveTasks) {
            this.tasks.forEach(task => {
                if (!task.completed) {
                    task.completed = true;
                    task.completedAt = new Date().toISOString();
                }
            });
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    deleteCompletedTasks() {
        const completedTasks = this.tasks.filter(task => task.completed);
        if (completedTasks.length > 0) {
            if (confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)?`)) {
                this.tasks = this.tasks.filter(task => !task.completed);
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
            }
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to add task
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.taskForm.dispatchEvent(new Event('submit'));
        }
        
        // Escape to cancel editing
        if (e.key === 'Escape' && this.editingTaskId) {
            this.cancelEdit();
        }
    }

    cancelEdit() {
        this.editingTaskId = null;
        this.taskInput.value = '';
        this.prioritySelect.value = 'medium';
        this.taskForm.querySelector('.add-btn').innerHTML = '<i class="fas fa-plus"></i> Add Task';
    }

    getFilteredTasks() {
        let filteredTasks = [...this.tasks];
        
        // Apply filter
        switch (this.currentFilter) {
            case 'active':
                filteredTasks = filteredTasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = filteredTasks.filter(task => task.completed);
                break;
            case 'priority':
                filteredTasks = filteredTasks.filter(task => task.priority === this.currentPriority);
                break;
            case 'category':
                filteredTasks = filteredTasks.filter(task => task.category === this.currentCategory);
                break;
            case 'today':
                const todayDate = new Date().toDateString();
                filteredTasks = filteredTasks.filter(task => {
                    const taskDate = new Date(task.createdAt).toDateString();
                    return taskDate === todayDate;
                });
                break;
            case 'upcoming':
                const upcomingDate = new Date();
                filteredTasks = filteredTasks.filter(task => {
                    const taskDate = new Date(task.createdAt);
                    return taskDate > upcomingDate;
                });
                break;
        }
        
        // Apply sort
        switch (this.currentSort) {
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'name':
                filteredTasks.sort((a, b) => a.text.localeCompare(b.text));
                break;
            case 'date':
            default:
                filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }
        
        return filteredTasks;
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.style.display = 'none';
            this.emptyState.style.display = 'block';
        } else {
            this.taskList.style.display = 'block';
            this.emptyState.style.display = 'none';
            
            this.taskList.innerHTML = filteredTasks.map(task => this.createTaskElement(task)).join('');
        }
        
        // Show/hide bulk actions
        const hasActiveTasks = this.tasks.some(task => !task.completed);
        const hasCompletedTasks = this.tasks.some(task => task.completed);
        
        if (hasActiveTasks || hasCompletedTasks) {
            this.bulkActions.style.display = 'flex';
        } else {
            this.bulkActions.style.display = 'none';
        }
    }

    createTaskElement(task) {
        const priorityColors = {
            high: '#d32f2f',
            medium: '#f57c00',
            low: '#388e3c'
        };
        
        const priorityLabels = {
            high: 'High',
            medium: 'Medium',
            low: 'Low'
        };
        
        const date = new Date(task.createdAt);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const categoryLabels = {
            'work': 'Work',
            'personal': 'Personal',
            'health': 'Health'
        };
        
        const categoryIcons = {
            'work': 'fas fa-briefcase',
            'personal': 'fas fa-user',
            'health': 'fas fa-heartbeat'
        };
        
        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="taskManager.toggleTask(${task.id})"
                >
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="task-date">
                            <i class="fas fa-calendar"></i>
                            ${formattedDate}
                        </span>
                        ${task.dueDate ? `
                            <span class="task-date">
                                <i class="fas fa-clock"></i>
                                Due: ${new Date(task.dueDate).toLocaleDateString()}
                            </span>
                        ` : ''}
                        <span class="priority-badge priority-${task.priority}">
                            ${priorityLabels[task.priority]}
                        </span>
                        ${categoryLabels[task.category] ? `
                            <span class="category-badge category-${task.category}">
                                <i class="${categoryIcons[task.category]}"></i>
                                ${categoryLabels[task.category]}
                            </span>
                        ` : ''}
                        ${task.completed ? `
                            <span class="task-date">
                                <i class="fas fa-check-circle"></i>
                                Completed ${new Date(task.completedAt).toLocaleDateString()}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn delete-btn" onclick="taskManager.deleteTask(${task.id})" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const active = total - completed;
        
        // Calculate upcoming tasks (tasks with due dates in the future)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = this.tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate > today;
        }).length;
        
        this.totalTasksEl.textContent = total;
        this.activeTasksEl.textContent = active;
        this.completedTasksEl.textContent = completed;
        
        // Update sidebar stats
        const sidebarTotalTasks = document.getElementById('sidebarTotalTasks');
        const sidebarCompletedTasks = document.getElementById('sidebarCompletedTasks');
        const upcomingCount = document.querySelector('.upcoming-count');
        
        if (sidebarTotalTasks) sidebarTotalTasks.textContent = total;
        if (sidebarCompletedTasks) sidebarCompletedTasks.textContent = completed;
        if (upcomingCount) upcomingCount.textContent = upcoming;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

// Initialize the task manager when the page loads
let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
    
    // Add some sample tasks if no tasks exist
    if (taskManager.tasks.length === 0) {
        const sampleTasks = [
            {
                id: Date.now() - 3,
                text: 'Welcome to your Task Manager!',
                priority: 'high',
                category: 'personal',
                completed: false,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                completedAt: null
            },
            {
                id: Date.now() - 2,
                text: 'Click the checkbox to mark tasks as complete',
                priority: 'medium',
                category: 'work',
                completed: true,
                createdAt: new Date(Date.now() - 43200000).toISOString(),
                completedAt: new Date().toISOString()
            },
            {
                id: Date.now() - 1,
                text: 'Use the filters to organize your tasks',
                priority: 'low',
                category: 'health',
                completed: false,
                createdAt: new Date(Date.now() - 21600000).toISOString(),
                completedAt: null
            }
        ];
        
        taskManager.tasks = sampleTasks;
        taskManager.saveTasks();
        taskManager.renderTasks();
        taskManager.updateStats();
    }
});

// Add some helpful tips
console.log('%c🎯 Task Manager Tips:', 'color: #d63384; font-size: 16px; font-weight: bold;');
console.log('• Use Ctrl/Cmd + Enter to quickly add tasks');
console.log('• Press Escape to cancel editing');
console.log('• Tasks are automatically saved to your browser');
console.log('• Use the priority levels to organize your tasks');
console.log('• Filter and sort to find what you need quickly');
