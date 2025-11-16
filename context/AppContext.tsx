import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Team, Player, Match, PlayerStats, MatchData, Championship, ChampionshipTeam } from '../types';

interface AppState {
  teams: Team[];
  players: Player[];
  matches: Match[];
  stats: PlayerStats[];
  championships: Championship[];
  championshipTeams: ChampionshipTeam[];
}

type Action =
  | { type: 'ADD_MATCH_DATA'; payload: { matchData: MatchData; championshipId: string } }
  | { type: 'ADD_TEAM'; payload: Omit<Team, 'id' | 'isMain'> }
  | { type: 'UPDATE_TEAM'; payload: Team }
  | { type: 'DELETE_TEAM'; payload: string }
  | { type: 'SET_MAIN_TEAM'; payload: string }
  | { type: 'UPDATE_PLAYER', payload: Player }
  | { type: 'UPDATE_MATCH', payload: Match }
  | { type: 'ADD_CHAMPIONSHIP'; payload: { name: string } }
  | { type: 'UPDATE_CHAMPIONSHIP'; payload: Championship }
  | { type: 'DELETE_CHAMPIONSHIP'; payload: string }
  | { type: 'ADD_TEAM_TO_CHAMPIONSHIP'; payload: ChampionshipTeam }
  | { type: 'REMOVE_TEAM_FROM_CHAMPIONSHIP'; payload: ChampionshipTeam };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  teams: [],
  players: [],
  matches: [],
  stats: [],
  championships: [],
  championshipTeams: [],
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_MATCH_DATA': {
      const { matchData, championshipId } = action.payload;
      const { match: rawMatch, stats: rawStats, teams: newTeamsFromPayload, players: newPlayersFromPayload } = matchData;

      const updatedTeams = [...state.teams];
      const updatedPlayers = [...state.players];
      const finalStats: PlayerStats[] = [];

      const teamIdMap = new Map<string, string>();
      const wasAnyTeamMain = state.teams.some(t => t.isMain);

      newTeamsFromPayload.forEach(newTeam => {
        const existingTeam = state.teams.find(t => t.name === newTeam.name);
        if (existingTeam) {
            teamIdMap.set(newTeam.id, existingTeam.id);
        } else {
            const isFirstTeamEver = state.teams.length === 0 && updatedTeams.length === 0;
            const finalNewTeam: Team = { 
                ...newTeam,
                isMain: !wasAnyTeamMain && isFirstTeamEver 
            };
            updatedTeams.push(finalNewTeam);
            teamIdMap.set(newTeam.id, finalNewTeam.id);
        }
      });

      const rawPlayerMap = new Map<string, Player>(newPlayersFromPayload.map(p => [p.id, p]));
      const existingPlayerLookup = new Map<string, Player>();
      updatedPlayers.forEach(p => existingPlayerLookup.set(`${p.teamId}-${p.number}`, p));

      rawStats.forEach(rawStat => {
        const rawPlayer = rawPlayerMap.get(rawStat.playerId);
        if (!rawPlayer) return;

        const finalTeamId = teamIdMap.get(rawStat.teamId);
        if (!finalTeamId) return;

        const lookupKey = `${finalTeamId}-${rawPlayer.number}`;
        let existingPlayer = existingPlayerLookup.get(lookupKey);
        let finalPlayerId: string;

        if (existingPlayer) {
            finalPlayerId = existingPlayer.id;
            if (existingPlayer.name !== rawPlayer.name) {
                const playerIndex = updatedPlayers.findIndex(p => p.id === existingPlayer!.id);
                if (playerIndex !== -1) {
                    updatedPlayers[playerIndex] = { ...updatedPlayers[playerIndex], name: rawPlayer.name };
                }
            }
        } else {
            const newPlayer: Player = {
                id: `player-${Date.now()}-${updatedPlayers.length}`,
                name: rawPlayer.name,
                number: rawPlayer.number,
                teamId: finalTeamId,
            };
            updatedPlayers.push(newPlayer);
            existingPlayerLookup.set(lookupKey, newPlayer);
            finalPlayerId = newPlayer.id;
        }

        finalStats.push({
            ...rawStat,
            matchId: rawMatch.id,
            teamId: finalTeamId,
            playerId: finalPlayerId,
        });
      });

      const finalMatch: Match = {
          ...rawMatch,
          championshipId,
          team1Id: teamIdMap.get(rawMatch.team1Id)!,
          team2Id: teamIdMap.get(rawMatch.team2Id)!,
          team1Name: updatedTeams.find(t => t.id === teamIdMap.get(rawMatch.team1Id))!.name,
          team2Name: updatedTeams.find(t => t.id === teamIdMap.get(rawMatch.team2Id))!.name,
      };
      
      return {
          ...state,
          teams: updatedTeams,
          players: updatedPlayers,
          matches: [...state.matches, finalMatch],
          stats: [...state.stats, ...finalStats],
      };
    }
    case 'ADD_TEAM': {
      const newTeam: Team = {
        ...action.payload,
        id: `team-${Date.now()}`,
        isMain: state.teams.length === 0,
      };
      return {
        ...state,
        teams: [...state.teams, newTeam],
      };
    }
    case 'UPDATE_TEAM': {
      return {
        ...state,
        teams: state.teams.map(team =>
          team.id === action.payload.id ? action.payload : team
        ),
      };
    }
    case 'DELETE_TEAM': {
      const teamId = action.payload;
      const teamToDelete = state.teams.find(t => t.id === teamId);
      const remainingTeams = state.teams.filter(team => team.id !== teamId);
      
      if (teamToDelete?.isMain && remainingTeams.length > 0) {
        remainingTeams[0].isMain = true;
      }
      
      return {
        ...state,
        teams: remainingTeams,
        championshipTeams: state.championshipTeams.filter(ct => ct.teamId !== teamId),
      };
    }
    case 'SET_MAIN_TEAM': {
      return {
        ...state,
        teams: state.teams.map(team => ({
          ...team,
          isMain: team.id === action.payload,
        })),
      };
    }
    case 'UPDATE_PLAYER': {
        return {
            ...state,
            players: state.players.map(p => p.id === action.payload.id ? action.payload : p),
        };
    }
    case 'UPDATE_MATCH': {
        return {
            ...state,
            matches: state.matches.map(m => m.id === action.payload.id ? action.payload : m),
        };
    }
    case 'ADD_CHAMPIONSHIP': {
        const newChampionship: Championship = {
            id: `champ-${Date.now()}`,
            name: action.payload.name,
        };
        return {
            ...state,
            championships: [...state.championships, newChampionship],
        };
    }
    case 'UPDATE_CHAMPIONSHIP': {
        return {
            ...state,
            championships: state.championships.map(c => c.id === action.payload.id ? action.payload : c),
        };
    }
    case 'DELETE_CHAMPIONSHIP': {
        const championshipId = action.payload;
        const matchesInChampionship = state.matches.filter(m => m.championshipId === championshipId).map(m => m.id);

        return {
            ...state,
            championships: state.championships.filter(c => c.id !== championshipId),
            championshipTeams: state.championshipTeams.filter(ct => ct.championshipId !== championshipId),
            matches: state.matches.filter(m => m.championshipId !== championshipId),
            stats: state.stats.filter(s => !matchesInChampionship.includes(s.matchId)),
        };
    }
    case 'ADD_TEAM_TO_CHAMPIONSHIP': {
        if (state.championshipTeams.some(ct => ct.championshipId === action.payload.championshipId && ct.teamId === action.payload.teamId)) {
            return state; // Already exists
        }
        return {
            ...state,
            championshipTeams: [...state.championshipTeams, action.payload],
        };
    }
    case 'REMOVE_TEAM_FROM_CHAMPIONSHIP': {
        return {
            ...state,
            championshipTeams: state.championshipTeams.filter(ct => !(ct.championshipId === action.payload.championshipId && ct.teamId === action.payload.teamId)),
        };
    }
    default:
      return state;
  }
};

const getInitialState = (): AppState => {
  if (typeof window !== 'undefined' && localStorage.getItem('basketstat_persistence_enabled') === 'true') {
    const savedState = localStorage.getItem('basketstat_app_state');
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error("Failed to parse state from localStorage:", e);
        return initialState;
      }
    }
  }
  return initialState;
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  React.useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('basketstat_persistence_enabled') === 'true') {
      localStorage.setItem('basketstat_app_state', JSON.stringify(state));
    }
  }, [state]);


  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};