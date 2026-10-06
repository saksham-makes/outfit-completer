require("dotenv").config();

const express = require("express");

const app = express();
const PORT = 3000;


// Serve the website files
app.use(express.static(__dirname));


// ---------------------------------------
// GET A FRESH EBAY OAUTH TOKEN
// ---------------------------------------

async function getEbayToken() {

    const clientId = process.env.EBAY_CLIENT_ID;
    const clientSecret = process.env.EBAY_CLIENT_SECRET;

    const credentials =
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(
        "https://api.ebay.com/identity/v1/oauth2/token",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${credentials}`
            },

            body:
                "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope"
        }
    );

    if (!response.ok) {

        const errorText = await response.text();

        console.error("Token error:", errorText);

        throw new Error("Could not get eBay token.");
    }

    const data = await response.json();

    return data.access_token;
}


// ---------------------------------------
// EBAY SEARCH
// ---------------------------------------

app.get("/api/search", async function (req, res) {

    try {

        const searchTerm = req.query.q;

        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                message: "Please enter a search."
            });
        }


        // Get a fresh token automatically
        const token = await getEbayToken();


        // Search eBay
        const ebayURL =
            "https://api.ebay.com/buy/browse/v1/item_summary/search" +
            `?q=${encodeURIComponent(searchTerm)}` +
            "&limit=10";


        const response = await fetch(
            ebayURL,
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "X-EBAY-C-MARKETPLACE-ID": "EBAY_CA"
                }
            }
        );


        if (!response.ok) {

            const errorText = await response.text();

            console.error("eBay search error:", errorText);

            throw new Error("eBay search failed.");
        }


        const data = await response.json();


        // Only send the information our website needs
        const products =
            (data.itemSummaries || []).map(function (item) {

                return {
                    id: item.itemId,
                    title: item.title,

                    image:
                        item.image
                            ? item.image.imageUrl
                            : "",

                    price:
                        item.price
                            ? item.price.value
                            : "",

                    currency:
                        item.price
                            ? item.price.currency
                            : "",

                    url:
                        item.itemWebUrl || ""
                };

            });


        res.json({
            success: true,
            search: searchTerm,
            products: products
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not search eBay."
        });
    }

});


// ---------------------------------------
// START SERVER
// ---------------------------------------

app.listen(PORT, function () {

    console.log(
        `Outfit Completer running at http://localhost:${PORT}`
    );

});