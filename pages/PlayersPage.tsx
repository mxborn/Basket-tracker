
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAppContext } from '../context/AppContext';
import type { Player } from '../types';

const PlayersPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { players, teams } = state;
    const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

    const [playerName, setPlayerName] = useState('');
    const [playerNumber, setPlayerNumber] = useState('');
    const [playerPictureUrl, setPlayerPictureUrl] = useState('');

    const filteredPlayers = useMemo(() => {
        if (selectedTeamId === 'all') {
            return players;
        }
        return players.filter(p => p.teamId === selectedTeamId);
    }, [players, selectedTeamId]);
    
    const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || 'N/A';
    
    const handleOpenEditModal = (player: Player) => {
        setEditingPlayer(player);
        setPlayerName(player.name);
        setPlayerNumber(player.number);
        setPlayerPictureUrl(player.pictureUrl || '');
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingPlayer(null);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPlayerPictureUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!editingPlayer) return;
        
        dispatch({
            type: 'UPDATE_PLAYER',
            payload: {
                ...editingPlayer,
                name: playerName,
                number: playerNumber,
                pictureUrl: playerPictureUrl
            }
        });
        handleCloseModal();
    };

    const playerTableRows = useMemo(() => {
        return filteredPlayers.map(player => [
            <div className="flex items-center gap-3">
                <img 
                    src={player.pictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=4A5568&color=fff`} 
                    alt={player.name}
                    className="w-10 h-10 rounded-full object-cover bg-gray-500"
                />
                <span>{`${player.number} - ${player.name}`}</span>
            </div>,
            getTeamName(player.teamId),
            <Button variant="secondary" onClick={() => handleOpenEditModal(player)}>Edit</Button>
        ]);
    }, [filteredPlayers, teams]);

    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Players</h1>
            
            <div className="mb-6">
                <label htmlFor="team-filter" className="block text-sm font-medium text-text-secondary mb-2">Filter by Team</label>
                <select 
                    id="team-filter"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="bg-secondary border border-gray-600 text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full md:w-1/3 p-2.5"
                >
                    <option value="all">All Teams</option>
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
            </div>
            
            <Card>
                {players.length === 0 ? (
                    <p className="text-text-secondary">No players found. Upload a match file to get started.</p>
                ) : (
                    <Table
                        headers={['Player', 'Team', 'Actions']}
                        rows={playerTableRows}
                    />
                )}
            </Card>
            
            <Modal isOpen={isEditModalOpen} onClose={handleCloseModal} title="Edit Player">
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="playerName" className="block text-sm font-medium text-text-secondary mb-1">Player Name</label>
                            <input type="text" id="playerName" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="bg-primary border border-gray-600 rounded px-3 py-2 w-full focus:ring-accent focus:border-accent" required />
                        </div>
                         <div>
                            <label htmlFor="playerNumber" className="block text-sm font-medium text-text-secondary mb-1">Player Number</label>
                            <input type="text" id="playerNumber" value={playerNumber} onChange={(e) => setPlayerNumber(e.target.value)} className="bg-primary border border-gray-600 rounded px-3 py-2 w-full focus:ring-accent focus:border-accent" required />
                        </div>
                        <div>
                            <label htmlFor="playerPicture" className="block text-sm font-medium text-text-secondary mb-1">Player Picture</label>
                            <div className="flex items-center gap-4 mt-2">
                                <img 
                                    src={playerPictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName || 'P')}&background=4A5568&color=fff`}
                                    alt="Player preview"
                                    className="w-16 h-16 rounded-full object-cover bg-gray-500"
                                />
                                <input type="file" id="playerPicture" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-orange-600"/>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PlayersPage;