import { useState, useEffect, useCallback } from 'react';
import { usePokemon } from '../context/PokemonContext';

function usePokemonSearch(initialSearchTerm = '', initialTypes = []) {
  const { fetchPokemonList, fetchPokemonDetail } = usePokemon();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedTypes, setSelectedTypes] = useState(initialTypes);
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const itemsPerPage = 20;
  
  // Load initial Pokémon data
  useEffect(() => {
    const loadInitialPokemons = async () => {
      if (searchTerm) return; // Don't load initial data if searching
      
      setIsLoading(true);
      setError(null);
      
      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const response = await fetchPokemonList(itemsPerPage, offset);
        
        setTotalPages(Math.ceil(response.count / itemsPerPage));
        
        const pokemonDetails = await Promise.all(
          response.results.map(async (pokemon) => {
            try {
              return await fetchPokemonDetail(pokemon.name);
            } catch (err) {
              console.error(`Error fetching details for ${pokemon.name}:`, err);
              return null;
            }
          })
        );
        
        const formattedPokemons = pokemonDetails
          .filter(p => p !== null)
          .map(details => ({
            id: details.id,
            name: details.name,
            sprites: details.sprites,
            types: details.types.map(type => type.type.name),
            stats: {
              hp: details.stats.find(stat => stat.stat.name === 'hp').base_stat,
              attack: details.stats.find(stat => stat.stat.name === 'attack').base_stat,
              defense: details.stats.find(stat => stat.stat.name === 'defense').base_stat,
              specialAttack: details.stats.find(stat => stat.stat.name === 'special-attack').base_stat,
              specialDefense: details.stats.find(stat => stat.stat.name === 'special-defense').base_stat,
              speed: details.stats.find(stat => stat.stat.name === 'speed').base_stat,
            }
          }));
        
        setPokemons(formattedPokemons);
        setFilteredPokemons(formattedPokemons);
      } catch (err) {
        console.error('Error loading Pokémon list:', err);
        setError('Failed to load Pokémon data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialPokemons();
  }, [currentPage, searchTerm]);
  
  // Handle search by name or ID
  const searchPokemon = useCallback(async (term) => {
    if (!term.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if the term is a number (ID) or name
      const isId = /^\d+$/.test(term);
      
      if (isId) {
        const pokemon = await fetchPokemonDetail(term);
        
        const formattedPokemon = {
          id: pokemon.id,
          name: pokemon.name,
          sprites: pokemon.sprites,
          types: pokemon.types.map(type => type.type.name),
          stats: {
            hp: pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat,
            attack: pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat,
            defense: pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat,
            specialAttack: pokemon.stats.find(stat => stat.stat.name === 'special-attack').base_stat,
            specialDefense: pokemon.stats.find(stat => stat.stat.name === 'special-defense').base_stat,
            speed: pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat,
          }
        };
        
        setFilteredPokemons([formattedPokemon]);
      } else {
        // Search by name (partial match)
        // In a real app, you might want to fetch a larger list and filter client-side
        // or use a server-side search endpoint if available
        
        // For demo purposes, we'll use a broader search and then filter
        const response = await fetchPokemonList(100, 0);
        
        const matchingPokemon = response.results.filter(
          p => p.name.includes(term.toLowerCase())
        );
        
        if (matchingPokemon.length === 0) {
          setFilteredPokemons([]);
          return;
        }
        
        const pokemonDetails = await Promise.all(
          matchingPokemon.map(async (pokemon) => {
            try {
              return await fetchPokemonDetail(pokemon.name);
            } catch (err) {
              console.error(`Error fetching details for ${pokemon.name}:`, err);
              return null;
            }
          })
        );
        
        const formattedPokemons = pokemonDetails
          .filter(p => p !== null)
          .map(details => ({
            id: details.id,
            name: details.name,
            sprites: details.sprites,
            types: details.types.map(type => type.type.name),
            stats: {
              hp: details.stats.find(stat => stat.stat.name === 'hp').base_stat,
              attack: details.stats.find(stat => stat.stat.name === 'attack').base_stat,
              defense: details.stats.find(stat => stat.stat.name === 'defense').base_stat,
              specialAttack: details.stats.find(stat => stat.stat.name === 'special-attack').base_stat,
              specialDefense: details.stats.find(stat => stat.stat.name === 'special-defense').base_stat,
              speed: details.stats.find(stat => stat.stat.name === 'speed').base_stat,
            }
          }));
        
        setFilteredPokemons(formattedPokemons);
      }
    } catch (err) {
      console.error('Error searching for Pokémon:', err);
      setError(`No Pokémon found matching "${term}"`);
      setFilteredPokemons([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPokemonDetail, fetchPokemonList]);
  
  // Handle search term changes
  useEffect(() => {
    if (searchTerm) {
      searchPokemon(searchTerm);
    } else {
      // Reset to initial data when search is cleared
      setFilteredPokemons(pokemons);
    }
  }, [searchTerm, searchPokemon]);
  
  // Apply type filters
  useEffect(() => {
    if (selectedTypes.length === 0) {
      // No type filters, show all results
      setFilteredPokemons(searchTerm ? filteredPokemons : pokemons);
      return;
    }
    
    const filtered = (searchTerm ? filteredPokemons : pokemons).filter(pokemon => 
      selectedTypes.every(type => pokemon.types.includes(type))
    );
    
    setFilteredPokemons(filtered);
  }, [selectedTypes, pokemons, searchTerm]);
  
  return {
    searchTerm,
    setSearchTerm,
    selectedTypes,
    setSelectedTypes,
    filteredPokemons,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
  };
}

export default usePokemonSearch;