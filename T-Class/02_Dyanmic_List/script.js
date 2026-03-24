const input = document.getElementById("inputText");
const addBtn = document.getElementById("add");
const list = document.getElementById("list");

addBtn.addEventListener("click", () => {
    if (input.value === "") {
        alert("INVALID INPUT!")
        return;
    }

    const li = document.createElement("li");
    const pInsideLi = document.createElement("p");
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.classList.add("delete");

    pInsideLi.textContent = input.value;
    li.appendChild(pInsideLi);

    delBtn.addEventListener("click", () => {
        li.remove();
    })
    li.addEventListener("dblclick", ()=>{
        li.style.border = "1px dashed white";
        pInsideLi.contentEditable = true;
        pInsideLi.focus();
        pInsideLi.addEventListener("blur", ()=>{
            pInsideLi.contentEditable = false;
            li.style.border = "none";
        }, { once: true });
    })

    li.appendChild(delBtn)
    list.appendChild(li);

    input.value = ""

})