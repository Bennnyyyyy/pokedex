import { useState, useEffect } from 'react';
import { usePokemon } from '../context/PokemonContext';
import { Link, useNavigate } from 'react-router-dom';
import CustomOpponentTeam from '../components/CustomOpponentTeam';

import { ArrowLeft, Shield, Sword, Zap, CheckCircle, AlertTriangle, RefreshCw, UserPlus, X, Trash2, Edit2, Save, X as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/ToastManager';

function TeamBattlePage() {
    const { teams, fetchPokemonDetail, fetchPokemonList, calculateDamage, addBattleToHistory } = usePokemon();
    const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [playerTeam, setPlayerTeam] = useState(null);
  const [opponentTeam, setOpponentTeam] = useState(null);
  const [playerCurrentPokemonIndex, setPlayerCurrentPokemonIndex] = useState(0);
  const [opponentCurrentPokemonIndex, setOpponentCurrentPokemonIndex] = useState(0);
  const [playerCurrentPokemon, setPlayerCurrentPokemon] = useState(null);
  const [opponentCurrentPokemon, setOpponentCurrentPokemon] = useState(null);
  const [playerCurrentHp, setPlayerCurrentHp] = useState(0);
  const [opponentCurrentHp, setOpponentCurrentHp] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleLog, setBattleLog] = useState([]);
  const [winner, setWinner] = useState(null);
  const [difficulty, setDifficulty] = useState('normal'); // easy, normal, hard
  const [playerAnimation, setPlayerAnimation] = useState(null);
  const [opponentAnimation, setOpponentAnimation] = useState(null);
  const [remainingPlayerPokemon, setRemainingPlayerPokemon] = useState(0);
  const [remainingOpponentPokemon, setRemainingOpponentPokemon] = useState(0);
  const [showCustomTeamBuilder, setShowCustomTeamBuilder] = useState(false);

  const [battleStats, setBattleStats] = useState({
    totalDamageDealt: 0,
    criticalHits: 0,
    superEffectiveHits: 0,
    pokemonFainted: 0,
  });


  const handleSaveCustomOpponentTeam = (team) => {
    setOpponentTeam({
      id: 'custom-opponent-' + Date.now(),
      name: team.name,
      pokemons: team.pokemons.map(pokemon => ({
        ...pokemon,
        level: 50,
        stats: {
          hp: pokemon.stats?.hp || 100,
          attack: pokemon.stats?.attack || 80,
          defense: pokemon.stats?.defense || 80,
          specialAttack: pokemon.stats?.specialAttack || 80,
          specialDefense: pokemon.stats?.specialDefense || 80,
          speed: pokemon.stats?.speed || 80
        },
        moves: pokemon.moves || generateDefaultMoves(pokemon)
      }))
    });
    setRemainingOpponentPokemon(team.pokemons.length);
    setShowCustomTeamBuilder(false);
  };
  const generateDefaultMoves = (pokemon) => {
    const firstType = pokemon.types && pokemon.types.length > 0 ? pokemon.types[0] : 'normal';
    
    return [
      {
        name: 'Tackle',
        power: 40,
        accuracy: 100,
        pp: 35,
        type: 'normal',
        category: 'Physical',
      },
      {
        name: 'Quick Attack',
        power: 40,
        accuracy: 100,
        pp: 30,
        type: 'normal',
        category: 'Physical',
      },
      {
        name: firstType === 'normal' ? 'Swift' : `${firstType.charAt(0).toUpperCase() + firstType.slice(1)} Attack`,
        power: 60,
        accuracy: 100,
        pp: 20,
        type: firstType,
        category: 'Special',
      },
      {
        name: 'Slam',
        power: 80,
        accuracy: 75,
        pp: 20,
        type: 'normal',
        category: 'Physical',
      }
    ];
  };
  useEffect(() => {
    // Redirect if no teams available
    if (teams.length === 0) {
      addToast('You need to create a team first!', 'warning');
      navigate('/teams');
    }
  }, [teams, navigate, addToast]);

  // Generate a random opponent team
  const generateOpponentTeam = async () => {
    setIsLoading(true);
    try {
      // Create a team with 3-6 random Pokémon
      const teamSize = Math.floor(Math.random() * 4) + 3; // 3-6 Pokémon
      const pokemonIds = [];
      
      // Generate unique random IDs
      while (pokemonIds.length < teamSize) {
        const randomId = Math.floor(Math.random() * 898) + 1;
        if (!pokemonIds.includes(randomId)) {
          pokemonIds.push(randomId);
        }
      }
      
      // Fetch details for each Pokémon
      const pokemonDetails = await Promise.all(
        pokemonIds.map(async (id) => {
          const pokemon = await fetchPokemonDetail(id);
          
          // Ensure we have stats object with valid numeric values
          const stats = {
            hp: pokemon.stats.find(stat => stat.stat.name === 'hp')?.base_stat || 100,
            attack: pokemon.stats.find(stat => stat.stat.name === 'attack')?.base_stat || 50,
            defense: pokemon.stats.find(stat => stat.stat.name === 'defense')?.base_stat || 50,
            specialAttack: pokemon.stats.find(stat => stat.stat.name === 'special-attack')?.base_stat || 50,
            specialDefense: pokemon.stats.find(stat => stat.stat.name === 'special-defense')?.base_stat || 50,
            speed: pokemon.stats.find(stat => stat.stat.name === 'speed')?.base_stat || 50,
          };
          
          // Validate that all stats are numbers
          Object.keys(stats).forEach(key => {
            if (typeof stats[key] !== 'number' || isNaN(stats[key])) {
              console.warn(`Invalid ${key} stat for ${pokemon.name}:`, stats[key]);
              stats[key] = key === 'hp' ? 100 : 50; // Default values
            }
          });
          
          // Fetch actual moves data from API (limit to 4 moves)
          let movesData = [];
          
          // Only process if there are moves available
          if (pokemon.moves && pokemon.moves.length > 0) {
            // Get up to 4 random moves
            const moveCount = Math.min(4, pokemon.moves.length);
            const randomMoves = pokemon.moves
              .sort(() => 0.5 - Math.random())
              .slice(0, moveCount);
            
            // Fetch details for each move
            movesData = await Promise.all(
              randomMoves.map(async (moveEntry) => {
                try {
                  const moveUrl = moveEntry.move.url;
                  const moveResponse = await axios.get(moveUrl);
                  const moveData = moveResponse.data;
                  
                  // Extract useful data from the move
                  return {
                    name: moveData.name.replace(/-/g, ' '),
                    power: moveData.power || 50, // Default power if none
                    accuracy: moveData.accuracy || 100, // Default accuracy if none
                    pp: moveData.pp || 10, // Default PP if none
                    type: moveData.type.name,
                    category: moveData.damage_class.name.charAt(0).toUpperCase() + 
                              moveData.damage_class.name.slice(1) // Capitalize
                  };
                } catch (err) {
                  console.error(`Error fetching move data for ${moveEntry.move.name}:`, err);
                  
                  // Return a fallback move if API call fails
                  return {
                    name: moveEntry.move.name.replace(/-/g, ' '),
                    power: 50,
                    accuracy: 100,
                    pp: 10,
                    type: pokemon.types[0].type.name,
                    category: Math.random() > 0.5 ? 'Physical' : 'Special',
                  };
                }
              })
            );
          }
          
          // If we couldn't get any moves, provide default ones
          if (movesData.length === 0) {
            const defaultType = pokemon.types[0].type.name;
            movesData = [
              {
                name: 'Tackle',
                power: 40,
                accuracy: 100,
                pp: 35,
                type: 'normal',
                category: 'Physical',
              },
              {
                name: 'Quick Attack',
                power: 40,
                accuracy: 100,
                pp: 30,
                type: 'normal',
                category: 'Physical',
              },
              {
                name: defaultType === 'normal' ? 'Swift' : `${defaultType.charAt(0).toUpperCase() + defaultType.slice(1)} Attack`,
                power: 60,
                accuracy: 100,
                pp: 20,
                type: defaultType,
                category: 'Special',
              },
              {
                name: 'Slam',
                power: 80,
                accuracy: 75,
                pp: 20,
                type: 'normal',
                category: 'Physical',
              }
            ];
          }
          
          return {
            id: pokemon.id,
            name: pokemon.name,
            sprites: pokemon.sprites,
            types: pokemon.types.map(type => type.type.name),
            stats: stats,
            moves: movesData,
            level: 50
          };
        })
      );
      
      // Create the opponent team
      const teamName = `Cosmic ${['Destroyers', 'Guardians', 'Voyagers', 'Conquerors', 'Rangers'][Math.floor(Math.random() * 5)]}`;
      
      const newOpponentTeam = {
        id: 'opponent-' + Date.now(),
        name: teamName,
        pokemons: pokemonDetails
      };
      
      setOpponentTeam(newOpponentTeam);
      setRemainingOpponentPokemon(pokemonDetails.length);
      
    } catch (error) {
      console.error('Error generating opponent team:', error);
      addToast('Failed to generate opponent team', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const selectPlayerTeam = (team) => {
    // Ensure each Pokémon has moves
    const enhancedTeam = {
      ...team,
      pokemons: team.pokemons.map(pokemon => {
        // Add moves if they don't exist
        if (!pokemon.moves) {
          // Get the first type, ensuring it's a string
          const firstType = Array.isArray(pokemon.types) 
            ? (typeof pokemon.types[0] === 'string' 
                ? pokemon.types[0] 
                : pokemon.types[0]?.type?.name || 'normal')
            : 'normal';
          
          const defaultMoves = [
            {
              name: 'Tackle',
              power: 40,
              accuracy: 100,
              pp: 35,
              type: firstType,  // Now we're sure this is a string
              category: 'Physical',
            },
            {
              name: 'Quick Attack',
              power: 40,
              accuracy: 100,
              pp: 30,
              type: firstType,  // Now we're sure this is a string
              category: 'Physical',
            },
            {
              name: 'Swift',
              power: 60,
              accuracy: 100,
              pp: 20,
              type: 'normal',
              category: 'Special',
            },
            {
              name: 'Slam',
              power: 80,
              accuracy: 75,
              pp: 20,
              type: 'normal',
              category: 'Physical',
            }
          ];
          
          return {
            ...pokemon,
            moves: defaultMoves,
            level: 50
          };
        }
        
        return {
          ...pokemon,
          level: pokemon.level || 50
        };
      })
    };
    
    setPlayerTeam(enhancedTeam);
    setRemainingPlayerPokemon(enhancedTeam.pokemons.length);
  };

  const startBattle = () => {
    if (!playerTeam || !opponentTeam) {
      addToast('Please select your team and an opponent team first', 'warning');
      return;
    }
    
    if (playerTeam.pokemons.length === 0) {
      addToast('Your team must have at least one Pokémon', 'warning');
      return;
    }
    
    // Reset battle state
    setIsBattleStarted(true);
    setIsBattleOver(false);
    setWinner(null);
    setBattleLog([{ text: "Team Battle started!", type: "info", timestamp: new Date().toISOString() }]);
    setPlayerCurrentPokemonIndex(0);
    setOpponentCurrentPokemonIndex(0);
    
    // Set initial Pokémon
    const initialPlayerPokemon = playerTeam.pokemons[0];
    const initialOpponentPokemon = opponentTeam.pokemons[0];
    
    console.log('Initial Pokémon:', {
      player: initialPlayerPokemon,
      opponent: initialOpponentPokemon
    });
    
    setPlayerCurrentPokemon(initialPlayerPokemon);
    setOpponentCurrentPokemon(initialOpponentPokemon);
    
    // Validate HP stats before setting them
    const playerHP = initialPlayerPokemon.stats.hp;
    const opponentHP = initialOpponentPokemon.stats.hp;
    
    if (typeof playerHP !== 'number' || isNaN(playerHP)) {
      console.error('Invalid player HP:', playerHP);
      setPlayerCurrentHp(100); // Default fallback
    } else {
      setPlayerCurrentHp(playerHP);
    }
    
    if (typeof opponentHP !== 'number' || isNaN(opponentHP)) {
      console.error('Invalid opponent HP:', opponentHP);
      setOpponentCurrentHp(100); // Default fallback
    } else {
      setOpponentCurrentHp(opponentHP);
    }
    
    // Apply difficulty modifier
    let playerSpeed = initialPlayerPokemon.stats.speed;
    let opponentSpeed = initialOpponentPokemon.stats.speed;
    
    if (difficulty === 'easy') {
      opponentSpeed = Math.floor(opponentSpeed * 0.7);
    } else if (difficulty === 'hard') {
      opponentSpeed = Math.floor(opponentSpeed * 1.3);
    }
    
    // Determine who goes first based on speed
    const playerGoesFirst = playerSpeed >= opponentSpeed;
    setIsPlayerTurn(playerGoesFirst);
    
    // Add turn log with timestamps
    addLogMessage(
      `${initialPlayerPokemon.name} faces off against ${initialOpponentPokemon.name}!`, 
      "info"
    );
    
    addLogMessage(
      playerGoesFirst 
        ? `${initialPlayerPokemon.name} goes first with ${playerSpeed} speed!` 
        : `${initialOpponentPokemon.name} goes first with ${opponentSpeed} speed!`, 
      "info"
    );
    
    // Reset battle stats
    setBattleStats({
      totalDamageDealt: 0,
      criticalHits: 0,
      superEffectiveHits: 0,
      pokemonFainted: 0,
    });
    
    // If opponent goes first, trigger their turn
    if (!playerGoesFirst) {
      setTimeout(() => {
        handleOpponentTurn();
      }, 1500);
    }
  };

  const addLogMessage = (text, type = "info") => {
    const timestamp = new Date().toISOString();
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setBattleLog(prevLog => [
      ...prevLog, 
      { 
        text, 
        type, 
        id: Date.now(),
        timestamp,
        formattedTime 
      }
    ]);
  };
  const handlePlayerAttack = (move) => {
    if (!isPlayerTurn || isBattleOver) return;
    
    // Play attack animation
    setPlayerAnimation('attack-animation');
    setTimeout(() => setPlayerAnimation(null), 500);
    
    // Calculate if attack hits (based on accuracy)
    const hitChance = Math.random() * 100;
    if (hitChance > move.accuracy) {
      addLogMessage(`${playerCurrentPokemon.name}'s ${move.name} missed!`, "warning");
      
      // End turn
      setIsPlayerTurn(false);
      setTimeout(() => {
        if (!isBattleOver) {
          handleOpponentTurn();
        }
      }, 1000);
      return;
    }
    
    // Log detailed battle information for debugging
    console.log('Player attack data:', {
      attacker: {
        name: playerCurrentPokemon.name,
        level: playerCurrentPokemon.level,
        stats: playerCurrentPokemon.stats,
        types: playerCurrentPokemon.types
      },
      defender: {
        name: opponentCurrentPokemon.name,
        level: opponentCurrentPokemon.level,
        stats: opponentCurrentPokemon.stats,
        types: opponentCurrentPokemon.types
      },
      move: move
    });
    
    // Calculate damage with error handling
    let damageResult;
    try {
      damageResult = calculateDamage(playerCurrentPokemon, opponentCurrentPokemon, move);
      console.log('Damage calculation result:', damageResult);
      
      // Ensure damage is a valid number
      if (typeof damageResult.damage !== 'number' || isNaN(damageResult.damage)) {
        console.error('Invalid damage value:', damageResult.damage);
        damageResult.damage = Math.floor(Math.random() * 20) + 10; // Fallback to random damage
      }
    } catch (error) {
      console.error('Error calculating damage:', error);
      // Fallback damage calculation
      damageResult = {
        damage: Math.floor(Math.random() * 20) + 10,
        effectiveness: 1,
        isCritical: false
      };
    }
    
    // Apply damage to opponent
    const effectivenessText = getEffectivenessText(damageResult.effectiveness);
    
    // Play damage animation on opponent
    setOpponentAnimation('damage-animation');
    setTimeout(() => setOpponentAnimation(null), 300);
    
    // Ensure we have valid current HP values
    let currentOpponentHp = opponentCurrentHp;
    if (typeof currentOpponentHp !== 'number' || isNaN(currentOpponentHp)) {
      console.error('Invalid opponent current HP:', opponentCurrentHp);
      currentOpponentHp = opponentCurrentPokemon.stats.hp || 100;
      setOpponentCurrentHp(currentOpponentHp);
    }
    
    // Update opponent HP with validation
    const newOpponentHp = Math.max(0, currentOpponentHp - damageResult.damage);
    console.log(`HP update: ${currentOpponentHp} - ${damageResult.damage} = ${newOpponentHp}`);
    setOpponentCurrentHp(newOpponentHp);
    
    // Update battle stats
    setBattleStats(prev => ({
      ...prev,
      totalDamageDealt: prev.totalDamageDealt + damageResult.damage,
      criticalHits: prev.criticalHits + (damageResult.isCritical ? 1 : 0),
      superEffectiveHits: prev.superEffectiveHits + (damageResult.effectiveness > 1 ? 1 : 0),
    }));
    
    // Create detailed attack log message
    let logMessage = `${playerCurrentPokemon.name} used ${move.name}!`;
    
    // Add move details
    const moveDetails = [];
    moveDetails.push(`Power: ${move.power}`);
    moveDetails.push(`Type: ${move.type}`);
    
    // Add a separate damage message
    addLogMessage(logMessage, "attack");
    
    // Add damage results
    let damageMessage = `Dealt ${damageResult.damage} damage to ${opponentCurrentPokemon.name}!`;
    if (damageResult.isCritical) {
      damageMessage += " Critical hit!";
    }
    if (effectivenessText) {
      damageMessage += ` ${effectivenessText}`;
    }
    
    // Add the damage message as a separate log entry
    addLogMessage(damageMessage, damageResult.effectiveness > 1 ? "success" : 
                                damageResult.effectiveness < 1 ? "warning" : "info");
    
    // Check if opponent Pokémon fainted
    if (newOpponentHp <= 0) {
      addLogMessage(`${opponentCurrentPokemon.name} fainted!`, "success");
      setBattleStats(prev => ({
        ...prev,
        pokemonFainted: prev.pokemonFainted + 1,
      }));
      
      // Check if there are more opponent Pokémon
      const nextOpponentIndex = opponentCurrentPokemonIndex + 1;
      if (nextOpponentIndex < opponentTeam.pokemons.length) {
        // Send out next opponent Pokémon
        setOpponentCurrentPokemonIndex(nextOpponentIndex);
        const nextOpponentPokemon = opponentTeam.pokemons[nextOpponentIndex];
        setOpponentCurrentPokemon(nextOpponentPokemon);
        
        // Ensure next opponent's HP is valid
        const nextOpponentHp = nextOpponentPokemon.stats.hp;
        if (typeof nextOpponentHp !== 'number' || isNaN(nextOpponentHp)) {
          console.error('Invalid next opponent HP:', nextOpponentHp);
          setOpponentCurrentHp(100); // Default fallback
        } else {
          setOpponentCurrentHp(nextOpponentHp);
        }
        
        setRemainingOpponentPokemon(prev => prev - 1);
        
        addLogMessage(`Opponent sends out ${nextOpponentPokemon.name}!`, "info");
        
        // End turn
        setIsPlayerTurn(false);
        setTimeout(() => {
          if (!isBattleOver) {
            handleOpponentTurn();
          }
        }, 1000);
      } else {
        // All opponent Pokémon fainted, player wins
        handleBattleEnd(playerTeam);
        return;
      }
    } else {
      // End turn
      setIsPlayerTurn(false);
      setTimeout(() => {
        if (!isBattleOver) {
          handleOpponentTurn();
        }
      }, 1000);
    }
  };

  const handleOpponentTurn = () => {
    if (isBattleOver) return;
    
    // Select a random move for the opponent
    const randomMoveIndex = Math.floor(Math.random() * opponentCurrentPokemon.moves.length);
    const selectedMove = opponentCurrentPokemon.moves[randomMoveIndex];
    
    // Play attack animation
    setOpponentAnimation('attack-animation');
    setTimeout(() => setOpponentAnimation(null), 500);
    
    // Calculate if attack hits
    const hitChance = Math.random() * 100;
    if (hitChance > selectedMove.accuracy) {
      addLogMessage(`${opponentCurrentPokemon.name}'s ${selectedMove.name} missed!`, "warning");
      
      // End turn
      setIsPlayerTurn(true);
      return;
    }
    
    // Log detailed battle information for debugging
    console.log('Opponent attack data:', {
      attacker: {
        name: opponentCurrentPokemon.name,
        level: opponentCurrentPokemon.level,
        stats: opponentCurrentPokemon.stats,
        types: opponentCurrentPokemon.types
      },
      defender: {
        name: playerCurrentPokemon.name,
        level: playerCurrentPokemon.level,
        stats: playerCurrentPokemon.stats,
        types: playerCurrentPokemon.types
      },
      move: selectedMove
    });
    
    // Calculate damage with error handling
    let damageResult;
    try {
      damageResult = calculateDamage(opponentCurrentPokemon, playerCurrentPokemon, selectedMove);
      console.log('Opponent damage calculation result:', damageResult);
      
      // Ensure damage is a valid number
      if (typeof damageResult.damage !== 'number' || isNaN(damageResult.damage)) {
        console.error('Invalid opponent damage value:', damageResult.damage);
        damageResult.damage = Math.floor(Math.random() * 15) + 5; // Fallback to random damage
      }
    } catch (error) {
      console.error('Error calculating opponent damage:', error);
      // Fallback damage calculation
      damageResult = {
        damage: Math.floor(Math.random() * 15) + 5,
        effectiveness: 1,
        isCritical: false
      };
    }
    
    // Apply damage to player
    const effectivenessText = getEffectivenessText(damageResult.effectiveness);
    
    // Play damage animation on player
    setPlayerAnimation('damage-animation');
    setTimeout(() => setPlayerAnimation(null), 300);
    
    // Ensure we have valid current HP values
    let currentPlayerHp = playerCurrentHp;
    if (typeof currentPlayerHp !== 'number' || isNaN(currentPlayerHp)) {
      console.error('Invalid player current HP:', playerCurrentHp);
      currentPlayerHp = playerCurrentPokemon.stats.hp || 100;
      setPlayerCurrentHp(currentPlayerHp);
    }
    
    // Update player HP with validation
    const newPlayerHp = Math.max(0, currentPlayerHp - damageResult.damage);
    console.log(`Player HP update: ${currentPlayerHp} - ${damageResult.damage} = ${newPlayerHp}`);
    setPlayerCurrentHp(newPlayerHp);
    
    // Create detailed attack log message
    let logMessage = `${opponentCurrentPokemon.name} used ${selectedMove.name}!`;
    
    // Add a separate damage message
    addLogMessage(logMessage, "attack");
    
    // Add damage results
    let damageMessage = `Dealt ${damageResult.damage} damage to ${playerCurrentPokemon.name}!`;
    if (damageResult.isCritical) {
      damageMessage += " Critical hit!";
    }
    if (effectivenessText) {
      damageMessage += ` ${effectivenessText}`;
    }
    
    // Add the damage message as a separate log entry
    addLogMessage(damageMessage, damageResult.effectiveness > 1 ? "error" : 
                                 damageResult.effectiveness < 1 ? "warning" : "info");
    
    // Check if player Pokémon fainted
    if (newPlayerHp <= 0) {
      addLogMessage(`${playerCurrentPokemon.name} fainted!`, "error");
      
      // Check if there are more player Pokémon
      const nextPlayerIndex = playerCurrentPokemonIndex + 1;
      if (nextPlayerIndex < playerTeam.pokemons.length) {
        // Send out next player Pokémon
        setPlayerCurrentPokemonIndex(nextPlayerIndex);
        const nextPlayerPokemon = playerTeam.pokemons[nextPlayerIndex];
        setPlayerCurrentPokemon(nextPlayerPokemon);
        
        // Ensure next player's HP is valid
        const nextPlayerHp = nextPlayerPokemon.stats.hp;
        if (typeof nextPlayerHp !== 'number' || isNaN(nextPlayerHp)) {
          console.error('Invalid next player HP:', nextPlayerHp);
          setPlayerCurrentHp(100); // Default fallback
        } else {
          setPlayerCurrentHp(nextPlayerHp);
        }
        
        setRemainingPlayerPokemon(prev => prev - 1);
        
        addLogMessage(`You send out ${nextPlayerPokemon.name}!`, "info");
        
        // Player gets to go next with the new Pokémon
        setIsPlayerTurn(true);
      } else {
        // All player Pokémon fainted, opponent wins
        handleBattleEnd(opponentTeam);
        return;
      }
    } else {
      // End turn
      setIsPlayerTurn(true);
    }
  };

  const getEffectivenessText = (effectiveness) => {
    if (effectiveness >= 2) {
      return "It's super effective!";
    } else if (effectiveness > 1 && effectiveness < 2) {
      return "It's somewhat effective!";
    } else if (effectiveness === 1) {
      return ""; // Normal effectiveness, no special message
    } else if (effectiveness > 0 && effectiveness < 1) {
      return "It's not very effective...";
    } else if (effectiveness === 0) {
      return "It has no effect...";
    }
    return "";
  };

  const handleBattleEnd = (victor) => {
    setIsBattleOver(true);
    setWinner(victor);
    
    addLogMessage(`Team ${victor.name} wins the battle!`, "success");
    
    // Save battle to history
    const battleData = {
      type: 'team',
      playerTeam: {
        id: playerTeam.id,
        name: playerTeam.name,
        pokemons: playerTeam.pokemons.map(p => ({
          id: p.id,
          name: p.name,
          sprite: p.sprites.front_default,
        })),
      },
      opponentTeam: {
        id: opponentTeam.id,
        name: opponentTeam.name,
        pokemons: opponentTeam.pokemons.map(p => ({
          id: p.id,
          name: p.name,
          sprite: p.sprites.front_default,
        })),
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
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading battle data..." />
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
        
        <h1 className="text-3xl font-bold">Team Battle</h1>
        
        <div className="w-[100px]"></div> {/* Empty div for flex balance */}
      </div>
      
      {!isBattleStarted && (
        <div className="space-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Battle Setup</h2>
          
          {/* Team Selection */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">Select Your Team</h3>
            
            {teams.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">You don't have any teams yet!</p>
                <Link to="/teams" className="space-button">
                  Create a Team
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => selectPlayerTeam(team)}
                    className={`space-card p-4 hover:border-purple-500/50 transition-colors ${
                      playerTeam?.id === team.id ? 'border-purple-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{team.name}</h4>
                      {playerTeam?.id === team.id && (
                        <CheckCircle size={18} className="text-green-500" />
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {team.pokemons.map(pokemon => (
                        <div key={`${team.id}-${pokemon.id}`} className="w-10 h-10">
                          <img
                            src={pokemon.sprites.front_default}
                            alt={pokemon.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                      
                      {team.pokemons.length === 0 && (
                        <p className="text-sm text-gray-400">No Pokémon in team</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Opponent Team */}
          <div className="mb-6">
  <h3 className="font-bold mb-3">Opponent Team</h3>
  
  {showCustomTeamBuilder ? (
    <CustomOpponentTeam 
      onSaveTeam={handleSaveCustomOpponentTeam}
      onCancel={() => setShowCustomTeamBuilder(false)}
      fetchPokemonList={fetchPokemonList}
      fetchPokemonDetail={fetchPokemonDetail}
      initialPokemons={opponentTeam?.pokemons || []}
    />
  ) : opponentTeam ? (
    <div className="space-card p-4 border-blue-500/50 mb-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">{opponentTeam.name}</h4>
        <div className="flex gap-2">
          <button 
            onClick={generateOpponentTeam}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
          >
            <RefreshCw size={14} className="mr-1" />
            Regenerate
          </button>
          <button 
            onClick={() => setShowCustomTeamBuilder(true)}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center"
          >
            <Edit2 size={14} className="mr-1" />
            Edit
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {opponentTeam.pokemons.map(pokemon => (
          <div key={`opponent-${pokemon.id}`} className="w-10 h-10">
            <img
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        onClick={generateOpponentTeam}
        className="space-button w-full flex items-center justify-center"
        disabled={isLoading}
      >
        <RefreshCw size={18} className="mr-2" />
        {isLoading ? 'Generating...' : 'Random Opponent Team'}
      </button>
      <button
        onClick={() => setShowCustomTeamBuilder(true)}
        className="space-button w-full flex items-center justify-center"
      >
        <UserPlus size={18} className="mr-2" />
        Custom Opponent Team
      </button>
    </div>
  )}
</div>
          
          {/* Difficulty Selection */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">Select Difficulty</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setDifficulty('easy')}
                className={`space-button flex-1 ${
                  difficulty === 'easy' ? 'from-green-600 to-emerald-600' : 'from-gray-700 to-gray-600'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => setDifficulty('normal')}
                className={`space-button flex-1 ${
                  difficulty === 'normal' ? 'from-blue-600 to-indigo-600' : 'from-gray-700 to-gray-600'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setDifficulty('hard')}
                className={`space-button flex-1 ${
                  difficulty === 'hard' ? 'from-red-600 to-rose-600' : 'from-gray-700 to-gray-600'
                }`}
              >
                Hard
              </button>
            </div>
          </div>
          
          {/* Start Battle */}
          <button
            onClick={startBattle}
            className="space-button w-full flex items-center justify-center"
            disabled={!playerTeam || !opponentTeam}
          >
            <Zap size={18} className="mr-2" />
            Start Team Battle
          </button>
        </div>
      )}
      
      {isBattleStarted && (
        <div className="mb-8">
          <div className="battle-arena p-6 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center">
                <span className="font-bold mr-2">{playerTeam.name}</span>
                <span className="bg-blue-900/30 px-2 py-0.5 rounded-full text-xs">
                  {remainingPlayerPokemon} remaining
                </span>
              </div>
              <div className="flex items-center">
                <span className="bg-red-900/30 px-2 py-0.5 rounded-full text-xs">
                  {remainingOpponentPokemon} remaining
                </span>
                <span className="font-bold ml-2">{opponentTeam.name}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="order-2 md:order-1">
                <div className={`relative ${playerAnimation}`}>
                  <img 
                    src={playerCurrentPokemon?.sprites.back_default || playerCurrentPokemon?.sprites.front_default} 
                    alt={playerCurrentPokemon?.name}
                    className="h-40 object-contain mx-auto"
                  />
                  
                  <div className="space-card p-3 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold capitalize">{playerCurrentPokemon?.name.replace(/-/g, ' ')}</h3>
                      <span className="text-sm">Lv{playerCurrentPokemon?.level || 50}</span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>HP</span>
                        <span>{playerCurrentHp}/{playerCurrentPokemon?.stats.hp}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${(playerCurrentHp / playerCurrentPokemon?.stats.hp) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <div className={`relative ${opponentAnimation}`}>
                  <img 
                    src={opponentCurrentPokemon?.sprites.front_default} 
                    alt={opponentCurrentPokemon?.name}
                    className="h-40 object-contain mx-auto"
                  />
                  
                  <div className="space-card p-3 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold capitalize">{opponentCurrentPokemon?.name.replace(/-/g, ' ')}</h3>
                      <span className="text-sm">Lv{opponentCurrentPokemon?.level || 50}</span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>HP</span>
                        <span>{opponentCurrentHp}/{opponentCurrentPokemon?.stats.hp}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${(opponentCurrentHp / opponentCurrentPokemon?.stats.hp) * 100}%` }}
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
                  {playerCurrentPokemon?.moves.map((move, index) => (
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
                    {winner?.id === playerTeam.id ? "Victory!" : "Defeat!"}
                  </h2>
                  <p className="text-gray-300 mb-6">
                    {winner?.id === playerTeam.id 
                      ? `Your team ${playerTeam.name} defeated ${opponentTeam.name}!`
                      : `Your team ${playerTeam.name} was defeated by ${opponentTeam.name}.`
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
                      <p className="text-sm text-gray-400">Fainted</p>
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
            log.type === 'error' ? 'bg-red-900/30' :
            'bg-gray-800/50'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="flex-1">{log.text}</span>
            {log.formattedTime && (
              <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                {log.formattedTime}
              </span>
            )}
          </div>
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

export default TeamBattlePage;