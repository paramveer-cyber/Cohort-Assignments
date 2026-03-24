const mainImage = document.getElementById("mainImage");
const thumbnails = document.querySelectorAll(".thumbnails img");
let previousActive = thumbnails[0];

thumbnails.forEach(img => {
    img.addEventListener("click", () => {
        previousActive.classList.remove("active");
        img.classList.add("active");
        previousActive = img;
        mainImage.src = img.src;
    });
});