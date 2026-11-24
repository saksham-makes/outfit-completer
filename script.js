// ---------------------------------------
// OUTFIT COMPLETER
// eBay Browse API + MongoDB Saved Outfits
// ---------------------------------------

// HTML elements

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const message = document.getElementById("message");

const shirtImage = document.getElementById("shirtImage");
const shirtName = document.getElementById("shirtName");
const shirtPrevious = document.getElementById("shirtPrevious");
const shirtNext = document.getElementById("shirtNext");
const selectTopButton = document.getElementById("selectTopButton");

const recommendations = document.getElementById("recommendations");

const pantsImage = document.getElementById("pantsImage");
const pantsName = document.getElementById("pantsName");
const pantsPrevious = document.getElementById("pantsPrevious");
const pantsNext = document.getElementById("pantsNext");

const shoesImage = document.getElementById("shoesImage");
const shoesName = document.getElementById("shoesName");
const shoesPrevious = document.getElementById("shoesPrevious");
const shoesNext = document.getElementById("shoesNext");

const completeButton = document.getElementById("completeButton");
const completeMessage = document.getElementById("completeMessage");
const surpriseButton = document.getElementById("surpriseButton");

const sectionNavigationLinks =
    document.querySelectorAll(".section-nav-link");

const navigableSections = [
    document.getElementById("outfit-studio"),
    document.getElementById("my-wardrobe"),
    document.getElementById("saved-outfits")
];

const revealSections = [
    document.getElementById("my-wardrobe"),
    document.getElementById("saved-outfits")
];

function setActiveNavigation(sectionId) {
    sectionNavigationLinks.forEach(function (link) {
        const isActive = link.getAttribute("href") === "#" + sectionId;
        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

sectionNavigationLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
        const targetId = link.getAttribute("href").slice(1);
        const target = document.getElementById(targetId);

        if (!target) return;

        event.preventDefault();
        setActiveNavigation(targetId);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

if ("IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("section-revealed");
            observer.unobserve(entry.target);
        });
    }, {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08
    });

    revealSections.forEach(function (section) {
        if (section) {
            section.classList.add("section-awaiting-reveal");
            revealObserver.observe(section);
        }
    });
}

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(function (entries) {
        const visibleEntries = entries
            .filter(function (entry) { return entry.isIntersecting; })
            .sort(function (a, b) {
                return b.intersectionRatio - a.intersectionRatio;
            });

        if (visibleEntries.length > 0) {
            setActiveNavigation(visibleEntries[0].target.id);
        }
    }, {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.05, 0.15, 0.35]
    });

    navigableSections.forEach(function (section) {
        if (section) sectionObserver.observe(section);
    });
}

function animateSelectorCard(card, direction = 0) {
    if (!card) return;

    card.classList.remove("selector-card", "slide-next", "slide-prev");
    void card.offsetWidth;
    card.classList.add("selector-card");

    if (direction > 0) card.classList.add("slide-next");
    if (direction < 0) card.classList.add("slide-prev");

    window.setTimeout(function () {
        card.classList.remove("slide-next", "slide-prev");
    }, 300);
}

// ---------------------------------------
// PRODUCT LISTS
// ---------------------------------------

let shirts = [];
let pants = [];
let shoes = [];

let shirtIndex = 0;
let pantsIndex = 0;
let shoesIndex = 0;

// Keep track of the selected top's colour.
let selectedTopColour = "neutral";

// ---------------------------------------
// SEARCH EBAY
// ---------------------------------------

async function searchEbay(searchTerm) {
    const url = "/api/search?q=" + encodeURIComponent(searchTerm);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("eBay search failed.");
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error("eBay search failed.");
    }

    return data.products;
}

// ---------------------------------------
// FIND COLOUR
// ---------------------------------------

function findColour(text) {
    const lowerText = text.toLowerCase();

    const colours = [
        "red", "black", "white", "navy", "blue",
        "green", "grey", "gray", "brown", "beige",
        "cream", "pink", "purple", "yellow", "orange"
    ];

    for (const colour of colours) {
        if (lowerText.includes(colour)) {
            return colour;
        }
    }

    return "neutral";
}

// ---------------------------------------
// CHOOSE MATCHING COLOURS
// ---------------------------------------

function getRecommendations(colour) {
    const recommendations = {
        red: { pants: "black", shoes: "white" },
        black: { pants: "blue", shoes: "white" },
        white: { pants: "blue", shoes: "black" },
        blue: { pants: "grey", shoes: "white" },
        navy: { pants: "beige", shoes: "white" },
        green: { pants: "beige", shoes: "white" },
        grey: { pants: "black", shoes: "white" },
        gray: { pants: "black", shoes: "white" },
        brown: { pants: "black", shoes: "white" },
        beige: { pants: "black", shoes: "white" },
        cream: { pants: "brown", shoes: "white" },
        pink: { pants: "grey", shoes: "white" },
        purple: { pants: "black", shoes: "white" },
        yellow: { pants: "blue", shoes: "white" },
        orange: { pants: "black", shoes: "white" },
        neutral: { pants: "black", shoes: "white" }
    };

    return recommendations[colour];
}

// ---------------------------------------
// SHOW TOP
// ---------------------------------------

function showShirt(direction = 0) {
    if (shirts.length === 0) return;

    const product = shirts[shirtIndex];

    shirtName.textContent = product.title;

    if (product.image) {
        shirtImage.src = product.image;
        shirtImage.alt = product.title;
        shirtImage.hidden = false;

        const placeholder =
            shirtImage.parentElement.querySelector(".placeholder");

        if (placeholder) {
            placeholder.style.display = "none";
        }
    }

    animateSelectorCard(shirtImage.closest(".item-card"), direction);
}

// ---------------------------------------
// SHOW BOTTOM
// ---------------------------------------

function showPants(direction = 0) {
    if (pants.length === 0) return;

    const product = pants[pantsIndex];

    pantsName.textContent = product.title;

    if (product.image) {
        pantsImage.src = product.image;
        pantsImage.alt = product.title;
        pantsImage.hidden = false;

        const placeholder =
            pantsImage.parentElement.querySelector(".placeholder");

        if (placeholder) {
            placeholder.style.display = "none";
        }
    }

    animateSelectorCard(pantsImage.closest(".item-card"), direction);
}

// ---------------------------------------
// SHOW SHOES
// ---------------------------------------

function showShoes(direction = 0) {
    if (shoes.length === 0) return;

    const product = shoes[shoesIndex];

    shoesName.textContent = product.title;

    if (product.image) {
        shoesImage.src = product.image;
        shoesImage.alt = product.title;
        shoesImage.hidden = false;

        const placeholder =
            shoesImage.parentElement.querySelector(".placeholder");

        if (placeholder) {
            placeholder.style.display = "none";
        }
    }

    animateSelectorCard(shoesImage.closest(".item-card"), direction);
}

// ---------------------------------------
// SEARCH FOR TOP
// ---------------------------------------

async function searchForTop() {
    const searchText = searchInput.value.trim();

    if (searchText === "") {
        message.textContent = "Type something like red t-shirt.";
        return;
    }

    if (searchButton.disabled) return;

    searchButton.disabled = true;
    searchButton.classList.add("is-loading");
    searchButton.innerHTML =
        '<span class="hanger-loading"><span class="hanger-icon" aria-hidden="true">' +
        '<svg viewBox="0 0 30 22" fill="none">' +
        '<path d="M15 2c0 3-3 3-3 5 0 2 2 3 4 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
        '<path d="M15 10l11 8H4l11-8z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<g class="hanger-shirt" fill="#eee7f4" stroke="currentColor" stroke-width="1">' +
        '<path d="M10 11l3-2 2 1 2-1 3 2-2 2-1-1v6h-4v-6l-1 1z"/>' +
        "</g></svg></span><span>Finding your next look...</span></span>";

    message.textContent = "Searching eBay for tops...";
    recommendations.hidden = true;
    surpriseButton.disabled = true;
    completeMessage.textContent = "";

    completeButton.disabled = true;
    selectTopButton.textContent = "Select Top";
    selectTopButton.disabled = true;

    try {
        const topSearch = `${searchText} mens clothing`;
        const products = await searchEbay(topSearch);

        console.log("eBay top results:", products);

        shirts = products.filter(product => product.image);

        if (shirts.length === 0) {
            message.textContent = "No matching tops were found.";
            return;
        }

        shirtIndex = 0;
        showShirt(1);

        shirtPrevious.disabled = false;
        shirtNext.disabled = false;
        selectTopButton.disabled = false;

        message.textContent =
            `${shirts.length} top option(s) found. Choose one and select it.`;
    } catch (error) {
        console.error(error);
        message.textContent =
            "Something went wrong while searching eBay.";
    } finally {
        searchButton.disabled = false;
        searchButton.classList.remove("is-loading");
        searchButton.textContent = "Search";
    }
}

// ---------------------------------------
// TOP ARROWS
// ---------------------------------------

shirtNext.addEventListener("click", function () {
    if (shirts.length === 0) return;

    shirtIndex++;

    if (shirtIndex >= shirts.length) {
        shirtIndex = 0;
    }

    showShirt(-1);
});

shirtPrevious.addEventListener("click", function () {
    if (shirts.length === 0) return;

    shirtIndex--;

    if (shirtIndex < 0) {
        shirtIndex = shirts.length - 1;
    }

    showShirt();
});

// ---------------------------------------
// SELECT TOP AND FIND MATCHES
// ---------------------------------------

selectTopButton.addEventListener("click", async function () {
    if (shirts.length === 0) return;

    const selectedShirt = shirts[shirtIndex];

    message.textContent = "Finding pieces to complete your outfit...";
    selectTopButton.disabled = true;
    completeButton.disabled = true;

    try {
        const colourText =
            searchInput.value + " " + selectedShirt.title;

        selectedTopColour = findColour(colourText);

        const matchingColours =
            getRecommendations(selectedTopColour);

        const pantsSearch =
            `mens ${matchingColours.pants} pants jeans`;

        const shoesSearch =
            `mens ${matchingColours.shoes} sneakers shoes`;

        console.log("Detected top colour:", selectedTopColour);
        console.log("Bottom search:", pantsSearch);
        console.log("Shoe search:", shoesSearch);

        const results = await Promise.all([
            searchEbay(pantsSearch),
            searchEbay(shoesSearch)
        ]);

        pants = results[0].filter(product => product.image);
        shoes = results[1].filter(product => product.image);

        console.log("Selected top:", selectedShirt);
        console.log("eBay bottom results:", pants);
        console.log("eBay shoe results:", shoes);

        if (pants.length === 0 || shoes.length === 0) {
            message.textContent =
                "Not enough outfit options were found.";

            selectTopButton.disabled = false;
            return;
        }

        pantsIndex = 0;
        shoesIndex = 0;

        showPants();
        showShoes();

        recommendations.hidden = false;
        recommendations.classList.remove("recommendations-enter");
        void recommendations.offsetWidth;
        recommendations.classList.add("recommendations-enter");
        window.setTimeout(function () {
            recommendations.classList.remove("recommendations-enter");
        }, 420);

        pantsPrevious.disabled = false;
        pantsNext.disabled = false;
        shoesPrevious.disabled = false;
        shoesNext.disabled = false;

        completeButton.disabled = false;
        surpriseButton.disabled = false;

        message.textContent =
            `Matching pieces found for your ${selectedTopColour} top: ` +
            `${matchingColours.pants} bottoms and ${matchingColours.shoes} shoes.`;

        selectTopButton.textContent = "Top Selected";
    } catch (error) {
        console.error(error);

        message.textContent =
            "Something went wrong while loading outfit options.";

        selectTopButton.disabled = false;
    }
});

// ---------------------------------------
// BOTTOM ARROWS
// ---------------------------------------

pantsNext.addEventListener("click", function () {
    if (pants.length === 0) return;

    pantsIndex++;

    if (pantsIndex >= pants.length) {
        pantsIndex = 0;
    }

    showPants(1);
});

pantsPrevious.addEventListener("click", function () {
    if (pants.length === 0) return;

    pantsIndex--;

    if (pantsIndex < 0) {
        pantsIndex = pants.length - 1;
    }

    showPants(-1);
});

// ---------------------------------------
// SHOE ARROWS
// ---------------------------------------

shoesNext.addEventListener("click", function () {
    if (shoes.length === 0) return;

    shoesIndex++;

    if (shoesIndex >= shoes.length) {
        shoesIndex = 0;
    }

    showShoes(1);
});

shoesPrevious.addEventListener("click", function () {
    if (shoes.length === 0) return;

    shoesIndex--;

    if (shoesIndex < 0) {
        shoesIndex = shoes.length - 1;
    }

    showShoes(-1);
});

surpriseButton.addEventListener("click", function () {
    if (shirts.length === 0 || pants.length === 0 || shoes.length === 0) {
        message.textContent =
            "More outfit items are needed before I can surprise you.";
        return;
    }

    shirtIndex = Math.floor(Math.random() * shirts.length);
    pantsIndex = Math.floor(Math.random() * pants.length);
    shoesIndex = Math.floor(Math.random() * shoes.length);

    showShirt();
    showPants();
    showShoes();

    recommendations.classList.remove("surprise-reveal");
    void recommendations.offsetWidth;
    recommendations.classList.add("surprise-reveal");
    window.setTimeout(function () {
        recommendations.classList.remove("surprise-reveal");
    }, 450);

    message.textContent =
        "A complete surprise look is ready. You can save it or keep shuffling.";
});

// ---------------------------------------
// SEARCH BUTTON
// ---------------------------------------

searchButton.addEventListener("click", searchForTop);

searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchForTop();
    }
});

// ---------------------------------------
// SAVE COMPLETED OUTFIT TO MONGODB
// ---------------------------------------

completeButton.addEventListener("click", async function () {
    const selectedShirt = shirts[shirtIndex];
    const selectedPants = pants[pantsIndex];
    const selectedShoes = shoes[shoesIndex];

    if (!selectedShirt || !selectedPants || !selectedShoes) {
        completeMessage.textContent =
            "Choose a top, bottoms, and shoes first.";
        return;
    }

    completeButton.disabled = true;
    completeMessage.textContent = "Saving your outfit...";

    const outfit = {
        name: `${selectedShirt.title} Outfit`,
        occasion: "Everyday",
        top: selectedShirt.title,
        bottom: selectedPants.title,
        shoes: selectedShoes.title
    };

    try {
        const response = await fetch("/api/outfits", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(outfit)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Could not save outfit.");
        }

        completeMessage.textContent = "The look is complete.";
        completeMessage.classList.remove("completed-look");
        void completeMessage.offsetWidth;
        completeMessage.classList.add("completed-look");

        const appPanel = completeMessage.closest(".app");
        appPanel.classList.remove("completed-outfit-reveal");
        void appPanel.offsetWidth;
        appPanel.classList.add("completed-outfit-reveal");
        window.setTimeout(function () {
            completeMessage.classList.remove("completed-look");
            appPanel.classList.remove("completed-outfit-reveal");
        }, 1200);

        console.log("Saved outfit to MongoDB:", data.outfit);
        await loadSavedOutfits();
    } catch (error) {
        console.error("Save outfit error:", error);

        completeMessage.textContent =
            "Could not save your outfit. Please try again.";
    } finally {
        completeButton.disabled = false;
    }
});

// ---------------------------------------
// DISPLAY SAVED OUTFITS FROM MONGODB
// ---------------------------------------

const savedOutfitsList = document.getElementById("savedOutfitsList");
const refreshOutfitsButton = document.getElementById("refreshOutfitsButton");

async function loadSavedOutfits() {
    savedOutfitsList.textContent = "Loading saved outfits...";

    try {
        const response = await fetch("/api/outfits");
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error("Could not load saved outfits.");
        }

        savedOutfitsList.innerHTML = "";

        if (data.outfits.length === 0) {
            savedOutfitsList.textContent = "You haven't saved any outfits yet.";
            return;
        }

        data.outfits.forEach(outfit => {
            const card = document.createElement("div");
            card.className = "saved-outfit-card";

            const title = document.createElement("h3");
            title.textContent = outfit.name;

            const occasion = document.createElement("p");
            occasion.className = "saved-outfit-occasion";
            const occasionLabel = document.createElement("strong");
            occasionLabel.textContent = "Occasion";
            const occasionValue = document.createElement("span");
            occasionValue.textContent = outfit.occasion;
            occasion.append(occasionLabel, occasionValue);

            const top = document.createElement("p");
            top.className = "saved-outfit-detail";
            const topLabel = document.createElement("strong");
            topLabel.textContent = "Top";
            const topValue = document.createElement("span");
            topValue.textContent = outfit.top;
            top.append(topLabel, topValue);

            const bottom = document.createElement("p");
            bottom.className = "saved-outfit-detail";
            const bottomLabel = document.createElement("strong");
            bottomLabel.textContent = "Bottom";
            const bottomValue = document.createElement("span");
            bottomValue.textContent = outfit.bottom;
            bottom.append(bottomLabel, bottomValue);

            const shoes = document.createElement("p");
            shoes.className = "saved-outfit-detail";
            const shoesLabel = document.createElement("strong");
            shoesLabel.textContent = "Shoes";
            const shoesValue = document.createElement("span");
            shoesValue.textContent = outfit.shoes;
            shoes.append(shoesLabel, shoesValue);

            card.append(title, occasion, top, bottom, shoes);
            savedOutfitsList.appendChild(card);
        });

    } catch (error) {
        console.error("Load outfits error:", error);
        savedOutfitsList.textContent = "Could not load saved outfits. Please try again.";
    }
}

refreshOutfitsButton.addEventListener("click", loadSavedOutfits);

// Load saved outfits when the page opens.
loadSavedOutfits();


// ---------------------------------------
// PERSONAL WARDROBE: ADD, EDIT, DISPLAY AND DELETE
// ---------------------------------------

const clothingForm = document.getElementById("clothingForm");
const clothingMessage = document.getElementById("clothingMessage");
const wardrobeItems = document.getElementById("wardrobeItems");
const wardrobeCount = document.getElementById("wardrobeCount");
const clothingSubmitButton = document.getElementById("clothingSubmitButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const categoryOptions = document.querySelectorAll(".category-option");
let editingClothingId = null;
let wardrobeSuccessTimeout = null;

function animateWardrobeImage(imageUrl) {
    if (!imageUrl) return;

    const target = document.querySelector(".wardrobe-section");
    if (!target) return;

    const sourceRect = document.querySelector("#clothingForm").getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const flyImage = document.createElement("img");

    flyImage.src = imageUrl;
    flyImage.alt = "";
    flyImage.className = "wardrobe-image-fly";
    flyImage.style.left = `${sourceRect.left + sourceRect.width * 0.5 - 48}px`;
    flyImage.style.top = `${sourceRect.bottom - 115}px`;
    document.body.appendChild(flyImage);

    window.requestAnimationFrame(function () {
        const targetX = targetRect.left + targetRect.width * 0.5 - sourceRect.left - sourceRect.width * 0.5;
        const targetY = targetRect.top - sourceRect.bottom + 180;
        flyImage.style.transform =
            `translate(${targetX}px, ${targetY}px) scale(.28)`;
        flyImage.style.opacity = "0";
    });

    window.setTimeout(function () {
        flyImage.remove();
    }, 560);

    let toast = document.querySelector(".collection-success-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "collection-success-toast";
        toast.setAttribute("role", "status");
        document.body.appendChild(toast);
    }

    toast.textContent = "Added to your collection!";
    toast.classList.remove("is-visible");
    void toast.offsetWidth;
    toast.classList.add("is-visible");
}

function syncCategoryOptions() {
    categoryOptions.forEach(option => {
        option.classList.toggle(
            "selected",
            option.dataset.category === document.getElementById("clothingCategory").value
        );
    });
}

function resetClothingForm() {
    clothingForm.reset();
    editingClothingId = null;
    clothingSubmitButton.textContent = "Add to Wardrobe";
    cancelEditButton.hidden = true;
    syncCategoryOptions();
}

function editClothingItem(id, item) {
    if (!id || !item) {
        console.error("Could not edit clothing item: missing item data.");
        clothingMessage.textContent = "Could not edit this clothing item.";
        return;
    }

    editingClothingId = String(id);
    document.getElementById("clothingName").value = item.name;
    document.getElementById("clothingCategory").value = item.category;
    document.getElementById("clothingColour").value = item.colour;
    document.getElementById("clothingBrand").value = item.brand || "";
    document.getElementById("clothingImage").value = item.imageUrl || "";
    clothingSubmitButton.textContent = "Update Clothing Item";
    cancelEditButton.hidden = false;
    clothingMessage.textContent = "Editing clothing item.";
    syncCategoryOptions();

    clothingForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function loadWardrobe() {
    wardrobeItems.textContent = "Loading your wardrobe...";

    try {
        const response = await fetch("/api/clothing");
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error("Could not load clothing items.");
        }

        wardrobeItems.innerHTML = "";
        wardrobeCount.textContent =
            `${data.items.length} ${data.items.length === 1 ? "item" : "items"}`;

        if (data.items.length === 0) {
            wardrobeItems.innerHTML = `
                <div class="wardrobe-empty-state">
                    <div class="empty-state-icon">♧</div>
                    <h3>Your wardrobe is waiting</h3>
                    <p>You haven't added any clothing yet. Add your first piece to start building your collection.</p>
                </div>
            `;
            return;
        }

        data.items.forEach(item => {
            const card = document.createElement("div");
            card.className = "wardrobe-item-card";

            const title = document.createElement("h3");
            title.textContent = item.name;

            const category = document.createElement("p");
            category.className = "wardrobe-meta";
            const categoryLabel = document.createElement("strong");
            categoryLabel.textContent = "Category";
            const categoryValue = document.createElement("span");
            categoryValue.textContent = item.category;
            category.append(categoryLabel, categoryValue);

            const colour = document.createElement("p");
            colour.className = "wardrobe-meta";
            const colourLabel = document.createElement("strong");
            colourLabel.textContent = "Colour";
            const colourValue = document.createElement("span");
            colourValue.textContent = item.colour;
            colour.append(colourLabel, colourValue);

            const brand = document.createElement("p");
            brand.className = "wardrobe-meta";
            const brandLabel = document.createElement("strong");
            brandLabel.textContent = "Brand";
            const brandValue = document.createElement("span");
            brandValue.textContent = item.brand || "Not specified";
            brand.append(brandLabel, brandValue);

            card.append(title, category, colour, brand);

            if (item.imageUrl) {
                const image = document.createElement("img");
                image.src = item.imageUrl;
                image.alt = item.name;
                image.className = "wardrobe-item-image";
                image.onerror = function () {
                    image.style.display = "none";
                };
                card.prepend(image);
            }

            const actions = document.createElement("div");
            actions.className = "wardrobe-item-actions";

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.type = "button";
            editButton.dataset.clothingId = String(item._id);
            editButton.addEventListener("click", function () {
                editClothingItem(editButton.dataset.clothingId, item);
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete Item";
            deleteButton.type = "button";
            deleteButton.addEventListener("click", function () {
                deleteClothingItem(item._id);
            });

            actions.append(editButton, deleteButton);
            card.appendChild(actions);
            wardrobeItems.appendChild(card);
        });

    } catch (error) {
        console.error("Wardrobe loading error:", error);
        wardrobeItems.textContent = "Could not load your wardrobe. Please try again.";
    }
}

// ADD OR UPDATE A CLOTHING ITEM
clothingForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const clothingItem = {
        name: document.getElementById("clothingName").value.trim(),
        category: document.getElementById("clothingCategory").value,
        colour: document.getElementById("clothingColour").value.trim(),
        brand: document.getElementById("clothingBrand").value.trim(),
        imageUrl: document.getElementById("clothingImage").value.trim()
    };

    const isEditing = editingClothingId !== null;
    const requestUrl = isEditing
        ? "/api/clothing/" + editingClothingId
        : "/api/clothing";

    clothingMessage.textContent = isEditing
        ? "Updating clothing item..."
        : "Saving clothing item...";

    try {
        const response = await fetch(requestUrl, {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(clothingItem)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Could not save clothing item.");
        }

        clothingMessage.textContent = isEditing
            ? "Clothing item updated successfully!"
            : "Clothing item added successfully!";
        resetClothingForm();

        if (!isEditing) {
            window.clearTimeout(wardrobeSuccessTimeout);
            clothingSubmitButton.textContent = "Added to Wardrobe ✓";
            clothingSubmitButton.classList.add("is-success");
            animateWardrobeImage(clothingItem.imageUrl);

            wardrobeSuccessTimeout = window.setTimeout(function () {
                clothingSubmitButton.textContent = "Add to Wardrobe";
                clothingSubmitButton.classList.remove("is-success");
            }, 1800);
        }

        await loadWardrobe();

    } catch (error) {
        console.error(isEditing ? "Update clothing error:" : "Add clothing error:", error);
        clothingMessage.textContent = error.message;
    }
});

cancelEditButton.addEventListener("click", function () {
    resetClothingForm();
    clothingMessage.textContent = "";
});

categoryOptions.forEach(option => {
    option.addEventListener("click", function () {
        document.getElementById("clothingCategory").value = option.dataset.category;
        syncCategoryOptions();
    });
});

syncCategoryOptions();

// DELETE A CLOTHING ITEM
async function deleteClothingItem(id) {
    const confirmed = window.confirm("Are you sure you want to delete this clothing item?");

    if (!confirmed) return;

    try {
        const response = await fetch("/api/clothing/" + id, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Could not delete clothing item.");
        }

        clothingMessage.textContent = "Clothing item deleted successfully!";
        await loadWardrobe();

    } catch (error) {
        console.error("Delete clothing error:", error);
        clothingMessage.textContent = error.message;
    }
}

// LOAD WARDROBE WHEN THE PAGE OPENS
loadWardrobe();
