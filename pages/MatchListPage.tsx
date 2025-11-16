
import React from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import { useAppContext } from '../context/AppContext';

const MatchListPage: React.FC = () => {
    const { state } = useAppContext();
    const { matches } = state;

    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Matches</h1>
            <Card>
                {matches.length === 0 ? (
                    <p className="text-text-secondary">No matches found. Upload a match file to get started.</p>
                ) : (
                    <Table
                        headers={['Date', 'Home Team', 'Score', 'Away Team']}
                        rows={matches.map(match => [
                            match.date,
                            match.team1Name,
                            `${match.team1Score} - ${match.team2Score}`,
                            match.team2Name
                        ])}
                    />
                )}
            </Card>
        </div>
    );
};

export default MatchListPage;
