
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import { useAppContext } from '../context/AppContext';

const MatchListPage: React.FC = () => {
    const { state } = useAppContext();
    const { matches, championships } = state;
    const [selectedChampionshipId, setSelectedChampionshipId] = useState<string>('all');

    const filteredMatches = useMemo(() => {
        if (selectedChampionshipId === 'all') {
            return matches;
        }
        return matches.filter(m => m.championshipId === selectedChampionshipId);
    }, [matches, selectedChampionshipId]);

    const getChampionshipName = (championshipId: string) => championships.find(c => c.id === championshipId)?.name || 'N/A';

    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Matches</h1>
            
            <div className="mb-6">
                <label htmlFor="championship-filter" className="block text-sm font-medium text-text-secondary mb-2">Filter by Championship</label>
                <select 
                    id="championship-filter"
                    value={selectedChampionshipId}
                    onChange={(e) => setSelectedChampionshipId(e.target.value)}
                    className="bg-secondary border border-gray-600 text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full md:w-1/3 p-2.5"
                >
                    <option value="all">All Championships</option>
                    {championships.map(champ => (
                        <option key={champ.id} value={champ.id}>{champ.name}</option>
                    ))}
                </select>
            </div>

            <Card>
                {matches.length === 0 ? (
                    <p className="text-text-secondary">No matches found. Upload a match file to get started.</p>
                ) : (
                    <Table
                        headers={['Date', 'Championship', 'Home Team', 'Score', 'Away Team']}
                        rows={filteredMatches.map(match => [
                            match.date,
                            getChampionshipName(match.championshipId),
                            match.team1Name,
                            `${match.team1Score} - ${match.team2Score}`,
                            match.team2Name
                        ])}
                    />
                )}
            </Card>
        </div>
    );
};

export default MatchListPage;
