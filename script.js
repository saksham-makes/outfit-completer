// ---------------------------------------
// OUTFIT COMPLETER
// eBay Browse API
// ---------------------------------------


// HTML elements

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const message =
    document.getElementById("message");


const shirtImage =
    document.getElementById("shirtImage");

const shirtName =
    document.getElementById("shirtName");

const shirtPrevious =
    document.getElementById("shirtPrevious");

const shirtNext =
    document.getElementById("shirtNext");

const selectTopButton =
    document.getElementById("selectTopButton");


const recommendations =
    document.getElementById("recommendations");


const pantsImage =
    document.getElementById("pantsImage");

const pantsName =
    document.getElementById("pantsName");

const pantsPrevious =
    document.getElementById("pantsPrevious");

const pantsNext =
    document.getElementById("pantsNext");


const shoesImage =
    document.getElementById("shoesImage");

const shoesName =
    document.getElementById("shoesName");

const shoesPrevious =
    document.getElementById("shoesPrevious");

const shoesNext =
    document.getElementById("shoesNext");


const completeButton =
    document.getElementById("completeButton");

const completeMessage =
    document.getElementById("completeMessage");


// ---------------------------------------
// PRODUCT LISTS
// ---------------------------------------

let shirts = [];
let pants = [];
let shoes = [];

let shirtIndex = 0;
let pantsIndex = 0;
let shoesIndex = 0;


// ---------------------------------------
// SEARCH EBAY
// ---------------------------------------

async function searchEbay(searchTerm) {

    const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchTerm)}`
    );

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

    const lowerText =
        text.toLowerCase();

    const colours = [
        "red",
        "black",
        "white",
        "navy",
        "blue",
        "green",
        "grey",
        "gray",
        "brown",
        "beige",
        "cream",
        "pink",
        "purple",
        "yellow",
        "orange"
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

        red: {
            pants: "black",
            shoes: "white"
        },

        black: {
            pants: "blue",
            shoes: "white"
        },

        white: {
            pants: "blue",
            shoes: "black"
        },

        blue: {
            pants: "grey",
            shoes: "white"
        },

        navy: {
            pants: "beige",
            shoes: "white"
        },

        green: {
            pants: "beige",
            shoes: "white"
        },

        grey: {
            pants: "black",
            shoes: "white"
        },

        gray: {
            pants: "black",
            shoes: "white"
        },

        brown: {
            pants: "black",
            shoes: "white"
        },

        beige: {
            pants: "black",
            shoes: "white"
        },

        cream: {
            pants: "brown",
            shoes: "white"
        },

        pink: {
            pants: "grey",
            shoes: "white"
        },

        purple: {
            pants: "black",
            shoes: "white"
        },

        yellow: {
            pants: "blue",
            shoes: "white"
        },

        orange: {
            pants: "black",
            shoes: "white"
        },

        neutral: {
            pants: "black",
            shoes: "white"
        }
    };

    return recommendations[colour];
}


// ---------------------------------------
// SHOW TOP
// ---------------------------------------

function showShirt() {

    if (shirts.length === 0) {
        return;
    }

    const product =
        shirts[shirtIndex];

    shirtName.textContent =
        product.title;

    if (product.image) {

        shirtImage.src =
            product.image;

        shirtImage.alt =
            product.title;

        shirtImage.hidden = false;

        const placeholder =
            shirtImage.parentElement
                .querySelector(".placeholder");

        if (placeholder) {
            placeholder.style.display = "none";
        }
    }
}


// ---------------------------------------
// SHOW BOTTOM
// ---------------------------------------

function showPants() {

    if (pants.length === 0) {
        return;
    }

    const product =
        pants[pantsIndex];

    pantsName.textContent =
        product.title;

    if (product.image) {

        pantsImage.src =
            product.image;

        pantsImage.alt =
            product.title;

        pantsImage.hidden = false;

        const placeholder =
            pantsImage.parentElement
                .querySelector(".placeholder");

        if (placeholder) {
            placeholder.style.display = "none";
        }
    }
}


// ---------------------------------------
// SHOW SHOES
// ---------------------------------------

function showShoes() {

    if (shoes.length === 0) {
        return;
    }

    const product =
        shoes[shoesIndex];

    shoesName.textContent =
        product.title;

    if (product.image) {

        shoesImage.src =
            product.image;

        shoesImage.alt =
            product.title;

        shoesImage.hidden = false;

        const placeholder =
            shoesImage.parentElement
                .querySelector(".placeholder");

        if (placeholder) {
            placeholder.style.display = "none";
        }
    }
}


// ---------------------------------------
// SEARCH FOR TOP
// ---------------------------------------

async function searchForTop() {

    const searchText =
        searchInput.value.trim();

    if (searchText === "") {

        message.textContent =
            "Type something like red t-shirt.";

        return;
    }


    message.textContent =
        "Searching eBay for tops...";

    recommendations.hidden = true;

    completeMessage.textContent = "";

    selectTopButton.textContent =
        "Select Top";

    selectTopButton.disabled = true;


    try {

        const topSearch =
            `${searchText} mens clothing`;

        const products =
            await searchEbay(topSearch);


        console.log(
            "eBay top results:",
            products
        );


        shirts =
            products.filter(product =>
                product.image
            );


        if (shirts.length === 0) {

            message.textContent =
                "No matching tops were found.";

            return;
        }


        shirtIndex = 0;

        showShirt();


        shirtPrevious.disabled = false;
        shirtNext.disabled = false;

        selectTopButton.disabled = false;


        message.textContent =
            `${shirts.length} top option(s) found. Choose one and select it.`;

    }

    catch (error) {

        console.error(error);

        message.textContent =
            "Something went wrong while searching eBay.";
    }
}


// ---------------------------------------
// TOP ARROWS
// ---------------------------------------

shirtNext.addEventListener(
    "click",
    function () {

        if (shirts.length === 0) {
            return;
        }

        shirtIndex++;

        if (shirtIndex >= shirts.length) {
            shirtIndex = 0;
        }

        showShirt();
    }
);


shirtPrevious.addEventListener(
    "click",
    function () {

        if (shirts.length === 0) {
            return;
        }

        shirtIndex--;

        if (shirtIndex < 0) {
            shirtIndex = shirts.length - 1;
        }

        showShirt();
    }
);


// ---------------------------------------
// SELECT TOP
// ---------------------------------------

selectTopButton.addEventListener(
    "click",
    async function () {

        if (shirts.length === 0) {
            return;
        }


        const selectedShirt =
            shirts[shirtIndex];


        message.textContent =
            "Finding pieces to complete your outfit...";

        selectTopButton.disabled = true;


        try {

            // Detect the colour from the user's search
            // and the selected eBay product title.

            const colourText =
                searchInput.value +
                " " +
                selectedShirt.title;

            const selectedColour =
                findColour(colourText);


            // Choose one specific matching colour
            // for the bottoms and shoes.

            const matchingColours =
                getRecommendations(selectedColour);


            // Build the recommendation searches.

            const pantsSearch =
                `mens ${matchingColours.pants} pants jeans`;

            const shoesSearch =
                `mens ${matchingColours.shoes} sneakers shoes`;


            console.log(
                "Detected top colour:",
                selectedColour
            );

            console.log(
                "Bottom search:",
                pantsSearch
            );

            console.log(
                "Shoe search:",
                shoesSearch
            );


            // Search eBay for both recommendations.

            const results =
                await Promise.all([
                    searchEbay(pantsSearch),
                    searchEbay(shoesSearch)
                ]);


            pants =
                results[0].filter(product =>
                    product.image
                );


            shoes =
                results[1].filter(product =>
                    product.image
                );


            console.log(
                "Selected top:",
                selectedShirt
            );

            console.log(
                "eBay bottom results:",
                pants
            );

            console.log(
                "eBay shoe results:",
                shoes
            );


            if (
                pants.length === 0 ||
                shoes.length === 0
            ) {

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


            pantsPrevious.disabled = false;
            pantsNext.disabled = false;

            shoesPrevious.disabled = false;
            shoesNext.disabled = false;

            completeButton.disabled = false;


            message.textContent =
                `Matching pieces found for your ${selectedColour} top: ${matchingColours.pants} bottoms and ${matchingColours.shoes} shoes.`;


            selectTopButton.textContent =
                "Top Selected";

        }

        catch (error) {

            console.error(error);

            message.textContent =
                "Something went wrong while loading outfit options.";

            selectTopButton.disabled = false;
        }
    }
);


// ---------------------------------------
// BOTTOM ARROWS
// ---------------------------------------

pantsNext.addEventListener(
    "click",
    function () {

        if (pants.length === 0) {
            return;
        }

        pantsIndex++;

        if (pantsIndex >= pants.length) {
            pantsIndex = 0;
        }

        showPants();
    }
);


pantsPrevious.addEventListener(
    "click",
    function () {

        if (pants.length === 0) {
            return;
        }

        pantsIndex--;

        if (pantsIndex < 0) {
            pantsIndex = pants.length - 1;
        }

        showPants();
    }
);


// ---------------------------------------
// SHOE ARROWS
// ---------------------------------------

shoesNext.addEventListener(
    "click",
    function () {

        if (shoes.length === 0) {
            return;
        }

        shoesIndex++;

        if (shoesIndex >= shoes.length) {
            shoesIndex = 0;
        }

        showShoes();
    }
);


shoesPrevious.addEventListener(
    "click",
    function () {

        if (shoes.length === 0) {
            return;
        }

        shoesIndex--;

        if (shoesIndex < 0) {
            shoesIndex = shoes.length - 1;
        }

        showShoes();
    }
);


// ---------------------------------------
// SEARCH BUTTON
// ---------------------------------------

searchButton.addEventListener(
    "click",
    searchForTop
);


searchInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            searchForTop();
        }
    }
);


// ---------------------------------------
// COMPLETE OUTFIT
// ---------------------------------------

completeButton.addEventListener(
    "click",
    function () {

        const selectedShirt =
            shirts[shirtIndex];

        const selectedPants =
            pants[pantsIndex];

        const selectedShoes =
            shoes[shoesIndex];


        if (
            !selectedShirt ||
            !selectedPants ||
            !selectedShoes
        ) {
            return;
        }


        completeMessage.textContent =
            `Outfit complete: ${selectedShirt.title} + ${selectedPants.title} + ${selectedShoes.title}`;
    }
);