
import React from 'react';

const iconProps = {
  className: "w-6 h-6",
  strokeWidth: 1.5,
  fill: "none",
  stroke: "currentColor"
};

export const HomeIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M2.25 12v8.25a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-5.25h-1.5v5.25h-2.25V12h-1.5zM12 2.25l-2.25 2.25V12h4.5V4.5L12 2.25zM21 12h-1.5v8.25h-2.25v-5.25h-1.5v5.25h4.5a.75.75 0 00.75-.75V12z" />
  </svg>
);

export const TeamIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 015.25 0m-5.25 0a3.75 3.75 0 00-5.25 0m16.5 0a4.5 4.5 0 01-9 0m9 0a4.5 4.5 0 00-9 0m9 0a9.095 9.095 0 01-3.741.479m-12.018 0a9.095 9.095 0 01-3.741-.479m15.759 0a3 3 0 01-4.682-2.72m-7.5-2.962a3.75 3.75 0 005.25 0m-5.25 0a3.75 3.75 0 01-5.25 0" />
  </svg>
);

export const PlayerIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

export const UploadIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export const DocumentIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export const ChartIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1.5-1.5m1.5 1.5v5.25m0 0l-1.5-1.5m1.5 1.5l1.5-1.5" />
    </svg>
);

export const StatsIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.94-3.94m3.94 3.94l-3.94 3.94" />
    </svg>
);

export const ChampionshipIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 21v-6.75a.75.75 0 00-1.5 0v6.75h-2.25a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h6.75a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75h-2.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75h-9a9.75 9.75 0 000 11.25h9a9.75 9.75 0 000-11.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 6.75a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0V6.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 6.75a.75.75 0 011.5 0v2.25a.75.75 0 01-1.5 0V6.75z" />
    </svg>
);

export const SettingsIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.008 1.11-1.233 1.13-.44 2.33.25 2.77 1.38l.11.28.16.39c.07.18.15.36.25.53a5.22 5.22 0 014.28 4.28c.17.1.35.18.53.25l.39.16.28.11c1.13.44 1.82 1.64 1.38 2.77-.22.55-.69 1.02-1.23 1.11l-.48.08c-.2.03-.4.08-.58.14a5.22 5.22 0 01-4.28 4.28c-.06.18-.11.38-.14.58l-.08.48c-.09.54-.56 1.008-1.11 1.233-1.13.44-2.33-.25-2.77-1.38l-.11-.28-.16-.39a5.22 5.22 0 01-.25-.53 5.22 5.22 0 01-4.28-4.28 5.22 5.22 0 01-.53-.25l-.39-.16-.28-.11c-1.13-.44-1.82-1.64-1.38-2.77.22-.55.69-1.02 1.23-1.11l.48-.08c.2-.03.4-.08.58-.14a5.22 5.22 0 014.28-4.28c.06-.18.11-.38.14-.58l.08-.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);