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
}

const PoloCard: React.FC<{ polo: PoloShirt; onClick: () => void }> = ({ polo, onClick }) => {
  return (
    <div className="polo-card" onClick={onClick}>
      <div className="polo-image-container">
        <img src={polo.image} alt={polo.name} className="polo-image" />
        {polo.originalPrice && polo.originalPrice > polo.price && (
          <div className="sale-badge">SALE</div>
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
}> = ({ brands, selectedBrands, onBrandChange, priceRange, onPriceChange }) => {
  const handleBrandToggle = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandChange(selectedBrands.filter(b => b !== brand));
    } else {
      onBrandChange([...selectedBrands, brand]);
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

const Modal: React.FC<{ polo: PoloShirt | null; onClose: () => void }> = ({ polo, onClose }) => {
  if (!polo) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-body">
          <div className="modal-images">
            <img src={polo.image} alt={polo.name} className="modal-main-image" />
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
            <a href="#" className="shop-button">Shop at {polo.store}</a>
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err: any) {
        setError('Failed to fetch polo shirts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPolos();
  }, [searchTerm, priceRange, selectedBrands]);

  // Get all brands from current polos
  const brands = Array.from(new Set(polos.map(polo => polo.brand)));

  // Filter polos by selected brands (if multiple)
  const filteredPolos = selectedBrands.length > 1
    ? polos.filter(polo => selectedBrands.includes(polo.brand))
    : polos;

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
          <FilterSection
            brands={brands}
            selectedBrands={selectedBrands}
            onBrandChange={setSelectedBrands}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
          />
        </aside>

        <main className="main-content">
          <div className="results-header">
            <h2>
              {loading ? 'Loading polo shirts...' : `Found ${filteredPolos.length} polo shirts`}
            </h2>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
          </div>
          <div className="polo-grid">
            {!loading && filteredPolos.map(polo => (
              <PoloCard
                key={polo.id}
                polo={polo}
                onClick={() => setSelectedPolo(polo)}
              />
            ))}
            {loading && <div>Loading...</div>}
          </div>
        </main>
      </div>

      <Modal polo={selectedPolo} onClose={() => setSelectedPolo(null)} />
    </div>
  );
};

export default App; 