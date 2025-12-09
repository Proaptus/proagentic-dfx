'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * DataTable Component - Enterprise data grid
 * REQ-272: Component library with consistent styling
 * REQ-273: WCAG 2.1 AA accessibility compliance
 */

import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  Search,
} from 'lucide-react';
import {
  Fragment,
  type ReactNode,
  useState,
  useMemo,
  useCallback,
  type HTMLAttributes,
} from 'react';
import { Button } from './Button';

export interface Column<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row?: T) => ReactNode;
}

interface DataTableProps<T> extends HTMLAttributes<HTMLDivElement> {
  data: T[];
  columns: Column<T>[];
  pageSize?: 10 | 25 | 50 | 100;
  selectable?: boolean;
  expandable?: boolean;
  renderExpandedRow?: (row: T) => ReactNode;
  onRowSelect?: (selectedRows: T[]) => void;
  exportable?: boolean;
  exportFilename?: string;
  sticky?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize: initialPageSize = 10,
  selectable = false,
  expandable = false,
  renderExpandedRow,
  onRowSelect,
  exportable = false,
  exportFilename = 'export.csv',
  sticky = true,
  className,
  ...props
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Get cell value
  const getCellValue = useCallback((item: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    return item[column.accessor];
  }, []);

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(filters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        result = result.filter((row) => {
          const column = columns.find((col) => col.id === columnId);
          if (!column) return true;
          const value = getCellValue(row, column);
          return String(value)
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortColumn && sortDirection) {
      const column = columns.find((col) => col.id === sortColumn);
      if (column) {
        result.sort((a, b) => {
          const aVal = getCellValue(a, column);
          const bVal = getCellValue(b, column);

          if (aVal === bVal) return 0;
          if (aVal == null) return 1;
          if (bVal == null) return -1;
          const comparison = aVal > bVal ? 1 : -1;
          return sortDirection === 'asc' ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [data, filters, sortColumn, sortDirection, columns, getCellValue]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle sorting
  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortable) return;

    if (sortColumn === columnId) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  // Handle filter
  const handleFilter = (columnId: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnId]: value }));
    setCurrentPage(1);
  };

  // Handle row selection
  const handleRowSelect = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);

    if (onRowSelect) {
      const selected = processedData.filter((_, i) => newSelected.has(i));
      onRowSelect(selected);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === processedData.length) {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    } else {
      const allIndices = new Set(processedData.map((_, i) => i));
      setSelectedRows(allIndices);
      onRowSelect?.(processedData);
    }
  };

  // Handle row expansion
  const handleRowExpand = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  // Export to CSV
  const handleExport = () => {
    const headers = columns.map((col) => col.header).join(',');
    const rows = processedData
      .map((row) =>
        columns
          .map((col) => {
            const value = getCellValue(row, col);
            const formatted = col.format ? col.format(value, row) : String(value);
            const stringValue = typeof formatted === 'string' ? formatted : String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm text-gray-600">
            Rows per page:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value) as 10 | 25 | 50 | 100);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {exportable && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            aria-label="Export to CSV"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-auto">
        <table className="w-full border-collapse">
          <thead className={cn('bg-gray-50', sticky && 'sticky top-0 z-10')}>
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === processedData.length &&
                      processedData.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {expandable && <th className="px-4 py-3 w-12" />}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    'px-4 py-3 text-sm font-semibold text-gray-700',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    !column.align && 'text-left'
                  )}
                  style={{ width: column.width }}
                >
                  <div className="space-y-2">
                    <div
                      className={cn(
                        'flex items-center gap-2',
                        column.sortable && 'cursor-pointer select-none',
                        column.align === 'center' && 'justify-center',
                        column.align === 'right' && 'justify-end'
                      )}
                      onClick={() => column.sortable && handleSort(column.id)}
                    >
                      <span>{column.header}</span>
                      {column.sortable && (
                        <span className="text-gray-400">
                          {sortColumn === column.id ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </div>
                    {column.filterable && (
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                        <input
                          type="text"
                          value={filters[column.id] || ''}
                          onChange={(e) =>
                            handleFilter(column.id, e.target.value)
                          }
                          placeholder="Filter..."
                          className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={`Filter ${column.header}`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (expandable ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const globalIndex = (currentPage - 1) * pageSize + rowIndex;
                const isExpanded = expandedRows.has(globalIndex);

                return (
                  <Fragment key={globalIndex}>
                    <tr
                      className={cn(
                        'border-t border-gray-200 hover:bg-gray-50',
                        selectedRows.has(globalIndex) && 'bg-blue-50'
                      )}
                    >
                      {selectable && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(globalIndex)}
                            onChange={() => handleRowSelect(globalIndex)}
                            className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                            aria-label={`Select row ${rowIndex + 1}`}
                          />
                        </td>
                      )}
                      {expandable && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRowExpand(globalIndex)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            aria-label={
                              isExpanded ? 'Collapse row' : 'Expand row'
                            }
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      {columns.map((column) => {
                        const value = getCellValue(row, column);
                        const displayValue = column.format
                          ? column.format(value, row)
                          : value;

                        return (
                          <td
                            key={column.id}
                            className={cn(
                              'px-4 py-3 text-sm text-gray-900',
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right'
                            )}
                          >
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                    {expandable && isExpanded && renderExpandedRow && (
                      <tr className="bg-gray-50">
                        <td
                          colSpan={
                            columns.length +
                            (selectable ? 1 : 0) +
                            (expandable ? 1 : 0)
                          }
                          className="px-4 py-4"
                        >
                          {renderExpandedRow(row)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, processedData.length)} of{' '}
          {processedData.length} results
          {data.length !== processedData.length &&
            ` (filtered from ${data.length} total)`}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
              )
              .map((page, index, array) => (
                <Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-gray-400">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'px-3 py-1 text-sm rounded border',
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    )}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                </Fragment>
              ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
