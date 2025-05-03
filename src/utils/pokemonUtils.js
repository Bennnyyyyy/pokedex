/**
 * Formats a Pokémon name for display by replacing hyphens with spaces and capitalizing
 * @param {string} name - The raw Pokémon name
 * @returns {string} - The formatted name
 */
export const formatPokemonName = (name) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  /**
   * Gets the appropriate sprite URL for a Pokémon
   * @param {Object} sprites - The sprites object from the API
   * @param {boolean} isShiny - Whether to return the shiny sprite
   * @param {boolean} isFront - Whether to return the front or back sprite
   * @returns {string} - The URL of the appropriate sprite
   */
  export const getPokemonSprite = (sprites, isShiny = false, isFront = true) => {
    if (!sprites) return '';
    
    if (sprites.other && sprites.other['official-artwork']) {
      if (isShiny && sprites.other['official-artwork'].front_shiny) {
        return sprites.other['official-artwork'].front_shiny;
      }
      if (sprites.other['official-artwork'].front_default) {
        return sprites.other['official-artwork'].front_default;
      }
    }
    
    // Fallback to regular sprites
    if (isShiny) {
      return isFront ? sprites.front_shiny : sprites.back_shiny;
    }
    return isFront ? sprites.front_default : sprites.back_default;
  };
  
  /**
   * Returns a color for a stat based on its value
   * @param {number} value - The stat value
   * @param {number} max - The maximum possible stat value
   * @returns {string} - A CSS color value
   */
  export const getStatColor = (value, max = 255) => {
    const percentage = (value / max) * 100;
    
    if (percentage >= 80) return 'rgb(34, 197, 94)'; // green-500
    if (percentage >= 50) return 'rgb(59, 130, 246)'; // blue-500
    if (percentage >= 30) return 'rgb(249, 115, 22)'; // orange-500
    return 'rgb(239, 68, 68)'; // red-500
  };
  
  /**
   * Calculates the battle win rate from history
   * @param {Array} battleHistory - The array of battle records
   * @returns {number} - Win percentage from 0-100
   */
  export const calculateWinRate = (battleHistory) => {
    if (!battleHistory || battleHistory.length === 0) return 0;
    
    const wins = battleHistory.filter(
      battle => battle.winner === 'player' || 
      (battle.playerPokemon && battle.winner === battle.playerPokemon.id)
    ).length;
    
    return Math.round((wins / battleHistory.length) * 100);
  };