
import React, { useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import { useAppContext } from '../context/AppContext';
import type { PlayerStats } from '../types';

interface AggregatedStats {
  gamesPlayed: number;
  [key: string]: number | string;
}

const OverallStatsPage: React.FC = () => {
    const { state } = useAppContext();
    const { players, stats, teams, championships, matches } = state;
    const [selectedChampionshipId, setSelectedChampionshipId] = useState<string>('all');

    const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || 'N/A';

    const aggregatedStats = useMemo(() => {
        const playerTotals: { [playerId: string]: AggregatedStats } = {};

        const filteredMatchIds = selectedChampionshipId === 'all'
            ? new Set(matches.map(m => m.id))
            : new Set(matches.filter(m => m.championshipId === selectedChampionshipId).map(m => m.id));
        
        const relevantStats = stats.filter(s => filteredMatchIds.has(s.matchId));

        relevantStats.forEach(stat => {
            if (!playerTotals[stat.playerId]) {
                playerTotals[stat.playerId] = { gamesPlayed: 0 };
            }
            playerTotals[stat.playerId].gamesPlayed += 1;
            
            Object.keys(stat).forEach(key => {
                const statKey = key as keyof PlayerStats;
                if (typeof stat[statKey] === 'number') {
                    if (!playerTotals[stat.playerId][statKey]) {
                        playerTotals[stat.playerId][statKey] = 0;
                    }
                    (playerTotals[stat.playerId][statKey] as number) += (stat[statKey] as number);
                }
            });
        });
        
        return players.map(player => {
            const totals = playerTotals[player.id];
            if (!totals || totals.gamesPlayed === 0) return null;

            const playerCell = (
                <div className="flex items-center gap-3">
                    <img 
                        src={player.pictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=4A5568&color=fff`} 
                        alt={player.name}
                        className="w-10 h-10 rounded-full object-cover bg-gray-500"
                    />
                    <span>{`${player.number} - ${player.name}`}</span>
                </div>
            );

            const ppg = ((totals.pts as number) / totals.gamesPlayed).toFixed(1);
            const rpg = ((totals.rebs as number) / totals.gamesPlayed).toFixed(1);
            const apg = ((totals.ast as number) / totals.gamesPlayed).toFixed(1);
            const spg = ((totals.stl as number) / totals.gamesPlayed).toFixed(1);
            const bpg = ((totals.blk as number) / totals.gamesPlayed).toFixed(1);

            const fgPct = (((totals.fg as number) / (totals.fga as number)) * 100 || 0).toFixed(1);
            const twoPtPct = (((totals.twoPt as number) / (totals.twoPtA as number)) * 100 || 0).toFixed(1);
            const threePtPct = (((totals.threePt as number) / (totals.threePtA as number)) * 100 || 0).toFixed(1);
            const ftPct = (((totals.ft as number) / (totals.fta as number)) * 100 || 0).toFixed(1);
            const efgPct = ((((totals.fg as number) + 0.5 * (totals.threePt as number)) / (totals.fga as number)) * 100 || 0).toFixed(1);

            return [
                playerCell,
                getTeamName(player.teamId),
                totals.gamesPlayed,
                ppg,
                rpg,
                apg,
                spg,
                bpg,
                `${fgPct}%`,
                `${twoPtPct}%`,
                `${threePtPct}%`,
                `${ftPct}%`,
                `${efgPct}%`,
            ];
        }).filter(row => row !== null) as React.ReactNode[][];

    }, [players, stats, teams, matches, selectedChampionshipId]);

    const headers = ['Player', 'Team', 'GP', 'PPG', 'RPG', 'APG', 'SPG', 'BPG', 'FG%', '2P%', '3P%', 'FT%', 'eFG%'];

    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Overall Player Stats</h1>

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
                {aggregatedStats.length === 0 ? (
                    <p className="text-text-secondary">No aggregated stats available for this selection. Upload match data to see player averages.</p>
                ) : (
                    <Table headers={headers} rows={aggregatedStats} />
                )}
            </Card>
        </div>
    );
};

export default OverallStatsPage;