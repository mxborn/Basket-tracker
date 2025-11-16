import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

type PersistenceMode = 'none' | 'local' | 'server';

const SettingsPage: React.FC = () => {
    const [persistenceMode, setPersistenceMode] = useState<PersistenceMode>('none');

    useEffect(() => {
        const mode = (localStorage.getItem('basketstat_persistence_mode') as PersistenceMode) || 'none';
        setPersistenceMode(mode);
    }, []);

    const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMode = e.target.value as PersistenceMode;
        setPersistenceMode(newMode);
        localStorage.setItem('basketstat_persistence_mode', newMode);
        
        if (newMode === 'none' && localStorage.getItem('basketstat_app_state')) {
            if (window.confirm('You are switching to no persistence. Do you want to clear all data previously saved in your local browser? This action cannot be undone.')) {
                localStorage.removeItem('basketstat_app_state');
                alert('Local data cleared. Reloading the page.');
                window.location.reload();
            }
        } else {
            alert(`Persistence mode set to "${newMode}". Please reload the page for the changes to take full effect.`);
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
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-s8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "sample_match_stats.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const options = [
        { id: 'none', title: 'No Persistence', description: 'Data is stored in memory and is lost when you close the browser tab. (Default)' },
        { id: 'local', title: 'Local Database', description: 'Data is saved in your browser. It persists after closing the tab, but is only available on this computer.' },
        { id: 'server', title: 'Server Database', description: 'Simulates saving to a server. Data is available across different computers and browsers.' }
    ];

    return (
        <div>
            <h1 className="text-4xl font-bold text-text-primary mb-8">Settings</h1>
            
            <div className="space-y-6">
                <Card>
                    <h2 className="text-2xl font-semibold text-accent mb-4">Data Storage</h2>
                    <p className="text-text-secondary mb-6">
                        Choose how you want your application data to be stored. Changes may require a page reload to take effect.
                    </p>
                    <div className="space-y-4">
                       {options.map(option => (
                           <label key={option.id} className="flex items-center p-4 rounded-lg bg-primary border-2 border-transparent has-[:checked]:border-accent cursor-pointer transition-all">
                               <input 
                                   type="radio"
                                   name="persistence-mode"
                                   value={option.id}
                                   checked={persistenceMode === option.id}
                                   onChange={handleModeChange}
                                   className="h-5 w-5 text-accent bg-secondary border-gray-500 focus:ring-accent"
                               />
                               <div className="ml-4">
                                   <p className="font-semibold text-text-primary">{option.title}</p>
                                   <p className="text-sm text-text-secondary">{option.description}</p>
                               </div>
                           </label>
                       ))}
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