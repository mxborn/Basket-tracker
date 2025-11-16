
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import { useAppContext } from '../context/AppContext';

const PlayersPage: React.FC = () => {
    const { state } = useAppContext();
    const { players, teams } = state;
    const [selectedTeamId, setSelectedTeamId] = useState<string>('all');

    const filteredPlayers = useMemo(() => {
        if (selectedTeamId === 'all') {
            return players;
        }
        return players.filter(p => p.teamId === selectedTeamId);
    }, [players, selectedTeamId]);
    
    const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || 'N/A';

    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Players</h1>
            
            <div className="mb-6">
                <label htmlFor="team-filter" className="block text-sm font-medium text-text-secondary mb-2">Filter by Team</label>
                <select 
                    id="team-filter"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="bg-secondary border border-gray-600 text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full md:w-1/3 p-2.5"
                >
                    <option value="all">All Teams</option>
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
            </div>
            
            <Card>
                {players.length === 0 ? (
                    <p className="text-text-secondary">No players found. Upload a match file to get started.</p>
                ) : (
                    <Table
                        headers={['Name', 'Number', 'Team']}
                        rows={filteredPlayers.map(player => [player.name, player.number, getTeamName(player.teamId)])}
                    />
                )}
            </Card>
        </div>
    );
};

export default PlayersPage;
