import { useState, useEffect } from 'react';
import { usePokemon } from '../context/PokemonContext';
import PokemonGrid from '../components/PokemonGrid';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

function FavoritesPage() {
  const { favorites, isLoading } = usePokemon();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  
  useEffect(() => {
    if (searchTerm) {
      const filtered = favorites.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pokemon.id.toString() === searchTerm
      );
      setFilteredFavorites(filtered);
    } else {
      setFilteredFavorites(favorites);
    }
  }, [favorites, searchTerm]);
  
  return (
    <div>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center">
          <Star size={24} className="text-yellow-400 fill-yellow-400 mr-2" />
          Favorite Pokémon
        </h1>
        <p className="text-gray-400">Your collection of starred Pokémon</p>
      </motion.div>
      
      <div className="mb-8">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search your favorites"
          className="space-input w-full"
        />
      </div>
      
      {!isLoading && filteredFavorites.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12 space-card"
        >
          <h2 className="text-2xl font-bold mb-4">No favorites yet</h2>
          <p className="text-gray-400 mb-6">
            Explore the Pokédex and click the star icon to add Pokémon to your favorites
          </p>
          <Link to="/pokedex" className="space-button">
            Go to Pokédex
          </Link>
        </motion.div>
      )}
      
      <PokemonGrid pokemons={filteredFavorites} isLoading={isLoading} />
    </div>
  );
}

export default FavoritesPage;