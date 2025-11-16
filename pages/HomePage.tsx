
import React, { useMemo } from 'react';
import Card from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HomePage: React.FC = () => {
    const { state } = useAppContext();
    const { matches, players, teams, stats } = state;

    const mainTeam = useMemo(() => {
        return teams.find(t => t.isMain) || (teams.length > 0 ? teams[0] : null);
    }, [teams]);

    const latestMatch = useMemo(() => {
        if (!mainTeam) return null;
        // Find the latest match involving the main team
        const teamMatches = matches
            .filter(m => m.team1Id === mainTeam.id || m.team2Id === mainTeam.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return teamMatches.length > 0 ? teamMatches[0] : null;
    }, [matches, mainTeam]);

    const topScorer = useMemo(() => {
        if (!mainTeam || !latestMatch) return null;
        const mainTeamStats = stats.filter(s => s.matchId === latestMatch.id && s.teamId === mainTeam.id);
        if (mainTeamStats.length === 0) return null;
        return mainTeamStats.reduce((top, player) => player.pts > top.pts ? player : top);
    }, [stats, mainTeam, latestMatch]);

    const chartData = useMemo(() => {
        if (!mainTeam || !latestMatch) return [];
        return stats
            .filter(s => s.matchId === latestMatch.id && s.teamId === mainTeam.id)
            .map(s => ({
                name: s.playerName,
                Points: s.pts,
                Rebounds: s.rebs,
                Assists: s.ast,
            }));
    }, [stats, mainTeam, latestMatch]);


    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Dashboard</h1>
            
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
                            <p className="text-4xl font-bold text-accent">{matches.length}</p>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-text-secondary mb-2">Total Teams</h3>
                            <p className="text-4xl font-bold text-accent">{teams.length}</p>
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-text-secondary mb-2">Total Players</h3>
                            <p className="text-4xl font-bold text-accent">{players.length}</p>
                        </Card>
                        {topScorer && mainTeam && (
                             <Card>
                                <h3 className="text-lg font-semibold text-text-secondary mb-2">Latest Top Scorer ({mainTeam.name})</h3>
                                <p className="text-2xl font-bold text-accent">{topScorer.playerName}</p>
                                <p className="text-xl text-text-primary">{topScorer.pts} Points</p>
                            </Card>
                        )}
                    </div>

                    <Card>
                        <h2 className="text-2xl font-semibold text-accent mb-4">
                            Latest Match Stats for {mainTeam?.name || 'Main Team'}
                        </h2>
                         <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                <XAxis dataKey="name" stroke="#a0aec0" />
                                <YAxis stroke="#a0aec0" />
                                <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none' }} cursor={{fill: '#4a5568' }} />
                                <Legend wrapperStyle={{ color: '#f7fafc' }} />
                                <Bar dataKey="Points" fill="#ed8936" />
                                <Bar dataKey="Rebounds" fill="#4299e1" />
                                <Bar dataKey="Assists" fill="#48bb78" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </>
            )}
        </div>
    );
};

export default HomePage;