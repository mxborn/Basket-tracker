
import React from 'react';

interface TableProps {
  headers: string[];
  rows: (string | number)[][];
  className?: string;
}

const Table: React.FC<TableProps> = ({ headers, rows, className }) => {
  return (
    <div className={`overflow-x-auto bg-secondary rounded-lg shadow ${className}`}>
      <table className="w-full text-left">
        <thead className="bg-gray-700">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="p-4 font-semibold text-text-primary uppercase tracking-wider text-sm">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-600 transition-colors">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-4 text-text-secondary whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
