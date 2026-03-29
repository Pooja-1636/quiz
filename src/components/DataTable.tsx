import React from 'react';
import { cn } from '../lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({ columns, data, onRowClick, className }: DataTableProps<T>) {
  return (
    <div className={cn("card overflow-hidden shadow-md", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className={cn(
                    "px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length > 0 ? (
              data.map((item, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "hover:bg-gray-50/50 transition-colors group",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={cn("px-6 py-4", column.className)}>
                      {typeof column.accessor === 'function' 
                        ? column.accessor(item) 
                        : (item[column.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 font-medium">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
