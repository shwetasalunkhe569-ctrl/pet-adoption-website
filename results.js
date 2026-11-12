const pets = [
    { name: "Bruno", type: "dog", breed: "Labrador Retriever", age: "2 Years", location: "Mumbai, Maharashtra", image: "bruno.jpg", emoji: "🐶" },
    { name: "Milo", type: "cat", breed: "Persian", age: "1 Year", location: "Thane, Maharashtra", image: "milo.jpg", emoji: "🐱" },
    { name: "Coco", type: "bird", breed: "Indian Ringneck Parakeet", age: "1.5 Years", location: "Navi Mumbai, Maharashtra", image: "coco.jpg", emoji: "🦜" },
    { name: "Max", type: "dog", breed: "Golden Retriever", age: "2 Months", location: "Pune, Maharashtra", image: "max.jpg", emoji: "🐶" },
    { name: "Kitty", type: "cat", breed: "Indian Domestic Shorthair", age: "8 Months", location: "Mumbai, Maharashtra", image: "kitty.jpg", emoji: "🐱" },
    { name: "Buddy", type: "dog", breed: "Beagle", age: "1 Year", location: "Nashik, Maharashtra", image: "buddy.jpg", emoji: "🐶" },
    { name: "Bella", type: "cat", breed: "Siamese", age: "2 Years", location: "Thane, Maharashtra", image: "bella.jpg", emoji: "🐱" },
    { name: "Rio", type: "bird", breed: "Budgerigar", age: "1 Year", location: "Pune, Maharashtra", image: "rio.jpg", emoji: "🦜" }
];

const queryParams = new URLSearchParams(window.location.search);
const searchText = (queryParams.get("q") || "").trim().toLowerCase();
const selectedType = (queryParams.get("type") || "all").toLowerCase();
const selectedBreed = (queryParams.get("breed") || "all").toLowerCase();
const searchInput = document.getElementById("petSearch");
const typeFilter = document.getElementById("typeFilter");
const breedFilter = document.getElementById("breedFilter");
const resultsGrid = document.getElementById("resultsGrid");
const resultsCount = document.getElementById("resultsCount");
const noResults = document.getElementById("noResults");
const searchSummary = document.getElementById("searchSummary");

searchInput.value = queryParams.get("q") || "";
typeFilter.value = selectedType;
breedFilter.value = selectedBreed;

const matchingPets = pets.filter(function(pet) {
    const matchesSearch =
        pet.name.toLowerCase().includes(searchText) ||
        pet.type.includes(searchText) ||
        pet.breed.toLowerCase().includes(searchText) ||
        pet.location.toLowerCase().includes(searchText);
    const matchesType = selectedType === "all" || pet.type === selectedType;
    const matchesBreed = selectedBreed === "all" || pet.breed.toLowerCase() === selectedBreed;

    return matchesSearch && matchesType && matchesBreed;
});

matchingPets.forEach(function(pet) {
    const card = document.createElement("article");
    card.className = "pet-card";

    const image = document.createElement("img");
    image.src = "images/" + pet.image;
    image.alt = pet.name + " the " + pet.type;

    const info = document.createElement("div");
    info.className = "pet-info";

    const tag = document.createElement("span");
    tag.className = "pet-tag";
    tag.textContent = pet.emoji + " " + pet.type.charAt(0).toUpperCase() + pet.type.slice(1);

    const name = document.createElement("h3");
    name.textContent = pet.name;

    const breed = document.createElement("p");
    breed.innerHTML = "<strong>Breed:</strong> ";
    breed.append(document.createTextNode(pet.breed));

    const age = document.createElement("p");
    age.innerHTML = "<strong>Age:</strong> ";
    age.append(document.createTextNode(pet.age));

    const location = document.createElement("p");
    location.innerHTML = "<strong>Location:</strong> ";
    location.append(document.createTextNode("📍 " + pet.location));

    const status = document.createElement("p");
    status.className = "status";
    status.textContent = "Available for Adoption";

    const adoptButton = document.createElement("button");
    adoptButton.type = "button";
    adoptButton.textContent = "Adopt " + pet.name;
    adoptButton.addEventListener("click", function() {
        window.location.href = "adoption.html?pet=" + encodeURIComponent(pet.name);
    });

    info.append(tag, name, breed, age, location, status, adoptButton);
    card.append(image, info);
    resultsGrid.append(card);
});

resultsCount.textContent = "Showing " + matchingPets.length + " of " + pets.length + " pets";
noResults.hidden = matchingPets.length !== 0;
searchSummary.textContent = searchText
    ? "Pets matching “" + queryParams.get("q").trim() + "”"
    : "Browse pets available for adoption.";
