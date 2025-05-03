import { useState } from 'react';
import { ShieldCheck, Shield, ShieldAlert, Info, Trophy } from 'lucide-react';

function DifficultySelector({ selectedDifficulty, onSelectDifficulty, showInfo = true }) {
  const [showTooltip, setShowTooltip] = useState(null);
  
  const difficultyInfo = {
    easy: {
      icon: <ShieldCheck size={18} />,
      label: "Easy",
      color: "from-green-600 to-emerald-600",
      hoverColor: "from-green-500 to-emerald-500",
      activeColor: "from-green-700 to-emerald-700",
      description: "Opponent's stats are reduced by 30%. Recommended for beginners."
    },
    normal: {
      icon: <Shield size={18} />,
      label: "Normal",
      color: "from-blue-600 to-indigo-600",
      hoverColor: "from-blue-500 to-indigo-500",
      activeColor: "from-blue-700 to-indigo-700",
      description: "Standard difficulty with balanced stats. A fair challenge."
    },
    hard: {
      icon: <ShieldAlert size={18} />,
      label: "Hard",
      color: "from-red-600 to-rose-600",
      hoverColor: "from-red-500 to-rose-500",
      activeColor: "from-red-700 to-rose-700",
      description: "Opponent's stats are increased by 30%. For experienced trainers."
    }
  };
  
  return (
    <div className="mb-6">
      <h3 className="font-bold mb-2">Select Difficulty</h3>
      <div className="flex gap-3 mb-2">
        {Object.keys(difficultyInfo).map(difficulty => (
          <button
            key={difficulty}
            onClick={() => onSelectDifficulty(difficulty)}
            onMouseEnter={() => showInfo && setShowTooltip(difficulty)}
            onMouseLeave={() => showInfo && setShowTooltip(null)}
            className={`space-button flex-1 relative flex items-center justify-center gap-2 ${
              selectedDifficulty === difficulty 
                ? difficultyInfo[difficulty].color + " ring-2 ring-white/30" 
                : "from-gray-700 to-gray-600 hover:" + difficultyInfo[difficulty].hoverColor
            }`}
          >
            {difficultyInfo[difficulty].icon}
            <span>{difficultyInfo[difficulty].label}</span>
            {selectedDifficulty === difficulty && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></span>
            )}
          </button>
        ))}
      </div>
      
      {showInfo && (
        <div className="relative">
          <div 
            className={`w-full p-3 bg-slate-800/70 rounded-md text-sm transition-opacity duration-200 ${
              showTooltip ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {showTooltip && (
              <div className="flex items-start gap-2">
                <Info size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p>{difficultyInfo[showTooltip].description}</p>
              </div>
            )}
          </div>
          <div className={`bg-slate-800/70 rounded-md p-3 mt-2 flex items-start gap-2 ${
            selectedDifficulty ? 'opacity-100' : 'opacity-0' 
          }`}>
            <Info size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              {selectedDifficulty 
                ? difficultyInfo[selectedDifficulty].description
                : "Select a difficulty level"
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DifficultySelector;