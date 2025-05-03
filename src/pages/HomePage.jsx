import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, BookOpen, Users, Star, Zap, Clock } from 'lucide-react';
import HomePageCard from '../components/HomePageCard';

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-stone-500 via-stone-300 to-stone-200">
        Pokémon Battle
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Experience Pokémon battles. Train your team, battle with alien intelligence, and become the ultimate Champion!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <HomePageCard 
          icon={<BookOpen size={32} />}
          title="Pokédex"
          description="Explore hundreds of Pokémon species with detailed information, stats, and abilities."
          to="/pokedex"
          buttonText="Open Pokédex"
          delay={0.1}
          bgColor="bg-blue-600/20"
          iconColor="text-blue-400"
        />

        <HomePageCard 
          icon={<Users size={32} />}
          title="Pokémon Teams"
          description="Build your ultimate team of up to 6 Pokémon strategically chosen for battle domination."
          to="/teams"
          buttonText="Create Team"
          delay={0.2}
          bgColor="bg-purple-600/20"
          iconColor="text-purple-400"
        />

        <HomePageCard 
          icon={<Zap size={32} />}
          title="Pokémon Battle"
          description="Test your skills in 1v1 or full team battles against AI opponents of varying difficulty."
          to="/battle"
          buttonText="Battle Now"
          delay={0.3}
          bgColor="bg-pink-600/20"
          iconColor="text-pink-400"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="battle-arena p-8 text-center mb-16"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Fiercely Battle
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-6">
          Battle with a firely heart to enhance your Pokémon's abilities in the battlefield.
        </p>
        <Link to="/team-battle" className="space-button inline-flex items-center">
          <Gamepad2 size={18} className="mr-2" />
          Enter Team Battle
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <HomePageCard 
          icon={<Star size={28} />}
          title="Collect Your Favorites"
          description="Mark your favorite Pokémon."
          to="/favorites"
          buttonText="View Favorites"
          delay={0.5}
          bgColor="bg-yellow-600/20"
          iconColor="text-yellow-400"
        />
        
        <HomePageCard 
          icon={<Zap size={28} />}
          title="Team Battles"
          description="Assemble your best team of Pokémon and face off against powerful opponents."
          to="/team-battle"
          buttonText="Team Battle"
          delay={0.6}
          bgColor="bg-red-600/20"
          iconColor="text-red-400"
        />
        
        <HomePageCard 
          icon={<Clock size={28} />}
          title="Battle Records"
          description="View your battle history, analyze your strategies, and improve your strategy."
          to="/history"
          buttonText="View History"
          delay={0.7}
          bgColor="bg-emerald-600/20"
          iconColor="text-emerald-400"
        />
      </motion.div>
    </div>
  );
}

export default HomePage;