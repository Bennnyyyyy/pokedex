import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePokemon } from '../context/PokemonContext';
import { ArrowLeft, Star, StarOff, Plus, Zap } from 'lucide-react';
import StatBar from '../components/StatBar';
import TypeBadge from '../components/TypeBadge';
import { motion } from 'framer-motion';

function PokemonDetailPage() {
  const { id } = useParams();
  const { 
    fetchPokemonDetail, 
    fetchPokemonSpecies, 
    addFavorite, 
    removeFavorite, 
    isFavorite,
    teams,
    addPokemonToTeam
  } = usePokemon();
  
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShiny, setShowShiny] = useState(false);
  const [isAddingToTeam, setIsAddingToTeam] = useState(false);
  
  useEffect(() => {
    const loadPokemonData = async () => {
      setIsLoading(true);
      try {
        const pokemonData = await fetchPokemonDetail(id);
        setPokemon(pokemonData);
        
        try {
          const speciesData = await fetchPokemonSpecies(pokemonData.species.name);
          setSpecies(speciesData);
        } catch (speciesErr) {
          console.error('Error loading species data:', speciesErr);
          // We don't set an error here since the main Pokemon data loaded successfully
        }
      } catch (err) {
        console.error('Error loading pokemon data:', err);
        setError('Failed to load Pokémon data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPokemonData();
  }, [id]);
  
  const handleFavoriteToggle = async () => {
    if (!pokemon) return;
    
    try {
      if (isFavorite(pokemon.id)) {
        await removeFavorite(pokemon.id);
      } else {
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
          types: pokemon.types.map(type => type.type.name)
        };
        await addFavorite(simplifiedPokemon);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };
  
  const handleAddToTeam = async (teamId) => {
    if (!pokemon) return;
    
    try {
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
        types: pokemon.types.map(type => type.type.name),
        stats: {
          hp: pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat,
          attack: pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat,
          defense: pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat,
          specialAttack: pokemon.stats.find(stat => stat.stat.name === 'special-attack').base_stat,
          specialDefense: pokemon.stats.find(stat => stat.stat.name === 'special-defense').base_stat,
          speed: pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat,
        },
        moves: pokemon.moves.slice(0, 4).map(move => move.move.name)
      };
      
      await addPokemonToTeam(teamId, simplifiedPokemon);
      setIsAddingToTeam(false);
    } catch (err) {
      console.error('Error adding to team:', err);
      alert(err.message);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error || !pokemon) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-gray-300">{error || 'Failed to load Pokémon data.'}</p>
        <Link to="/pokedex" className="space-button mt-4 inline-flex items-center">
          <ArrowLeft size={18} className="mr-2" />
          Back to Pokédex
        </Link>
      </div>
    );
  }
  
  // Extract English flavor text
  const flavorText = species?.flavor_text_entries?.find(
    entry => entry.language.name === 'en'
  )?.flavor_text.replace(/\f/g, ' ');
  
  return (
    <div>
      <Link to="/pokedex" className="space-button mb-6 inline-flex items-center">
        <ArrowLeft size={18} className="mr-2" />
        Back to Pokédex
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="space-card p-6 mb-6">
            <div className="relative">
              <div className="absolute top-0 right-0 flex gap-2">
                <button
                  onClick={() => setShowShiny(!showShiny)}
                  className="space-button !p-2 !text-xs"
                >
                  {showShiny ? 'Normal' : 'Shiny'}
                </button>
                <button
                  onClick={handleFavoriteToggle}
                  className="space-button !p-2"
                >
                  {isFavorite(pokemon.id) ? (
                    <Star size={20} className="text-yellow-400 fill-yellow-400" />
                  ) : (
                    <StarOff size={20} />
                  )}
                </button>
              </div>
              
              <div className="h-64 flex items-center justify-center">
                <img
                  src={showShiny 
                    ? (pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny) 
                    : (pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default)
                  }
                  alt={pokemon.name}
                  className="max-h-full object-contain filter drop-shadow-[0_0_8px_rgba(124,58,237,0.4)]"
                />
              </div>
            </div>
            
            <div className="text-center mt-4">
              <h1 className="text-3xl font-bold capitalize mb-1">
                {pokemon.name.replace(/-/g, ' ')}
              </h1>
              <p className="text-gray-400 mb-3">#{pokemon.id.toString().padStart(3, '0')}</p>
              
              <div className="flex justify-center gap-2 mb-4">
                {pokemon.types.map(type => (
                  <TypeBadge key={type.type.name} type={type.type.name} />
                ))}
              </div>
              
              <div className="flex justify-between text-sm text-gray-300 mb-4">
                <div>
                  <p className="mb-1">Height</p>
                  <p className="font-semibold">{pokemon.height / 10}m</p>
                </div>
                <div>
                  <p className="mb-1">Weight</p>
                  <p className="font-semibold">{pokemon.weight / 10}kg</p>
                </div>
                <div>
                  <p className="mb-1">Base Exp</p>
                  <p className="font-semibold">{pokemon.base_experience || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Link to={`/battle?pokemon=${pokemon.id}`} className="space-button flex-1 flex items-center justify-center">
                  <Zap size={18} className="mr-2" />
                  Battle
                </Link>
                <button 
                  onClick={() => setIsAddingToTeam(!isAddingToTeam)} 
                  className="space-button flex-1 flex items-center justify-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add to Team
                </button>
              </div>
              
              {isAddingToTeam && (
                <div className="mt-4 space-card p-4 border-2 border-purple-500/50">
                  <h3 className="text-lg font-semibold mb-2">Select Team</h3>
                  {teams.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                      No teams available. Create a team first.
                      <Link to="/teams" className="text-blue-400 hover:text-blue-300 ml-1">
                        Go to Teams
                      </Link>
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                      {teams.map(team => (
                        <button
                          key={team.id}
                          onClick={() => handleAddToTeam(team.id)}
                          className="space-button !py-2 text-left flex items-center justify-between"
                        >
                          <span>{team.name}</span>
                          <span className="text-sm text-gray-300">
                            {team.pokemons.length}/6
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2"
        >
          {flavorText && (
            <div className="space-card p-6 mb-6">
              <h2 className="text-xl font-bold mb-3">Description</h2>
              <p className="text-gray-300 italic">{flavorText}</p>
            </div>
          )}
          
          <div className="space-card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Base Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {pokemon.stats.map(stat => (
                <StatBar 
                  key={stat.stat.name}
                  statName={stat.stat.name}
                  value={stat.base_stat}
                />
              ))}
            </div>
          </div>
          
          <div className="space-card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Abilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pokemon.abilities.map(ability => (
                <div key={ability.ability.name} className="space-card !bg-slate-800/50 p-4">
                  <h3 className="font-semibold capitalize mb-1">
                    {ability.ability.name.replace(/-/g, ' ')}
                    {ability.is_hidden && (
                      <span className="ml-2 text-xs bg-purple-800/70 px-2 py-1 rounded-full">
                        Hidden
                      </span>
                    )}
                  </h3>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-card p-6">
            <h2 className="text-xl font-bold mb-4">Moves</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              {pokemon.moves.slice(0, 20).map(move => (
                <div key={move.move.name} className="bg-slate-800/50 px-3 py-2 rounded-md">
                  <p className="capitalize text-sm">
                    {move.move.name.replace(/-/g, ' ')}
                  </p>
                </div>
              ))}
            </div>
            {pokemon.moves.length > 20 && (
              <p className="text-gray-400 text-sm text-center mt-3">
                Showing 20 of {pokemon.moves.length} moves
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PokemonDetailPage;