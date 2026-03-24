const columns = document.querySelectorAll(".column");
let draggedTask = null;

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-btn")) {
        const todo = prompt("Enter task you want to add:");
        if (!todo) return;
        const task = document.createElement("div");
        task.className = "task";
        task.textContent = todo;

        task.setAttribute("draggable", true);

        e.target.previousElementSibling.appendChild(task);
    }
})

document.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("task")) {
        e.target.classList.add("dragging");
        draggedTask = e.target;
    }
})

document.addEventListener("dragend", (e) => {
    if (e.target.classList.contains("task")) {
        e.target.classList.remove("dragging");
        draggedTask = null;
    }
})

columns.forEach((col) => {
    col.addEventListener("dragover", (e) => {
        e.preventDefault();
        col.classList.add("drag-over");
    })

    
    col.addEventListener("drop", (e) => {
        e.preventDefault();
        col.classList.remove("drag-over");
        
        if (draggedTask) {
            col.querySelector(".tasks").appendChild(draggedTask);
        }
    })

    col.addEventListener("dragleave", (e) => {
        e.preventDefault();
        col.classList.remove("drag-over");
    })
})