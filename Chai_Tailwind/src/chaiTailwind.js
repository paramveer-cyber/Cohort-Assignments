import { processClass } from './processing.js';

export function initChaiTailwind() {
    const elements = document.querySelectorAll("[class*='chai-']");

    elements.forEach(element => {
        const existing = element.getAttribute("style") || "";
        const stylesArr = [];
        [...element.classList].forEach(elementClass => {
            processClass(element, elementClass, stylesArr);
        });
        if (element.classList.length === 0){
            element.removeAttribute("class");
        }
        if (stylesArr.length > 0) {
            element.setAttribute("style", existing + stylesArr.join(""));
        }
    });
}