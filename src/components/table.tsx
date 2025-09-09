// components/table.tsx
import React from "react";
import "../components styles/table.css";

export type Column<T> = {
  key: keyof T; // chỉ cho phép key trong T
  header: string;
  size?: number;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
};

export type GenericTableProps<T> = {
  data: T[];
  columns: Column<T>[];
};

function GenericTable<T extends { id: string }>({ data, columns }: GenericTableProps<T>) {
  return (
    <div className="table-container">
      <table className="user-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={col.className}
                style={col.size ? { width: `${col.size * 100}%` } : {}}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="no-data">
                No data found.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.id} className="table-row">
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={col.className}
                    style={col.size ? { width: `${col.size * 100}%` } : {}}
                  >
                    {col.render
                      ? col.render(row, index)
                      : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default GenericTable;
