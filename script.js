document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DOM Element Selection ---
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const prioritySelect = document.getElementById('priority-select');
    
    // ▼▼▼ NEW ELEMENT ▼▼▼
    const categoryInput = document.getElementById('category-input');

    // --- 2. Load Tasks from localStorage ---
    const getTasks = () => {
        const tasks = localStorage.getItem('tasks');
        let loadedTasks = tasks ? JSON.parse(tasks) : [];
        
        // Ensure all tasks have all properties (for old data)
        return loadedTasks.map(task => ({
            id: task.id,
            text: task.text,
            done: task.done || false,
            priority: task.priority || 'medium',
            category: task.category || 'General' // ▼▼▼ NEW: Add default category
        }));
    };

    let tasks = getTasks();

    // --- 3. Save Tasks to localStorage ---
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // --- 4. Render Tasks to the DOM ---
    const renderTasks = () => {
        taskList.innerHTML = '';

        const priorityValues = { 'high': 3, 'medium': 2, 'low': 1 };

        // Sort tasks: 1st by done (false before true), 2nd by priority
        const sortedTasks = tasks.sort((a, b) => {
            if (a.done !== b.done) {
                return a.done - b.done;
            }
            return priorityValues[b.priority] - priorityValues[a.priority];
        });

        sortedTasks.forEach(task => {
            // Create list item and set base attributes
            const li = document.createElement('li');
            li.setAttribute('data-id', task.id);
            if (task.done) {
                li.classList.add('done');
            }
            li.classList.add('priority-' + task.priority);

            // ▼▼▼ NEW: Create wrapper for text and category ▼▼▼
            const taskDetails = document.createElement('div');
            taskDetails.className = 'task-details';

            // Create task text
            const taskText = document.createElement('span');
            taskText.className = 'task-text';
            taskText.textContent = task.text;

            // ▼▼▼ NEW: Create category tag ▼▼▼
            const categoryTag = document.createElement('span');
            categoryTag.className = 'category-tag';
            categoryTag.textContent = task.category;

            // Append text and tag to the details wrapper
            taskDetails.appendChild(taskText);
            taskDetails.appendChild(categoryTag);

            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '&times;'; 

            // Append details wrapper and delete button to the list item
            li.appendChild(taskDetails);
            li.appendChild(deleteBtn);

            // Append the list item to the main list
            taskList.appendChild(li);
        });
    };

    // --- 5. Add a New Task ---
    // ▼▼▼ NEW: Added 'category' parameter ▼▼▼
    const addTask = (text, priority, category) => { 
        const newTask = {
            id: Date.now(), 
            text: text,
            done: false,
            priority: priority,
            category: category || 'General' // Default if empty
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
    };

    // --- 6. Toggle Task (Done/Undone) ---
    const toggleTask = (id) => {
        const task = tasks.find(task => task.id === id);
        
        if (task) {
            task.done = !task.done;
            saveTasks();
            renderTasks(); // Re-render to sort (move to bottom)
        }
    };

    // --- 7. Delete a Task ---
    const deleteTask = (id) => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    };

    // --- 8. Event Listeners ---

    // Form submit listener
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const taskText = taskInput.value.trim();
        const taskPriority = prioritySelect.value;
        const taskCategory = categoryInput.value.trim(); // ▼▼▼ NEW ▼▼▼
        
        if (taskText !== '') {
            addTask(taskText, taskPriority, taskCategory); // ▼▼▼ NEW ▼▼▼
            taskInput.value = ''; 
            categoryInput.value = ''; // ▼▼▼ NEW: Clear category input ▼▼▼
            taskInput.focus();
        }
    });

    // Task list click listener
    taskList.addEventListener('click', (e) => {
        const clickedEl = e.target;
        
        // Find the parent 'li' and its ID
        const parentLi = clickedEl.closest('li');
        if (!parentLi) return;
        const taskId = Number(parentLi.dataset.id);

        // Check if the delete button was clicked
        if (clickedEl.classList.contains('delete-btn')) {
            deleteTask(taskId);
        }
        // Check if the task text was clicked
        // Note: We check closest() in case they click the category tag
        else if (clickedEl.closest('.task-details')) {
            toggleTask(taskId);
        }
    });

    // --- 9. Initial Render ---
    renderTasks();
});