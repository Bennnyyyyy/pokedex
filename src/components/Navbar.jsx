import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Star, Users, Zap, Clock, BookOpen } from 'lucide-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const navLinks = [
    { path: '/', name: 'Home', icon: null },
    { path: '/pokedex', name: 'Pokédex', icon: <BookOpen size={18} /> },
    { path: '/favorites', name: 'Favorites', icon: <Star size={18} /> },
    { path: '/teams', name: 'Teams', icon: <Users size={18} /> },
    { path: '/battle', name: 'Single Battle', icon: <Zap size={18} /> },
    { path: '/team-battle', name: 'Team Battle', icon: <Users size={18} /> },
    { path: '/history', name: 'Battle History', icon: <Clock size={18} /> },
  ];
  
  return (
    <nav className="bg-red-600/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl md:text-2xl font-Ortem font-semibold bg-gradient-to-r from-stone-200 to-stone-100 text-transparent bg-clip-text">
            Pokémon
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-white-700/30 text-black'
                    : 'text-gray-300 hover:bg-red-600/20 hover:text-white'
                }`}
              >
                {link.icon && <span>{link.icon}</span>}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-800 border-t border-stone-200">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-purple-700/30 text-white'
                    : 'text-gray-300 hover:bg-red-600/20 hover:text-white'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.icon && <span>{link.icon}</span>}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;