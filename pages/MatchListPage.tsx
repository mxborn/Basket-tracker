
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAppContext } from '../context/AppContext';
import type { Match } from '../types';

const periods = [
    { key: 'q1', label: 'Q1' }, { key: 'q2', label: 'Q2' },
    { key: 'q3', label: 'Q3' }, { key: 'q4', label: 'Q4' },
    { key: 'e1', label: 'E1' }, { key: 'e2', label: 'E2' },
    { key: 'e3', label: 'E3' }
];

const EditMatchModal: React.FC<{
    match: Match | null;
    isOpen: boolean;
    onClose: () => void;
}> = ({ match, isOpen, onClose }) => {
    const { dispatch } = useAppContext();
    const [formData, setFormData] = useState<Partial<Match>>({});

    useEffect(() => {
        if (match) {
            setFormData(match);
        }
    }, [match]);

    const handleScoreChange = (team: 1 | 2, period: string, value: string) => {
        const fieldName = `team${team}_${period}` as keyof Match;
        setFormData(current => ({ ...current, [fieldName]: parseInt(value) || 0 }));
    };

    const { team1Score, team2Score } = useMemo(() => {
        const t1s = periods.reduce((sum, p) => sum + (Number(formData[`team1_${p.key}` as keyof Match]) || 0), 0);
        const t2s = periods.reduce((sum, p) => sum + (Number(formData[`team2_${p.key}` as keyof Match]) || 0), 0);
        return { team1Score: t1s, team2Score: t2s };
    }, [formData]);

    const handleSubmit = () => {
        if (!match) return;
        const finalMatchData: Match = {
            ...match,
            ...formData,
            team1Score,
            team2Score,
        };
        dispatch({ type: 'UPDATE_MATCH', payload: finalMatchData });
        onClose();
    };

    if (!match) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Scores: ${match.team1Name} vs ${match.team2Name}`}>
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{match.team1Name}</h3>
                    <div className="grid grid-cols-7 gap-2">
                        {periods.map(p => <label key={p.key} className="text-center text-sm font-semibold text-text-secondary">{p.label}</label>)}
                        {periods.map(p => (
                            <input
                                key={p.key}
                                type="number"
                                value={formData[`team1_${p.key}` as keyof Match] as number || ''}
                                onChange={(e) => handleScoreChange(1, p.key, e.target.value)}
                                className="bg-primary border border-gray-600 rounded px-2 py-1 w-full text-center focus:ring-accent focus:border-accent"
                                min="0"
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{match.team2Name}</h3>
                    <div className="grid grid-cols-7 gap-2">
                        {periods.map(p => <label key={p.key} className="text-center text-sm font-semibold text-text-secondary">{p.label}</label>)}
                        {periods.map(p => (
                            <input
                                key={p.key}
                                type="number"
                                value={formData[`team2_${p.key}` as keyof Match] as number || ''}
                                onChange={(e) => handleScoreChange(2, p.key, e.target.value)}
                                className="bg-primary border border-gray-600 rounded px-2 py-1 w-full text-center focus:ring-accent focus:border-accent"
                                min="0"
                            />
                        ))}
                    </div>
                </div>
                <div className="text-center pt-4">
                    <p className="text-text-secondary">Calculated Final Score</p>
                    <p className="text-2xl font-bold text-accent">{team1Score} - {team2Score}</p>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Save Scores</Button>
            </div>
        </Modal>
    );
};

const MatchListPage: React.FC = () => {
    const { state } = useAppContext();
    const { matches, championships, teams } = state;
    const [selectedChampionshipId, setSelectedChampionshipId] = useState<string>('all');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);

    const filteredMatches = useMemo(() => {
        if (selectedChampionshipId === 'all') {
            return matches;
        }
        return matches.filter(m => m.championshipId === selectedChampionshipId);
    }, [matches, selectedChampionshipId]);

    const getChampionshipName = (championshipId: string) => championships.find(c => c.id === championshipId)?.name || 'N/A';
    const getTeam = (teamId: string) => teams.find(t => t.id === teamId);
    
    const handleOpenModal = (match: Match) => {
        setEditingMatch(match);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMatch(null);
    };

    const hasOvertime = useMemo(() => {
        return filteredMatches.some(m => 
            m.team1_e1 || m.team2_e1 || 
            m.team1_e2 || m.team2_e2 || 
            m.team1_e3 || m.team2_e3
        );
    }, [filteredMatches]);

    const tableHeaders = useMemo(() => {
        const baseHeaders: React.ReactNode[] = [
            'Date', 
            'CS', 
            <>Home<br/>Team</>, 
            'Score', 
            <>Away<br/>Team</>, 
            'Q1', 'Q2', 'Q3', 'Q4'
        ];
        if (hasOvertime) {
            baseHeaders.push('OT');
        }
        baseHeaders.push('Actions');
        return baseHeaders;
    }, [hasOvertime]);

    const tableRows = useMemo(() => {
        return filteredMatches.map(match => {
            const team1 = getTeam(match.team1Id);
            const team2 = getTeam(match.team2Id);
            const team1Cell = (
                <div className="flex items-center gap-3">
                    <img 
                        src={team1?.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team1Name)}&background=ED8936&color=fff`} 
                        alt={`${match.team1Name} logo`}
                        className="w-8 h-8 rounded-full object-cover bg-gray-500"
                    />
                    <span>{match.team1Name}</span>
                </div>
            );
            const team2Cell = (
                <div className="flex items-center justify-end gap-3">
                     <span>{match.team2Name}</span>
                    <img 
                        src={team2?.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team2Name)}&background=4A5568&color=fff`} 
                        alt={`${match.team2Name} logo`}
                        className="w-8 h-8 rounded-full object-cover bg-gray-500"
                    />
                </div>
            );

            const rowData: React.ReactNode[] = [
                match.date,
                getChampionshipName(match.championshipId),
                team1Cell,
                <span className="font-bold text-lg">{`${match.team1Score} - ${match.team2Score}`}</span>,
                team2Cell,
                `${match.team1_q1 || 0} - ${match.team2_q1 || 0}`,
                `${match.team1_q2 || 0} - ${match.team2_q2 || 0}`,
                `${match.team1_q3 || 0} - ${match.team2_q3 || 0}`,
                `${match.team1_q4 || 0} - ${match.team2_q4 || 0}`,
            ];

            if (hasOvertime) {
                const ot1Score = (match.team1_e1 || 0) + (match.team1_e2 || 0) + (match.team1_e3 || 0);
                const ot2Score = (match.team2_e1 || 0) + (match.team2_e2 || 0) + (match.team2_e3 || 0);
                rowData.push(`${ot1Score} - ${ot2Score}`);
            }

            rowData.push(<Button variant="secondary" onClick={() => handleOpenModal(match)}>Edit</Button>);

            return rowData;
        });
    }, [filteredMatches, getChampionshipName, getTeam, hasOvertime]);

    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Matches</h1>
            
            <div className="mb-6">
                <label htmlFor="championship-filter" className="block text-sm font-medium text-text-secondary mb-2">Filter by Championship</label>
                <select 
                    id="championship-filter"
                    value={selectedChampionshipId}
                    onChange={(e) => setSelectedChampionshipId(e.target.value)}
                    className="bg-secondary border border-gray-600 text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full md:w-1/3 p-2.5"
                >
                    <option value="all">All Championships</option>
                    {championships.map(champ => (
                        <option key={champ.id} value={champ.id}>{champ.name}</option>
                    ))}
                </select>
            </div>

            <Card>
                {matches.length === 0 ? (
                    <p className="text-text-secondary">No matches found. Upload a match file to get started.</p>
                ) : (
                    <Table
                        headers={tableHeaders}
                        rows={tableRows}
                    />
                )}
            </Card>
            
            <EditMatchModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                match={editingMatch}
            />
        </div>
    );
};

export default MatchListPage;