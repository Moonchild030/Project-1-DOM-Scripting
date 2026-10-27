document.addEventListener("DOMContentLoaded", () => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const displayWeekDay = document.getElementById("day");
    const displayDate = document.getElementById("dayNumber");
    const displayMonth = document.getElementById("month");
    const displayYear = document.getElementById("year");

    // Get current date information for the date-time widget
    const day = new Date();
    let nameOfDay = weekdays[day.getDay()];
    let numberOfDay = day.getDate();
    let month = months[day.getMonth()];
    let year = day.getFullYear();

    //Get day suffix
    const getDaySuffix = (d) => {
        if (d > 3 && d < 21) return "th";
        switch (d % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    // Populate date elements in the UI
    if (displayWeekDay) displayWeekDay.textContent = nameOfDay;
    if (displayDate) displayDate.textContent = numberOfDay + getDaySuffix(numberOfDay);
    if (displayMonth) displayMonth.textContent = month;
    if (displayYear) displayYear.textContent = year;

    // Load tasks from localStorage or initialize empty array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const addButton = document.getElementById("addButton");
    const taskInput = document.getElementById("taskInput");
    const errorMessage = document.getElementById("errorMessage");

    // Clear error styling and messages when user starts typing
    if (taskInput) {
        taskInput.addEventListener('input', () => {
            taskInput.classList.remove('input-error');
            if (errorMessage) errorMessage.textContent = '';
        });
    }

    // Allow adding tasks by pressing the Enter key
     taskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addButton.click();
    }
});

    // Saves the current tasks array to browser localStorage as a JSON string.
    function saveData() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

   

    //Updates the progress bar width and the completed-to-total task count display.
    function updateProgress() {
        const progressCountTotal= document.querySelector('.totalTask');
        const progressCountDone = document.querySelector('.totalTaskdone');
        
        const progressFill = document.querySelector('.progress-fill');
        let totalTaskCount = tasks.length;
        let totalTaskDoneCount = tasks.filter(t => t.Status === 'done').length;

        let percentage = 0;
        if (totalTaskCount > 0) {
            percentage = (totalTaskDoneCount / totalTaskCount) * 100;
        }

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressCountTotal) {
            progressCountTotal.textContent = totalTaskCount;
        }
        if (progressCountDone) {
            progressCountDone.textContent = totalTaskDoneCount;
        }
    }

    //Dynamically renders the task list into the DOM and attaches event listeners to action buttons.
    function renderTaskList() {
        const taskListContainer = document.getElementById("taskList");
        if (!taskListContainer) return;

        taskListContainer.innerHTML = '';

        let todoListHTML = '';
        tasks.forEach((task) => {
            todoListHTML += `
                <div class="task-container">
                    <div class="checkmark js-checkmark-button ${task.Status === "not done" ? "hide-checkmark" : "show-checkmark"}" data-task-id="${task.id}">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>

                    <div class="task-name js-task-name-${task.id}">
                        <p class="task-name-text ${task.Status === 'done' ? 'completed-text' : ''}">${task.text}</p>
                        <div class="task-icons js-task-icons-${task.id}">
                            <i class="fa-solid fa-trash delete-button js-delete-button" data-task-id="${task.id}"></i>
                        </div>
                    </div>
                </div>
            `;
        });

        taskListContainer.innerHTML = todoListHTML;

        // Attach click listeners to checkmark buttons for toggling completion status
        document.querySelectorAll('.js-checkmark-button').forEach((button) => {
            button.addEventListener('click', () => {
                const id = Number(button.dataset.taskId);
                const task = tasks.find((taskItem) => taskItem.id === id);

                if (!task) return;

                task.Status = task.Status === "not done" ? "done" : "not done";

                saveData();
                renderTaskList();
                updateProgress();
            });
        });

        // Attach click listeners to delete buttons
        document.querySelectorAll('.js-delete-button').forEach((button) => {
            button.addEventListener('click', () => {
                const id = Number(button.dataset.taskId);
                deleteTask(id);
            });
        });

        updateProgress();
    }

    //Filters out a task by its unique ID, saves data, and re-renders the UI.
    function deleteTask(id) {
        tasks = tasks.filter((task) => task.id !== id);
        saveData();
        renderTaskList();
    }

    // Event listener for the Add button with input validation checks   
    if (addButton) {
        addButton.addEventListener("click", (event) => {
            event.preventDefault();
            const taskText = taskInput.value.trim();

            if (taskText === '') {
                taskInput.classList.add('input-error');
                if (errorMessage) errorMessage.textContent = 'Task cannot be empty!';
                return;
            }

            if (taskText.length < 3) {
                taskInput.classList.add('input-error');
                if (errorMessage) errorMessage.textContent = 'Task must be at least 3 characters long!';
                return;
            }

            taskInput.classList.remove('input-error');
            if (errorMessage) errorMessage.textContent = '';

            tasks.push({
                id: Date.now(),
                text: taskText,
                Status: 'not done'
            });

            taskInput.value = '';
            saveData();
            renderTaskList();
        });
    }

    // Initial render when the page loads    
    renderTaskList();
});



