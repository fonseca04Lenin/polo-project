import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

interface PoloShirt {
  id: number | string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  store: string;
  colors: string[];
  sizes: string[];
  rating: number;
  reviews: number;
  location?: string;
}

interface Store {
  id: string;
  name: string;
  logo: string;
  description: string;
}

type SortOption = 'price-low' | 'price-high' | 'rating' | 'reviews' | 'name';

// Store data with logos and descriptions
const AVAILABLE_STORES: Store[] = [
  {
    id: 'uniqlo',
    name: 'Uniqlo',
    logo: 'https://via.placeholder.com/80x40/000000/ffffff?text=UNIQLO',
    description: 'Japanese casual wear retailer'
  },
  {
    id: 'jcrew',
    name: 'J.Crew',
    logo: 'https://via.placeholder.com/80x40/1f2937/ffffff?text=J.CREW',
    description: 'American clothing retailer'
  },
  {
    id: 'zara',
    name: 'Zara',
    logo: 'https://via.placeholder.com/80x40/374151/ffffff?text=ZARA',
    description: 'Spanish fast fashion retailer'
  }
];

const PoloCard: React.FC<{ polo: PoloShirt; onClick: () => void }> = ({ polo, onClick }) => {
  const discount = polo.originalPrice ? Math.round(((polo.originalPrice - polo.price) / polo.originalPrice) * 100) : 0;
  
  return (
    <div className="polo-card" onClick={onClick}>
      <div className="polo-image-container">
        <img src={polo.image} alt={polo.name} className="polo-image" />
        {polo.originalPrice && polo.originalPrice > polo.price && (
          <div className="sale-badge">
            <span className="discount-text">-{discount}%</span>
            <span className="sale-text">SALE</span>
          </div>
        )}
        {polo.location && (
          <div className="location-badge">{polo.location}</div>
        )}
      </div>
      <div className="polo-info">
        <div className="polo-brand">{polo.brand}</div>
        <div className="polo-name">{polo.name}</div>
        <div className="polo-store">Available at {polo.store}</div>
        <div className="polo-rating">
          <span className="stars">{'★'.repeat(Math.floor(polo.rating))}</span>
          <span className="rating-text">({polo.reviews})</span>
        </div>
        <div className="polo-colors">
          {polo.colors.slice(0, 3).map((color, index) => (
            <span key={index} className="color-dot" style={{backgroundColor: color.toLowerCase()}}></span>
          ))}
          {polo.colors.length > 3 && <span className="more-colors">+{polo.colors.length - 3}</span>}
        </div>
        <div className="polo-price">
          <span className="current-price">${polo.price}</span>
          {polo.originalPrice && polo.originalPrice > polo.price && (
            <span className="original-price">${polo.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterSection: React.FC<{
  brands: string[];
  selectedBrands: string[];
  onBrandChange: (brands: string[]) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  selectedStores: string[];
  onStoreChange: (stores: string[]) => void;
}> = ({ brands, selectedBrands, onBrandChange, priceRange, onPriceChange, selectedStores, onStoreChange }) => {
  const handleBrandToggle = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandChange(selectedBrands.filter(b => b !== brand));
    } else {
      onBrandChange([...selectedBrands, brand]);
    }
  };

  const handleStoreToggle = (storeId: string) => {
    if (selectedStores.includes(storeId)) {
      onStoreChange(selectedStores.filter(s => s !== storeId));
    } else {
      onStoreChange([...selectedStores, storeId]);
    }
  };

  return (
    <div className="filters">
      <h3>Filters</h3>
      
      <div className="filter-section">
        <h4>Brands</h4>
        {brands.map(brand => (
          <label key={brand} className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedBrands.includes(brand)}
              onChange={() => handleBrandToggle(brand)}
            />
            {brand}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h4>Stores</h4>
        {AVAILABLE_STORES.map(store => (
          <label key={store.id} className="filter-checkbox store-checkbox">
            <input
              type="checkbox"
              checked={selectedStores.includes(store.id)}
              onChange={() => handleStoreToggle(store.id)}
            />
            <div className="store-logo-container">
              <img src={store.logo} alt={store.name} className="store-logo" />
              <div className="store-info">
                <span className="store-name">{store.name}</span>
                <span className="store-description">{store.description}</span>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={priceRange[0]}
            onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange[1]}
            onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
          />
        </div>
      </div>
    </div>
  );
};

const SortSection: React.FC<{
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}> = ({ sortBy, onSortChange }) => {
  return (
    <div className="sort-section">
      <label htmlFor="sort-select">Sort by:</label>
      <select 
        id="sort-select"
        value={sortBy} 
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="sort-select"
      >
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="rating">Rating</option>
        <option value="reviews">Most Reviews</option>
        <option value="name">Name A-Z</option>
      </select>
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Searching for polo shirts...</p>
  </div>
);

const Modal: React.FC<{ polo: PoloShirt | null; onClose: () => void }> = ({ polo, onClose }) => {
  if (!polo) return null;
  
  const discount = polo.originalPrice ? Math.round(((polo.originalPrice - polo.price) / polo.originalPrice) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-body">
          <div className="modal-images">
            <img src={polo.image} alt={polo.name} className="modal-main-image" />
            {polo.originalPrice && polo.originalPrice > polo.price && (
              <div className="modal-sale-badge">-{discount}% OFF</div>
            )}
          </div>
          <div className="modal-details">
            <h2>{polo.brand}</h2>
            <h3>{polo.name}</h3>
            <div className="modal-rating">
              <span className="stars">{'★'.repeat(Math.floor(polo.rating))}</span>
              <span>{polo.rating} ({polo.reviews} reviews)</span>
            </div>
            <div className="modal-price">
              <span className="current-price">${polo.price}</span>
              {polo.originalPrice && polo.originalPrice > polo.price && (
                <span className="original-price">${polo.originalPrice}</span>
              )}
            </div>
            <div className="modal-section">
              <h4>Available Colors:</h4>
              <div className="color-options">
                {polo.colors.map((color, index) => (
                  <span key={index} className="color-option">{color}</span>
                ))}
              </div>
            </div>
            <div className="modal-section">
              <h4>Available Sizes:</h4>
              <div className="size-options">
                {polo.sizes.map((size, index) => (
                  <span key={index} className="size-option">{size}</span>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <a href="#" className="shop-button">Shop at {polo.store}</a>
              <button className="wishlist-button">Add to Wishlist</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [polos, setPolos] = useState<PoloShirt[]>([]);
  const [selectedPolo, setSelectedPolo] = useState<PoloShirt | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('price-low');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch polos from backend
  useEffect(() => {
    const fetchPolos = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          search: searchTerm,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
        };
        if (selectedBrands.length === 1) {
          params.brand = selectedBrands[0];
        }
        const res = await axios.get('/api/polos', { params });
        setPolos(res.data);
        setCurrentPage(1); // Reset to first page when filters change
      } catch (err: any) {
        setError('Failed to fetch polo shirts. Please try again.');
        setPolos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPolos();
  }, [searchTerm, priceRange, selectedBrands]);





  // Get all brands from current polos
  const brands = Array.from(new Set(polos.map(polo => polo.brand)));

  // Filter and sort polos
  const filteredPolos = polos
    .filter(polo => {
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(polo.brand);
      const matchesStore = selectedStores.length === 0 || selectedStores.includes(polo.store.toLowerCase().replace(/\s+/g, ''));
      return matchesBrand && matchesStore;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviews - a.reviews;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredPolos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPolos = filteredPolos.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="App">
      <header className="app-header">
        <h1>Polo Central</h1>
        <p>Your one-stop destination for polo shirts from all your favorite stores</p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search polo shirts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      
      <div className="app-content">
        <aside className="sidebar">
          <div className="store-selection-header">
            <h3>Choose Your Stores</h3>
            <p>Select which stores to search for polo shirts</p>
          </div>
          <FilterSection
            brands={brands}
            selectedBrands={selectedBrands}
            onBrandChange={setSelectedBrands}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            selectedStores={selectedStores}
            onStoreChange={setSelectedStores}
          />
        </aside>
        
        <main className="main-content">
          <div className="results-header">
            <div className="results-info">
              <h2>
                {loading ? 'Loading polo shirts...' : `Found ${filteredPolos.length} polo shirts`}
              </h2>
              {error && <div className="error-message">{error}</div>}
            </div>
            <SortSection sortBy={sortBy} onSortChange={setSortBy} />
          </div>
          
          <div className="polo-grid">
            {loading ? (
              <LoadingSpinner />
            ) : (
              paginatedPolos.map(polo => (
                <PoloCard
                  key={polo.id}
                  polo={polo}
                  onClick={() => setSelectedPolo(polo)}
                />
              ))
            )}
          </div>
          
          {!loading && totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
      
      <Modal polo={selectedPolo} onClose={() => setSelectedPolo(null)} />
    </div>
  );
};

export default App; 