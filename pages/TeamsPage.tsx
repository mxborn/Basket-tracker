
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAppContext } from '../context/AppContext';
import type { Team } from '../types';

const TeamsPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { teams } = state;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [teamName, setTeamName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenModalForAdd = () => {
        setEditingTeam(null);
        setTeamName('');
        setLogoUrl('');
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (team: Team) => {
        setEditingTeam(team);
        setTeamName(team.name);
        setLogoUrl(team.logoUrl || '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTeam(null);
    };

    const handleSubmit = () => {
        if (!teamName.trim()) {
            alert('Team name cannot be empty.');
            return;
        }

        if (editingTeam) {
            dispatch({ type: 'UPDATE_TEAM', payload: { ...editingTeam, name: teamName, logoUrl } });
        } else {
            dispatch({ type: 'ADD_TEAM', payload: { name: teamName, logoUrl } });
        }
        handleCloseModal();
    };

    const handleDelete = (teamId: string) => {
        if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
            dispatch({ type: 'DELETE_TEAM', payload: teamId });
        }
    };

    const handleSetMain = (teamId: string) => {
        dispatch({ type: 'SET_MAIN_TEAM', payload: teamId });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-text-primary">Teams</h1>
                <Button onClick={handleOpenModalForAdd}>+ Add Team</Button>
            </div>
            <Card>
                {teams.length === 0 ? (
                    <p className="text-text-secondary">No teams found. Add a team or upload a match file to get started.</p>
                ) : (
                    <div className="space-y-3">
                        {teams.map(team => (
                            <div key={team.id} className="flex items-center justify-between bg-primary hover:bg-gray-700 p-3 rounded-lg transition-colors">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <img 
                                        src={team.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=ED8936&color=fff`} 
                                        alt={`${team.name} logo`} 
                                        className="w-12 h-12 rounded-full object-cover bg-gray-500 flex-shrink-0" 
                                        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=ED8936&color=fff`; }}
                                    />
                                    <span className="font-semibold text-lg truncate" title={team.name}>{team.name}</span>
                                    {team.isMain && <span className="text-xs bg-accent text-white font-bold py-1 px-2 rounded-full uppercase">Main</span>}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {!team.isMain && <Button variant="secondary" onClick={() => handleSetMain(team.id)}>Set Main</Button>}
                                    <Button variant="secondary" onClick={() => handleOpenModalForEdit(team)}>Edit</Button>
                                    <Button className="bg-red-700 hover:bg-red-600" onClick={() => handleDelete(team.id)}>Delete</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTeam ? 'Edit Team' : 'Add New Team'}>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="teamName" className="block text-sm font-medium text-text-secondary mb-1">Team Name</label>
                            <input type="text" id="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="bg-primary border border-gray-600 rounded px-3 py-2 w-full focus:ring-accent focus:border-accent" required />
                        </div>
                        <div>
                            <label htmlFor="logoFile" className="block text-sm font-medium text-text-secondary mb-1">Team Logo</label>
                            <div className="flex items-center gap-4 mt-2">
                                <img 
                                    src={logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName || 'T')}&background=4A5568&color=fff`} 
                                    alt="Logo preview"
                                    className="w-16 h-16 rounded-full object-cover bg-gray-500"
                                />
                                <input type="file" id="logoFile" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-orange-600"/>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit">Save Team</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TeamsPage;