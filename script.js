
const searchInput = document.getElementById("petSearch");
const searchForm = document.getElementById("petSearchForm");
const typeFilter = document.getElementById("typeFilter");
const breedFilter = document.getElementById("breedFilter");
const clearButton = document.getElementById("clearFilters");

const petGrid = document.getElementById("petGrid");
const resultsCount = document.getElementById("resultsCount");
const noResults = document.getElementById("noResults");

let allPets = [];

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function displayPets(pets) {
    petGrid.innerHTML = pets.map(pet => {
        const name = escapeHTML(pet.name);
        const type = escapeHTML(pet.type);
        const breed = escapeHTML(pet.breed);
        const age = escapeHTML(pet.age);
        const location = escapeHTML(pet.location);
        const image = escapeHTML(pet.image);

        const emoji = pet.type.toLowerCase() === "dog" ? "🐶"
            : pet.type.toLowerCase() === "cat" ? "🐱" : "🦜";

        return `
            <article class="pet-card"
                data-id="${pet.id}"
                data-name="${name}"
                data-type="${type.toLowerCase()}"
                data-breed="${breed}"
                data-location="${location}">

                <img src="${image}" alt="${name}" loading="lazy">

                <div class="pet-info">
                    <span class="pet-tag">${emoji} ${type}</span>
                    <h3>${name}</h3>
                    <p><strong>Breed:</strong> ${breed}</p>
                    <p><strong>Age:</strong> ${age}</p>
                    <p><strong>Location:</strong> 📍 ${location}</p>
                    <p class="status">Available for Adoption</p>
                    <button type="button" class="adopt-button"
                        data-pet="${name}">Adopt ${name}</button>
                </div>
            </article>
        `;
    }).join("");

    petGrid.querySelectorAll(".adopt-button").forEach(button => {
        button.addEventListener("click", () => {
            window.location.href =
                "adoption.html?pet=" + encodeURIComponent(button.dataset.pet);
        });
    });

    filterPets();
}

function filterPets() {
    const query = searchInput.value.trim().toLowerCase();
    const type = typeFilter.value.toLowerCase();
    const breed = breedFilter.value.toLowerCase();
    let count = 0;

    petGrid.querySelectorAll(".pet-card").forEach(card => {
        const matchesSearch = (
            card.dataset.name + " " +
            card.dataset.type + " " +
            card.dataset.breed + " " +
            card.dataset.location
        ).toLowerCase().includes(query);

        const matchesType = type === "all" || card.dataset.type === type;
        const matchesBreed = breed === "all" ||
            card.dataset.breed.toLowerCase() === breed;

        const visible = matchesSearch && matchesType && matchesBreed;
        card.hidden = !visible;
        if (visible) count++;
    });

    resultsCount.textContent = `Showing ${count} of ${allPets.length} pets`;
    noResults.hidden = count !== 0;
}

async function loadPets() {
    resultsCount.textContent = "Loading pets from database...";

    try {
        const response = await fetch("/api/pets");

        if (!response.ok) {
            throw new Error(`API error: HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.pets)) {
            throw new Error("Invalid data returned by the pets API.");
        }

        allPets = data.pets;
        displayPets(allPets);

    } catch (error) {
        console.error("Pets loading failed:", error);
        resultsCount.textContent =
            "Error: " + error.message +
            ". Open http://localhost:3000/api/pets to check the API.";
        noResults.hidden = true;
    }
}

searchForm.addEventListener("submit", event => {
    event.preventDefault();
    filterPets();
    document.getElementById("pets").scrollIntoView({ behavior: "smooth" });
});

searchInput.addEventListener("input", filterPets);
typeFilter.addEventListener("change", filterPets);
breedFilter.addEventListener("change", filterPets);

clearButton.addEventListener("click", () => {
    searchInput.value = "";
    typeFilter.value = "all";
    breedFilter.value = "all";
    filterPets();
});

loadPets();