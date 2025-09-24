import React from "react";
import "../components styles/table.css";

export type Align = "left" | "center" | "right";

export type Column<T> = {
  key: string;
  header: string | React.ReactNode;
  size?: number;
  align?: Align;
  /** header chỉ định riêng class (khác với cell) */
  headerClassName?: string;
  /** class cho cell */
  className?: string;
  /** custom render phần header */
  headerRender?: () => React.ReactNode;
  /** render cell */
  render?: (row: T, index: number) => React.ReactNode;
  /** bật sort client-side cho cột này */
  sortable?: boolean;
  /** accessor để sort (mặc định lấy (row as any)[key]) */
  sortAccessor?: (row: T) => string | number | null | undefined;
  /** khi enableSelection=true, auto chèn checkbox column riêng nên không cần định nghĩa */
};

export type GenericTableProps<T> = {
  data: T[];
  columns: Column<T>[];

  // ===== Row interactivity & a11y =====
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;
  onRowKeyDown?: (e: React.KeyboardEvent, row: T, index: number) => void;
  rowClassName?: (row: T, index: number) => string | undefined;
  rowProps?: (row: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  /** props cho từng cell (tiêm tooltip, data-*, v.v.) */
  cellProps?: (
    row: T,
    col: Column<T>,
    index: number
  ) => React.TdHTMLAttributes<HTMLTableCellElement>;

  // ===== States =====
  loading?: boolean;
  emptyText?: string;

  // ===== Keys =====
  /** fallback là row.id hoặc index */
  getRowKey?: (row: T, index: number) => React.Key;

  // ===== Sticky header =====
  stickyHeader?: boolean;

  // ===== Tooltip text dài (ellipsis đã có trong CSS) =====
  /** auto thêm title={plainText} cho cell khi text dài */
  cellAutoTooltip?: boolean;

  // ===== Selection (checkbox) =====
  enableSelection?: boolean;
  selectedRowIds?: Set<React.Key>;
  onSelectionChange?: (ids: Set<React.Key>) => void;
  /** định danh dùng cho selection (mặc định = getRowKey(row) hoặc row.id) */
  getSelectionKey?: (row: T, index: number) => React.Key;

  // ===== Pagination (server hoặc client) =====
  page?: number;        // 1-based
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;

  /** Bật Enter/Space + focus row khi có onRowClick (mặc định: true) */
  activateOnKeyboard?: boolean;
};

type SortState = { key?: string; dir?: "asc" | "desc" };

function GenericTable<T extends { id?: string }>({
  data,
  columns,
  onRowClick,
  onRowDoubleClick,
  onRowKeyDown,
  rowClassName,
  rowProps,
  cellProps,
  loading,
  emptyText = "No data found.",
  getRowKey,
  stickyHeader = false,
  cellAutoTooltip = true,
  enableSelection = false,
  selectedRowIds,
  onSelectionChange,
  getSelectionKey,
  page,
  pageSize,
  total,
  onPageChange,
  activateOnKeyboard = true, // 🆕 mặc định bật
}: GenericTableProps<T>) {
  // ===== Sorting (client-side nhẹ) =====
  const [sortState, setSortState] = React.useState<SortState>({});
  const toggleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    setSortState((s) => {
      if (s.key !== col.key) return { key: col.key, dir: "asc" };
      return { key: col.key, dir: s.dir === "asc" ? "desc" : "asc" };
    });
  };

  const sorted = React.useMemo(() => {
    if (!sortState.key) return data;
    const col = columns.find((c) => c.key === sortState.key);
    if (!col) return data;
    const acc = col.sortAccessor ?? ((r: any) => r[col.key]);
    const copy = [...data];
    copy.sort((a, b) => {
      const va = acc(a) as any;
      const vb = acc(b) as any;
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va < vb) return sortState.dir === "asc" ? -1 : 1;
      if (va > vb) return sortState.dir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, columns, sortState]);

  // ===== Selection =====
  const selectionIds = React.useMemo<Set<React.Key>>(
    () => selectedRowIds ?? new Set<React.Key>(),
    [selectedRowIds]
  );

  const getKey = (row: T, index: number): React.Key =>
    getRowKey?.(row, index) ?? (row as any).id ?? index;

  const getSelKey = (row: T, index: number): React.Key =>
    getSelectionKey?.(row, index) ?? getKey(row, index);

  const allSelectableKeys = React.useMemo(
    () => (enableSelection ? sorted.map((r, i) => getSelKey(r, i)) : []),
    [enableSelection, sorted]
  );

  const allChecked =
    enableSelection &&
    allSelectableKeys.length > 0 &&
    allSelectableKeys.every((k) => selectionIds.has(k));

  const indeterminate =
    enableSelection &&
    allSelectableKeys.length > 0 &&
    !allChecked &&
    allSelectableKeys.some((k) => selectionIds.has(k));

  const onToggleAll = () => {
    if (!enableSelection || !onSelectionChange) return;
    const next = new Set(selectionIds);
    if (allChecked) {
      allSelectableKeys.forEach((k) => next.delete(k));
    } else {
      allSelectableKeys.forEach((k) => next.add(k));
    }
    onSelectionChange(next);
  };

  const onToggleOne = (key: React.Key) => {
    if (!enableSelection || !onSelectionChange) return;
    const next = new Set(selectionIds);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  // ===== Pagination footer (hiển thị nếu đủ props) =====
  const showPagination =
    typeof page === "number" &&
    typeof pageSize === "number" &&
    typeof total === "number" &&
    typeof onPageChange === "function";

  const totalPages =
    showPagination && pageSize! > 0 ? Math.max(1, Math.ceil(total! / pageSize!)) : 1;

  const handlePrev = () => {
    if (!showPagination) return;
    if (page! > 1) onPageChange!(page! - 1);
  };
  const handleNext = () => {
    if (!showPagination) return;
    if (page! < totalPages) onPageChange!(page! + 1);
  };

  // ===== Render =====
  return (
    <div
      className="table-container"
      role="table"
      aria-busy={!!loading}
      aria-rowcount={data.length}
    >
      <table className={`user-table${stickyHeader ? " user-table--sticky" : ""}`} role="grid">
        <thead>
          <tr>
            {enableSelection && (
              <th
                className="th-select"
                scope="col"
                aria-label="Select all rows"
                style={{ width: "32px", textAlign: "center" }}
              >
                <input
                  type="checkbox"
                  aria-checked={indeterminate ? "mixed" : allChecked}
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = indeterminate as boolean;
                  }}
                  onChange={onToggleAll}
                />
              </th>
            )}

            {columns.map((col) => {
              const style: React.CSSProperties = {
                ...(col.size ? { width: `${col.size * 100}%` } : {}),
                ...(col.align ? { textAlign: col.align } : {}),
                cursor: col.sortable ? "pointer" : undefined,
              };
              const isActive = sortState.key === col.key;
              const arrow = isActive ? (sortState.dir === "asc" ? " ▲" : " ▼") : "";
              const ariaSort = isActive
                ? (sortState.dir === "asc" ? "ascending" : "descending")
                : "none";
              return (
                <th
                  key={col.key}
                  className={col.headerClassName ?? col.className}
                  style={style}
                  onClick={() => toggleSort(col)}
                  aria-sort={ariaSort as React.AriaAttributes["aria-sort"]}
                  scope="col"
                >
                  {col.headerRender ? col.headerRender() : col.header}
                  {col.sortable && <span className="sort-arrow">{arrow}</span>}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={(enableSelection ? 1 : 0) + columns.length} className="no-data">
                Loading…
              </td>
            </tr>
          ) : sorted.length === 0 ? (
            <tr>
              <td colSpan={(enableSelection ? 1 : 0) + columns.length} className="no-data">
                {emptyText}
              </td>
            </tr>
          ) : (
            sorted.map((row, index) => {
              const key = getKey(row, index);
              const selKey = enableSelection ? getSelKey(row, index) : undefined;
              const checked = enableSelection && selKey ? selectionIds.has(selKey) : false;

              const cn = `table-row${
                rowClassName ? ` ${rowClassName(row, index) || ""}` : ""
              }${onRowClick || onRowDoubleClick ? " row-clickable" : ""}`;

              const rp = rowProps?.(row, index) ?? {};

              const interactive = Boolean(onRowClick || onRowDoubleClick);
              const enableKb = interactive && activateOnKeyboard;

              const baseRowHandlers = {
                onClick: onRowClick ? () => onRowClick(row, index) : undefined,
                onDoubleClick: onRowDoubleClick ? () => onRowDoubleClick(row, index) : undefined,
                onKeyDown: onRowKeyDown
                  ? (e: React.KeyboardEvent) => onRowKeyDown(e, row, index)
                  : onRowClick && enableKb
                  ? (e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") onRowClick(row, index);
                    }
                  : undefined,
              };

              return (
                <tr
                  key={key}
                  className={cn}
                  style={interactive ? { cursor: "pointer" } : undefined}
                  tabIndex={enableKb ? 0 : undefined}
                  role={enableKb ? "button" : undefined}
                  {...baseRowHandlers}
                  {...rp}
                >
                  {enableSelection && (
                    <td
                      className="td-select"
                      style={{ width: "32px", textAlign: "center" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => selKey != null && onToggleOne(selKey)}
                        aria-label="Select row"
                      />
                    </td>
                  )}

                  {columns.map((col) => {
                    const style: React.CSSProperties = {
                      ...(col.size ? { width: `${col.size * 100}%` } : {}),
                      ...(col.align ? { textAlign: col.align } : {}),
                    };
                    const cp = cellProps?.(row, col, index) ?? {};
                    const content = col.render
                      ? col.render(row, index)
                      : (row as any)[col.key] ?? null;

                    const isPlainText =
                      typeof content === "string" || typeof content === "number";

                    // Auto tooltip (title) để xem full text khi bị ellipsis
                    if (cellAutoTooltip && isPlainText && cp.title == null) {
                      cp.title = String(content);
                    }

                    return (
                      <td key={col.key} className={col.className} style={style} {...cp}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {showPagination && (
        <div className="table-pagination" role="group" aria-label="Pagination">
          <button
            className="btn-plain"
            onClick={handlePrev}
            disabled={page! <= 1}
            aria-label="Previous page"
          >
            ◀ Prev
          </button>
          <span className="page-info">
            Page {page} / {totalPages} • Showing{" "}
            {Math.min((page! - 1) * pageSize! + 1, total!)}–
            {Math.min(page! * pageSize!, total!)} of {total}
          </span>
          <button
            className="btn-plain"
            onClick={handleNext}
            disabled={page! >= totalPages}
            aria-label="Next page"
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}

export default GenericTable;
