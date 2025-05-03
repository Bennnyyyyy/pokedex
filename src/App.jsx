import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PokedexPage from './pages/PokedexPage';
import PokemonDetailPage from './pages/PokemonDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import TeamBuilderPage from './pages/TeamBuilderPage';
import BattlePage from './pages/BattlePage';
import TeamBattlePage from './pages/TeamBattlePage';
import HistoryPage from './pages/HistoryPage';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ToastProvider from './components/ToastManager';
import { PokemonProvider } from './context/PokemonContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate initial loading (e.g., checking server connection)
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        // In a real app, you might check connectivity to your JSON server
        const response = await fetch('http://localhost:3001/healthcheck');
        
        // Simulate a server check
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Server connection error:', error);
        // Still proceed to show the app even if server is down
        setIsLoading(false);
      }
    };
    
    checkServerConnection();
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="space-card p-8 text-center">
          <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-400 to-stone-400">
          Pokémon Battle
          </h1>
          <LoadingSpinner size="large" text="Initializing Pokédex..." />
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <ToastProvider>
        <PokemonProvider>
          <div className="min-h-screen">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/pokedex" element={<PokedexPage />} />
                <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/teams" element={<TeamBuilderPage />} />
                <Route path="/battle" element={<BattlePage />} />
                <Route path="/team-battle" element={<TeamBattlePage />} />
                <Route path="/history" element={<HistoryPage />} />
              </Routes>
            </main>
            
            <footer className="bg-slate-900/80 backdrop-blur-md border-t border-red-500/20 py-6 mt-12">
              <div className="container mx-auto px-4 text-center">
                <p className="text-gray-400 text-sm">
                Pokémon Battle - A thrilled Pokémon Battle Experience
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Pokémon data provided by <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">PokéAPI</a>
                </p>
              </div>
            </footer>
          </div>
        </PokemonProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;