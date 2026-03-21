import { standAlone, propMap, unitLess } from './supportedClasses.js';

const scale = (val) => `${val * 0.5}rem`;

const transformProps = ["translatex", "translatey", "scale", "rotate"];

export function processClass(element, elementClass, stylesArr) {
    if (!element || !elementClass) return;
    if (!elementClass.startsWith("chai-")) return;

    const parts = elementClass.split("-");

    if (parts.length === 2) {
        const style = standAlone[parts[1]];
        if (style) stylesArr.push(style);

        element.classList.remove(elementClass);
        return;
    }

    const prop = parts[1];
    if (!propMap[prop]) return;

    const rawValue = parts.slice(2).join("-");
    let value;

    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
        value = rawValue.slice(1, -1).replaceAll("_", " ");
    } else {
        value = rawValue;
    }

    const isNumber = !isNaN(parseFloat(value)) && isFinite(value);

    // ✅ ONLY ADDITION
    if (transformProps.includes(prop)) {
        stylesArr.push(`${propMap[prop]}${value});`);
    }
    else if (isNumber && !unitLess.includes(prop)) {
        stylesArr.push(`${propMap[prop]}${scale(Number(value))};`);
    } else {
        stylesArr.push(`${propMap[prop]}${value};`);
    }

    element.classList.remove(elementClass);
}