import { useState, useEffect } from 'react';
import { usePokemon } from '../context/PokemonContext';
import PokemonGrid from '../components/PokemonGrid';
import Pagination from '../components/Pagination';
import SearchFilter from '../components/SearchFilter';
import { motion } from 'framer-motion';

function PokedexPage() {
  const { fetchPokemonList, fetchPokemonDetail } = usePokemon();
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  
  const itemsPerPage = 20;
  
  // Initial load of pokemons
  useEffect(() => {
    const loadInitialPokemons = async () => {
      setIsLoading(true);
      try {
        const response = await fetchPokemonList(itemsPerPage, (currentPage - 1) * itemsPerPage);
        setTotalCount(response.count);
        setTotalPages(Math.ceil(response.count / itemsPerPage));
        
        const pokemonDetails = await Promise.all(
          response.results.map(async (pokemon) => {
            const details = await fetchPokemonDetail(pokemon.name);
            return {
              id: details.id,
              name: details.name,
              sprites: details.sprites,
              types: details.types.map(type => type.type.name),
              stats: {
                hp: details.stats.find(stat => stat.stat.name === 'hp').base_stat,
                attack: details.stats.find(stat => stat.stat.name === 'attack').base_stat,
                defense: details.stats.find(stat => stat.stat.name === 'defense').base_stat,
                specialAttack: details.stats.find(stat => stat.stat.name === 'special-attack').base_stat,
                specialDefense: details.stats.find(stat => stat.stat.name === 'special-defense').base_stat,
                speed: details.stats.find(stat => stat.stat.name === 'speed').base_stat,
              }
            };
          })
        );
        
        setPokemons(pokemonDetails);
        setFilteredPokemons(pokemonDetails);
      } catch (err) {
        console.error('Error loading pokemons:', err);
        setError('Failed to load Pokémon data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialPokemons();
  }, [currentPage]);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const handleSearch = (term) => {
    setSearchTerm(term);
    
    // Debounce search to avoid excessive filtering on rapid typing
    const timerId = setTimeout(() => {
      applyFilters(term, selectedTypes);
    }, 300);
    
    return () => clearTimeout(timerId);
  };
  
  const handleFilter = (types) => {
    setSelectedTypes(types);
    applyFilters(searchTerm, types);
  };
  
  const applyFilters = (term, types) => {
    let filtered = [...pokemons];
    
    // Apply search term filter
    if (term) {
      const lowerTerm = term.toLowerCase();
      
      // Try to match by ID first (exact match)
      const idMatches = filtered.filter(pokemon => 
        pokemon.id.toString() === lowerTerm
      );
      
      if (idMatches.length > 0) {
        filtered = idMatches;
      } else {
        // Then try to match by name (partial match)
        filtered = filtered.filter(pokemon => 
          pokemon.name.toLowerCase().includes(lowerTerm)
        );
        
        // Sort results by relevance (how early the match appears in the name)
        filtered.sort((a, b) => {
          const aIndex = a.name.toLowerCase().indexOf(lowerTerm);
          const bIndex = b.name.toLowerCase().indexOf(lowerTerm);
          return aIndex - bIndex;
        });
      }
    }
    
    // Apply type filter
    if (types.length > 0) {
      filtered = filtered.filter(pokemon => 
        // We can use .every for AND logic (must have all selected types)
        // Or .some for OR logic (must have at least one of the selected types)
        // Currently using AND logic
        types.every(type => pokemon.types.includes(type))
      );
    }
    
    setFilteredPokemons(filtered);
  };
  
  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }
  
  return (
    <div>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Pokémon Pokédex</h1>
        <p className="text-gray-400">Explore the Different Pokémon species</p>
      </motion.div>
      
      <SearchFilter onSearch={handleSearch} onFilter={handleFilter} />
      
      <PokemonGrid pokemons={filteredPokemons} isLoading={isLoading} />
      
      {!searchTerm && selectedTypes.length === 0 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default PokedexPage;