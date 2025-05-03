import { useState, useEffect } from 'react';
import { usePokemon } from '../context/PokemonContext';
import { useSearchParams, Link } from 'react-router-dom';
import DifficultySelector from '../components/DifficultySelector';

import { ArrowLeft, Shield, Sword, Zap, SkipForward, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function BattlePage() {
  const { fetchPokemonDetail, fetchPokemonList, addBattleToHistory, calculateDamage } = usePokemon();
  const [searchParams] = useSearchParams();
  
  const initialPokemonId = searchParams.get('pokemon');
  
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [opponentPokemon, setOpponentPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [playerCurrentHp, setPlayerCurrentHp] = useState(0);
  const [opponentCurrentHp, setOpponentCurrentHp] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerAnimation, setPlayerAnimation] = useState(null);
  const [opponentAnimation, setOpponentAnimation] = useState(null);
  const [difficulty, setDifficulty] = useState('normal'); // easy, normal, hard
  const [showOpponentSelect, setShowOpponentSelect] = useState(false);
  const [opponentSearchTerm, setOpponentSearchTerm] = useState('');
  const [opponentSearchResults, setOpponentSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [battleStats, setBattleStats] = useState({
    totalDamageDealt: 0,
    criticalHits: 0,
    superEffectiveHits: 0,
    pokemonFainted: 0,
  });
  
  // Load the selected Pokémon from the URL parameter if provided
  useEffect(() => {
    if (initialPokemonId) {
      loadPokemon(initialPokemonId, setSelectedPokemon);
    }
  }, [initialPokemonId]);

  // Search for opponents
  useEffect(() => {
    const searchOpponents = async () => {
      if (!opponentSearchTerm) {
        setOpponentSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Search directly from PokeAPI
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${opponentSearchTerm.toLowerCase()}`);
        if (!response.ok) {
          throw new Error('Pokemon not found');
        }
        const data = await response.json();
        
        // Format the result to match our expected structure
        const result = {
          name: data.name,
          url: `https://pokeapi.co/api/v2/pokemon/${data.id}/`
        };
        
        setOpponentSearchResults([result]);
      } catch (err) {
        console.error('Error searching opponents:', err);
        setOpponentSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchOpponents, 300);
    return () => clearTimeout(debounceTimer);
  }, [opponentSearchTerm]);
  
  const loadPokemon = async (id, setStateFunction) => {
    setIsLoading(true);
    try {
      const data = await fetchPokemonDetail(id);
      
      // Format moves with more details
      const moves = data.moves.slice(0, 4).map(moveData => {
        const moveName = moveData.move.name.replace(/-/g, ' ');
        // Random values for demonstration - in a real app you'd fetch actual move data
        return {
          name: moveName,
          power: Math.floor(Math.random() * 100) + 20,
          accuracy: Math.floor(Math.random() * 30) + 70,
          pp: Math.floor(Math.random() * 15) + 5,
          type: data.types[Math.floor(Math.random() * data.types.length)].type.name,
          category: ['Physical', 'Special'][Math.floor(Math.random() * 2)],
        };
      });
      
      const formattedPokemon = {
        id: data.id,
        name: data.name,
        sprites: data.sprites,
        types: data.types.map(type => type.type.name),
        stats: {
          hp: data.stats.find(stat => stat.stat.name === 'hp').base_stat,
          attack: data.stats.find(stat => stat.stat.name === 'attack').base_stat,
          defense: data.stats.find(stat => stat.stat.name === 'defense').base_stat,
          specialAttack: data.stats.find(stat => stat.stat.name === 'special-attack').base_stat,
          specialDefense: data.stats.find(stat => stat.stat.name === 'special-defense').base_stat,
          speed: data.stats.find(stat => stat.stat.name === 'speed').base_stat,
        },
        moves: moves,
        level: 50
      };
      
      setStateFunction(formattedPokemon);
      
      // Set initial HP
      if (setStateFunction === setSelectedPokemon) {
        setPlayerCurrentHp(formattedPokemon.stats.hp);
      } else {
        setOpponentCurrentHp(formattedPokemon.stats.hp);
      }
      
    } catch (err) {
      console.error('Error loading pokemon:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectRandomPokemon = async () => {
    // Random ID between 1 and 898 (number of Pokémon in the API)
    const randomId = Math.floor(Math.random() * 898) + 1;
    await loadPokemon(randomId, setOpponentPokemon);
  };

  const selectOpponentFromPokedex = async (pokemon) => {
    await loadPokemon(pokemon.name, setOpponentPokemon);
    setShowOpponentSelect(false);
    setOpponentSearchTerm('');
    setOpponentSearchResults([]);
  };
  
  const startBattle = () => {
    setIsBattleStarted(true);
    setIsBattleOver(false);
    setWinner(null);
    setBattleLog([{ text: "Battle started!", type: "info" }]);
    
    // Determine who goes first based on speed
    const playerSpeed = selectedPokemon.stats.speed;
    
    // Apply difficulty modifier to opponent's speed
    let opponentSpeed = opponentPokemon.stats.speed;
    if (difficulty === 'easy') {
      opponentSpeed = Math.floor(opponentSpeed * 0.7);
    } else if (difficulty === 'hard') {
      opponentSpeed = Math.floor(opponentSpeed * 1.3);
    }
    
    setIsPlayerTurn(playerSpeed >= opponentSpeed);
    
    // Reset HP
    setPlayerCurrentHp(selectedPokemon.stats.hp);
    setOpponentCurrentHp(opponentPokemon.stats.hp);
    
    // Add first turn log
    if (playerSpeed >= opponentSpeed) {
      addLogMessage(`${selectedPokemon.name} goes first!`, "info");
    } else {
      addLogMessage(`${opponentPokemon.name} goes first!`, "info");
      // If opponent goes first, trigger their turn
      setTimeout(() => {
        if (!isBattleOver) {
          handleOpponentTurn();
        }
      }, 1000);
    }
  };
  
  const addLogMessage = (text, type = "info") => {
    setBattleLog(prevLog => [...prevLog, { text, type, id: Date.now() }]);
  };
  
  const handlePlayerAttack = (move) => {
    if (!isPlayerTurn || isBattleOver) return;
    
    // Play attack animation
    setPlayerAnimation('attack-animation');
    setTimeout(() => setPlayerAnimation(null), 500);
    
    // Calculate if attack hits (based on accuracy)
    const hitChance = Math.random() * 100;
    if (hitChance > move.accuracy) {
      addLogMessage(`${selectedPokemon.name}'s ${move.name} missed!`, "warning");
      
      // End turn
      setIsPlayerTurn(false);
      setTimeout(() => {
        if (!isBattleOver) {
          handleOpponentTurn();
        }
      }, 1000);
      return;
    }
    
    // Calculate damage
    const damageResult = calculateDamage(selectedPokemon, opponentPokemon, move);
    
    // Apply damage to opponent
    const effectivenessText = getEffectivenessText(damageResult.effectiveness);
    
    // Play damage animation on opponent
    setOpponentAnimation('damage-animation');
    setTimeout(() => setOpponentAnimation(null), 300);
    
    // Update opponent HP
    const newOpponentHp = Math.max(0, opponentCurrentHp - damageResult.damage);
    setOpponentCurrentHp(newOpponentHp);

    // Update battle stats
    setBattleStats(prev => ({
      ...prev,
      totalDamageDealt: prev.totalDamageDealt + damageResult.damage,
      criticalHits: prev.criticalHits + (damageResult.isCritical ? 1 : 0),
      superEffectiveHits: prev.superEffectiveHits + (damageResult.effectiveness > 1 ? 1 : 0),
    }));
    
    // Log the attack
    let logMessage = `${selectedPokemon.name} used ${move.name} and dealt ${damageResult.damage} damage!`;
    if (damageResult.isCritical) {
      logMessage += " Critical hit!";
    }
    if (effectivenessText) {
      logMessage += ` ${effectivenessText}`;
    }
    addLogMessage(logMessage, "attack");
    
    // Check if opponent fainted
    if (newOpponentHp <= 0) {
      handleBattleEnd(selectedPokemon);
      return;
    }
    
    // End turn
    setIsPlayerTurn(false);
    setTimeout(() => {
      if (!isBattleOver) {
        handleOpponentTurn();
      }
    }, 1000);
  };
  
  const handleOpponentTurn = () => {
    if (isBattleOver) return;
    
    // Select a random move for the opponent
    const randomMoveIndex = Math.floor(Math.random() * opponentPokemon.moves.length);
    const selectedMove = opponentPokemon.moves[randomMoveIndex];
    
    // Play attack animation
    setOpponentAnimation('attack-animation');
    setTimeout(() => setOpponentAnimation(null), 500);
    
    // Calculate if attack hits
    const hitChance = Math.random() * 100;
    if (hitChance > selectedMove.accuracy) {
      addLogMessage(`${opponentPokemon.name}'s ${selectedMove.name} missed!`, "warning");
      
      // End turn
      setIsPlayerTurn(true);
      return;
    }
    
    // Calculate damage
    const damageResult = calculateDamage(opponentPokemon, selectedPokemon, selectedMove);
    
    // Apply damage to player
    const effectivenessText = getEffectivenessText(damageResult.effectiveness);
    
    // Play damage animation on player
    setPlayerAnimation('damage-animation');
    setTimeout(() => setPlayerAnimation(null), 300);
    
    // Update player HP
    const newPlayerHp = Math.max(0, playerCurrentHp - damageResult.damage);
    setPlayerCurrentHp(newPlayerHp);
    
    // Log the attack
    let logMessage = `${opponentPokemon.name} used ${selectedMove.name} and dealt ${damageResult.damage} damage!`;
    if (damageResult.isCritical) {
      logMessage += " Critical hit!";
    }
    if (effectivenessText) {
      logMessage += ` ${effectivenessText}`;
    }
    addLogMessage(logMessage, "attack");
    
    // Check if player fainted
    if (newPlayerHp <= 0) {
      handleBattleEnd(opponentPokemon);
      return;
    }
    
    // End turn
    setIsPlayerTurn(true);
  };
  
  const getEffectivenessText = (effectiveness) => {
    if (effectiveness > 1.5) {
      return "It's super effective!";
    } else if (effectiveness < 0.5) {
      return "It's not very effective...";
    } else if (effectiveness === 0) {
      return "It has no effect...";
    }
    return "";
  };
  
  const handleBattleEnd = (victor) => {
    setIsBattleOver(true);
    setWinner(victor);
    
    addLogMessage(`${victor.name} wins the battle!`, "success");
    
    // Add victory animation
    if (victor.id === selectedPokemon.id) {
      setPlayerAnimation('victory-animation');
    } else {
      setOpponentAnimation('victory-animation');
    }
    
    // Update fainted count in battle stats
    setBattleStats(prev => ({
      ...prev,
      pokemonFainted: prev.pokemonFainted + 1,
    }));
    
    // Save battle to history
    const battleData = {
      type: 'single',
      playerPokemon: {
        id: selectedPokemon.id,
        name: selectedPokemon.name,
        sprite: selectedPokemon.sprites.front_default,
      },
      opponentPokemon: {
        id: opponentPokemon.id,
        name: opponentPokemon.name,
        sprite: opponentPokemon.sprites.front_default,
      },
      winner: victor.id,
      difficulty,
      stats: battleStats,
      log: battleLog,
      date: new Date().toISOString(),
    };
    
    addBattleToHistory(battleData);
  };
  
  const resetBattle = () => {
    setIsBattleStarted(false);
    setIsBattleOver(false);
    setWinner(null);
    setBattleLog([]);
    setPlayerAnimation(null);
    setOpponentAnimation(null);
    
    // Reset HP
    if (selectedPokemon) {
      setPlayerCurrentHp(selectedPokemon.stats.hp);
    }
    if (opponentPokemon) {
      setOpponentCurrentHp(opponentPokemon.stats.hp);
    }
    
    // Reset battle stats
    setBattleStats({
      totalDamageDealt: 0,
      criticalHits: 0,
      superEffectiveHits: 0,
      pokemonFainted: 0,
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Link to="/" className="space-button inline-flex items-center">
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold">Pokémon Battle</h1>
        
        <div className="w-[100px]"></div> {/* Empty div for flex balance */}
      </div>
      
      {!selectedPokemon && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-card p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Select Your Pokémon</h2>
          <p className="text-gray-400 mb-6">
            Choose a Pokémon from the Pokédex to start a battle.
          </p>
          <Link to="/pokedex" className="space-button">
            Go to Pokédex
          </Link>
        </motion.div>
      )}
      
      {selectedPokemon && !opponentPokemon && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-card p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Select Opponent</h2>
          <p className="text-gray-400 mb-6">
            {selectedPokemon.name} is ready for battle! Choose an opponent.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={selectRandomPokemon} 
              className="space-button"
            >
              Random Opponent
            </button>
            <button
              onClick={() => setShowOpponentSelect(true)}
              className="space-button"
            >
              Choose from Pokédex
            </button>
          </div>
        </motion.div>
      )}

      {/* Opponent Selection Modal */}
      <AnimatePresence>
        {showOpponentSelect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowOpponentSelect(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Select Opponent</h2>
                <button
                  onClick={() => setShowOpponentSelect(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="relative mb-6">
                <input
                  type="text"
                  value={opponentSearchTerm}
                  onChange={(e) => setOpponentSearchTerm(e.target.value)}
                  placeholder="Search Pokémon..."
                  className="w-full space-input pl-10"
                />
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {isSearching ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : opponentSearchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {opponentSearchResults.map(pokemon => (
                    <motion.button
                      key={pokemon.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectOpponentFromPokedex(pokemon)}
                      className="space-card p-4 text-center hover:border-purple-500/50 transition-colors cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split('/')[6]}.png`}
                        alt={pokemon.name}
                        className="w-16 h-16 object-contain mx-auto mb-2"
                      />
                      <p className="capitalize text-sm font-medium">
                        {pokemon.name.replace(/-/g, ' ')}
                      </p>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500/0 group-hover:bg-purple-500/50 transition-colors"></div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {opponentSearchTerm ? 'No Pokémon found' : 'Start typing to search Pokémon'}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedPokemon && opponentPokemon && !isBattleStarted && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-card p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Battle Setup</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-card p-4 text-center">
              <h3 className="font-bold mb-2">Your Pokémon</h3>
              <div className="flex justify-center mb-2">
                <img 
                  src={selectedPokemon.sprites.other['official-artwork'].front_default || selectedPokemon.sprites.front_default} 
                  alt={selectedPokemon.name}
                  className="h-32 object-contain"
                />
              </div>
              <p className="capitalize text-lg font-semibold">
                {selectedPokemon.name.replace(/-/g, ' ')}
              </p>
              <div className="flex justify-center gap-2 mt-2">
                {selectedPokemon.types.map(type => (
                  <span key={type} className={`badge badge-${type}`}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-card p-4 text-center">
              <h3 className="font-bold mb-2">Opponent</h3>
              <div className="flex justify-center mb-2">
                <img 
                  src={opponentPokemon.sprites.other['official-artwork'].front_default || opponentPokemon.sprites.front_default} 
                  alt={opponentPokemon.name}
                  className="h-32 object-contain"
                />
              </div>
              <p className="capitalize text-lg font-semibold">
                {opponentPokemon.name.replace(/-/g, ' ')}
              </p>
              <div className="flex justify-center gap-2 mt-2">
                {opponentPokemon.types.map(type => (
                  <span key={type} className={`badge badge-${type}`}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <DifficultySelector 
  selectedDifficulty={difficulty} 
  onSelectDifficulty={setDifficulty} 
/>
          
          <div className="flex gap-4">
            <button 
              onClick={startBattle} 
              className="space-button flex-1 flex items-center justify-center"
            >
              <Zap size={18} className="mr-2" />
              Start Battle
            </button>
            <button 
              onClick={() => setOpponentPokemon(null)} 
              className="space-button !bg-gray-700 hover:!bg-gray-600"
            >
              Change Opponent
            </button>
          </div>
        </motion.div>
      )}
      
      {isBattleStarted && (
        <div className="mb-8">
          <div className="battle-arena p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="order-2 md:order-1">
                <div className={`relative ${playerAnimation}`}>
                  <img 
                    src={selectedPokemon.sprites.back_default || selectedPokemon.sprites.front_default} 
                    alt={selectedPokemon.name}
                    className="h-40 object-contain mx-auto"
                  />
                  
                  <div className="space-card p-3 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold capitalize">{selectedPokemon.name.replace(/-/g, ' ')}</h3>
                      <span className="text-sm">Lv{selectedPokemon.level}</span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>HP</span>
                        <span>{playerCurrentHp}/{selectedPokemon.stats.hp}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${(playerCurrentHp / selectedPokemon.stats.hp) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <div className={`relative ${opponentAnimation}`}>
                  <img 
                    src={opponentPokemon.sprites.front_default} 
                    alt={opponentPokemon.name}
                    className="h-40 object-contain mx-auto"
                  />
                  
                  <div className="space-card p-3 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold capitalize">{opponentPokemon.name.replace(/-/g, ' ')}</h3>
                      <span className="text-sm">Lv{opponentPokemon.level}</span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>HP</span>
                        <span>{opponentCurrentHp}/{opponentPokemon.stats.hp}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${(opponentCurrentHp / opponentPokemon.stats.hp) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-card p-4 md:col-span-2">
              <h3 className="font-bold mb-3">
                {isBattleOver 
                  ? "Battle Ended" 
                  : isPlayerTurn 
                    ? "Your Turn - Choose a Move" 
                    : "Opponent's Turn"
                }
              </h3>
              
              {!isBattleOver && isPlayerTurn && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPokemon.moves.map((move, index) => (
                    <button
                      key={index}
                      onClick={() => handlePlayerAttack(move)}
                      className="space-button flex flex-col items-start p-3"
                      disabled={!isPlayerTurn}
                    >
                      <span className="font-bold capitalize mb-1">{move.name}</span>
                      <div className="flex justify-between w-full text-sm">
                        <span className={`badge badge-${move.type} text-xs`}>{move.type}</span>
                        <span>Power: {move.power}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {!isBattleOver && !isPlayerTurn && (
                <div className="text-center py-4">
                  <p className="text-gray-300 mb-4">Opponent is choosing a move...</p>
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              )}
              
              {isBattleOver && (
                <div className="text-center py-6">
                  <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    {winner.id === selectedPokemon.id ? "Victory!" : "Defeat!"}
                  </h2>
                  <p className="text-gray-300 mb-6">
                    {winner.id === selectedPokemon.id 
                      ? `Your ${selectedPokemon.name} defeated ${opponentPokemon.name}!`
                      : `Your ${selectedPokemon.name} was defeated by ${opponentPokemon.name}.`
                    }
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto">
                    <div className="space-card p-3">
                      <p className="text-sm text-gray-400">Total Damage</p>
                      <p className="text-xl font-bold">{battleStats.totalDamageDealt}</p>
                    </div>
                    <div className="space-card p-3">
                      <p className="text-sm text-gray-400">Critical Hits</p>
                      <p className="text-xl font-bold">{battleStats.criticalHits}</p>
                    </div>
                    <div className="space-card p-3">
                      <p className="text-sm text-gray-400">Super Effective</p>
                      <p className="text-xl font-bold">{battleStats.superEffectiveHits}</p>
                    </div>
                    <div className="space-card p-3">
                      <p className="text-sm text-gray-400">Pokémon Fainted</p>
                      <p className="text-xl font-bold">{battleStats.pokemonFainted}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <button 
                      onClick={resetBattle} 
                      className="space-button"
                    >
                      Battle Again
                    </button>
                    <Link to="/history" className="space-button !bg-gray-700 hover:!bg-gray-600">
                      View History
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-card p-4 h-[300px] overflow-y-auto">
              <h3 className="font-bold mb-3">Battle Log</h3>
              
              <div className="space-y-2">
                <AnimatePresence>
                  {battleLog.map((log, index) => (
                    <motion.div
                      key={log.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-2 rounded text-sm ${
                        log.type === 'attack' ? 'bg-red-900/30' :
                        log.type === 'info' ? 'bg-blue-900/30' :
                        log.type === 'warning' ? 'bg-yellow-900/30' :
                        log.type === 'success' ? 'bg-green-900/30' :
                        'bg-gray-800/50'
                      }`}
                    >
                      {log.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BattlePage;