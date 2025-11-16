import type { MatchData, PlayerStats, Team, Player, Match } from '../types';

const headerMapping: { [key: string]: keyof PlayerStats } = {
    'Player': 'playerName',
    'No.': 'playerNumber',
    'N.': 'playerNumber',
    'N,': 'playerNumber',
    'Mins': 'minutes',
    '-Mins': 'minutes',
    '2Pt': 'twoPt',
    '-2P': 'twoPt',
    '2PtA': 'twoPtA',
    '-2PA': 'twoPtA',
    '2Pt%': 'twoPtPct',
    '-2P%': 'twoPtPct',
    '3Pt': 'threePt',
    '-3P': 'threePt',
    '3PtA': 'threePtA',
    '-3PA': 'threePtA',
    '3Pt%': 'threePtPct',
    '-3P%': 'threePtPct',
    'FG': 'fg',
    'FGM': 'fg',
    'FGA': 'fga',
    'FG%': 'fgPct',
    'FG %': 'fgPct',
    'EFG%': 'efgPct',
    'FT': 'ft',
    '-FT': 'ft',
    'FTA': 'fta',
    '-FTA': 'fta',
    'FT %': 'ftPct',
    '-FT%': 'ftPct',
    'Pts': 'pts',
    '-Pt': 'pts',
    'Layup': 'layup',
    'LayupA': 'layupA',
    'Layup%': 'layupPct',
    'Paint Pt': 'paintPt',
    'Paint Att': 'paintAtt',
    'TO Pts': 'toPts',
    'OReb': 'oReb',
    '-OR': 'oReb',
    'DReb': 'dReb',
    '-DR': 'dReb',
    'Rebs': 'rebs',
    'Ast': 'ast',
    '-AST': 'ast',
    'TO': 'to',
    '-TO': 'to',
    'Stl': 'stl',
    '-ST': 'stl',
    'Blk': 'blk',
    '-BLK': 'blk',
    'Blk Against': 'blka',
    '-BLKA': 'blka',
    'Foul': 'foul',
    '-PF': 'foul',
    'Fouled': 'fouled',
    '-DF': 'fouled',
    'Minutes': 'minutes',
    'VPS': 'vps',
    '+/-': 'plusMinus',
    'Effic': 'effic',
};

const parseNumber = (val: string): number => {
    if (!val || val.trim() === '') return 0;
    const cleanedVal = val.replace('%', '').trim();
    const num = parseFloat(cleanedVal);
    return isNaN(num) ? 0 : num;
};

export const parseCsv = (csvText: string): MatchData => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].trim().split(';').map(h => {
        const trimmedHeader = h.trim();
        if (trimmedHeader === 'N.' || trimmedHeader === 'N,') {
            return 'No.';
        }
        return trimmedHeader;
    });
    
    const teamStatsRows = lines.slice(1).filter(line => line.includes('Totals'));
    const playerRows = lines.slice(1).filter(line => !line.includes('Totals'));

    const teams: Team[] = [];
    const teamScores: { [key: string]: number } = {};

    teamStatsRows.forEach(row => {
        const rowData = row.split(';');
        const teamName = rowData[0].replace('Totals', '').trim();
        const teamId = `team-${Date.now()}-${teams.length}`;
        teams.push({ id: teamId, name: teamName });
        const ptsIndex = headers.findIndex(h => headerMapping[h] === 'pts');
        if (ptsIndex !== -1) {
            teamScores[teamId] = parseNumber(rowData[ptsIndex]);
        }
    });

    if (teams.length !== 2) {
        throw new Error('CSV must contain total stats for exactly two teams.');
    }

    const matchId = `match-${Date.now()}`;
    const match: Omit<Match, 'championshipId'> = {
        id: matchId,
        date: new Date().toLocaleDateString(),
        team1Id: teams[0].id,
        team2Id: teams[1].id,
        team1Name: teams[0].name,
        team2Name: teams[1].name,
        team1Score: teamScores[teams[0].id] || 0,
        team2Score: teamScores[teams[1].id] || 0,
    };
    
    const players: Player[] = [];
    const stats: PlayerStats[] = [];
    let currentTeamIndex = 0;

    playerRows.forEach((line, index) => {
        const values = line.trim().split(';');
        if (values.length < headers.length) return;

        const playerNumberIndex = headers.indexOf('No.');
        if (playerNumberIndex === -1) throw new Error("CSV Header must include 'No.' for player numbers.");
        const playerNumber = values[playerNumberIndex];
        
        if (parseInt(playerNumber, 10) > 900 && index > 0) {
            currentTeamIndex = 1;
        }

        const team = teams[currentTeamIndex];
        const rawStat: any = {};
        headers.forEach((header, i) => {
            const key = headerMapping[header];
            if (key) {
                rawStat[key] = values[i];
            }
        });

        const playerId = `player-${Date.now()}-${players.length}`;
        
        const player: Player = {
          id: playerId,
          name: rawStat.playerName,
          number: rawStat.playerNumber,
          teamId: team.id,
        };
        players.push(player);

        const playerStat: PlayerStats = {
            id: `stat-${Date.now()}-${stats.length}`,
            matchId: matchId,
            playerId: playerId,
            teamId: team.id,
            playerName: rawStat.playerName,
            playerNumber: rawStat.playerNumber,
            twoPt: parseNumber(rawStat.twoPt),
            twoPtA: parseNumber(rawStat.twoPtA),
            twoPtPct: parseNumber(rawStat.twoPtPct),
            threePt: parseNumber(rawStat.threePt),
            threePtA: parseNumber(rawStat.threePtA),
            threePtPct: parseNumber(rawStat.threePtPct),
            fg: parseNumber(rawStat.fg),
            fga: parseNumber(rawStat.fga),
            fgPct: parseNumber(rawStat.fgPct),
            efgPct: parseNumber(rawStat.efgPct),
            ft: parseNumber(rawStat.ft),
            fta: parseNumber(rawStat.fta),
            ftPct: parseNumber(rawStat.ftPct),
            pts: parseNumber(rawStat.pts),
            layup: parseNumber(rawStat.layup),
            layupA: parseNumber(rawStat.layupA),
            layupPct: parseNumber(rawStat.layupPct),
            paintPt: parseNumber(rawStat.paintPt),
            paintAtt: parseNumber(rawStat.paintAtt),
            toPts: parseNumber(rawStat.toPts),
            oReb: parseNumber(rawStat.oReb),
            dReb: parseNumber(rawStat.dReb),
            rebs: parseNumber(rawStat.rebs),
            ast: parseNumber(rawStat.ast),
            to: parseNumber(rawStat.to),
            stl: parseNumber(rawStat.stl),
            blk: parseNumber(rawStat.blk),
            foul: parseNumber(rawStat.foul),
            fouled: parseNumber(rawStat.fouled),
            minutes: parseNumber(rawStat.minutes),
            vps: parseNumber(rawStat.vps),
            plusMinus: parseNumber(rawStat.plusMinus),
            blka: parseNumber(rawStat.blka),
            effic: parseNumber(rawStat.effic),
        };
        stats.push(playerStat);
    });
    
    return { match, stats, teams, players };
};