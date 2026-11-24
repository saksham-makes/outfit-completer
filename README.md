# Outfit Completer

## Project Overview

Outfit Completer is an interactive web application that helps users discover clothing items and create outfit combinations. Users can search for clothing products through the eBay API, receive outfit recommendations, save completed outfits and manage their personal clothing collection.

The application uses MongoDB Atlas to store clothing items and saved outfits, allowing users to access their saved data after refreshing the website.

## Technologies Used

- HTML5 – Website structure
- CSS3 – Styling and responsive layout
- JavaScript – Frontend functionality and API integration
- Node.js – Backend runtime
- Express.js – Server and API routes
- MongoDB Atlas – Cloud database
- eBay Browse API – Clothing product search
- GitHub – Version control

## Main Features

### 1. eBay Clothing Search
- Search for clothing products using keywords.
- Retrieve product listings through the eBay Browse API.
- Display product names, images and prices.
- Browse available product options using carousel navigation.

### 2. Outfit Recommendations
- Select a clothing item as the starting point.
- Generate recommendations for matching bottoms and shoes.
- Browse recommended products.
- Complete an outfit using selected clothing items.

### 3. Saved Outfits
- Save completed outfit combinations.
- Store outfit names, occasions, tops, bottoms and shoes in MongoDB.
- Display previously saved outfits.
- Refresh the saved outfits list.
- Retain saved outfits after refreshing the website.

### 4. Personal Wardrobe
- Add clothing items to a personal wardrobe.
- Enter clothing name, category, colour, brand and image URL.
- Display saved clothing items.
- Delete clothing items from the collection.
- Retrieve stored items from MongoDB after refreshing the website.

## Database Structure

**Database:** `outfitCompleter`

The application uses two MongoDB collections:

### clothingItems

Stores individual clothing items.

Fields:
- `_id`
- `name`
- `category`
- `colour`
- `brand`
- `imageUrl`
- `createdAt`
- `updatedAt` (when updated)

### outfits

Stores completed outfit combinations.

Fields:
- `_id`
- `name`
- `occasion`
- `top`
- `bottom`
- `shoes`
- `createdAt`
- `updatedAt` (when updated)

## API Endpoints

### Clothing Items

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/clothing` | Retrieve clothing items |
| POST | `/api/clothing` | Add a clothing item |
| PUT | `/api/clothing/:id` | Update a clothing item |
| DELETE | `/api/clothing/:id` | Delete a clothing item |

### Saved Outfits

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/outfits` | Retrieve saved outfits |
| POST | `/api/outfits` | Save a completed outfit |
| PUT | `/api/outfits/:id` | Update a saved outfit |
| DELETE | `/api/outfits/:id` | Delete a saved outfit |

### eBay Search

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/search?q=keyword` | Search clothing products through eBay |

## Project Structure

```text
api-testing/
│
├── index.html
├── style.css
├── script.js
├── server.js
├── package.json
├── package-lock.json
├── .env
└── README.md
```

## Installation and Setup

### 1. Install Dependencies

Open the project folder in Visual Studio Code and run:

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root.

The application requires the following environment variables:

```env
EBAY_CLIENT_ID=your_ebay_client_id
EBAY_CLIENT_SECRET=your_ebay_client_secret
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

Replace the placeholder values with your own credentials. Never publish API credentials or database connection strings.

### 3. Run the Application

Start the local server:

```bash
npm start
```

Open the application in your browser:

```text
http://localhost:3000
```

## Testing

The following functionality was manually tested in the local application:

| Test | Result |
|---|---|
| eBay clothing search | Passed |
| Product results and images | Passed |
| Outfit recommendations | Passed |
| Complete Outfit functionality | Passed |
| Save outfits to MongoDB | Passed |
| Display saved outfits | Passed |
| Saved outfit persistence after refresh | Passed |
| Add clothing to Personal Wardrobe | Passed |
| Display wardrobe items | Passed |
| Wardrobe persistence after refresh | Passed |
| Delete wardrobe items | Passed |

**Testing note:** The above tests were performed manually in the local browser. Update this section if further testing identifies issues or additional functionality is verified.

## Future Improvements

- Allow users to edit clothing items and saved outfits through the interface.
- Add filtering and sorting options to the Personal Wardrobe.
- Improve outfit recommendations using additional clothing attributes.
- Add user accounts and individual wardrobes.
- Improve image uploading and clothing organization.

## Project Conclusion

Outfit Completer combines third-party API integration, dynamic frontend interactions and database storage to create an interactive outfit-completion experience. The application allows users to discover clothing products, build outfit combinations, save their outfits and manage their personal wardrobe.
