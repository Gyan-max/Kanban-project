const todo = document.querySelector('#todo');
const inProgress = document.querySelector('#inprogress');
const done = document.querySelector('#done');


let draggedTask = null;

const tasks = document.querySelectorAll('.task');

tasks.forEach(task => {
    // Ensure tasks are draggable
    if (!task.hasAttribute('draggable')) {
        task.setAttribute('draggable', 'true');
    }

    task.addEventListener('dragstart', (e) => {
        draggedTask = task;
        e.dataTransfer.effectAllowed = 'move';
        task.classList.add('dragging');
    });

    task.addEventListener('dragend', () => {
        draggedTask = null;
        task.classList.remove('dragging');
    });
});


function addDragEventsOnColumn(column) {
    if (!column) return;

    column.addEventListener('dragenter', (e) => {
        e.preventDefault();
        column.classList.add('hover-over');
    });

    column.addEventListener('dragleave', () => {
        column.classList.remove('hover-over');
    });

    column.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    column.addEventListener('drop', (e) => {
        e.preventDefault();
        column.classList.remove('hover-over');

        const container = column.querySelector('.tasks') || column;
        if (draggedTask) {
            container.appendChild(draggedTask);
        }
    });
}

addDragEventsOnColumn(todo);
addDragEventsOnColumn(inProgress);
addDragEventsOnColumn(done);
