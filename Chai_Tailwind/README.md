# ☕ ChaiCSS

A lightweight utility-first CSS engine which converts `chai-*` class names into inline styles using JavaScript.

No CSS files. No build step. Just write classes!

---

## 🚀 Features

- Utility-first class system (like Tailwind)
- Dynamic parsing in the browser
- Supports spacing, colors, typography, layout
- Custom values support using `[]`
- Zero dependencies

---

## 📦 Installation

npm install chaicss

---

## ⚙️ Usage

### 1. Import the package

<script type="module">
  import "chaicss";
</script>

---

### 2. Use `chai-*` classes

<div class="chai-p-4 chai-bg-blue chai-text-white chai-center chai-bold">
  Hello ChaiTailwind ☕
</div>

---

## 🧠 How it works

1. Scans the DOM for classes containing `chai-`
2. Parses each class name
3. Maps it to corresponding CSS
4. Applies styles inline
5. Removes the original class

---

## ✨ Examples

### Spacing

<div class="chai-mt-4 chai-p-2"></div>

→

margin-top: 2rem;
padding: 1rem;

---

### Colors

<div class="chai-bg-red chai-text-white"></div>

---

### Layout

<div class="chai-flex chai-justifycenter chai-itemscenter"></div>

---

### Custom values

<div class="chai-w-[calc(100%-2rem)]"></div>

---

## 🧩 Supported Utilities

- Spacing: m, p, mt, mb, px, py
- Colors: bg, text
- Typography: fs, fontw, alignment classes
- Layout: flex, grid, position
- Borders: b, br, bc
- And many more...

(See supportedClasses.js for full list)

---

## 📁 Project Structure

chai-tailwind/
├── src/
│   ├── chaiTailwind.js
│   ├── processing.js
│   ├── supportedClasses.js

---

## 🧪 Example

<div class="chai-p-4 chai-bg-[#1f1f1f] chai-text-white chai-round chai-shadow">
  Card UI
</div>

---

## 🛠 Future Improvements [To be added...]

- Responsive utilities (chai-md-*)
- Support of keyframes, animations

---

## 📄 License

MIT © Paramveer Oberoi

---

## 🙌 Acknowledgements

Inspired by Tailwind CSS and utility-first styling principles for the Chai aur Code Cohort! Hope you all like it :).

---

## 🔗 Links

- GitHub: https://github.com/your-username/chai-tailwind