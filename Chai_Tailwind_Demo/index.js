// I have bundled all the javascript code into this file
// While uploading a npm package, I have done the same through modular code
// This is only submitted so as to give all javascript in one file as 
// advised by admins! :)

const standAlone = {
    red: "color: red;",
    black: "color: black;",
    white: "color: white;",
    gray: "color: gray;",
    blue: "color: blue;",
    green: "color: green;",
    yellow: "color: yellow;",
    purple: "color: purple;",
    pink: "color: pink;",
    orange: "color: orange;",

    center: "text-align: center;",
    left: "text-align: left;",
    right: "text-align: right;",
    justify: "text-align: justify;",
    bold: "font-weight: bold;",
    italic: "font-style: italic;",
    underline: "text-decoration: underline;",
    linethrough: "text-decoration: line-through;",
    upper: "text-transform: uppercase;",
    lower: "text-transform: lowercase;",
    capitalize: "text-transform: capitalize;",

    block: "display: block;",
    inline: "display: inline;",
    inlineblock: "display: inline-block;",
    hidden: "display: none;",
    visible: "display: block;",

    relative: "position: relative;",
    absolute: "position: absolute;",
    fixed: "position: fixed;",
    sticky: "position: sticky;",

    overflowhidden: "overflow: hidden;",
    overflowauto: "overflow: auto;",
    overflowscroll: "overflow: scroll;",
    overflowxhidden: "overflow-x: hidden;",
    overflowyhidden: "overflow-y: hidden;",
    overflowxauto: "overflow-x: auto;",
    overflowyauto: "overflow-y: auto;",

    notallowed: "cursor: not-allowed;",
    grab: "cursor: grab;",
    crosshair: "cursor: crosshair;",
    move: "cursor: move;",

    nowrap: "white-space: nowrap;",
    wrap: "white-space: normal;",
    pre: "white-space: pre;",
    ellipsis: "text-overflow: ellipsis; overflow: hidden; white-space: nowrap;",

    border: "border: 1px solid black;",
    border0: "border: none;",

    bgcover: "background-size: cover;",
    bgcontain: "background-size: contain;",
    bgcenter: "background-position: center;",
    bgtop: "background-position: top;",
    bgbottom: "background-position: bottom;",
    bgleft: "background-position: left;",
    bgright: "background-position: right;",
    norepeat: "background-repeat: no-repeat;",
    repeat: "background-repeat: repeat;",

    flex: "display: flex;",
    flexcol: "display: flex; flex-direction: column;",
    flexrow: "display: flex; flex-direction: row;",
    justifycenter: "justify-content: center;",
    justifybetween: "justify-content: space-between;",
    justifyaround: "justify-content: space-around;",
    itemscenter: "align-items: center;",
    itemsstart: "align-items: flex-start;",
    itemsend: "align-items: flex-end;",

    pointer: "cursor: pointer;",
    round: "border-radius: 50%;",
    shadow: "box-shadow: 0 4px 10px rgba(0,0,0,0.2);",
    shadowmd: "box-shadow: 0 6px 15px rgba(0,0,0,0.2);",
    shadowlg: "box-shadow: 0 10px 25px rgba(0,0,0,0.25);",
    shadowxl: "box-shadow: 0 15px 35px rgba(0,0,0,0.3);",

    transparent: "background: transparent;",
    selectnone: "user-select: none;",
    selectall: "user-select: all;",

    btn: `
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        border: none;
        cursor: pointer;
        background: #191919;
        color: white;
    `,

    card: `
        padding: 1rem;
        border-radius: 0.75rem;
        background: #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `,

    carddark: `
        padding: 1rem;
        border-radius: 0.75rem;
        background: #1f1f1f;
        color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `,

    badge: `
        padding: 0.25rem 0.5rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: bold;
        display: inline-block;
    `,

    input: `
        padding: 0.5rem 0.75rem;
        border-radius: 0.4rem;
        border: 1px solid #ccc;
        outline: none;
        width: 100%;
        box-sizing: border-box;
    `,

    inputdark: `
        padding: 0.5rem 0.75rem;
        border-radius: 0.4rem;
        border: 1px solid #444;
        background: #1f1f1f;
        color: white;
        outline: none;
        width: 100%;
        box-sizing: border-box;
    `,

    flexcenter: `
        display: flex;
        justify-content: center;
        align-items: center;
    `,

    flexbetween: `
        display: flex;
        justify-content: space-between;
        align-items: center;
    `,

    flexaround: `
        display: flex;
        justify-content: space-around;
        align-items: center;
    `,

    grid2: `
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    `,

    grid3: `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
    `,

    grid4: `
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
    `,

    container: `
        width: 100%;
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
        padding-left: 1rem;
        padding-right: 1rem;
    `,

    divider: `
        width: 100%;
        height: 1px;
        background: #e5e5e5;
    `,

    dividerdark: `
        width: 100%;
        height: 1px;
        background: #444;
    `,

    circle: `
        border-radius: 50%;
        overflow: hidden;
    `,
    flexwrap: "flex-wrap: wrap;",
    flexnowrap: "flex-wrap: nowrap;",
    flex1: "flex: 1;",
    flexauto: "flex: auto;",

    itemsstretch: "align-items: stretch;",
    justifyend: "justify-content: flex-end;",
    justifystart: "justify-content: flex-start;",

    invisible: "visibility: hidden;",

    pointernone: "pointer-events: none;",
    pointerauto: "pointer-events: auto;",
};
const propMap = {
    bg: "background: ",
    text: "color: ",
    w: "width: ",
    h: "height: ",
    minw: "min-width: ",
    minh: "min-height: ",
    maxw: "max-width: ",
    maxh: "max-height: ",

    m: "margin: ",
    mt: "margin-top: ",
    mb: "margin-bottom: ",
    ml: "margin-left: ",
    mr: "margin-right: ",
    mx: "margin-inline: ",
    my: "margin-block: ",

    p: "padding: ",
    pt: "padding-top: ",
    pb: "padding-bottom: ",
    pl: "padding-left: ",
    pr: "padding-right: ",
    px: "padding-inline: ",
    py: "padding-block: ",

    fs: "font-size: ",
    fontw: "font-weight: ",
    lh: "line-height: ",
    ls: "letter-spacing: ",

    br: "border-radius: ",
    b: "border: ",
    bw: "border-width: ",
    bc: "border-color: ",
    bs: "border-style: ",

    d: "display: ",
    pos: "position: ",

    top: "top: ",
    left: "left: ",
    right: "right: ",
    bottom: "bottom: ",

    z: "z-index: ",

    jc: "justify-content: ",
    ai: "align-items: ",
    gap: "gap: ",
    grow: "flex-grow: ",
    shrink: "flex-shrink: ",
    basis: "flex-basis: ",
    wrap: "flex-wrap: ",

    shadow: "box-shadow: ",
    opacity: "opacity: ",

    fit: "object-fit: ",
    aspect: "aspect-ratio: ",

    overflow: "overflow: ",
    overflowx: "overflow-x: ",
    overflowy: "overflow-y: ",

    cursor: "cursor: ",
    select: "user-select: ",

    outline: "outline: ",
    outlinew: "outline-width: ",
    outlinec: "outline-color: ",

    visibility: "visibility: ",

    bgsize: "background-size: ",
    bgpos: "background-position: ",

    color: "color: ",
    bgc: "background-color: ",
    borderc: "border-color: ",
    radius: "border-radius: ",
    display: "display: ",
    translatex: "transform: translateX(",
    translatey: "transform: translateY(",
    scale: "transform: scale(",
    rotate: "transform: rotate(",

    bgr: "background-repeat: ",
    bgimg: "background-image: ",

    bt: "border-top: ",
    bb: "border-bottom: ",
    bl: "border-left: ",
    brd: "border-right: ",

    fw: "font-weight: ",
    ta: "text-align: ",
    td: "text-decoration: ",

    box: "box-sizing: ",

    transition: "transition: ",
    duration: "transition-duration: ",
    ease: "transition-timing-function: ",

    inset: "inset: ",
};
const unitLess = [
    "z",
    "opacity",
    "lh",
    "fontw",
    "aspect",
    "grow",
    "shrink",
    "order",
    "flex",
    "scale",
    "fw"
];
const scale = (val) => `${val * 0.5}rem`;

const transformProps = ["translatex", "translatey", "scale", "rotate"];

function processClass(element, elementClass, stylesArr) {
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
function initChaiTailwind() {
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
if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", initChaiTailwind);
}