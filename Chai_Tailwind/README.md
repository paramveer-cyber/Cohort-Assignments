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

### 1. Import

```html
<script type="module">
  import "https://unpkg.com/chai-css-engine@1.0.10/index.js";
</script>
```

#### Vite / React


```js
import {initChaiTailwind} from "chai-css-engine";
initChaiTailwind();
```

### 2. Write classes

```html
<div class="chai-p-4 chai-bg-blue chai-text-white chai-center chai-bold">
  Hello Chai CSS Engine
</div>
```



## How it works

1. Scans the DOM for classes containing `chai-`
2. Parses each class name
3. Maps it to a CSS property + value
4. Applies styles inline
5. Removes the original class names



## Examples

### Spacing

```html
<div class="chai-mt-4 chai-p-2"></div>
```

Would be converted to =:

```css
margin-top: 2rem;
padding: 1rem;
```



### Colors

```html
<div class="chai-bg-red chai-text-white"></div>
```



### Layout

```html
<div class="chai-flex chai-justifycenter chai-itemscenter"></div>
```



### Custom values

```html
<div class="chai-w-[calc(100%-2rem)]"></div>
```



## Supported Utilities

- Spacing: `m`, `p`, `mt`, `mb`, `px`, `py`
- Colors: `bg`, `text`
- Typography: `fs`, `fontw`, alignment classes
- Layout: flex, grid, position
- Borders: `b`, `br`, `bc`

(and a few more, check `supportedClasses.js`)



## Project Structure

```bash
chai-css-engine/
├── src/
│   ├── chaiTailwind.js
│   ├── processing.js
│   ├── supportedClasses.js
```



## Example

```html
<div class="chai-p-4 chai-bg-[#1f1f1f] chai-text-white chai-round chai-shadow">
  Card UI
</div>
```



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