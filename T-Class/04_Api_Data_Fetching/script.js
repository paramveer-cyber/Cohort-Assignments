const loader = document.getElementById("loader");
const userCard = document.getElementById("userCard");

function generateCard(image, fname, lname, email, city, country){
    const card = document.createElement("div");
    card.classList.add("card");

    const img = document.createElement("img");
    img.src = image;
    img.alt = "User Image";
    const name = document.createElement("h3");
    name.textContent = `${fname} ${lname}`;
    const emailEl = document.createElement("p");
    emailEl.textContent = email;
    const location = document.createElement("p");
    location.textContent = `${city}, ${country}`;

    card.append(img, name, emailEl, location);

    return card;
}

async function fetchUser() {
    loader.style.display = "block";
    userCard.innerHTML = "";

    try {
        const response = await fetch("https://randomuser.me/api/");
        const data = await response.json();

        const user = data.results[0];

        loader.style.display = "none";
        const card = generateCard(user.picture.large,user.name.first,user.name.last,user.email,user.location.city,user.location.country);
        userCard.appendChild(card);

    } 
    catch (error) {
        userCard.textContent = "Failed to fetch, try again";
        console.log(error);
    }
}

document.getElementById("getUser").addEventListener("click", fetchUser);