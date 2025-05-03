import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import axios from 'axios';

function SearchFilter({ onSearch, onFilter, initialSearchTerm = '', initialTypes = [] }) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedTypes, setSelectedTypes] = useState(initialTypes);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchTypes = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get('https://pokeapi.co/api/v2/type');
        // Filter out 'unknown' and 'shadow' types
        const filteredTypes = res.data.results
          .filter(type => !['unknown', 'shadow'].includes(type.name))
          .map(type => type.name);
        setTypes(filteredTypes);
      } catch (err) {
        console.error('Error fetching types:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTypes();
  }, []);
  
  // Update search as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm); // Immediate search on form submit
  };
  
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleTypeToggle = (type) => {
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    setSelectedTypes(newSelectedTypes);
    onFilter(newSelectedTypes);
  };
  
  const clearFilters = () => {
    setSelectedTypes([]);
    onFilter([]);
  };
  
  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchInputChange}
            placeholder="Search Pokémon by name or ID"
            className="space-input w-full pl-10"
            aria-label="Search Pokémon"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          {searchTerm && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={() => {
                setSearchTerm('');
                onSearch('');
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button type="submit" className="space-button">
          Search
        </button>
        <button 
          type="button" 
          className={`space-button ${isFilterOpen ? 'from-purple-700 to-indigo-700' : ''}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          aria-label="Toggle filters"
          aria-expanded={isFilterOpen}
        >
          <Filter size={18} />
        </button>
      </form>
      
      {isFilterOpen && (
        <div className="space-card p-4 mb-4">
          <div className="flex justify-between mb-3">
            <h3 className="text-lg font-semibold">Filter by Type</h3>
            {selectedTypes.length > 0 && (
              <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-white flex items-center">
                Clear <X size={14} className="ml-1" />
              </button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`badge capitalize transition-all ${
                    selectedTypes.includes(type)
                      ? `badge-${type} scale-110`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchFilter;