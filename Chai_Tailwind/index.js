import { initChaiTailwind } from "./src/chaiTailwind.js";
if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", initChaiTailwind);
}
export { initChaiTailwind };