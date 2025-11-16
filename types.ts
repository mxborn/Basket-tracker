
export type Page = 'Home' | 'Teams' | 'Players' | 'Data Entry' | 'Matches' | 'Match Stats' | 'Overall Stats';

export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  isMain?: boolean;
}

export interface Player {
  id: string;
  name: string;
  number: string;
  teamId: string;
}

export interface Match {
  id: string;
  date: string;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
}

export interface PlayerStats {
  id: string;
  matchId: string;
  playerId: string;
  teamId: string;
  playerName: string;
  playerNumber: string;
  twoPt: number;
  twoPtA: number;
  twoPtPct: number;
  threePt: number;
  threePtA: number;
  threePtPct: number;
  fg: number;
  fga: number;
  fgPct: number;
  efgPct: number;
  ft: number;
  fta: number;
  ftPct: number;
  pts: number;
  layup: number;
  layupA: number;
  layupPct: number;
  paintPt: number;
  paintAtt: number;
  toPts: number;
  oReb: number;
  dReb: number;
  rebs: number;
  ast: number;
  to: number;
  stl: number;
  blk: number;
  foul: number;
  fouled: number;
  minutes: string;
  vps: number;
  plusMinus: number;
  effic: number;
}

export interface MatchData {
  match: Match;
  stats: PlayerStats[];
  teams: Team[];
  players: Player[];
}