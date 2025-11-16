import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import { useAppContext } from '../context/AppContext';
import type { Player, PlayerStats } from '../types';

const VpsCell: React.FC<{ value: number }> = ({ value }) => {
  const valueStr = value.toFixed(2).replace('.', ',');
  let bgColor = 'bg-red-700/80';
  if (value >= 2) bgColor = 'bg-green-500/80';
  else if (value >= 1.5) bgColor = 'bg-green-600/80';
  else if (value >= 1) bgColor = 'bg-yellow-500/80';
  else if (value >= 0.5) bgColor = 'bg-orange-600/80';

  return (
    <div className="flex justify-center">
      <div className={`text-white font-bold px-2 py-0.5 rounded-md text-xs ${bgColor}`}>
        {valueStr}
      </div>
    </div>
  );
};

const PlusMinusCell: React.FC<{ value: number }> = ({ value }) => {
    const maxVal = 35; // A reasonable max for scaling the bar
    const width = Math.min((Math.abs(value) / maxVal) * 100, 100);
    return (
        <div className="relative w-16 h-5 mx-auto bg-gray-600 rounded-sm overflow-hidden flex items-center justify-center">
            <div
                className="absolute top-0 left-0 h-full bg-blue-400/70"
                style={{ width: `${width}%` }}
            ></div>
            <span className="relative z-10 font-semibold text-white text-xs">{value}</span>
        </div>
    );
};

const StatsTable: React.FC<{
    teamName: string;
    teamStats: PlayerStats[];
    players: Player[];
}> = ({ teamName, teamStats, players }) => {

    const headers = [
        'Player', '-Mins', '-2P', '-2PA', '-2P%', '-3P', '-3PA', '-3P%', '-FT', '-FTA', '-FT%', 'FGM', 'FGA', 'FG %',
        '-DR', '-OR', '-PF', '-DF', '-TO', '-ST', '-AST', '-BLK', '-BLKA', '-Pt', 'VPS', '+/-'
    ];

    const totals = useMemo(() => {
        if (!teamStats || teamStats.length === 0) return null;

        const sum = teamStats.reduce((acc, s) => {
            acc.minutes += s.minutes;
            acc.twoPt += s.twoPt; acc.twoPtA += s.twoPtA;
            acc.threePt += s.threePt; acc.threePtA += s.threePtA;
            acc.ft += s.ft; acc.fta += s.fta;
            acc.fg += s.fg; acc.fga += s.fga;
            acc.dReb += s.dReb; acc.oReb += s.oReb;
            acc.foul += s.foul; acc.fouled += s.fouled;
            acc.to += s.to; acc.stl += s.stl;
            acc.ast += s.ast; acc.blk += s.blk;
            acc.blka += s.blka || 0;
            acc.pts += s.pts;
            return acc;
        }, {
            minutes: 0, twoPt: 0, twoPtA: 0, threePt: 0, threePtA: 0, ft: 0, fta: 0, fg: 0, fga: 0,
            dReb: 0, oReb: 0, foul: 0, fouled: 0, to: 0, stl: 0, ast: 0, blk: 0, blka: 0, pts: 0,
        });

        return {
          ...sum,
          twoPtPct: sum.twoPtA > 0 ? (sum.twoPt / sum.twoPtA) * 100 : 0,
          threePtPct: sum.threePtA > 0 ? (sum.threePt / sum.threePtA) * 100 : 0,
          ftPct: sum.fta > 0 ? (sum.ft / sum.fta) * 100 : 0,
          fgPct: sum.fga > 0 ? (sum.fg / sum.fga) * 100 : 0,
        };
    }, [teamStats]);

    const rows = teamStats.sort((a,b) => parseInt(a.playerNumber) - parseInt(b.playerNumber)).map(s => {
        const player = players.find(p => p.id === s.playerId);
        const playerCell = (
            <div className="flex items-center gap-3 text-left whitespace-nowrap">
                <img 
                    src={player?.pictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.playerName)}&background=4A5568&color=fff`} 
                    alt={s.playerName}
                    className="w-8 h-8 rounded-full object-cover bg-gray-500"
                />
                <span className="font-semibold">{`${s.playerNumber} - ${s.playerName}`}</span>
            </div>
        );
        
        return [
            playerCell, s.minutes, s.twoPt, s.twoPtA, `${s.twoPtPct.toFixed(0)}%`,
            s.threePt, s.threePtA, `${s.threePtPct.toFixed(0)}%`, s.ft, s.fta, `${s.ftPct.toFixed(0)}%`,
            s.fg, s.fga, `${s.fgPct.toFixed(0)}%`, s.dReb, s.oReb, s.foul, s.fouled,
            s.to, s.stl, s.ast, s.blk, s.blka || 0, s.pts,
            <VpsCell value={s.vps} />,
            <PlusMinusCell value={s.plusMinus} />
        ];
    });

    const footerRows = useMemo(() => {
        if (!totals) return [];
        return [[
            <div className="text-left font-bold">Grand Total</div>,
            totals.minutes, totals.twoPt, totals.twoPtA, `${totals.twoPtPct.toFixed(0)}%`,
            totals.threePt, totals.threePtA, `${totals.threePtPct.toFixed(0)}%`, totals.ft, totals.fta, `${totals.ftPct.toFixed(0)}%`,
            totals.fg, totals.fga, `${totals.fgPct.toFixed(0)}%`, totals.dReb, totals.oReb, totals.foul, totals.fouled,
            totals.to, totals.stl, totals.ast, totals.blk, totals.blka, totals.pts,
            '', '' // Empty cells for VPS and +/-
        ]];
    }, [totals]);

    return (
        <div>
            <h2 className="text-2xl font-semibold text-accent mb-4">{teamName}</h2>
            <Table headers={headers} rows={rows} footerRows={footerRows} />
        </div>
    );
};

const MatchStatsPage: React.FC = () => {
    const { state } = useAppContext();
    const { matches, stats, teams, championships, players } = state;
    const [selectedMatchId, setSelectedMatchId] = useState<string>(matches.length > 0 ? matches[matches.length - 1].id : '');

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
                            <StatsTable 
                                teamName={getTeamName(selectedMatch.team1Id)} 
                                teamStats={team1Stats} 
                                players={players} 
                            />
                            <StatsTable 
                                teamName={getTeamName(selectedMatch.team2Id)} 
                                teamStats={team2Stats} 
                                players={players} 
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MatchStatsPage;