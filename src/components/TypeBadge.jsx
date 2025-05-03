function TypeBadge({ type }) {
    const typeClass = {
      normal: 'badge-normal',
      fire: 'badge-fire',
      water: 'badge-water',
      electric: 'badge-electric',
      grass: 'badge-grass',
      ice: 'badge-ice',
      fighting: 'badge-fighting',
      poison: 'badge-poison',
      ground: 'badge-ground',
      flying: 'badge-flying',
      psychic: 'badge-psychic',
      bug: 'badge-bug',
      rock: 'badge-rock',
      ghost: 'badge-ghost',
      dragon: 'badge-dragon',
      dark: 'badge-dark',
      steel: 'badge-steel',
      fairy: 'badge-fairy'
    };
    
    return (
      <span className={`badge ${typeClass[type] || 'badge-normal'}`}>
        {type}
      </span>
    );
  }
  
  export default TypeBadge;
  