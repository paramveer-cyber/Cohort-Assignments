const formatField = document.getElementById("format");
const toneField = document.getElementById("tone");
const palette = document.getElementById("palette");

function generateRGB(tone) {
    const range = { min: 0, max: 255 };
    if (tone === "light") {
        range['min'] = 150;
    }
    if (tone === "dark") {
        range['max'] = 150;
    }
    const randomRGB = () =>
        Math.floor(range.min + Math.random() * (range.max - range.min + 1));
    return {
        r: randomRGB(),
        g: randomRGB(),
        b: randomRGB()
    };
}

function parseRGB(rgb, format) {
    if (format == "hex") {
        return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
    }
    return `rgb(${rgb['r']}, ${rgb['g']}, ${rgb['b']})`;
}

function generatePalette() {
    const fieldValues = [formatField.value, toneField.value];
    palette.innerHTML = "";
    for (let i = 0; i < 5; i++) {
        const paletteChild = document.createElement("div");
        paletteChild.setAttribute("class", "color");
        const color = parseRGB(generateRGB(fieldValues[1]), fieldValues[0]);
        paletteChild.style.backgroundColor = color;
        paletteChild.textContent = color;
        paletteChild.style.cursor = "pointer";
        paletteChild.addEventListener("click", () => {
            navigator.clipboard.writeText(color)
                .then(() => {
                    paletteChild.innerHTML = `${color}<br><br>Copied!`;
                    setTimeout(() => { paletteChild.textContent = color; }, 1500)
                })
                .catch(err => {
                    console.error("Failed to copy:", err);
                });
        })
        palette.appendChild(paletteChild);
    }
}


document.getElementById("generateBtn").addEventListener("click", generatePalette);