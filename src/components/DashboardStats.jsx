import { motion } from 'framer-motion';

function DashboardStats({ stats, columns = 4 }) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`grid ${gridCols[columns] || gridCols[4]} gap-4`}
    >
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className={`space-card p-4 text-center ${stat.highlight ? 'border-red-500/50' : ''}`}
          style={stat.bgColor ? { backgroundColor: stat.bgColor } : {}}
        >
          <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color || ''}`}>{stat.value}</p>
          {stat.subtitle && <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>}
        </div>
      ))}
    </motion.div>
  );
}

export default DashboardStats;