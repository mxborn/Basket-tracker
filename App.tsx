
import React, { useState } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import PlayersPage from './pages/PlayersPage';
import DataEntryPage from './pages/DataEntryPage';
import MatchListPage from './pages/MatchListPage';
import MatchStatsPage from './pages/MatchStatsPage';
import OverallStatsPage from './pages/OverallStatsPage';
import ChampionshipsPage from './pages/ChampionshipsPage';
import type { Page } from './types';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Home');

  const renderPage = () => {
    switch (activePage) {
      case 'Home':
        return <HomePage />;
      case 'Teams':
        return <TeamsPage />;
      case 'Players':
        return <PlayersPage />;
      case 'Data Entry':
        return <DataEntryPage />;
      case 'Matches':
        return <MatchListPage />;
      case 'Match Stats':
        return <MatchStatsPage />;
      case 'Overall Stats':
        return <OverallStatsPage />;
      case 'Championships':
        return <ChampionshipsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <Layout activePage={activePage} setActivePage={setActivePage}>
        {renderPage()}
      </Layout>
    </div>
  );
};

export default App;