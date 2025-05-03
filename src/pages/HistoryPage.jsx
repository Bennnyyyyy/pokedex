import { useState, useEffect } from 'react';
import { usePokemon } from '../context/PokemonContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Filter, Clock, Trophy, Calendar, Zap, Users, Trash2, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import BattleCard from '../components/BattleCard';
import DashboardStats from '../components/DashboardStats';
import { formatPokemonName } from '../utils/pokemonUtils';
import { calculateWinRate } from '../utils/pokemonUtils';
import { useToast } from '../components/ToastManager';

function HistoryPage() {
  const { battleHistory, deleteBattleFromHistory, clearBattleHistory } = usePokemon();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filter, setFilter] = useState('all'); // all, wins, losses, single, team
  const [sortBy, setSortBy] = useState('date'); // date, difficulty, type
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [battleToDelete, setBattleToDelete] = useState(null);
  const [expandedBattle, setExpandedBattle] = useState(null);
  const [error, setError] = useState(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalBattles: 0,
    winRate: 0,
    singleBattles: 0,
    teamBattles: 0,
    easyBattles: 0,
    normalBattles: 0,
    hardBattles: 0,
  });

  // Load and filter data on mount and when dependencies change
  useEffect(() => {
    setIsLoading(true);
    
    // Apply filters and sorting
    let filtered = [...battleHistory];
    
    // Apply filter
    if (filter === 'wins') {
      filtered = filtered.filter(battle => {
        if (battle.type === 'team') {
          return battle.winner === battle.playerTeam.id;
        } else {
          return battle.winner === battle.playerPokemon.id;
        }
      });
    } else if (filter === 'losses') {
      filtered = filtered.filter(battle => {
        if (battle.type === 'team') {
          return battle.winner !== battle.playerTeam.id;
        } else {
          return battle.winner !== battle.playerPokemon.id;
        }
      });
    } else if (filter === 'single') {
      filtered = filtered.filter(battle => battle.type !== 'team');
    } else if (filter === 'team') {
      filtered = filtered.filter(battle => battle.type === 'team');
    }
    
    // Apply sorting
    filtered = filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'difficulty') {
        const difficultyOrder = { easy: 1, normal: 2, hard: 3 };
        return sortOrder === 'desc'
          ? difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]
          : difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      } else if (sortBy === 'type') {
        const typeA = a.type === 'team' ? 'team' : 'single';
        const typeB = b.type === 'team' ? 'team' : 'single';
        return sortOrder === 'desc'
          ? typeA.localeCompare(typeB)
          : typeB.localeCompare(typeA);
      }
      return 0;
    });
    
    // Calculate stats
    const totalBattles = battleHistory.length;
    const winRate = calculateWinRate(battleHistory);
    const singleBattles = battleHistory.filter(battle => battle.type !== 'team').length;
    const teamBattles = battleHistory.filter(battle => battle.type === 'team').length;
    const easyBattles = battleHistory.filter(battle => battle.difficulty === 'easy').length;
    const normalBattles = battleHistory.filter(battle => battle.difficulty === 'normal').length;
    const hardBattles = battleHistory.filter(battle => battle.difficulty === 'hard').length;
    
    setStats({
      totalBattles,
      winRate,
      singleBattles,
      teamBattles,
      easyBattles,
      normalBattles,
      hardBattles,
    });
    
    setFilteredHistory(filtered);
    setIsLoading(false);
  }, [battleHistory, filter, sortBy, sortOrder]);

  const handleDeleteBattle = (battle) => {
    setBattleToDelete(battle);
    setShowConfirmDelete(true);
  };

  const confirmDeleteBattle = async () => {
    if (battleToDelete) {
      await deleteBattleFromHistory(battleToDelete.id);
      setBattleToDelete(null);
    }
  };
  
  const confirmClearHistory = async () => {
    try {
      setIsLoading(true);
      await clearBattleHistory();
      addToast('Battle history cleared successfully', 'success');
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('Failed to clear battle history');
      addToast('Failed to clear battle history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'hard': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" text="Loading battle history..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Link to="/" className="space-button inline-flex items-center">
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold">Battle History</h1>
        
        <button
          onClick={() => setShowConfirmClear(true)}
          className="space-button !bg-red-600 hover:!bg-red-500 flex items-center"
          disabled={battleHistory.length === 0}
        >
          <Trash2 size={18} className="mr-2" />
          Clear All
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 text-red-400 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={18} />
          </button>
        </div>
      )}
      
      {/* Stats Overview */}
      <div className="space-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Battle Statistics</h2>
        
        <DashboardStats 
          stats={[
            { label: 'Total Battles', value: stats.totalBattles },
            { label: 'Win Rate', value: `${stats.winRate}%`, color: 'text-green-400', highlight: true },
            { label: 'Single Battles', value: stats.singleBattles },
            { label: 'Team Battles', value: stats.teamBattles }
          ]}
        />
        
        <h3 className="text-lg font-semibold mt-6 mb-3">Difficulty Breakdown</h3>
        <DashboardStats 
          stats={[
            { label: 'Easy', value: stats.easyBattles, color: 'text-green-400', subtitle: 'Battles' },
            { label: 'Normal', value: stats.normalBattles, color: 'text-blue-400', subtitle: 'Battles' },
            { label: 'Hard', value: stats.hardBattles, color: 'text-red-400', subtitle: 'Battles' },
          ]}
          columns={3}
        />
      </div>
      
      {/* Filters and Sorting */}
      <div className="space-card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Filter</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === 'all'
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('wins')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === 'wins'
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Wins
              </button>
              <button
                onClick={() => setFilter('losses')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === 'losses'
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Losses
              </button>
              <button
                onClick={() => setFilter('single')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === 'single'
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Single
              </button>
              <button
                onClick={() => setFilter('team')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === 'team'
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Team
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-400 block mb-1">Sort By</label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="space-input text-sm py-1"
              >
                <option value="date">Date</option>
                <option value="difficulty">Difficulty</option>
                <option value="type">Battle Type</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm"
                title={sortOrder === 'desc' ? "Descending" : "Ascending"}
              >
                {sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Battle History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12 space-card">
          <h2 className="text-2xl font-bold mb-4">No Battles Yet</h2>
          <p className="text-gray-400 mb-6">
            You haven't fought any battles yet, or none match your current filter.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/battle" className="space-button">
              Single Battle
            </Link>
            <Link to="/team-battle" className="space-button">
              Team Battle
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredHistory.map(battle => (
              <BattleCard
                key={battle.id}
                battle={battle}
                expanded={expandedBattle === battle.id}
                onDelete={handleDeleteBattle}
                onToggleExpand={(isExpanded) => {
                  setExpandedBattle(isExpanded ? battle.id : null);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
      
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={confirmDeleteBattle}
        title="Delete Battle Record"
        message="Are you sure you want to delete this battle record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      
      <ConfirmDialog
        isOpen={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        onConfirm={confirmClearHistory}
        title="Clear Battle History"
        message="Are you sure you want to clear your entire battle history? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default HistoryPage;