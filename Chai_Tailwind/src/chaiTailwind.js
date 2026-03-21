import { processClass } from './processing.js'
function initChaiTailwind() {
    let mainBody = document.querySelectorAll("[class*='chai-']");

    mainBody.forEach(element => {
        let classesApplied = element.getAttribute("class");
        const existing = element.getAttribute("style") || "";

        if (classesApplied === null) {
            return;
        }
        let stylesToApply = ""

        element.classList.forEach((elementClass) => {
            let result = processClass(elementClass, classesApplied, stylesToApply);
            classesApplied = result.classesApplied;
            stylesToApply = result.stylesToApply;
        })
        if (classesApplied) {
            element.setAttribute("class", classesApplied);
        }
        else {
            element.removeAttribute("class");
        }
        element.setAttribute("style", existing + stylesToApply);
    });
}
if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", initChaiTailwind);
}