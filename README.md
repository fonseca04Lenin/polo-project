# Polo Central

A React app that finds polo shirts from different online stores and puts them all in one place. No more searching through multiple websites - everything you need is here.

## What it does

- Shows polo shirts from eBay, Target, Walmart, and other stores
- Search for specific brands or styles
- Filter by price, brand, or store
- Sort by price, rating, or name
- Click on any polo to see more details

## Getting Started

### What you need
- Node.js (version 14 or higher)
- npm

### Setup

1. Clone the repo
   ```bash
   git clone https://github.com/yourusername/polo-central.git
   cd polo-central
   ```

2. Install packages
   ```bash
   npm install
   ```

3. Start the app
   ```bash
   # Run both frontend and backend
   npm run dev
   
   # Or run them separately
   npm run server  # Backend
   npm start       # Frontend
   ```

4. Open your browser
   - App: http://localhost:3000
   - API: http://localhost:5000

## How it works

The app has two parts:
- **Frontend** (React) - Shows the polo shirts and handles user interactions
- **Backend** (Node.js) - Gets polo data from different websites

### API Endpoints

Get all polo shirts:
```
GET /api/polos
```

Search for specific polos:
```
GET /api/polos?search=nike&minPrice=50&maxPrice=100
```

Check if the server is running:
```
GET /api/health
```

## Project files

```
polo-central/
├── src/                    # React frontend
│   ├── App.tsx            # Main app
│   ├── App.css            # Styles
│   └── index.tsx          # Entry point
├── server/                # Backend
│   └── index.js           # API server
└── package.json           # Dependencies
```

## Adding new stores

To add a new website as a data source:

1. Add a new function in `server/index.js`:
   ```javascript
   async function fetchNewStorePolos(search, brand, minPrice, maxPrice) {
     // Your code here
   }
   ```

2. Add it to the sources list:
   ```javascript
   const sources = [
     fetchEnhancedFallbackData(search, brand, minPrice, maxPrice),
     fetchEbayPolos(search, brand, minPrice, maxPrice),
     fetchNewStorePolos(search, brand, minPrice, maxPrice), // Add this
   ];
   ```

## What's next

Planned features:
- User accounts
- Save favorite polos
- Price alerts
- More stores
- Mobile app

## Contributing

1. Fork the repo
2. Make your changes
3. Submit a pull request

## License

MIT License - feel free to use this code however you want.

## Questions?

Open an issue on GitHub if you need help or have suggestions.
