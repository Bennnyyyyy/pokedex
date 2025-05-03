import { useState, useEffect } from 'react';
import { Search, Plus, X, PlusCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TypeBadge from './TypeBadge';

function CustomOpponentTeam({ 
  onSaveTeam, 
  onCancel, 
  fetchPokemonList, 
  fetchPokemonDetail,
  initialPokemons = []
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPokemons, setSelectedPokemons] = useState(initialPokemons);
  const [isSearching, setIsSearching] = useState(false);
  const [teamName, setTeamName] = useState('Cosmic Rivals');
  const [error, setError] = useState(null);
  
  // Search for Pokémon as the user types
  useEffect(() => {
    const searchPokemon = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        // Try to fetch by exact ID/name first
        try {
          const pokemon = await fetchPokemonDetail(searchTerm.toLowerCase());
          if (pokemon) {
            setSearchResults([{
              id: pokemon.id,
              name: pokemon.name,
              sprites: pokemon.sprites,
              types: pokemon.types.map(t => t.type.name)
            }]);
            setIsSearching(false);
            return;
          }
        } catch (error) {
          // If exact match fails, continue with general search
        }
        
        // Get a list of Pokémon to search through
        const response = await fetchPokemonList(100, 0);
        const filtered = response.results.filter(p => 
          p.name.includes(searchTerm.toLowerCase())
        );
        
        // Limit to top 8 results
        const limitedResults = filtered.slice(0, 8);
        
        // Fetch details for each result
        const detailedResults = await Promise.all(
          limitedResults.map(async (result) => {
            try {
              const details = await fetchPokemonDetail(result.name);
              return {
                id: details.id,
                name: details.name,
                sprites: details.sprites,
                types: details.types.map(t => t.type.name)
              };
            } catch (error) {
              return null;
            }
          })
        );
        
        setSearchResults(detailedResults.filter(p => p !== null));
      } catch (error) {
        console.error('Error searching for Pokémon:', error);
        setError('Failed to search for Pokémon. Please try again.');
      } finally {
        setIsSearching(false);
      }
    };
    
    const debounceTimer = setTimeout(searchPokemon, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchPokemonDetail, fetchPokemonList]);
  
  const addPokemonToTeam = (pokemon) => {
    if (selectedPokemons.length >= 6) {
      setError('Team can have a maximum of 6 Pokémon');
      return;
    }
    
    if (selectedPokemons.some(p => p.id === pokemon.id)) {
      setError('This Pokémon is already in the team');
      return;
    }
    
    setSelectedPokemons([...selectedPokemons, pokemon]);
    setError(null);
  };
  
  const removePokemonFromTeam = (index) => {
    const newTeam = [...selectedPokemons];
    newTeam.splice(index, 1);
    setSelectedPokemons(newTeam);
  };
  
  const handleRandomize = async () => {
    try {
      setIsSearching(true);
      
      // Get 6 random Pokémon IDs (1-898)
      const randomIds = [];
      while (randomIds.length < 6) {
        const randomId = Math.floor(Math.random() * 898) + 1;
        if (!randomIds.includes(randomId)) {
          randomIds.push(randomId);
        }
      }
      
      // Fetch details for each random Pokémon
      const randomPokemons = await Promise.all(
        randomIds.map(async (id) => {
          try {
            const details = await fetchPokemonDetail(id);
            return {
              id: details.id,
              name: details.name,
              sprites: details.sprites,
              types: details.types.map(t => t.type.name)
            };
          } catch (error) {
            return null;
          }
        })
      );
      
      setSelectedPokemons(randomPokemons.filter(p => p !== null));
    } catch (error) {
      console.error('Error randomizing team:', error);
      setError('Failed to create random team. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSaveTeam = () => {
    if (selectedPokemons.length === 0) {
      setError('Team must have at least one Pokémon');
      return;
    }
    
    onSaveTeam({
      name: teamName,
      pokemons: selectedPokemons
    });
  };
  
  return (
    <div className="space-card p-6">
      <h2 className="text-xl font-bold mb-4">Create Custom Opponent Team</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Team Name</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="space-input w-full"
          placeholder="Enter team name"
        />
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm text-gray-400">Selected Pokémon ({selectedPokemons.length}/6)</label>
          <button
            onClick={handleRandomize}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            disabled={isSearching}
          >
            <RefreshCw size={14} />
            Randomize
          </button>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {selectedPokemons.map((pokemon, index) => (
            <div key={index} className="space-card !bg-slate-800/50 p-2 relative">
              <button
                onClick={() => removePokemonFromTeam(index)}
                className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 hover:bg-red-500"
                title="Remove from team"
              >
                <X size={12} />
              </button>
              <div className="flex flex-col items-center">
                <img
                  src={pokemon.sprites.front_default}
                  alt={pokemon.name}
                  className="w-16 h-16 object-contain"
                />
                <p className="text-xs text-center capitalize truncate w-full">
                  {pokemon.name.replace(/-/g, ' ')}
                </p>
              </div>
            </div>
          ))}
          
          {Array.from({ length: 6 - selectedPokemons.length }).map((_, index) => (
            <div 
              key={`empty-${index}`} 
              className="space-card border-dashed border-2 border-gray-600 p-2 flex flex-col items-center justify-center h-[80px]"
            >
              <Plus size={20} className="text-gray-500 mb-1" />
              <p className="text-xs text-gray-500">Add</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Search Pokémon</label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="space-input w-full pl-10"
            placeholder="Search by name or ID"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 max-h-48 overflow-y-auto overflow-x-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {searchResults.map(pokemon => (
                <motion.button
                  key={pokemon.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addPokemonToTeam(pokemon)}
                  className="space-card !bg-slate-800/50 p-2 hover:border-purple-500/50 transition-colors text-left"
                  disabled={selectedPokemons.length >= 6}
                >
                  <div className="flex items-center">
                    <img
                      src={pokemon.sprites.front_default}
                      alt={pokemon.name}
                      className="w-12 h-12 object-contain mr-2"
                    />
                    <div>
                      <p className="text-sm capitalize font-medium">
                        {pokemon.name.replace(/-/g, ' ')}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {pokemon.types.map(type => (
                          <TypeBadge key={type} type={type} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onCancel} className="space-button !bg-gray-700 hover:!bg-gray-600">
          Cancel
        </button>
        <button 
          onClick={handleSaveTeam}
          className="space-button"
          disabled={selectedPokemons.length === 0}
        >
          Save Team
        </button>
      </div>
    </div>
  );
}

export default CustomOpponentTeam;