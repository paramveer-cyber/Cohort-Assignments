let lightMode = true;

document.addEventListener("click", ()=>{
    document.body.classList.toggle("dark");
    document.getElementById("switch").textContent = lightMode ? `Toggle to Light Mode`:`Toggle to Dark Mode`;
    lightMode = !lightMode;
})