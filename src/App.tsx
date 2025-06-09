import React, { useState } from 'react';
import './App.css';

interface PoloShirt {
  id: number;
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

const mockPoloData: PoloShirt[] = [
  {
    id: 1,
    name: "Classic Fit Polo",
    brand: "Ralph Lauren",
    price: 89.50,
    originalPrice: 110.00,
    image: "https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=400&h=400&fit=crop",
    store: "Ralph Lauren",
    colors: ["Navy", "White", "Red"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.5,
    reviews: 234
  },
  {
    id: 2,
    name: "Lacoste L.12.12 Polo",
    brand: "Lacoste",
    price: 95.00,
    image: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=400&h=400&fit=crop",
    store: "Lacoste",
    colors: ["Green", "Navy", "White"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.7,
    reviews: 189
  },
  {
    id: 3,
    name: "Performance Polo",
    brand: "Nike",
    price: 65.00,
    originalPrice: 75.00,
    image: "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=400&h=400&fit=crop",
    store: "Nike",
    colors: ["Black", "Navy", "Gray"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.3,
    reviews: 156
  },
  {
    id: 4,
    name: "Premium Cotton Polo",
    brand: "Uniqlo",
    price: 29.90,
    image: "https://images.unsplash.com/photo-1622445276096-b7e7fb5ab947?w=400&h=400&fit=crop",
    store: "Uniqlo",
    colors: ["White", "Black", "Blue", "Gray"],
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.2,
    reviews: 89
  },
  {
    id: 5,
    name: "Luxury Pique Polo",
    brand: "Polo Ralph Lauren",
    price: 125.00,
    image: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=400&h=400&fit=crop",
    store: "Nordstrom",
    colors: ["Navy", "White", "Pink"],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.6,
    reviews: 278
  },
  {
    id: 6,
    name: "Stretch Performance Polo",
    brand: "Adidas",
    price: 55.00,
    originalPrice: 70.00,
    image: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=400&h=400&fit=crop",
    store: "Adidas",
    colors: ["Black", "White", "Navy"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.4,
    reviews: 145
  }
];

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
  const [selectedPolo, setSelectedPolo] = useState<PoloShirt | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [searchTerm, setSearchTerm] = useState('');

  const brands = Array.from(new Set(mockPoloData.map(polo => polo.brand)));

  const filteredPolos = mockPoloData.filter(polo => {
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(polo.brand);
    const matchesPrice = polo.price >= priceRange[0] && polo.price <= priceRange[1];
    const matchesSearch = polo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         polo.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBrand && matchesPrice && matchesSearch;
  });

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏆 Polo Central</h1>
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
            <h2>Found {filteredPolos.length} polo shirts</h2>
          </div>
          <div className="polo-grid">
            {filteredPolos.map(polo => (
              <PoloCard
                key={polo.id}
                polo={polo}
                onClick={() => setSelectedPolo(polo)}
              />
            ))}
          </div>
        </main>
      </div>

      <Modal polo={selectedPolo} onClose={() => setSelectedPolo(null)} />
    </div>
  );
};

export default App; 