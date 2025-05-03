import { motion } from 'framer-motion';

function StatBar({ statName, value, maxValue = 255 }) {
  const percentage = Math.min(100, (value / maxValue) * 100);
  
  const getStatClass = () => {
    switch (statName.toLowerCase()) {
      case 'hp': return 'stat-hp';
      case 'attack': return 'stat-attack';
      case 'defense': return 'stat-defense';
      case 'special-attack': return 'stat-special-attack';
      case 'special-defense': return 'stat-special-defense';
      case 'speed': return 'stat-speed';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatName = () => {
    switch (statName.toLowerCase()) {
      case 'hp': return 'HP';
      case 'attack': return 'Attack';
      case 'defense': return 'Defense';
      case 'special-attack': return 'Sp. Atk';
      case 'special-defense': return 'Sp. Def';
      case 'speed': return 'Speed';
      default: return statName;
    }
  };
  
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{getStatName()}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
      <div className="stat-bar">
        <motion.div 
          className={`stat-bar-fill ${getStatClass()}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default StatBar;