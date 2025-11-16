import React, { useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HomePage: React.FC = () => {
    const { state } = useAppContext();
    const { matches, players, teams, stats, championships } = state;
    const [selectedChampionshipId, setSelectedChampionshipId] = useState<string>('all');

    const filteredMatches = useMemo(() => {
        if (selectedChampionshipId === 'all') return matches;
        return matches.filter(m => m.championshipId === selectedChampionshipId);
    }, [matches, selectedChampionshipId]);

    const filteredMatchIds = useMemo(() => new Set(filteredMatches.map(m => m.id)), [filteredMatches]);

    const filteredStats = useMemo(() => {
        return stats.filter(s => filteredMatchIds.has(s.matchId));
    }, [stats, filteredMatchIds]);

    const mainTeam = useMemo(() => {
        return teams.find(t => t.isMain) || (teams.length > 0 ? teams[0] : null);
    }, [teams]);

    const totalMatches = filteredMatches.length;

    const totalTeams = useMemo(() => {
        const teamIds = new Set<string>();
        filteredMatches.forEach(match => {
            teamIds.add(match.team1Id);
            teamIds.add(match.team2Id);
        });
        return teamIds.size;
    }, [filteredMatches]);

    const totalPlayers = useMemo(() => {
        const playerIds = new Set<string>();
        filteredStats.forEach(stat => playerIds.add(stat.playerId));
        return playerIds.size;
    }, [filteredStats]);

    const topScorer = useMemo(() => {
        if (!mainTeam) return null;
        const mainTeamStats = filteredStats.filter(s => s.teamId === mainTeam.id);
        if (mainTeamStats.length === 0) return null;

        const pointsPerPlayer = mainTeamStats.reduce((acc, stat) => {
            const player = players.find(p => p.id === stat.playerId);
            if (!player) return acc;

            if (!acc[stat.playerId]) {
                acc[stat.playerId] = { name: player.name, number: player.number, points: 0 };
            }
            acc[stat.playerId].points += stat.pts;
            return acc;
        }, {} as { [playerId: string]: { name: string, number: string, points: number } });
        
        const playerPointsArray = Object.values(pointsPerPlayer);
        if (playerPointsArray.length === 0) {
            return null;
        }

        // FIX: The reduce function without an initial value was causing type inference issues.
        // By providing the first element of the (guaranteed non-empty) array as the initial value,
        // we ensure correct type inference for the result.
        const top = playerPointsArray.reduce((max, p) => p.points > max.points ? p : max, playerPointsArray[0]);
        
        return { playerName: top.name, playerNumber: top.number, pts: top.points };
    }, [filteredStats, mainTeam, players]);

    const chartData = useMemo(() => {
        if (!mainTeam) return [];

        const mainTeamPlayers = players.filter(p => p.teamId === mainTeam.id);
        const mainTeamPlayerIds = new Set(mainTeamPlayers.map(p => p.id));
        const mainTeamStats = filteredStats.filter(s => mainTeamPlayerIds.has(s.playerId));

        const aggregated = mainTeamPlayers.map(player => {
            const playerStats = mainTeamStats.filter(s => s.playerId === player.id);
            if (playerStats.length === 0) return null;

            const totals = playerStats.reduce((acc, stat) => {
                acc.Points += stat.pts;
                acc.Rebounds += stat.rebs;
                acc.Assists += stat.ast;
                return acc;
            }, { Points: 0, Rebounds: 0, Assists: 0 });

            return {
                name: `${player.number} - ${player.name}`,
                ...totals,
            };
        }).filter((p): p is { name: string; Points: number; Rebounds: number; Assists: number; } => p !== null);

        return aggregated;
    }, [filteredStats, players, mainTeam]);


    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Dashboard</h1>
            
            {mainTeam && (
                <Card className="mb-8 flex items-center gap-4">
                    <img 
                        src={mainTeam.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(mainTeam.name)}&background=ED8936&color=fff`} 
                        alt={`${mainTeam.name} logo`} 
                        className="w-16 h-16 rounded-full object-cover bg-gray-500"
                    />
                    <div>
                        <h2 className="text-2xl font-semibold text-text-primary">{mainTeam.name}</h2>
                        <p className="text-text-secondary">Main Team</p>
                    </div>
                </Card>
            )}

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

            {matches.length === 0 ? (
                <Card>
                    <h2 className="text-2xl font-semibold text-accent mb-4">Welcome to BasketStat Pro!</h2>
                    <p className="text-text-secondary">It looks like you haven't uploaded any data yet. Go to the "Data Entry" tab to upload your first match CSV and see the stats come to life!</p>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <h3 className="text-lg font-semibold text-text-secondary mb-2">Total Matches</h3>
                            <p className="text-4xl font-bold text-accent">{totalMatches}</p>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-text-secondary mb-2">Total Teams</h3>
                            <p className="text-4xl font-bold text-accent">{totalTeams}</p>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-text-secondary mb-2">Total Players</h3>
                            <p className="text-4xl font-bold text-accent">{totalPlayers}</p>
                        </Card>
                        {topScorer && mainTeam && (
                            <Card>
                                <h3 className="text-lg font-semibold text-text-secondary mb-2">Top Scorer ({mainTeam.name})</h3>
                                <p className="text-2xl font-bold text-accent">{`#${topScorer.playerNumber} ${topScorer.playerName}`}</p>
                                <p className="text-xl text-text-primary">{topScorer.pts} Points</p>
                            </Card>
                        )}
                    </div>

                    <Card>
                        <h2 className="text-2xl font-semibold text-accent mb-4">
                            Overall Player Stats for {mainTeam?.name || 'Main Team'}
                        </h2>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                    <XAxis dataKey="name" stroke="#a0aec0" />
                                    <YAxis stroke="#a0aec0" />
                                    <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} cursor={{ fill: '#4a5568' }} />
                                    <Legend wrapperStyle={{ color: '#f7fafc' }} />
                                    <Bar dataKey="Points" fill="#ed8936" />
                                    <Bar dataKey="Rebounds" fill="#4299e1" />
                                    <Bar dataKey="Assists" fill="#48bb78" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-96">
                                <p className="text-text-secondary">No data available for the selected team and championship.</p>
                            </div>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
};

export default HomePage;