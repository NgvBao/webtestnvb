import React from "react";
import "../components styles/table.css";

export type Column<T> = {
  key: string;
  header: string;
  size?: number;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
};

export type GenericTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T, index: number) => void;                // ⬅️ mới
  rowClassName?: (row: T, index: number) => string | undefined; // ⬅️ mới
};

function GenericTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  rowClassName,
}: GenericTableProps<T>) {
  return (
    <div className="table-container">
      <table className="user-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
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
            data.map((row, index) => {
              const cn = `table-row${rowClassName ? ` ${rowClassName(row, index) || ""}` : ""}`;
              return (
                <tr
                  key={row.id}
                  className={cn}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                  style={onRowClick ? { cursor: "pointer" } : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={col.className}
                      style={col.size ? { width: `${col.size * 100}%` } : {}}
                    >
                      {col.render ? col.render(row, index) : (row as any)[col.key] ?? null}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default GenericTable;
