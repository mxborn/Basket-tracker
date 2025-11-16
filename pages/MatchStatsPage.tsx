import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import { useAppContext } from '../context/AppContext';
import type { PlayerStats } from '../types';

const statHeaders = ['Player', 'MIN', 'PTS', 'REB', 'AST', 'STL', 'BLK', 'FG', 'FGA', 'FG%', '3P', '3PA', '3P%', 'FT', 'FTA', 'FT%', '+/-'];

const formatStatsToRows = (stats: PlayerStats[]): (string | number)[][] => {
  return stats.map(s => [
    `${s.playerNumber} - ${s.playerName}`,
    s.minutes,
    s.pts,
    s.rebs,
    s.ast,
    s.stl,
    s.blk,
    s.fg,
    s.fga,
    s.fgPct.toFixed(1),
    s.threePt,
    s.threePtA,
    s.threePtPct.toFixed(1),
    s.ft,
    s.fta,
    s.ftPct.toFixed(1),
    s.plusMinus,
  ]);
};

const MatchStatsPage: React.FC = () => {
    const { state } = useAppContext();
    const { matches, stats, teams, championships } = state;
    const [selectedMatchId, setSelectedMatchId] = useState<string>(matches.length > 0 ? matches[0].id : '');

    const selectedMatch = matches.find(m => m.id === selectedMatchId);
    const team1Stats = selectedMatch ? stats.filter(s => s.matchId === selectedMatch.id && s.teamId === selectedMatch.team1Id) : [];
    const team2Stats = selectedMatch ? stats.filter(s => s.matchId === selectedMatch.id && s.teamId === selectedMatch.team2Id) : [];

    const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || 'Team';
    const getChampionshipName = (championshipId: string) => championships.find(c => c.id === championshipId)?.name || 'N/A';


    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Match Statistics</h1>
            
            {matches.length === 0 ? (
                <Card><p className="text-text-secondary">No match data available. Please upload a CSV file.</p></Card>
            ) : (
                <>
                    <div className="mb-6">
                        <label htmlFor="match-selector" className="block text-sm font-medium text-text-secondary mb-2">Select a Match</label>
                        <select 
                            id="match-selector"
                            value={selectedMatchId}
                            onChange={(e) => setSelectedMatchId(e.target.value)}
                            className="bg-secondary border border-gray-600 text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full md:w-2/3 p-2.5"
                        >
                            {matches.map(match => (
                                <option key={match.id} value={match.id}>
                                    {`${match.date} | ${getChampionshipName(match.championshipId)} | ${match.team1Name} vs ${match.team2Name}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedMatch && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-semibold text-accent mb-4">{getTeamName(selectedMatch.team1Id)}</h2>
                                <Table headers={statHeaders} rows={formatStatsToRows(team1Stats)} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-accent mb-4">{getTeamName(selectedMatch.team2Id)}</h2>
                                <Table headers={statHeaders} rows={formatStatsToRows(team2Stats)} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MatchStatsPage;