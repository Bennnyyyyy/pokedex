import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const PokemonContext = createContext();

export const usePokemon = () => useContext(PokemonContext);

export const PokemonProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [teams, setTeams] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data from JSON server on first render
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [favRes, teamsRes, historyRes] = await Promise.all([
          axios.get('http://localhost:3001/favorites'),
          axios.get('http://localhost:3001/teams'),
          axios.get('http://localhost:3001/battle_history')
        ]);
        
        setFavorites(favRes.data);
        setTeams(teamsRes.data);
        setBattleHistory(historyRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data from server. Make sure json-server is running.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Pokemon API functions
  const fetchPokemonList = async (limit = 20, offset = 0) => {
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      return res.data;
    } catch (err) {
      console.error('Error fetching pokemon list:', err);
      throw new Error('Failed to fetch Pokemon list');
    }
  };

  const fetchPokemonDetail = async (idOrName) => {
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching pokemon ${idOrName}:`, err);
      throw new Error('Failed to fetch Pokemon details');
    }
  };

  const fetchPokemonSpecies = async (idOrName) => {
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${idOrName}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching pokemon species ${idOrName}:`, err);
      throw new Error('Failed to fetch Pokemon species details');
    }
  };

  // Favorites functions
  const addFavorite = async (pokemon) => {
    try {
      const res = await axios.post('http://localhost:3001/favorites', pokemon);
      setFavorites(prevFavs => [...prevFavs, res.data]);
      return res.data;
    } catch (err) {
      console.error('Error adding favorite:', err);
      throw new Error('Failed to add to favorites');
    }
  };

  

  const removeFavorite = async (id) => {
    try {
      // First find the correct favorite item with this pokemon ID
      const favoriteItem = favorites.find(fav => fav.id === id);
      
      if (!favoriteItem) {
        console.error('Favorite not found with id:', id);
        throw new Error('Favorite not found');
      }
      
      // Get the database ID (which may be different from the pokemon ID)
      const response = await axios.get(`http://localhost:3001/favorites?id=${id}`);
      if (response.data && response.data.length > 0) {
        // Use the correct database ID to delete
        await axios.delete(`http://localhost:3001/favorites/${response.data[0].id}`);
        // Update state only after successful deletion
        setFavorites(prevFavs => prevFavs.filter(fav => fav.id !== id));
      } else {
        throw new Error('Favorite not found in database');
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
      // Handle specific error cases
      if (err.response && err.response.status === 404) {
        // If the server returns 404, the item might already be deleted
        // So we should update state anyway
        setFavorites(prevFavs => prevFavs.filter(fav => fav.id !== id));
        console.log('Updated local state despite server error');
      } else {
        throw new Error('Failed to remove from favorites');
      }
    }
  };
  const isFavorite = (pokemonId) => {
    return favorites.some(fav => fav.id === pokemonId);
  };

  // Teams functions
  const createTeam = async (teamName) => {
    try {
      const newTeam = {
        name: teamName,
        pokemons: [],
        createdAt: new Date().toISOString()
      };
      const res = await axios.post('http://localhost:3001/teams', newTeam);
      setTeams(prevTeams => [...prevTeams, res.data]);
      return res.data;
    } catch (err) {
      console.error('Error creating team:', err);
      throw new Error('Failed to create team');
    }
  };

  const updateTeam = async (teamId, updatedTeam) => {
    try {
      const res = await axios.put(`http://localhost:3001/teams/${teamId}`, updatedTeam);
      setTeams(prevTeams => prevTeams.map(team => 
        team.id === teamId ? res.data : team
      ));
      return res.data;
    } catch (err) {
      console.error('Error updating team:', err);
      throw new Error('Failed to update team');
    }
  };

  const deleteTeam = async (teamId) => {
    try {
      await axios.delete(`http://localhost:3001/teams/${teamId}`);
      setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
    } catch (err) {
      console.error('Error deleting team:', err);
      throw new Error('Failed to delete team');
    }
  };

  const addPokemonToTeam = async (teamId, pokemon) => {
    try {
      const team = teams.find(t => t.id === teamId);
      if (!team) throw new Error('Team not found');
      
      if (team.pokemons.length >= 6) {
        throw new Error('Team is already full (max 6 Pokémon)');
      }

      // Check if Pokemon is already in the team
      if (team.pokemons.some(p => p.id === pokemon.id)) {
        throw new Error('This Pokémon is already in the team');
      }
      
      const updatedTeam = {
        ...team,
        pokemons: [...team.pokemons, pokemon]
      };
      
      return await updateTeam(teamId, updatedTeam);
    } catch (err) {
      console.error('Error adding pokemon to team:', err);
      throw err;
    }
  };

  const removePokemonFromTeam = async (teamId, pokemonIndex) => {
    try {
      const team = teams.find(t => t.id === teamId);
      if (!team) throw new Error('Team not found');
      
      const updatedPokemons = [...team.pokemons];
      updatedPokemons.splice(pokemonIndex, 1);
      
      const updatedTeam = {
        ...team,
        pokemons: updatedPokemons
      };
      
      return await updateTeam(teamId, updatedTeam);
    } catch (err) {
      console.error('Error removing pokemon from team:', err);
      throw err;
    }
  };

  // Battle history functions
  const addBattleToHistory = async (battleData) => {
    try {
      const newBattle = {
        ...battleData,
        id: battleData.id || `battle-${Date.now()}`,
        date: battleData.date || new Date().toISOString()
      };
      const res = await axios.post('http://localhost:3001/battle_history', newBattle);
      setBattleHistory(prevHistory => [...prevHistory, res.data]);
      return res.data;
    } catch (err) {
      console.error('Error adding battle to history:', err);
      throw new Error('Failed to save battle to history');
    }
  };

  const deleteBattleFromHistory = async (battleId) => {
    try {
      await axios.delete(`http://localhost:3001/battle_history/${battleId}`);
      setBattleHistory(prevHistory => prevHistory.filter(battle => battle.id !== battleId));
      return true;
    } catch (err) {
      console.error('Error deleting battle from history:', err);
      throw new Error('Failed to delete battle from history');
    }
  };

  const clearBattleHistory = async () => {
    try {
      // Get all battle history entries
      const response = await axios.get('http://localhost:3001/battle_history');
      
      // Delete each entry
      await Promise.all(
        response.data.map(battle => 
          axios.delete(`http://localhost:3001/battle_history/${battle.id}`)
        )
      );
      
      // Clear the state
      setBattleHistory([]);
      return true;
    } catch (err) {
      console.error('Error clearing battle history:', err);
      throw new Error('Failed to clear battle history');
    }
  };

  const getBattlesByType = (type) => {
    return battleHistory.filter(battle => 
      type === 'team' ? battle.type === 'team' : battle.type !== 'team'
    );
  };

  // Battle logic
  const calculateDamage = (attacker, defender, move) => {
    // Simplified damage calculation
    const attackStat = move.category === 'Special' ? attacker.stats.specialAttack : attacker.stats.attack;
    const defenseStat = move.category === 'Special' ? defender.stats.specialDefense : defender.stats.defense;
    
    // Base damage formula
    let damage = Math.floor((2 * attacker.level / 5 + 2) * move.power * (attackStat / defenseStat) / 50) + 2;
    
    // Type effectiveness
    const effectiveness = getTypeEffectiveness(move.type, defender.types);
    damage = Math.floor(damage * effectiveness);
    
    // Critical hit (10% chance)
    const isCritical = Math.random() < 0.1;
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }
    
    // Random factor (85-100%)
    const randomFactor = Math.floor(Math.random() * 16) + 85;
    damage = Math.floor(damage * randomFactor / 100);
    
    return {
      damage,
      effectiveness,
      isCritical
    };
  };

  // Type effectiveness chart (simplified)
  const getTypeEffectiveness = (moveType, defenderTypes) => {
    // This is a simplified version - real Pokémon has more complex type interactions
    const typeChart = {
      normal: { rock: 0.5, ghost: 0, steel: 0.5 },
      fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
      water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
      electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
      grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
      ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
      fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
      poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
      ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
      flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
      psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
      bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
      rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
      ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
      dragon: { dragon: 2, steel: 0.5, fairy: 0 },
      dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
      steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
      fairy: { fighting: 2, poison: 0.5, bug: 0.5, dragon: 2, dark: 2, steel: 0.5 }
    };
    
    let effectiveness = 1;
    
    defenderTypes.forEach(defenderType => {
      if (typeChart[moveType] && typeChart[moveType][defenderType]) {
        effectiveness *= typeChart[moveType][defenderType];
      }
    });
    
    return effectiveness;
  };

  return (
    <PokemonContext.Provider value={{
      favorites,
      teams,
      battleHistory,
      isLoading,
      error,
      fetchPokemonList,
      fetchPokemonDetail,
      fetchPokemonSpecies,
      addFavorite,
      removeFavorite,
      isFavorite,
      createTeam,
      updateTeam,
      deleteTeam,
      addPokemonToTeam,
      removePokemonFromTeam,
      addBattleToHistory,
      deleteBattleFromHistory,
      clearBattleHistory,
      getBattlesByType,
      calculateDamage
    }}>
      {children}
    </PokemonContext.Provider>
  );
};