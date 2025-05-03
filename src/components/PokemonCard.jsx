import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, StarOff, Plus, X } from 'lucide-react';
import { usePokemon } from '../context/PokemonContext';
import TypeBadge from './TypeBadge';
import { motion, AnimatePresence } from 'framer-motion';

function PokemonCard({ pokemon, showFavoriteButton = true }) {
  const { addFavorite, removeFavorite, isFavorite, teams, addPokemonToTeam } = usePokemon();
  const [isLoading, setIsLoading] = useState(true);
  const [showTeamSelect, setShowTeamSelect] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToTeam, setIsAddingToTeam] = useState(false);
  const [error, setError] = useState(null);
  const teamSelectRef = useRef(null);
  
  // Close team select when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (teamSelectRef.current && !teamSelectRef.current.contains(event.target)) {
        setShowTeamSelect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isFavorite(pokemon.id)) {
        console.log('Removing favorite with id:', pokemon.id);
        await removeFavorite(pokemon.id);
      } else {
        await addFavorite(pokemon);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Show error in UI
      // This is optional - you can uncomment if you have a toast system
      // if (typeof window !== 'undefined') {
      //   addToast(`Failed to ${isFavorite(pokemon.id) ? 'remove' : 'add'} favorite: ${err.message}`, 'error');
      // }
    }
  };

  const handleAddToTeam = async (e, teamId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToTeam) return;
    
    setIsAddingToTeam(true);
    setError(null);
    
    try {
      // Ensure we have the correct Pokemon data structure
      const simplifiedPokemon = {
        id: pokemon.id,
        name: pokemon.name,
        sprites: {
          front_default: pokemon.sprites.front_default,
          other: {
            'official-artwork': {
              front_default: pokemon.sprites.other['official-artwork'].front_default
            }
          }
        },
        types: Array.isArray(pokemon.types) 
          ? pokemon.types.map(type => typeof type === 'string' ? type : type.type.name)
          : [],
        stats: {
          hp: pokemon.stats?.hp || 0,
          attack: pokemon.stats?.attack || 0,
          defense: pokemon.stats?.defense || 0,
          specialAttack: pokemon.stats?.specialAttack || 0,
          specialDefense: pokemon.stats?.specialDefense || 0,
          speed: pokemon.stats?.speed || 0
        }
      };
      
      await addPokemonToTeam(teamId, simplifiedPokemon);
      setShowTeamSelect(false);
    } catch (err) {
      console.error('Error adding to team:', err);
      setError(err.message || 'Failed to add Pokemon to team');
    } finally {
      setIsAddingToTeam(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pokemon-card relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/pokemon/${pokemon.id}`} className="w-full h-full block">
        <div className="relative sprite-container">
          <div className="absolute top-0 right-0 flex gap-2 p-1 z-10">
            {showFavoriteButton && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFavoriteToggle}
                className="rounded-full bg-slate-800/50 hover:bg-slate-800 p-1.5 transition-colors"
                title={isFavorite(pokemon.id) ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite(pokemon.id) ? (
                  <Star size={18} className="text-yellow-400 fill-yellow-400" />
                ) : (
                  <StarOff size={18} className="text-gray-400" />
                )}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowTeamSelect(!showTeamSelect);
                setError(null);
              }}
              className="rounded-full bg-slate-800/50 hover:bg-slate-800 p-1.5 transition-colors"
              title="Add to team"
            >
              <Plus size={18} className="text-gray-400" />
            </motion.button>
          </div>
          
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
            alt={pokemon.name}
            className={`w-4/5 h-4/5 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold capitalize mb-1">
            {pokemon.name.replace(/-/g, ' ')}
          </h3>
          <p className="text-sm text-gray-400 mb-2">#{pokemon.id.toString().padStart(3, '0')}</p>
          
          <div className="flex flex-wrap justify-center gap-1">
            {pokemon.types.map(type => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
        </div>
      </Link>

      <AnimatePresence>
        {showTeamSelect && (
          <motion.div
            ref={teamSelectRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-20 bg-slate-800 rounded-lg shadow-lg p-3"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold">Add to Team</h4>
              <button
                onClick={() => {
                  setShowTeamSelect(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                <X size={16} />
              </button>
            </div>
            
            {error && (
              <div className="mb-2 p-2 bg-red-500/20 text-red-400 text-sm rounded">
                {error}
              </div>
            )}
            
            {teams.length === 0 ? (
              <div className="text-center py-2">
                <p className="text-sm text-gray-400 mb-2">
                  No teams available. Create a team first.
                </p>
                <Link 
                  to="/teams" 
                  className="inline-block px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-md text-sm transition-colors"
                >
                  Go to Teams
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {teams.map(team => (
                  <motion.button
                    key={team.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => handleAddToTeam(e, team.id)}
                    className={`text-left px-3 py-2 rounded-md text-sm flex justify-between items-center transition-colors ${
                      team.pokemons.length >= 6 
                        ? 'bg-slate-700/50 text-gray-500 cursor-not-allowed' 
                        : isAddingToTeam
                          ? 'bg-slate-700/50 cursor-wait'
                          : 'bg-slate-700/30 hover:bg-slate-700/50'
                    }`}
                    disabled={team.pokemons.length >= 6 || isAddingToTeam}
                  >
                    <span className="truncate">{team.name}</span>
                    <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                      {team.pokemons.length}/6
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default PokemonCard;