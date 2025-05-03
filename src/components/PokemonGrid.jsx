import { useState, useEffect } from 'react';
import PokemonCard from './PokemonCard';
import { usePokemon } from '../context/PokemonContext';
import { motion } from 'framer-motion';

function PokemonGrid({ pokemons, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="space-card p-4 animate-pulse">
            <div className="w-full aspect-square bg-slate-700/50 rounded-lg mb-3"></div>
            <div className="h-5 bg-slate-700/50 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-slate-700/50 rounded w-1/2 mx-auto mb-2"></div>
            <div className="flex justify-center gap-1">
              <div className="h-6 bg-slate-700/50 rounded-full w-16"></div>
              <div className="h-6 bg-slate-700/50 rounded-full w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!pokemons || pokemons.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl text-gray-400">No Pokémon found</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {pokemons.map(pokemon => (
        <PokemonCard key={pokemon.id} pokemon={pokemon} />
      ))}
    </motion.div>
  );
}

export default PokemonGrid;