const todo = document.querySelector('#todo');
const inProgress = document.querySelector('#inprogress');
const done = document.querySelector('#done');
const board = document.querySelector('.board');

const STORAGE_KEY = 'kanbanState';

function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        return null;
    } catch { return null; }
}

// const state = [
//     {id:'t1', title: 'Task 1', description: 'Description of Task 1', status: 'todo'},
// ];


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

        if (!draggedTask) return;

        const taskId = draggedTask.dataset.id;
        const targetStatus =
            column.id === 'todo' ? 'todo' :
            column.id === 'inprogress' ? 'inprogress' :
            'done';

        const t = state.find(x => x.id === taskId);
        if (t) t.status = targetStatus;

        render(state);
        saveState();
    });
}

addDragEventsOnColumn(todo);
addDragEventsOnColumn(inProgress);
addDragEventsOnColumn(done);


function uid() {
    return 't_' + Math.random().toString(36).slice(2, 9);
}


function createTaskElement(task) {
    const el = document.createElement('div')
    el.className = 'task';
    el.setAttribute('draggable', 'true');
    el.dataset.id = task.id;

    const h2 = document.createElement('h2');
    h2.textContent = task.title;

    const p = document.createElement('p');
    p.textContent = task.description;

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';

    el.append(h2, p, editBtn, deleteBtn);

    el.addEventListener('dragstart', (e) => {
        draggedTask = el;
        e.dataTransfer.effectAllowed = 'move';

        try { e.dataTransfer.setData('text/plain', task.id); } catch {}
            el.classList.add('dragging');
    });

    el.addEventListener('dragend', () => {
        draggedTask = null;
        el.classList.remove('dragging');
    });
    return el;
}

const columnsByStatus = {
    todo:document.querySelector('#todo'),
    inprogress: document.querySelector('#inprogress'),
    done: document.querySelector('#done')
};

function render(state) {
    Object.values(columnsByStatus).forEach((col) => {
        const body = col?.querySelector('.tasks') || col;
        if (body) body.innerHTML = '';
    });

    state.forEach((task) => {
        const col = columnsByStatus[task.status];
        const body = col?.querySelector('.tasks') || col;
        if (!body) return;

        const el = createTaskElement(task);
        body.appendChild(el);
    });

    
    updateCounts(state);
}


let state = loadState() || [
    {id:uid(), title: 'Task 1', description: 'Description of Task 1', status: 'todo'},
    {id:uid(), title: 'Task 2', description: 'Description of Task 2', status: 'inprogress'},
    {id:uid(), title: 'Task 3', description: 'Description of Task 3', status: 'done'},
];

render(state);
saveState();


const addBtn = document.querySelector('nav .right button');

function createTask({ title, description, status = 'todo'}) {
    return {
        id: uid(),
        title: title.trim(),
        description: (description || '').trim(),
        status,
    };
}

function isValidTitle(s) {
    return typeof s === 'string' && s.trim().length > 0;
}

addBtn?.addEventListener('click', () => {
    const title = prompt("Enter task title: ");
    if (!isValidTitle(title)) {
        alert("Task title cannot be empty.");
        return;
    }

    const description = prompt("Enter task description (optional): ");

    const newTask = createTask({ title, description, status: 'todo' });
    state.push(newTask);
    render(state);
    saveState();
})

function updateCounts(state) {
    const countByStatus = { todo: 0, inprogress: 0, done: 0 };
    state.forEach(t => { countByStatus[t.status]++; });

    const columns = [
        { id: 'todo', count: countByStatus.todo },
        { id: 'inprogress', count: countByStatus.inprogress },
        { id: 'done', count: countByStatus.done },
    ];

    columns.forEach(({ id, count }) => {
        const col = document.querySelector(`#${id}`);
        const right = col?.querySelector('.heading .right');
        if (right) right.textContent = String(count);
    });
}

// Edit/Delete via event delegation
board?.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const taskEl = target.closest('.task');
    if (!taskEl) return;

    const taskId = taskEl.dataset.id;
    const task = state.find(t => t.id === taskId);
    if (!task) return;

    // Edit
    if (target.classList.contains('edit-btn') || target.textContent === 'Edit') {
        const newTitle = prompt('Edit task title:', task.title);
        if (newTitle === null) return; // cancelled
        if (!isValidTitle(newTitle)) { alert('Title cannot be empty.'); return; }
        const newDesc = prompt('Edit task description (optional):', task.description || '');
        task.title = newTitle.trim();
        task.description = (newDesc || '').trim();
        render(state);
        saveState();
        return;
    }

    // Delete
    if (target.classList.contains('delete-btn') || target.textContent === 'Delete') {
        const ok = confirm('Delete this task?');
        if (!ok) return;
        state = state.filter(t => t.id !== taskId);
        render(state);
        saveState();
        return;
    }
});