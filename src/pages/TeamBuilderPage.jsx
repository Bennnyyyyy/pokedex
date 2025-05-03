import { useState, useEffect } from 'react';
import { usePokemon } from '../context/PokemonContext';
import { Link } from 'react-router-dom';
import { PlusCircle, X, Trash2, Edit2, Save, X as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function TeamBuilderPage() {
  const { teams, createTeam, updateTeam, deleteTeam, removePokemonFromTeam } = usePokemon();
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editingTeamName, setEditingTeamName] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      setError('Team name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createTeam(newTeamName.trim());
      setNewTeamName('');
      setIsCreatingTeam(false);
    } catch (err) {
      setError(err.message || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTeamName = async (teamId) => {
    if (!editingTeamName.trim()) {
      setError('Team name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const team = teams.find(t => t.id === teamId);
      if (!team) throw new Error('Team not found');

      await updateTeam(teamId, {
        ...team,
        name: editingTeamName.trim()
      });
      setEditingTeamId(null);
      setEditingTeamName('');
    } catch (err) {
      setError(err.message || 'Failed to update team name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteTeam(teamId);
    } catch (err) {
      setError(err.message || 'Failed to delete team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePokemon = async (teamId, pokemonIndex) => {
    setIsLoading(true);
    setError(null);

    try {
      await removePokemonFromTeam(teamId, pokemonIndex);
    } catch (err) {
      setError(err.message || 'Failed to remove Pokemon from team');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Team Builder</h1>
        <Link to="/pokedex" className="space-button">
          Go to Pokédex
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {isCreatingTeam ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-card p-6"
          >
            <form onSubmit={handleCreateTeam} className="flex gap-4">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
                className="flex-1 space-input"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="space-button"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Team'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingTeam(false);
                  setNewTeamName('');
                  setError(null);
                }}
                className="space-button !bg-gray-700 hover:!bg-gray-600"
                disabled={isLoading}
              >
                Cancel
              </button>
            </form>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsCreatingTeam(true)}
            className="space-button w-full flex items-center justify-center"
          >
            <PlusCircle size={20} className="mr-2" />
            Create New Team
          </button>
        )}

        <AnimatePresence>
          {teams.map(team => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-card p-6"
            >
              <div className="flex justify-between items-center mb-4">
                {editingTeamId === team.id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={editingTeamName}
                      onChange={(e) => setEditingTeamName(e.target.value)}
                      className="space-input flex-1"
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => handleUpdateTeamName(team.id)}
                      className="space-button !p-2"
                      disabled={isLoading}
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingTeamId(null);
                        setEditingTeamName('');
                        setError(null);
                      }}
                      className="space-button !p-2 !bg-gray-700 hover:!bg-gray-600"
                      disabled={isLoading}
                    >
                      <XIcon size={18} />
                    </button>
                  </div>
                ) : (
                  <h2 className="text-xl font-bold">{team.name}</h2>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingTeamId(team.id);
                      setEditingTeamName(team.name);
                      setError(null);
                    }}
                    className="space-button !p-2"
                    disabled={isLoading || editingTeamId !== null}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="space-button !p-2 !bg-red-600 hover:!bg-red-500"
                    disabled={isLoading || editingTeamId !== null}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {team.pokemons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No Pokémon in this team yet</p>
                  <Link
                    to="/pokedex"
                    className="space-button inline-flex items-center"
                  >
                    <PlusCircle size={18} className="mr-2" />
                    Add Pokémon
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {team.pokemons.map((pokemon, index) => (
                    <div key={`${pokemon.id}-${index}`} className="relative">
                      <Link to={`/pokemon/${pokemon.id}`} className="block">
                        <div className="space-card p-2 flex flex-col items-center hover:border-purple-500/50 transition-colors">
                          <img
                            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                            alt={pokemon.name}
                            className="w-16 h-16 object-contain mb-1"
                          />
                          <p className="text-xs text-center capitalize truncate w-full">
                            {pokemon.name.replace(/-/g, ' ')}
                          </p>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleRemovePokemon(team.id, index)}
                        className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 hover:bg-red-500 transition-colors"
                        disabled={isLoading}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {Array.from({ length: 6 - team.pokemons.length }).map((_, index) => (
                    <Link
                      key={`empty-${index}`}
                      to="/pokedex"
                      className="space-card p-2 flex flex-col items-center justify-center h-[90px] border-dashed border-2 border-gray-600 hover:border-purple-500/50 transition-colors"
                    >
                      <PlusCircle size={24} className="text-gray-500 mb-1" />
                      <p className="text-xs text-gray-500">Add</p>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TeamBuilderPage;
