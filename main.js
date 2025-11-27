const todo = document.querySelector('#todo');
const inProgress = document.querySelector('#in-progress');
const done = document.querySelector('#done');


const tasks = document.querySelectorAll('.task');

tasks.forEach(task => {
    task.addEventListener("drag", (e) =>{
        // console.log("dragstart", e);
        
    })
})

inprogress.addEventListener("dragenter", (e) =>{
    inprogress.classList.add("hover-over");
})

inprogress.addEventListener("dragleave", (e) =>{
    inprogress.classList.remove("hover-over");
})

function addDragEventsOnColumn(column) {
    column.addEventListener("dragenter", (e)=>{
        column.classList.add("hover-over");
    })
    column.addEventListener("dragleave", (e)=>{
        column.classList.remove("hover-over");
    })
    column.addEventListener("dragover", (e)=>{
        e.preventDefault();
    })
    column.addEventListener("drop", (e)=>{
        console.log("dropped in ", column.id);
    })


}

addDragEventsOnColumn(todo);
addDragEventsOnColumn(inProgress);
addDragEventsOnColumn(done);
