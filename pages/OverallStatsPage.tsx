import React, { useMemo } from 'react';
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
    const { players, stats, teams } = state;

    const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || 'N/A';

    const aggregatedStats = useMemo(() => {
        const playerTotals: { [playerId: string]: AggregatedStats } = {};

        stats.forEach(stat => {
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
                player.number,
                player.name,
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
        }).filter(row => row !== null) as (string|number)[][];

    }, [players, stats, teams]);

    const headers = ['#', 'Player', 'Team', 'GP', 'PPG', 'RPG', 'APG', 'SPG', 'BPG', 'FG%', '2P%', '3P%', 'FT%', 'eFG%'];

    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Overall Player Stats</h1>
            <Card>
                {aggregatedStats.length === 0 ? (
                    <p className="text-text-secondary">No aggregated stats available. Upload match data to see player averages.</p>
                ) : (
                    <Table headers={headers} rows={aggregatedStats} />
                )}
            </Card>
        </div>
    );
};

export default OverallStatsPage;
