import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SettingsPage: React.FC = () => {
    const [isPersistenceEnabled, setIsPersistenceEnabled] = useState<boolean>(false);

    useEffect(() => {
        const enabled = localStorage.getItem('basketstat_persistence_enabled') === 'true';
        setIsPersistenceEnabled(enabled);
    }, []);

    const handleTogglePersistence = (e: React.ChangeEvent<HTMLInputElement>) => {
        const enabled = e.target.checked;
        setIsPersistenceEnabled(enabled);
        localStorage.setItem('basketstat_persistence_enabled', String(enabled));
        
        if (enabled) {
            alert('Data will now be saved locally in your browser. Please reload the page to load any previously saved data.');
        } else {
            if (window.confirm('Disabling this will stop saving data. Do you also want to clear all currently saved data from your browser? This action cannot be undone.')) {
                localStorage.removeItem('basketstat_app_state');
                alert('Local data has been cleared. The app will now use temporary memory. Reloading the page to apply changes.');
                window.location.reload();
            } else {
                 alert('Data will no longer be saved, but existing data will remain in your browser if you re-enable persistence later.');
            }
        }
    };

    const handleDownloadSample = () => {
        const headers = "Player;No.;-Mins;-2P;-2PA;-2P%;-3P;-3PA;-3P%;-FT;-FTA;-FT%;FGM;FGA;FG %;-DR;-OR;-PF;-DF;-TO;-ST;-AST;-BLK;-BLKA;-Pt;VPS;+/-";
        const team1Player1 = "Player One;1;25;5;10;50;2;5;40;3;4;75;7;15;47;4;1;2;3;2;1;5;1;0;19;1.27;10";
        const team1Player2 = "Player Two;2;20;3;6;50;1;2;50;0;0;0;4;8;50;5;2;1;1;3;2;3;0;1;9;0.75;5";
        const team1Totals = "Team A Totals;;200;28;53;53;3;18;17;12;23;52;43;94;46;18;17;13;17;30;38;13;1;1;77;;";
        const team2Player1 = "Player Three;901;28;6;12;50;1;4;25;5;6;83;7;16;44;6;3;3;4;4;0;2;2;1;20;1.11;-8";
        const team2Player2 = "Player Four;902;22;4;9;44;0;3;0;2;2;100;4;12;33;3;0;2;2;1;3;1;0;0;10;0.56;-5";
        const team2Totals = "Team B Totals;;200;30;60;50;5;20;25;15;20;75;50;100;50;25;10;15;18;20;15;10;5;2;90;;";
        
        const csvContent = [headers, team1Player1, team1Player2, team1Totals, team2Player1, team2Player2, team2Totals].join("\n");
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "sample_match_stats.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Settings</h1>
            
            <div className="space-y-6">
                <Card>
                    <h2 className="text-2xl font-semibold text-accent mb-4">Data Storage</h2>
                    <p className="text-text-secondary mb-4">
                        Enable this option to save all your teams, players, and match data in your browser's local storage.
                        This allows your data to persist even after you close the browser tab.
                    </p>
                    <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only" 
                                    checked={isPersistenceEnabled}
                                    onChange={handleTogglePersistence}
                                />
                                <div className={`block w-14 h-8 rounded-full ${isPersistenceEnabled ? 'bg-accent' : 'bg-gray-600'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isPersistenceEnabled ? 'transform translate-x-6' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-text-primary font-medium">
                                {isPersistenceEnabled ? 'Local Storage Enabled' : 'Local Storage Disabled'}
                            </div>
                        </label>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-2xl font-semibold text-accent mb-4">CSV Template</h2>
                    <p className="text-text-secondary mb-4">
                        Download a sample CSV file to understand the required format for data uploads. 
                        Using this template will ensure your match data is parsed correctly.
                    </p>
                    <Button onClick={handleDownloadSample}>Download CSV Template</Button>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;