import React, { useRef, useState } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { parseCsv } from '../services/csvParser';
import { UploadIcon } from '../components/icons';
import type { MatchData, Team, Player, Match, PlayerStats } from '../types';

type FormPlayerStat = {
    playerName: string;
    playerNumber: string;
    minutes: number;
    pts: number;
    rebs: number;
    ast: number;
    stl: number;
    blk: number;
    fg: number;
    fga: number;
    threePt: number;
    threePtA: number;
    ft: number;
    fta: number;
};

const initialPlayerStat: FormPlayerStat = {
    playerName: '', playerNumber: '', minutes: 0,
    pts: 0, rebs: 0, ast: 0, stl: 0, blk: 0,
    fg: 0, fga: 0, threePt: 0, threePtA: 0, ft: 0, fta: 0,
};


const PlayerStatInputRow: React.FC<{
    stat: FormPlayerStat;
    onStatChange: (field: keyof FormPlayerStat, value: string | number) => void;
    onRemove: () => void;
}> = ({ stat, onStatChange, onRemove }) => {
    
    const fields: (keyof FormPlayerStat)[] = [ 'playerName', 'playerNumber', 'minutes', 'pts', 'rebs', 'ast', 'stl', 'blk', 'fg', 'fga', 'threePt', 'threePtA', 'ft', 'fta' ];
    const fieldPlaceholders: Record<keyof FormPlayerStat, string> = {
        playerName: 'Name', playerNumber: '#', minutes: 'MIN', pts: 'PTS', rebs: 'REB', ast: 'AST', stl: 'STL', blk: 'BLK',
        fg: 'FG', fga: 'FGA', threePt: '3P', threePtA: '3PA', ft: 'FT', fta: 'FTA'
    };
    
    return (
        <tr className="border-b border-gray-700 last:border-b-0">
            {fields.map(field => (
                <td key={field} className="p-1">
                    <input
                        type={typeof initialPlayerStat[field] === 'number' ? 'number' : 'text'}
                        placeholder={fieldPlaceholders[field]}
                        value={stat[field]}
                        onChange={(e) => onStatChange(field, e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                        className="bg-primary border border-gray-600 rounded px-2 py-1 w-full text-sm focus:ring-accent focus:border-accent"
                        min="0"
                    />
                </td>
            ))}
            <td className="p-1 text-center">
                <button onClick={onRemove} className="text-red-400 hover:text-red-300 transition-colors text-lg font-bold">&times;</button>
            </td>
        </tr>
    );
};

const ManualDataEntryForm: React.FC<{ championshipId: string; matchDate: string; onChampionshipMissing: () => void; }> = ({ championshipId, matchDate, onChampionshipMissing }) => {
    const { dispatch } = useAppContext();
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });

    const [team1Name, setTeam1Name] = useState('');
    const [team2Name, setTeam2Name] = useState('');
    const [team1Stats, setTeam1Stats] = useState<FormPlayerStat[]>([initialPlayerStat]);
    const [team2Stats, setTeam2Stats] = useState<FormPlayerStat[]>([initialPlayerStat]);
    
    const handleAddPlayer = (team: 1 | 2) => {
        if (team === 1) setTeam1Stats(s => [...s, { ...initialPlayerStat }]);
        else setTeam2Stats(s => [...s, { ...initialPlayerStat }]);
    };

    const handleRemovePlayer = (team: 1 | 2, index: number) => {
        if (team === 1) setTeam1Stats(s => s.length > 1 ? s.filter((_, i) => i !== index) : s);
        else setTeam2Stats(s => s.length > 1 ? s.filter((_, i) => i !== index) : s);
    };

    const handleStatChange = (team: 1 | 2, index: number, field: keyof FormPlayerStat, value: string | number) => {
        const updater = (stats: FormPlayerStat[]) => {
            const newStats = [...stats];
            newStats[index] = { ...newStats[index], [field]: value };
            return newStats;
        };
        if (team === 1) setTeam1Stats(updater);
        else setTeam2Stats(updater);
    };

    const handleSubmit = () => {
        if (!championshipId) {
            onChampionshipMissing();
            return;
        }
        if (!team1Name || !team2Name) {
            setStatus({ type: 'error', message: 'Please enter names for both teams.' });
            return;
        }

        try {
            const matchId = `match-${Date.now()}`;
            const team1Id = `team-${Date.now()}-1`;
            const team2Id = `team-${Date.now()}-2`;
            
            const teams: Team[] = [{ id: team1Id, name: team1Name }, { id: team2Id, name: team2Name }];
            const allPlayers: Player[] = [];
            const allStats: PlayerStats[] = [];
            
            const processTeamStats = (teamStats: FormPlayerStat[], teamId: string, teamIndex: number) => {
                let totalScore = 0;
                teamStats.forEach((s, i) => {
                    if (!s.playerName) return;
                    const playerId = `player-${Date.now()}-${teamIndex}-${i}`;
                    allPlayers.push({ id: playerId, name: s.playerName, number: s.playerNumber, teamId: teamId });
                    
                    const twoPt = s.fg - s.threePt;
                    const twoPtA = s.fga - s.threePtA;
                    
                    allStats.push({
                        id: `stat-${Date.now()}-${teamIndex}-${i}`, matchId, playerId, teamId,
                        playerName: s.playerName, playerNumber: s.playerNumber, minutes: s.minutes,
                        pts: s.pts, rebs: s.rebs, ast: s.ast, stl: s.stl, blk: s.blk,
                        twoPt, twoPtA, twoPtPct: twoPtA > 0 ? (twoPt / twoPtA) * 100 : 0,
                        threePt: s.threePt, threePtA: s.threePtA, threePtPct: s.threePtA > 0 ? (s.threePt / s.threePtA) * 100 : 0,
                        fg: s.fg, fga: s.fga, fgPct: s.fga > 0 ? (s.fg / s.fga) * 100 : 0,
                        efgPct: s.fga > 0 ? ((s.fg + 0.5 * s.threePt) / s.fga) * 100 : 0,
                        ft: s.ft, fta: s.fta, ftPct: s.fta > 0 ? (s.ft / s.fta) * 100 : 0,
                        layup: 0, layupA: 0, layupPct: 0, paintPt: 0, paintAtt: 0, toPts: 0,
                        oReb: 0, dReb: 0, to: 0, foul: 0, fouled: 0, vps: 0, plusMinus: 0, effic: 0,
                    });
                    totalScore += s.pts;
                });
                return totalScore;
            };

            const team1Score = processTeamStats(team1Stats, team1Id, 1);
            const team2Score = processTeamStats(team2Stats, team2Id, 2);

            const match: Omit<Match, 'championshipId'> = {
                id: matchId, date: new Date(matchDate).toLocaleDateString(),
                team1Id, team2Id, team1Name, team2Name, team1Score, team2Score,
            };

            const matchData: MatchData = { match, stats: allStats, teams, players: allPlayers };
            
            dispatch({ type: 'ADD_MATCH_DATA', payload: { matchData, championshipId } });
            setStatus({ type: 'success', message: `Successfully added match: ${team1Name} vs ${team2Name}` });
            
            setTeam1Name(''); setTeam2Name('');
            setTeam1Stats([{...initialPlayerStat}]); setTeam2Stats([{...initialPlayerStat}]);

        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to save match data.' });
        }
    };
    
    const renderTeamSection = (teamNum: 1 | 2) => {
        const teamName = teamNum === 1 ? team1Name : team2Name;
        const setTeamName = teamNum === 1 ? setTeam1Name : setTeam2Name;
        const stats = teamNum === 1 ? team1Stats : team2Stats;
        const headers = ['Name', '#', 'MIN', 'PTS', 'REB', 'AST', 'STL', 'BLK', 'FG', 'FGA', '3P', '3PA', 'FT', 'FTA', ''];

        return (
            <div className="mb-8">
                <label className="text-xl font-semibold mb-4 flex items-center">
                    Team {teamNum}:
                    <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)}
                        placeholder={`Team ${teamNum} Name`}
                        className="bg-primary border border-gray-600 rounded px-3 py-2 ml-4 w-full md:w-auto"/>
                </label>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-600">{headers.map(h => <th key={h} className="p-1 text-left text-sm font-semibold uppercase text-text-secondary">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {stats.map((stat, index) => (
                                <PlayerStatInputRow key={index} stat={stat}
                                    onStatChange={(field, value) => handleStatChange(teamNum, index, field, value)}
                                    onRemove={() => handleRemovePlayer(teamNum, index)} />
                            ))}
                        </tbody>
                    </table>
                </div>
                <Button onClick={() => handleAddPlayer(teamNum)} variant="secondary" className="mt-4">+ Add Player</Button>
            </div>
        );
    };

    return (
        <Card>
            <h2 className="text-2xl font-semibold text-accent mb-6">Enter Match Data Manually</h2>
            {renderTeamSection(1)}
            {renderTeamSection(2)}
            <Button onClick={handleSubmit}>Save Match Data</Button>
            {status.message && (
                <div className={`mt-6 p-4 rounded-md ${
                    status.type === 'success' ? 'bg-green-500/20 text-green-300' : ''
                } ${
                    status.type === 'error' ? 'bg-red-500/20 text-red-300' : ''
                }`}>
                    {status.message}
                </div>
            )}
        </Card>
    );
};

const CsvUploader: React.FC<{ championshipId: string; matchDate: string; onChampionshipMissing: () => void; }> = ({ championshipId, matchDate, onChampionshipMissing }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { dispatch } = useAppContext();
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });

    const handleFileUpload = () => {
        if (!championshipId) {
            onChampionshipMissing();
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setStatus({ type: 'idle', message: 'Processing...' });
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                try {
                    const matchData = parseCsv(text);
                    const finalMatchData = {
                        ...matchData,
                        match: {
                            ...matchData.match,
                            date: new Date(matchDate).toLocaleDateString()
                        }
                    };
                    dispatch({ type: 'ADD_MATCH_DATA', payload: { matchData: finalMatchData, championshipId } });
                    setStatus({ type: 'success', message: `Successfully loaded match: ${matchData.match.team1Name} vs ${matchData.match.team2Name}` });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
                    setStatus({ type: 'error', message: `Failed to parse CSV: ${errorMessage}` });
                }
            }
            if(fileInputRef.current) fileInputRef.current.value = "";
        };
        
        reader.onerror = () => setStatus({ type: 'error', message: 'Failed to read the file.' });
        reader.readAsText(file);
    };

    return (
        <Card>
            <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl font-semibold text-accent mb-4">Upload Match Data from CSV</h2>
                <p className="text-text-secondary mb-6 max-w-md">Select a semicolon-delimited CSV file with match statistics.</p>
                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <Button onClick={handleFileUpload} className="inline-flex items-center">
                    <UploadIcon />
                    <span className="ml-2">Choose CSV File</span>
                </Button>
                {status.message && (
                    <div className={`mt-6 p-4 rounded-md w-full max-w-md ${
                        status.type === 'success' ? 'bg-green-500/20 text-green-300' : ''
                    } ${
                        status.type === 'error' ? 'bg-red-500/20 text-red-300' : ''
                    } ${
                        status.type === 'idle' ? 'bg-blue-500/20 text-blue-300' : ''
                    }`}>
                        {status.message}
                    </div>
                )}
            </div>
        </Card>
    );
};

const DataEntryPage: React.FC = () => {
    const { state } = useAppContext();
    const { championships } = state;
    const [entryMode, setEntryMode] = useState<'csv' | 'manual'>('csv');
    const [selectedChampionshipId, setSelectedChampionshipId] = useState<string>('');
    const [matchDate, setMatchDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [championshipError, setChampionshipError] = useState<string>('');

    const handleChampionshipMissing = () => {
        setChampionshipError('Please select a championship first.');
        setTimeout(() => setChampionshipError(''), 3000);
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Data Entry</h1>
            
            <Card className="mb-6">
                <label htmlFor="championship-selector" className="block text-lg font-medium text-text-secondary mb-2">1. Select Championship</label>
                <select 
                    id="championship-selector"
                    value={selectedChampionshipId}
                    onChange={(e) => {
                        setSelectedChampionshipId(e.target.value);
                        setChampionshipError('');
                    }}
                    className="bg-secondary border border-gray-600 text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full md:w-1/2 p-2.5"
                    disabled={championships.length === 0}
                >
                    <option value="">{championships.length > 0 ? 'Select a championship...' : 'No championships available. Create one first.'}</option>
                    {championships.map(champ => (
                        <option key={champ.id} value={champ.id}>{champ.name}</option>
                    ))}
                </select>
                {championshipError && <p className="text-red-400 mt-2 text-sm">{championshipError}</p>}
            </Card>

            <Card className="mb-6">
                <label htmlFor="match-date-selector" className="block text-lg font-medium text-text-secondary mb-2">2. Select Match Date</label>
                <input 
                    type="date"
                    id="match-date-selector"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="bg-secondary border border-gray-600 text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full md:w-1/2 p-2.5"
                />
            </Card>

            <div className="flex space-x-2 md:space-x-4 mb-6 border-b border-gray-700">
                <h2 className="text-lg font-medium text-text-secondary mr-4">3. Choose Entry Method</h2>
                <button 
                    onClick={() => setEntryMode('csv')} 
                    className={`px-4 py-2 text-sm md:text-base font-semibold transition-colors ${entryMode === 'csv' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary'}`}>
                    Upload from CSV
                </button>
                <button 
                    onClick={() => setEntryMode('manual')}
                    className={`px-4 py-2 text-sm md:text-base font-semibold transition-colors ${entryMode === 'manual' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary'}`}>
                    Enter Manually
                </button>
            </div>
            
            {entryMode === 'csv' ? 
                <CsvUploader championshipId={selectedChampionshipId} matchDate={matchDate} onChampionshipMissing={handleChampionshipMissing} /> : 
                <ManualDataEntryForm championshipId={selectedChampionshipId} matchDate={matchDate} onChampionshipMissing={handleChampionshipMissing} />
            }
        </div>
    );
};

export default DataEntryPage;