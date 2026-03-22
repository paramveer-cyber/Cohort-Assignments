# Chai CSS Engine

A lightweight utility-first CSS engine that converts `chai-*` class names into inline styles using JavaScript.

No CSS files. No build step. Just write classes and it works.

## Features

- Utility-first class system (inspired by Tailwind)
- Parses classes directly in the browser
- Supports spacing, colors, typography, layout
- Custom values using `[]`
- No dependencies

## Installation

```bash
npm install chai-css-engine
```

## Usage

### CDN (plain HTML)

```html
<script type="module">
  import "https://unpkg.com/chai-css-engine@1.0.10/index.js";
</script>
```

### Vite / React / any bundler

```js
import { initChaiTailwind } from "chai-css-engine";

initChaiTailwind(); // Call once after DOM is ready
```

## How it works

1. Scans the DOM for classes containing `chai-`
2. Parses each class name
3. Maps it to a CSS property + value
4. Applies styles inline
5. Removes the original class names

## Class Syntax

| Pattern                  | Description        | Example                                         |
| ------------------------ | ------------------ | ----------------------------------------------- |
| `chai-{keyword}`         | Standalone utility | `chai-flex`, `chai-bold`                        |
| `chai-{prop}-{value}`    | Dynamic property   | `chai-p-4`, `chai-fs-16`                        |
| `chai-{prop}-[{custom}]` | Arbitrary value    | `chai-bg-[#ff6600]`, `chai-w-[calc(100%-2rem)]` |

> Use underscores inside `[...]` to represent spaces: `chai-shadow-[0_4px_10px_black]`

---

## Examples

### Spacing

| Class           | Output CSS               |
| --------------- | ------------------------ |
| `chai-p-4`      | `padding: 2rem`          |
| `chai-mt-2`     | `margin-top: 1rem`       |
| `chai-px-3`     | `padding-inline: 1.5rem` |
| `chai-my-6`     | `margin-block: 3rem`     |
| `chai-p-[10px]` | `padding: 10px`          |

```html
<div class="chai-p-4 chai-mt-2">Padded box</div>
```

---

### Colors

| Class                        | Output CSS                          |
| ---------------------------- | ----------------------------------- |
| `chai-bg-red`                | `background: red`                   |
| `chai-bg-[#1a1a2e]`          | `background: #1a1a2e`               |
| `chai-text-white`            | `color: white`                      |
| `chai-color-[tomato]`        | `color: tomato`                     |
| `chai-bgc-[rgba(0,0,0,0.5)]` | `background-color: rgba(0,0,0,0.5)` |

```html
<div class="chai-bg-[#1f1f1f] chai-text-white">Dark card</div>
```

---

### Typography

| Class              | Output CSS                                   |
| ------------------ | -------------------------------------------- |
| `chai-bold`        | `font-weight: bold`                          |
| `chai-italic`      | `font-style: italic`                         |
| `chai-underline`   | `text-decoration: underline`                 |
| `chai-upper`       | `text-transform: uppercase`                  |
| `chai-center`      | `text-align: center`                         |
| `chai-fs-18`       | `font-size: 9rem` _(scaled)_                 |
| `chai-fs-[18px]`   | `font-size: 18px` _(exact)_                  |
| `chai-fontw-700`   | `font-weight: 700` _(unit-less, no scaling)_ |
| `chai-lh-1.6`      | `line-height: 1.6` _(unit-less)_             |
| `chai-ls-[0.05em]` | `letter-spacing: 0.05em`                     |

```html
<h1 class="chai-fs-[2rem] chai-bold chai-upper chai-center">Hello World</h1>
```

> **Note:** `fontw`, `lh`, `z`, `opacity`, `scale`, `fw` are unit-less — they are never scaled and receive no `rem` suffix.

---

### Layout — Flexbox

| Class                 | Output CSS                                                           |
| --------------------- | -------------------------------------------------------------------- |
| `chai-flex`           | `display: flex`                                                      |
| `chai-flexcol`        | `display: flex; flex-direction: column`                              |
| `chai-flexrow`        | `display: flex; flex-direction: row`                                 |
| `chai-flexcenter`     | `display: flex; justify-content: center; align-items: center`        |
| `chai-flexbetween`    | `display: flex; justify-content: space-between; align-items: center` |
| `chai-justifycenter`  | `justify-content: center`                                            |
| `chai-justifybetween` | `justify-content: space-between`                                     |
| `chai-itemscenter`    | `align-items: center`                                                |
| `chai-itemsstart`     | `align-items: flex-start`                                            |
| `chai-flexwrap`       | `flex-wrap: wrap`                                                    |
| `chai-flex1`          | `flex: 1`                                                            |
| `chai-gap-4`          | `gap: 2rem`                                                          |
| `chai-grow-1`         | `flex-grow: 1` _(unit-less)_                                         |
| `chai-shrink-0`       | `flex-shrink: 0` _(unit-less)_                                       |

```html
<div class="chai-flex chai-justifybetween chai-itemscenter chai-gap-4">
  <span>Left</span>
  <span>Right</span>
</div>
```

---

### Layout — Grid

| Class        | Output CSS                                                        |
| ------------ | ----------------------------------------------------------------- |
| `chai-grid2` | `display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem` |
| `chai-grid3` | `display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem` |
| `chai-grid4` | `display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem` |

```html
<div class="chai-grid3">
  <div>One</div>
  <div>Two</div>
  <div>Three</div>
</div>
```

---

### Sizing

| Class               | Output CSS                |
| ------------------- | ------------------------- |
| `chai-w-100`        | `width: 50rem` _(scaled)_ |
| `chai-w-[100%]`     | `width: 100%`             |
| `chai-h-[200px]`    | `height: 200px`           |
| `chai-maxw-[600px]` | `max-width: 600px`        |
| `chai-minh-[100vh]` | `min-height: 100vh`       |

```html
<img class="chai-w-[100%] chai-h-[200px] chai-fit-cover" src="..." />
```

---

### Borders & Radius

| Class                      | Output CSS                      |
| -------------------------- | ------------------------------- |
| `chai-border`              | `border: 1px solid black`       |
| `chai-border0`             | `border: none`                  |
| `chai-br-4`                | `border-radius: 2rem`           |
| `chai-br-[8px]`            | `border-radius: 8px`            |
| `chai-round`               | `border-radius: 50%`            |
| `chai-bc-red`              | `border-color: red`             |
| `chai-bw-2`                | `border-width: 1rem` _(scaled)_ |
| `chai-bs-dashed`           | `border-style: dashed`          |
| `chai-bt-[1px_solid_#ccc]` | `border-top: 1px solid #ccc`    |

```html
<div class="chai-border chai-br-[12px] chai-bc-[#e2e8f0]">Card</div>
```

---

### Positioning

| Class              | Output CSS                  |
| ------------------ | --------------------------- |
| `chai-relative`    | `position: relative`        |
| `chai-absolute`    | `position: absolute`        |
| `chai-fixed`       | `position: fixed`           |
| `chai-sticky`      | `position: sticky`          |
| `chai-top-0`       | `top: 0`                    |
| `chai-left-[20px]` | `left: 20px`                |
| `chai-z-10`        | `z-index: 10` _(unit-less)_ |
| `chai-inset-0`     | `inset: 0`                  |

```html
<div class="chai-relative">
  <span class="chai-absolute chai-top-0 chai-right-0">Badge</span>
</div>
```

---

### Transforms

> Transform classes append to `transform:` — value receives no scaling.

| Class                    | Output CSS                    |
| ------------------------ | ----------------------------- |
| `chai-translatex-10`     | `transform: translateX(10)`   |
| `chai-translatey-[-50%]` | `transform: translateY(-50%)` |
| `chai-scale-1.1`         | `transform: scale(1.1)`       |
| `chai-rotate-45`         | `transform: rotate(45)`       |

```html
<div class="chai-rotate-[45deg] chai-scale-[1.2]">Tilted</div>
```

---

### Visual Effects

| Class                                    | Output CSS                                 |
| ---------------------------------------- | ------------------------------------------ |
| `chai-shadow`                            | `box-shadow: 0 4px 10px rgba(0,0,0,0.2)`   |
| `chai-shadowmd`                          | `box-shadow: 0 6px 15px rgba(0,0,0,0.2)`   |
| `chai-shadowlg`                          | `box-shadow: 0 10px 25px rgba(0,0,0,0.25)` |
| `chai-shadowxl`                          | `box-shadow: 0 15px 35px rgba(0,0,0,0.3)`  |
| `chai-shadow-[0_0_20px_rgba(0,0,0,0.4)]` | Custom box-shadow                          |
| `chai-opacity-50`                        | `opacity: 50` _(unit-less)_                |
| `chai-opacity-[0.5]`                     | `opacity: 0.5`                             |

---

### Transitions

| Class                     | Output CSS                                |
| ------------------------- | ----------------------------------------- |
| `chai-transition-all`     | `transition: all`                         |
| `chai-duration-[300ms]`   | `transition-duration: 300ms`              |
| `chai-ease-[ease-in-out]` | `transition-timing-function: ease-in-out` |

```html
<button
  class="chai-btn chai-transition-[all] chai-duration-[200ms] chai-ease-[ease-in-out]"
>
  Hover me
</button>
```

---

### Background Utilities

| Class                           | Output CSS                           |
| ------------------------------- | ------------------------------------ |
| `chai-bgcover`                  | `background-size: cover`             |
| `chai-bgcontain`                | `background-size: contain`           |
| `chai-bgcenter`                 | `background-position: center`        |
| `chai-norepeat`                 | `background-repeat: no-repeat`       |
| `chai-bgimg-[url('/hero.jpg')]` | `background-image: url('/hero.jpg')` |
| `chai-transparent`              | `background: transparent`            |

```html
<div
  class="chai-bgimg-[url('/banner.jpg')] chai-bgcover chai-bgcenter chai-norepeat chai-h-[400px]"
></div>
```

---

### Overflow & Visibility

| Class                  | Output CSS                                                       |
| ---------------------- | ---------------------------------------------------------------- |
| `chai-overflowhidden`  | `overflow: hidden`                                               |
| `chai-overflowauto`    | `overflow: auto`                                                 |
| `chai-overflowxhidden` | `overflow-x: hidden`                                             |
| `chai-overflowyauto`   | `overflow-y: auto`                                               |
| `chai-hidden`          | `display: none`                                                  |
| `chai-invisible`       | `visibility: hidden`                                             |
| `chai-ellipsis`        | `text-overflow: ellipsis; overflow: hidden; white-space: nowrap` |

---

### Cursor & Pointer

| Class              | Output CSS             |
| ------------------ | ---------------------- |
| `chai-pointer`     | `cursor: pointer`      |
| `chai-notallowed`  | `cursor: not-allowed`  |
| `chai-grab`        | `cursor: grab`         |
| `chai-crosshair`   | `cursor: crosshair`    |
| `chai-pointernone` | `pointer-events: none` |
| `chai-pointerauto` | `pointer-events: auto` |
| `chai-selectnone`  | `user-select: none`    |

---

## Prebuilt Component Classes

Drop-in component styles, ready to use:

| Class                                      | Description                               |
| ------------------------------------------ | ----------------------------------------- |
| `chai-btn`                                 | Dark button with padding, rounded corners |
| `chai-card`                                | White card with subtle shadow             |
| `chai-carddark`                            | Dark card (`#1f1f1f`) with white text     |
| `chai-badge`                               | Inline pill / badge                       |
| `chai-input`                               | Light styled input with border            |
| `chai-inputdark`                           | Dark styled input                         |
| `chai-flexcenter`                          | `display:flex` centered both axes         |
| `chai-flexbetween`                         | `display:flex` space-between + centered   |
| `chai-flexaround`                          | `display:flex` space-around + centered    |
| `chai-grid2` / `chai-grid3` / `chai-grid4` | Responsive grid layouts                   |
| `chai-container`                           | Centered layout, max-width 1200px         |
| `chai-divider`                             | Light 1px horizontal rule                 |
| `chai-dividerdark`                         | Dark 1px horizontal rule                  |
| `chai-circle`                              | `border-radius: 50%; overflow: hidden`    |

```html
<!-- Button -->
<button class="chai-btn">Click me</button>

<!-- Card -->
<div class="chai-card chai-p-4">
  <h2 class="chai-bold chai-fs-[1.25rem]">Title</h2>
  <p>Some content here.</p>
</div>

<!-- Dark input -->
<input class="chai-inputdark" placeholder="Search..." />

<!-- Badge -->
<span class="chai-badge chai-bg-[#4ade80] chai-text-[#14532d]">New</span>
```

---

## Arbitrary Values

Wrap any value in `[...]` to bypass scaling and pass it directly:

```html
<!-- Exact pixel sizes -->
<div class="chai-w-[320px] chai-h-[180px]"></div>

<!-- CSS functions -->
<div class="chai-w-[calc(100%-2rem)]"></div>

<!-- CSS variables -->
<div class="chai-bg-[var(--brand-color)]"></div>

<!-- Multi-word values: use _ for spaces -->
<div class="chai-shadow-[0_8px_30px_rgba(0,0,0,0.3)]"></div>
<div class="chai-transition-[background-color_200ms_ease]"></div>
```

---

## Numeric Scaling

When a **bare number** is passed (not inside `[...]`), it is scaled as `n × 0.5rem`:

| Input        | Computed Value        |
| ------------ | --------------------- |
| `chai-p-4`   | `padding: 2rem`       |
| `chai-mt-1`  | `margin-top: 0.5rem`  |
| `chai-gap-6` | `gap: 3rem`           |
| `chai-br-2`  | `border-radius: 1rem` |

The following props are **unit-less** (numbers passed as-is, no scaling):
`z`, `opacity`, `lh`, `fontw`, `fw`, `aspect`, `grow`, `shrink`, `order`, `flex`, `scale`

---

## Real-World Example

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      import "https://unpkg.com/chai-css-engine@1.0.10/index.js";
    </script>
  </head>
  <body class="chai-bg-[#0f0f0f] chai-flexcenter chai-h-[100vh]">
    <div
      class="chai-carddark chai-p-6 chai-maxw-[400px] chai-w-[100%] chai-br-[16px]"
    >
      <h1 class="chai-fs-[1.5rem] chai-bold chai-white chai-mb-2">Sign in</h1>
      <p class="chai-text-[#aaa] chai-fs-[0.9rem] chai-mb-4">Welcome back</p>
      <input class="chai-inputdark chai-mb-3" placeholder="Email" />
      <input
        class="chai-inputdark chai-mb-4"
        type="password"
        placeholder="Password"
      />
      <button class="chai-btn chai-w-[100%] chai-py-[0.75rem] chai-pointer">
        Continue
      </button>
    </div>
  </body>
</html>
```

---

### 🧠 Mental Model

- `chai-{keyword}` → predefined utility
- `chai-{prop}-{value}` → dynamic mapping
- `chai-[...]` → custom values

## Future Improvements

- Responsive utilities (`chai-md-*`)
- Animations / keyframes support
- Some basic performance optimizations (maybe caching)

## License

MIT © Paramveer Oberoi

## Acknowledgements

Inspired by utility-first CSS frameworks like Tailwind, built as part of the Chai aur Code cohort.

## Links

- GitHub: https://github.com/paramveer-cyber/Cohort-Assignments/tree/main/Chai_Tailwind
- Hosted + Documentation Link: https://cohort-assignments-vsnm.vercel.app/
