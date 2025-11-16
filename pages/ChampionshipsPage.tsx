
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAppContext } from '../context/AppContext';
import type { Championship, Team } from '../types';

const ChampionshipsPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { championships, teams, championshipTeams } = state;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChampionship, setEditingChampionship] = useState<Championship | null>(null);
    const [championshipName, setChampionshipName] = useState('');

    const [manageTeamsChampionship, setManageTeamsChampionship] = useState<Championship | null>(null);
    const [teamToAdd, setTeamToAdd] = useState<string>('');

    const handleOpenModalForAdd = () => {
        setEditingChampionship(null);
        setChampionshipName('');
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (championship: Championship) => {
        setEditingChampionship(championship);
        setChampionshipName(championship.name);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingChampionship(null);
    };

    const handleSubmit = () => {
        if (!championshipName.trim()) {
            alert('Championship name cannot be empty.');
            return;
        }

        if (editingChampionship) {
            dispatch({ type: 'UPDATE_CHAMPIONSHIP', payload: { ...editingChampionship, name: championshipName } });
        } else {
            dispatch({ type: 'ADD_CHAMPIONSHIP', payload: { name: championshipName } });
        }
        handleCloseModal();
    };

    const handleDelete = (championshipId: string) => {
        if (window.confirm('Are you sure you want to delete this championship? This will also delete all associated matches and stats. This action cannot be undone.')) {
            dispatch({ type: 'DELETE_CHAMPIONSHIP', payload: championshipId });
        }
    };
    
    const handleAddTeamToChampionship = () => {
        if (teamToAdd && manageTeamsChampionship) {
            dispatch({ type: 'ADD_TEAM_TO_CHAMPIONSHIP', payload: { championshipId: manageTeamsChampionship.id, teamId: teamToAdd }});
            setTeamToAdd('');
        }
    };
    
    const handleRemoveTeam = (teamId: string) => {
        if (manageTeamsChampionship) {
            dispatch({ type: 'REMOVE_TEAM_FROM_CHAMPIONSHIP', payload: { championshipId: manageTeamsChampionship.id, teamId }});
        }
    };

    const getTeamsInChampionship = (championshipId: string): Team[] => {
        const teamIds = championshipTeams.filter(ct => ct.championshipId === championshipId).map(ct => ct.teamId);
        return teams.filter(team => teamIds.includes(team.id));
    };

    const getAvailableTeams = (championshipId: string): Team[] => {
        const teamIdsInChampionship = championshipTeams.filter(ct => ct.championshipId === championshipId).map(ct => ct.teamId);
        return teams.filter(team => !teamIdsInChampionship.includes(team.id));
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-text-primary">Championships</h1>
                <Button onClick={handleOpenModalForAdd}>+ Add Championship</Button>
            </div>
            <Card>
                {championships.length === 0 ? (
                    <p className="text-text-secondary">No championships found. Add one to get started.</p>
                ) : (
                    <div className="space-y-4">
                        {championships.map(champ => (
                            <div key={champ.id} className="bg-primary p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-xl text-accent">{champ.name}</span>
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" onClick={() => setManageTeamsChampionship(manageTeamsChampionship?.id === champ.id ? null : champ)}>
                                            {manageTeamsChampionship?.id === champ.id ? 'Hide Teams' : 'Manage Teams'}
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleOpenModalForEdit(champ)}>Edit</Button>
                                        <Button className="bg-red-700 hover:bg-red-600" onClick={() => handleDelete(champ.id)}>Delete</Button>
                                    </div>
                                </div>
                                {manageTeamsChampionship?.id === champ.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <h3 className="text-lg font-semibold mb-2">Teams in {champ.name}</h3>
                                        <div className="space-y-2 mb-4">
                                            {getTeamsInChampionship(champ.id).map(team => (
                                                <div key={team.id} className="flex justify-between items-center bg-secondary p-2 rounded">
                                                    <span>{team.name}</span>
                                                    <button onClick={() => handleRemoveTeam(team.id)} className="text-red-400 hover:text-red-300">&times; Remove</button>
                                                </div>
                                            ))}
                                             {getTeamsInChampionship(champ.id).length === 0 && <p className="text-sm text-text-secondary">No teams assigned yet.</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select 
                                                value={teamToAdd} 
                                                onChange={e => setTeamToAdd(e.target.value)}
                                                className="bg-secondary border border-gray-600 text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2"
                                            >
                                                <option value="">Select a team to add...</option>
                                                {getAvailableTeams(champ.id).map(team => (
                                                    <option key={team.id} value={team.id}>{team.name}</option>
                                                ))}
                                            </select>
                                            <Button onClick={handleAddTeamToChampionship} disabled={!teamToAdd}>Add Team</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingChampionship ? 'Edit Championship' : 'Add New Championship'}>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="championshipName" className="block text-sm font-medium text-text-secondary mb-1">Championship Name</label>
                            <input type="text" id="championshipName" value={championshipName} onChange={(e) => setChampionshipName(e.target.value)} className="bg-primary border border-gray-600 rounded px-3 py-2 w-full focus:ring-accent focus:border-accent" required />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit">Save Championship</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ChampionshipsPage;
