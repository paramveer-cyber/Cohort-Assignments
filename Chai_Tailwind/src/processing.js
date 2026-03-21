import { standAlone, propMap, unitLess } from './supportedClasses.js';
const scale = (val) => { return `${val * 0.5}rem` }

export function processClass(elementClass, classesApplied, stylesToApply) {
    if (!elementClass.startsWith("chai-")) {
        return { classesApplied, stylesToApply };
    }

    let parts = elementClass.split("-");

    if (parts.length === 2) {
        stylesToApply += standAlone[parts[1]] ?? "";
        classesApplied = classesApplied
            .split(" ")
            .filter(c => c !== elementClass)
            .join(" ");
        return { classesApplied, stylesToApply };
    }

    const prop = parts[1];
    if (!propMap[prop]) {
        return { classesApplied, stylesToApply };
    }

    const rawValue = parts.slice(2).join("-");
    let value;

    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
        value = rawValue.slice(1, -1);
        value = value.replaceAll("_", " ");
    } else {
        value = rawValue;
    }

    const isNumber = !isNaN(parseFloat(value)) && isFinite(value);

    if (isNumber && !unitLess.includes(prop)) {
        stylesToApply += propMap[prop] + scale(Number(value)) + ";";
    } else {
        stylesToApply += propMap[prop] + value + ";";
    }

    classesApplied = classesApplied
        .split(" ")
        .filter(c => c !== elementClass)
        .join(" ");
    return { classesApplied, stylesToApply };
}