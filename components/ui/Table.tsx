import React from 'react';

interface TableProps {
  headers: React.ReactNode[];
  rows: React.ReactNode[][];
  footerRows?: React.ReactNode[][];
  className?: string;
}

const Table: React.FC<TableProps> = ({ headers, rows, footerRows, className }) => {
  return (
    <div className={`overflow-x-auto bg-secondary rounded-lg shadow ${className}`}>
      <table className="w-full text-left">
        <thead className="bg-gray-700">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="p-2 font-semibold text-text-primary uppercase tracking-wider text-xs text-center whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-600 transition-colors">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-1 text-text-secondary whitespace-nowrap text-center text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footerRows && (
          <tfoot className="bg-gray-800 font-bold">
            {footerRows.map((row, rowIndex) => (
              <tr key={`footer-${rowIndex}`} className="border-t-2 border-accent">
                {row.map((cell, cellIndex) => (
                  <td key={`footer-cell-${cellIndex}`} className="p-2 text-text-primary whitespace-nowrap text-center text-sm">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default Table;