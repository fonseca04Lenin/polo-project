const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Cache for 5 minutes to avoid hitting rate limits
const cache = new NodeCache({ stdTTL: 300 });

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../build')));

// API Routes
app.get('/api/polos', async (req, res) => {
  try {
    const { search = '', brand = '', minPrice = 0, maxPrice = 1000 } = req.query;
    
    // Check cache first
    const cacheKey = `polos_${search}_${brand}_${minPrice}_${maxPrice}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    // Fetch data from multiple sources
    const poloData = await fetchPoloData(search, brand, minPrice, maxPrice);
    
    // Cache the results
    cache.set(cacheKey, poloData);
    
    res.json(poloData);
  } catch (error) {
    console.error('Error fetching polo data:', error);
    res.status(500).json({ error: 'Failed to fetch polo data' });
  }
});

app.get('/api/polos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const poloData = await fetchPoloData();
    const polo = poloData.find(p => p.id.toString() === id);
    
    if (!polo) {
      return res.status(404).json({ error: 'Polo not found' });
    }
    
    res.json(polo);
  } catch (error) {
    console.error('Error fetching polo details:', error);
    res.status(500).json({ error: 'Failed to fetch polo details' });
  }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    
    const poloData = await fetchPoloData(q);
    res.json(poloData);
  } catch (error) {
    console.error('Error searching polos:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Main data fetching function
async function fetchPoloData(search = '', brand = '', minPrice = 0, maxPrice = 1000) {
  const allPolos = [];
  
  try {
    // Fetch from multiple sources concurrently
    const [amazonPolos, ebayPolos, walmartPolos] = await Promise.allSettled([
      fetchAmazonPolos(search, brand, minPrice, maxPrice),
      fetchEbayPolos(search, brand, minPrice, maxPrice),
      fetchWalmartPolos(search, brand, minPrice, maxPrice)
    ]);

    // Add successful results
    if (amazonPolos.status === 'fulfilled') {
      allPolos.push(...amazonPolos.value);
    }
    if (ebayPolos.status === 'fulfilled') {
      allPolos.push(...ebayPolos.value);
    }
    if (walmartPolos.status === 'fulfilled') {
      allPolos.push(...walmartPolos.value);
    }

    // Filter by search term and price range
    const filteredPolos = allPolos.filter(polo => {
      const matchesSearch = !search || 
        polo.name.toLowerCase().includes(search.toLowerCase()) ||
        polo.brand.toLowerCase().includes(search.toLowerCase());
      
      const matchesPrice = polo.price >= minPrice && polo.price <= maxPrice;
      
      return matchesSearch && matchesPrice;
    });

    return filteredPolos;
  } catch (error) {
    console.error('Error in fetchPoloData:', error);
    // Return fallback data if all sources fail
    return getFallbackData();
  }
}

// Amazon scraping function
async function fetchAmazonPolos(search, brand, minPrice, maxPrice) {
  try {
    // Note: Amazon has strict anti-scraping measures
    // In production, you'd need to use their official API
    const searchTerm = search || 'polo shirt';
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&i=fashion-mens-clothing&rh=n%3A7141123011%2Cn%3A7147441011`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const polos = [];

    $('[data-component-type="s-search-result"]').each((i, element) => {
      if (i >= 10) return; // Limit to 10 results

      const title = $(element).find('h2 a span').text().trim();
      const priceText = $(element).find('.a-price-whole').text().trim();
      const image = $(element).find('img').attr('src');
      const rating = $(element).find('.a-icon-star-small .a-icon-alt').text().trim();
      const reviews = $(element).find('.a-size-base').text().trim();

      if (title.toLowerCase().includes('polo') && priceText) {
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        
        if (price >= minPrice && price <= maxPrice) {
          polos.push({
            id: `amazon_${i}`,
            name: title,
            brand: extractBrand(title),
            price: price,
            image: image || 'https://via.placeholder.com/300x300?text=Polo+Shirt',
            store: 'Amazon',
            colors: ['Navy', 'White', 'Black'],
            sizes: ['S', 'M', 'L', 'XL'],
            rating: parseRating(rating),
            reviews: parseInt(reviews) || 0
          });
        }
      }
    });

    return polos;
  } catch (error) {
    console.error('Amazon scraping failed:', error.message);
    return [];
  }
}

// eBay scraping function
async function fetchEbayPolos(search, brand, minPrice, maxPrice) {
  try {
    const searchTerm = search || 'polo shirt';
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchTerm)}&_sacat=0&_udlo=${minPrice}&_udhi=${maxPrice}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const polos = [];

    $('.s-item').each((i, element) => {
      if (i >= 10) return; // Limit to 10 results

      const title = $(element).find('.s-item__title').text().trim();
      const priceText = $(element).find('.s-item__price').text().trim();
      const image = $(element).find('.s-item__image-img').attr('src');
      const rating = $(element).find('.x-star-rating').text().trim();

      if (title.toLowerCase().includes('polo') && priceText) {
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        
        if (price >= minPrice && price <= maxPrice) {
          polos.push({
            id: `ebay_${i}`,
            name: title,
            brand: extractBrand(title),
            price: price,
            image: image || 'https://via.placeholder.com/300x300?text=Polo+Shirt',
            store: 'eBay',
            colors: ['Navy', 'White', 'Black'],
            sizes: ['S', 'M', 'L', 'XL'],
            rating: parseRating(rating),
            reviews: 0
          });
        }
      }
    });

    return polos;
  } catch (error) {
    console.error('eBay scraping failed:', error.message);
    return [];
  }
}

// Walmart scraping function
async function fetchWalmartPolos(search, brand, minPrice, maxPrice) {
  try {
    const searchTerm = search || 'polo shirt';
    const url = `https://www.walmart.com/search?q=${encodeURIComponent(searchTerm)}&min_price=${minPrice}&max_price=${maxPrice}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const polos = [];

    $('[data-item-id]').each((i, element) => {
      if (i >= 10) return; // Limit to 10 results

      const title = $(element).find('[data-testid="product-title"]').text().trim();
      const priceText = $(element).find('[data-testid="price-wrap"]').text().trim();
      const image = $(element).find('img').attr('src');

      if (title.toLowerCase().includes('polo') && priceText) {
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        
        if (price >= minPrice && price <= maxPrice) {
          polos.push({
            id: `walmart_${i}`,
            name: title,
            brand: extractBrand(title),
            price: price,
            image: image || 'https://via.placeholder.com/300x300?text=Polo+Shirt',
            store: 'Walmart',
            colors: ['Navy', 'White', 'Black'],
            sizes: ['S', 'M', 'L', 'XL'],
            rating: 4.0,
            reviews: 0
          });
        }
      }
    });

    return polos;
  } catch (error) {
    console.error('Walmart scraping failed:', error.message);
    return [];
  }
}

// Helper functions
function extractBrand(title) {
  const brands = ['Ralph Lauren', 'Lacoste', 'Nike', 'Adidas', 'Tommy Hilfiger', 'Calvin Klein', 'Polo', 'Lacoste'];
  for (const brand of brands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return 'Unknown Brand';
}

function parseRating(ratingText) {
  if (!ratingText) return 4.0;
  const match = ratingText.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 4.0;
}

function getFallbackData() {
  // Return some fallback data if all scraping fails
  return [
    {
      id: 'fallback_1',
      name: 'Classic Polo Shirt',
      brand: 'Ralph Lauren',
      price: 89.50,
      image: 'https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=400&h=400&fit=crop',
      store: 'Amazon',
      colors: ['Navy', 'White', 'Red'],
      sizes: ['S', 'M', 'L', 'XL'],
      rating: 4.5,
      reviews: 234
    }
  ];
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 