
require("dotenv").config();

const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow the backend to receive JSON from the frontend.
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "public", "images")));

// ---------------------------------------
// MONGODB CONNECTION
// ---------------------------------------

const mongoURI = process.env.MONGODB_URI;
let db;
let mongoClient;
let mongoConnectionPromise;

async function connectToMongoDB() {
    if (db) return db;
    if (mongoConnectionPromise) return mongoConnectionPromise;

    if (!mongoURI) {
        throw new Error("MONGODB_URI is missing from .env");
    }

    mongoConnectionPromise = (async function () {
        if (!mongoClient) {
            mongoClient = new MongoClient(mongoURI);
        }

        await mongoClient.connect();
        db = mongoClient.db("outfitCompleter");

        console.log("Connected to MongoDB database: outfitCompleter");
        return db;
    })().catch(function (error) {
        mongoConnectionPromise = undefined;
        throw error;
    });

    return mongoConnectionPromise;
}

// Helper for database routes.
async function getCollection(name) {
    const database = await connectToMongoDB();
    return database.collection(name);
}

// ---------------------------------------
// SERVE WEBSITE FILES
// ---------------------------------------

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/style.css", function (req, res) {
    res.sendFile(path.join(__dirname, "style.css"));
});

app.get("/script.js", function (req, res) {
    res.sendFile(path.join(__dirname, "script.js"));
});

// ---------------------------------------
// MONGODB: CLOTHING ITEMS
// ---------------------------------------

// READ all clothing items
app.get("/api/clothing", async function (req, res) {
    try {
        const clothing = await getCollection("clothingItems");
        const items = await clothing.find({}).sort({ createdAt: -1 }).toArray();

        res.json({ success: true, items });
    } catch (error) {
        console.error("Read clothing error:", error);
        res.status(500).json({ success: false, message: "Could not load clothing items." });
    }
});

// CREATE a clothing item
app.post("/api/clothing", async function (req, res) {
    try {
        const { name, category, colour, imageUrl, brand } = req.body;

        if (!name || !category || !colour) {
            return res.status(400).json({
                success: false,
                message: "Name, category, and colour are required."
            });
        }

        const clothing = await getCollection("clothingItems");

        const newItem = {
            name: String(name).trim(),
            category: String(category).trim().toLowerCase(),
            colour: String(colour).trim().toLowerCase(),
            imageUrl: imageUrl ? String(imageUrl).trim() : "",
            brand: brand ? String(brand).trim() : "",
            createdAt: new Date()
        };

        const result = await clothing.insertOne(newItem);

        res.status(201).json({
            success: true,
            item: { _id: result.insertedId, ...newItem }
        });
    } catch (error) {
        console.error("Create clothing error:", error);
        res.status(500).json({ success: false, message: "Could not save clothing item." });
    }
});

// UPDATE a clothing item
app.put("/api/clothing/:id", async function (req, res) {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid clothing item ID." });
        }

        const { name, category, colour, imageUrl, brand } = req.body;

        if (!name || !category || !colour) {
            return res.status(400).json({
                success: false,
                message: "Name, category, and colour are required."
            });
        }

        const clothing = await getCollection("clothingItems");

        const result = await clothing.updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    name: String(name).trim(),
                    category: String(category).trim().toLowerCase(),
                    colour: String(colour).trim().toLowerCase(),
                    imageUrl: imageUrl ? String(imageUrl).trim() : "",
                    brand: brand ? String(brand).trim() : "",
                    updatedAt: new Date()
                }
            }
        );

        if (!result.matchedCount) {
            return res.status(404).json({ success: false, message: "Clothing item not found." });
        }

        res.json({ success: true, message: "Clothing item updated." });
    } catch (error) {
        console.error("Update clothing error:", error);
        res.status(500).json({ success: false, message: "Could not update clothing item." });
    }
});

// DELETE a clothing item
app.delete("/api/clothing/:id", async function (req, res) {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid clothing item ID." });
        }

        const clothing = await getCollection("clothingItems");
        const result = await clothing.deleteOne({ _id: new ObjectId(req.params.id) });

        if (!result.deletedCount) {
            return res.status(404).json({ success: false, message: "Clothing item not found." });
        }

        res.json({ success: true, message: "Clothing item deleted." });
    } catch (error) {
        console.error("Delete clothing error:", error);
        res.status(500).json({ success: false, message: "Could not delete clothing item." });
    }
});

// ---------------------------------------
// MONGODB: SAVED OUTFITS
// ---------------------------------------

// READ saved outfits
app.get("/api/outfits", async function (req, res) {
    try {
        const outfits = await getCollection("outfits");
        const items = await outfits.find({}).sort({ createdAt: -1 }).toArray();

        res.json({ success: true, outfits: items });
    } catch (error) {
        console.error("Read outfits error:", error);
        res.status(500).json({ success: false, message: "Could not load saved outfits." });
    }
});

// CREATE a saved outfit
app.post("/api/outfits", async function (req, res) {
    try {
        const { name, occasion, top, bottom, shoes } = req.body;

        if (!name || !top || !bottom || !shoes) {
            return res.status(400).json({
                success: false,
                message: "Name, top, bottom, and shoes are required."
            });
        }

        const outfits = await getCollection("outfits");

        const newOutfit = {
            name: String(name).trim(),
            occasion: occasion ? String(occasion).trim() : "Everyday",
            top,
            bottom,
            shoes,
            createdAt: new Date()
        };

        const result = await outfits.insertOne(newOutfit);

        res.status(201).json({
            success: true,
            outfit: { _id: result.insertedId, ...newOutfit }
        });
    } catch (error) {
        console.error("Create outfit error:", error);
        res.status(500).json({ success: false, message: "Could not save outfit." });
    }
});

// UPDATE a saved outfit
app.put("/api/outfits/:id", async function (req, res) {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid outfit ID." });
        }

        const { name, occasion, top, bottom, shoes } = req.body;

        if (!name || !top || !bottom || !shoes) {
            return res.status(400).json({
                success: false,
                message: "Name, top, bottom, and shoes are required."
            });
        }

        const outfits = await getCollection("outfits");

        const result = await outfits.updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    name: String(name).trim(),
                    occasion: occasion ? String(occasion).trim() : "Everyday",
                    top,
                    bottom,
                    shoes,
                    updatedAt: new Date()
                }
            }
        );

        if (!result.matchedCount) {
            return res.status(404).json({ success: false, message: "Saved outfit not found." });
        }

        res.json({ success: true, message: "Saved outfit updated." });
    } catch (error) {
        console.error("Update outfit error:", error);
        res.status(500).json({ success: false, message: "Could not update saved outfit." });
    }
});

// DELETE a saved outfit
app.delete("/api/outfits/:id", async function (req, res) {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid outfit ID." });
        }

        const outfits = await getCollection("outfits");
        const result = await outfits.deleteOne({ _id: new ObjectId(req.params.id) });

        if (!result.deletedCount) {
            return res.status(404).json({ success: false, message: "Saved outfit not found." });
        }

        res.json({ success: true, message: "Saved outfit deleted." });
    } catch (error) {
        console.error("Delete outfit error:", error);
        res.status(500).json({ success: false, message: "Could not delete saved outfit." });
    }
});

// ---------------------------------------
// GET A FRESH EBAY OAUTH TOKEN
// ---------------------------------------

async function getEbayToken() {
    const clientId = process.env.EBAY_CLIENT_ID;
    const clientSecret = process.env.EBAY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("eBay environment variables are missing.");
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(
        "https://api.ebay.com/identity/v1/oauth2/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${credentials}`
            },
            body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope"
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

        const token = await getEbayToken();

        const ebayURL =
            "https://api.ebay.com/buy/browse/v1/item_summary/search" +
            `?q=${encodeURIComponent(searchTerm)}` +
            "&limit=10";

        const response = await fetch(ebayURL, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-EBAY-C-MARKETPLACE-ID": "EBAY_CA"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("eBay search error:", errorText);
            throw new Error("eBay search failed.");
        }

        const data = await response.json();

        const products = (data.itemSummaries || []).map(function (item) {
            return {
                id: item.itemId,
                title: item.title,
                image: item.image ? item.image.imageUrl : "",
                price: item.price ? item.price.value : "",
                currency: item.price ? item.price.currency : "",
                url: item.itemWebUrl || ""
            };
        });

        res.json({
            success: true,
            search: searchTerm,
            products
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Could not search eBay."
        });
    }
});

// ---------------------------------------
// START LOCAL SERVER
// ---------------------------------------

if (require.main === module) {
    app.listen(PORT, function () {
        console.log(`Outfit Completer running at http://localhost:${PORT}`);
    });
}

// ---------------------------------------
// EXPORT FOR VERCEL
// ---------------------------------------

module.exports = app;
