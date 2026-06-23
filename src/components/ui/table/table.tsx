import React from 'react';
import styles from './table.module.scss';

export interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  width?: string | number;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  onRowClick?: (item: T) => void;
}

export const Table = <T,>({
  data,
  columns,
  className = '',
  onRowClick,
}: TableProps<T>) => {
  return (
    <div className={`${styles.tableWrapper} ${className}`}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={styles.headerCell}
                style={{ width: col.width }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={index} 
              className={`${styles.row} ${onRowClick ? styles.clickable : ''}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className={styles.cell}>
                  {col.render ? col.render(item) : String(item[col.key as keyof T])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};