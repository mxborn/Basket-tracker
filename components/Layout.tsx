
import React from 'react';
import type { Page } from '../types';
import { HomeIcon, TeamIcon, PlayerIcon, UploadIcon, DocumentIcon, ChartIcon, StatsIcon } from './icons';

interface LayoutProps {
  children: React.ReactNode;
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const navItems: { name: Page; icon: React.ReactNode }[] = [
  { name: 'Home', icon: <HomeIcon /> },
  { name: 'Data Entry', icon: <UploadIcon /> },
  { name: 'Matches', icon: <DocumentIcon /> },
  { name: 'Match Stats', icon: <ChartIcon /> },
  { name: 'Overall Stats', icon: <StatsIcon /> },
  { name: 'Teams', icon: <TeamIcon /> },
  { name: 'Players', icon: <PlayerIcon /> },
];

const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage }) => {
  return (
    <div className="flex h-screen bg-primary">
      <nav className="w-64 bg-secondary p-4 flex flex-col">
        <div className="text-accent text-2xl font-bold mb-8">BasketStat Pro</div>
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <button
                onClick={() => setActivePage(item.name)}
                className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-200 ${
                  activePage === item.name
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:bg-gray-700 hover:text-text-primary'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
