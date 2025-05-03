import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Zap, Clock, Shield, Trash2 } from 'lucide-react';
import { formatPokemonName } from '../utils/pokemonUtils';

function BattleCard({ 
  battle, 
  expanded = false, 
  onDelete = null, 
  onToggleExpand = null,
  showActions = true
}) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  const toggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (onToggleExpand) {
      onToggleExpand(newExpandedState);
    }
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(battle);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'hard': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };
  
  const isWinner = () => {
    if (battle.type === 'team') {
      return battle.winner === battle.playerTeam.id;
    } else {
      return battle.winner === battle.playerPokemon.id;
    }
  };

  return (
    <motion.div
      layout
      className="space-card p-4"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          {battle.type === 'team' ? (
            <Users className="text-purple-400" size={20} />
          ) : (
            <Zap className="text-blue-400" size={20} />
          )}
          <h3 className="font-bold">
            {battle.type === 'team' ? 'Team Battle' : 'Single Battle'}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(battle.difficulty)}`}>
            {battle.difficulty}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Clock size={14} />
            <span>{formatDate(battle.date)}</span>
          </div>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300"
              title="Delete battle record"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-3">
        {/* Player/Team */}
        <div className="text-center">
          {battle.type === 'team' ? (
            <div>
              <h4 className="font-medium mb-2">{battle.playerTeam.name}</h4>
              <div className="flex flex-wrap justify-center gap-1">
                {battle.playerTeam.pokemons.map(pokemon => (
                  <div key={`player-${pokemon.id}`} className="w-8 h-8">
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 mx-auto mb-2">
                <img
                  src={battle.playerPokemon.sprite}
                  alt={battle.playerPokemon.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <h4 className="font-medium capitalize">
                {formatPokemonName(battle.playerPokemon.name)}
              </h4>
            </div>
          )}
        </div>
        
        {/* Battle Result */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-2">
            <hr className="flex-1 border-t border-gray-700" />
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-800">VS</span>
            <hr className="flex-1 border-t border-gray-700" />
          </div>
          
          <div className="my-2">
            {isWinner() ? (
              <span className="text-green-400 font-bold flex items-center">
                <Trophy size={16} className="mr-1" />
                Victory
              </span>
            ) : (
              <span className="text-red-400 font-bold">Defeat</span>
            )}
          </div>
          
          <button
            onClick={toggleExpand}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {isExpanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>
        
        {/* Opponent/Team */}
        <div className="text-center">
          {battle.type === 'team' ? (
            <div>
              <h4 className="font-medium mb-2">{battle.opponentTeam.name}</h4>
              <div className="flex flex-wrap justify-center gap-1">
                {battle.opponentTeam.pokemons.map(pokemon => (
                  <div key={`opponent-${pokemon.id}`} className="w-8 h-8">
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 mx-auto mb-2">
                <img
                  src={battle.opponentPokemon.sprite}
                  alt={battle.opponentPokemon.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <h4 className="font-medium capitalize">
                {formatPokemonName(battle.opponentPokemon.name)}
              </h4>
            </div>
          )}
        </div>
      </div>
      
      {/* Battle Details (Expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-700 mt-3">
              {battle.stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-slate-800/50 p-2 rounded-md text-center">
                    <p className="text-xs text-gray-400">Total Damage</p>
                    <p className="font-bold">{battle.stats.totalDamageDealt || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded-md text-center">
                    <p className="text-xs text-gray-400">Critical Hits</p>
                    <p className="font-bold">{battle.stats.criticalHits || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded-md text-center">
                    <p className="text-xs text-gray-400">Super Effective</p>
                    <p className="font-bold">{battle.stats.superEffectiveHits || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-800/50 p-2 rounded-md text-center">
                    <p className="text-xs text-gray-400">Pokémon Fainted</p>
                    <p className="font-bold">{battle.stats.pokemonFainted || 'N/A'}</p>
                  </div>
                </div>
              )}
              
              <h4 className="font-medium mb-2">Battle Log</h4>
              <div className="max-h-40 overflow-y-auto p-2 bg-slate-800/50 rounded-md space-y-1">
                {battle.log && battle.log.length > 0 ? (
                  battle.log.map((entry, index) => (
                    <div
                      key={index}
                      className={`text-xs p-1 rounded ${
                        entry.type === 'attack' ? 'bg-red-900/30' :
                        entry.type === 'info' ? 'bg-blue-900/30' :
                        entry.type === 'warning' ? 'bg-yellow-900/30' :
                        entry.type === 'success' ? 'bg-green-900/30' :
                        'bg-gray-800/50'
                      }`}
                    >
                      {entry.text}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">No battle log available</p>
                )}
              </div>
              
              {showActions && (
                <div className="text-center mt-4">
                  <div className="flex justify-center gap-4">
                    <Link
                      to={battle.type === 'team' ? "/team-battle" : "/battle"}
                      className="space-button text-sm"
                    >
                      <Shield size={14} className="mr-1" />
                      Battle Again
                    </Link>
                    <Link
                      to={`/${battle.type === 'team' ? 'teams' : 'pokedex'}`}
                      className="space-button !bg-gray-700 hover:!bg-gray-600 text-sm"
                    >
                      {battle.type === 'team' ? 'View Teams' : 'View Pokédex'}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default BattleCard;