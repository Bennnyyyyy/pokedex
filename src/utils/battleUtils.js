/**
 * Calculates the damage multiplier based on types
 * @param {string} attackType - The type of the attack
 * @param {Array} defenderTypes - Array of the defender's types
 * @returns {number} - Damage multiplier (0, 0.25, 0.5, 1, 2, or 4)
 */
export const calculateTypeEffectiveness = (attackType, defenderTypes) => {
    const typeChart = {
      normal: { rock: 0.5, steel: 0.5, ghost: 0 },
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
    
    let multiplier = 1;
    
    defenderTypes.forEach(defenderType => {
      if (typeChart[attackType] && typeChart[attackType][defenderType]) {
        multiplier *= typeChart[attackType][defenderType];
      }
    });
    
    return multiplier;
  };
  
  /**
   * Determines if an attack is a critical hit
   * @param {number} critRate - Base critical hit rate (0-1)
   * @returns {boolean} - Whether the attack is a critical hit
   */
  export const isCriticalHit = (critRate = 0.1) => {
    return Math.random() < critRate;
  };
  
  /**
   * Calculates the damage of an attack
   * @param {Object} attacker - The attacking Pokémon
   * @param {Object} defender - The defending Pokémon
   * @param {Object} move - The move being used
   * @returns {Object} - Object containing damage and metadata
   */
  export const calculateDamage = (attacker, defender, move) => {
    // Get relevant stats based on move category
    const attackStat = move.category === 'Special' 
      ? attacker.stats.specialAttack 
      : attacker.stats.attack;
      
    const defenseStat = move.category === 'Special' 
      ? defender.stats.specialDefense 
      : defender.stats.defense;
    
    // Base damage formula
    let damage = Math.floor(
      (2 * attacker.level / 5 + 2) * move.power * (attackStat / defenseStat) / 50
    ) + 2;
    
    // Type effectiveness
    const effectiveness = calculateTypeEffectiveness(move.type, defender.types);
    damage = Math.floor(damage * effectiveness);
    
    // Critical hit
    const critical = isCriticalHit();
    if (critical) {
      damage = Math.floor(damage * 1.5);
    }
    
    // Random factor (85-100%)
    const randomFactor = Math.floor(Math.random() * 16) + 85;
    damage = Math.floor(damage * randomFactor / 100);
    
    return {
      damage,
      effectiveness,
      critical,
      randomFactor
    };
  };
  
  /**
   * Determines attack accuracy
   * @param {number} moveAccuracy - The accuracy of the move (0-100)
   * @returns {boolean} - Whether the attack hits
   */
  export const attackHits = (moveAccuracy) => {
    return Math.random() * 100 <= moveAccuracy;
  };
  