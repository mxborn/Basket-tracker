export type Page = 'Home' | 'Teams' | 'Players' | 'Data Entry' | 'Matches' | 'Match Stats' | 'Overall Stats' | 'Championships' | 'Settings';

export interface Championship {
  id: string;
  name: string;
}

export interface ChampionshipTeam {
  championshipId: string;
  teamId: string;
}

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
  pictureUrl?: string;
}

export interface Match {
  id: string;
  date: string;
  championshipId: string;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  team1_q1?: number;
  team1_q2?: number;
  team1_q3?: number;
  team1_q4?: number;
  team1_e1?: number;
  team1_e2?: number;
  team1_e3?: number;
  team2_q1?: number;
  team2_q2?: number;
  team2_q3?: number;
  team2_q4?: number;
  team2_e1?: number;
  team2_e2?: number;
  team2_e3?: number;
}

export interface PlayerStats {
  id:string;
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
  minutes: number;
  vps: number;
  plusMinus: number;
  blka?: number;
  effic: number;
}

export interface MatchData {
  match: Omit<Match, 'championshipId'>;
  stats: PlayerStats[];
  teams: Team[];
  players: Player[];
}

export interface AppState {
  teams: Team[];
  players: Player[];
  matches: Match[];
  stats: PlayerStats[];
  championships: Championship[];
  championshipTeams: ChampionshipTeam[];
}