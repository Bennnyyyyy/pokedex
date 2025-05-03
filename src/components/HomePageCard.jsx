import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function HomePageCard({ 
  icon, 
  title, 
  description, 
  to, 
  buttonText, 
  delay = 0.1, 
  bgColor = 'bg-blue-600/20',
  iconColor = 'text-blue-400'
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-card p-6 flex flex-col items-center text-center h-full"
    >
      <div className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center mb-4`}>
        {icon && <span className={iconColor}>{icon}</span>}
      </div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-400 mb-6 flex-grow">
        {description}
      </p>
      <Link to={to} className="space-button mt-auto">
        {buttonText || 'Explore'}
      </Link>
    </motion.div>
  );
}

export default HomePageCard;