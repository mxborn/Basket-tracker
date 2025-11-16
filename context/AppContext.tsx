import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Team, Player, Match, PlayerStats, MatchData } from '../types';

interface AppState {
  teams: Team[];
  players: Player[];
  matches: Match[];
  stats: PlayerStats[];
}

type Action =
  | { type: 'ADD_MATCH_DATA'; payload: MatchData }
  | { type: 'ADD_TEAM'; payload: Omit<Team, 'id' | 'isMain'> }
  | { type: 'UPDATE_TEAM'; payload: Team }
  | { type: 'DELETE_TEAM'; payload: string }
  | { type: 'SET_MAIN_TEAM'; payload: string };

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
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_MATCH_DATA': {
      const { match: rawMatch, stats: rawStats, teams: newTeamsFromPayload, players: newPlayersFromPayload } = action.payload;

      // --- State updates will be based on these new arrays ---
      const updatedTeams = [...state.teams];
      const updatedPlayers = [...state.players];
      const finalStats: PlayerStats[] = [];

      // --- 1. Reconcile Teams ---
      const teamIdMap = new Map<string, string>(); // Maps raw team ID from payload to final team ID
      const wasAnyTeamMain = state.teams.some(t => t.isMain);

      newTeamsFromPayload.forEach(newTeam => {
        const existingTeam = state.teams.find(t => t.name === newTeam.name);
        if (existingTeam) {
            teamIdMap.set(newTeam.id, existingTeam.id);
        } else {
            // Team doesn't exist, create it
            const isFirstTeamEver = state.teams.length === 0 && updatedTeams.length === 0;
            const finalNewTeam: Team = { 
                ...newTeam,
                isMain: !wasAnyTeamMain && isFirstTeamEver 
            };
            updatedTeams.push(finalNewTeam);
            teamIdMap.set(newTeam.id, finalNewTeam.id);
        }
      });

      // --- 2. Reconcile Players and Finalize Stats ---
      const rawPlayerMap = new Map<string, Player>(newPlayersFromPayload.map(p => [p.id, p]));
      const existingPlayerLookup = new Map<string, Player>();
      updatedPlayers.forEach(p => existingPlayerLookup.set(`${p.teamId}-${p.number}`, p));

      rawStats.forEach(rawStat => {
        const rawPlayer = rawPlayerMap.get(rawStat.playerId);
        if (!rawPlayer) return; // Should not happen if data is consistent

        const finalTeamId = teamIdMap.get(rawStat.teamId);
        if (!finalTeamId) return; // Should not happen

        const lookupKey = `${finalTeamId}-${rawPlayer.number}`;
        let existingPlayer = existingPlayerLookup.get(lookupKey);
        let finalPlayerId: string;

        if (existingPlayer) {
            finalPlayerId = existingPlayer.id;
            // Optional: update player name if it has changed
            if (existingPlayer.name !== rawPlayer.name) {
                const playerIndex = updatedPlayers.findIndex(p => p.id === existingPlayer!.id);
                if (playerIndex !== -1) {
                    updatedPlayers[playerIndex] = { ...updatedPlayers[playerIndex], name: rawPlayer.name };
                }
            }
        } else {
            // Player does not exist, create a new one
            const newPlayer: Player = {
                id: `player-${Date.now()}-${updatedPlayers.length}`,
                name: rawPlayer.name,
                number: rawPlayer.number,
                teamId: finalTeamId,
            };
            updatedPlayers.push(newPlayer);
            existingPlayerLookup.set(lookupKey, newPlayer); // Add to lookup for this run
            finalPlayerId = newPlayer.id;
        }

        finalStats.push({
            ...rawStat,
            matchId: rawMatch.id,
            teamId: finalTeamId,
            playerId: finalPlayerId,
        });
      });

      // --- 3. Finalize Match ---
      const finalMatch: Match = {
          ...rawMatch,
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
      const teamToDelete = state.teams.find(t => t.id === action.payload);
      const remainingTeams = state.teams.filter(team => team.id !== action.payload);
      
      if (teamToDelete?.isMain && remainingTeams.length > 0) {
        remainingTeams[0].isMain = true;
      }
      
      return {
        ...state,
        teams: remainingTeams,
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
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

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
