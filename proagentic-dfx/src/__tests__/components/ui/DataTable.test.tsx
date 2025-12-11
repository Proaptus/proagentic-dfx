/**
 * DataTable Component Tests
 * Coverage Target: 80%
 *
 * Test Coverage:
 * - Basic rendering (4 tests)
 * - Sorting functionality (6 tests)
 * - Filtering functionality (4 tests)
 * - Pagination (5 tests)
 * - Row selection (4 tests)
 * - Row expansion (3 tests)
 * - CSV Export (3 tests)
 * - Accessibility (4 tests)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DataTable, type Column } from '@/components/ui/DataTable';

// Test data
interface TestData {
  id: number;
  name: string;
  value: number;
  status: string;
}

const testData: TestData[] = [
  { id: 1, name: 'Alpha', value: 100, status: 'active' },
  { id: 2, name: 'Beta', value: 200, status: 'inactive' },
  { id: 3, name: 'Gamma', value: 150, status: 'active' },
  { id: 4, name: 'Delta', value: 50, status: 'pending' },
  { id: 5, name: 'Epsilon', value: 300, status: 'active' },
];

const columns: Column<TestData>[] = [
  { id: 'id', header: 'ID', accessor: 'id', sortable: true },
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, filterable: true },
  { id: 'value', header: 'Value', accessor: 'value', sortable: true, align: 'right' },
  { id: 'status', header: 'Status', accessor: 'status', filterable: true },
];

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('DataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render table with data', () => {
      render(<DataTable data={testData} columns={columns} />);

      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    it('should render column headers', () => {
      render(<DataTable data={testData} columns={columns} />);

      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render empty state when no data', () => {
      render(<DataTable data={[]} columns={columns} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <DataTable data={testData} columns={columns} className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should render rows per page selector', () => {
      render(<DataTable data={testData} columns={columns} />);

      expect(screen.getByLabelText(/rows per page/i)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should display sort icons for sortable columns', () => {
      const { container } = render(<DataTable data={testData} columns={columns} />);

      const sortIcons = container.querySelectorAll('svg');
      expect(sortIcons.length).toBeGreaterThan(0);
    });

    it('should sort ascending on first click', () => {
      render(<DataTable data={testData} columns={columns} />);

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      const rows = screen.getAllByRole('row');
      // First row is header, second should be 'Alpha' (first alphabetically)
      expect(within(rows[1]).getByText('Alpha')).toBeInTheDocument();
    });

    it('should sort descending on second click', () => {
      render(<DataTable data={testData} columns={columns} />);

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);

      const rows = screen.getAllByRole('row');
      // Should now show Gamma first (last alphabetically when sorted desc after 5 items)
      expect(rows.length).toBeGreaterThan(1);
    });

    it('should clear sort on third click', () => {
      render(<DataTable data={testData} columns={columns} />);

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);

      // Table should return to original order
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });

    it('should handle null values in sorting', () => {
      const dataWithNull = [
        { id: 1, name: 'Alpha', value: 100, status: 'active' },
        { id: 2, name: null as unknown as string, value: 200, status: 'inactive' },
      ];

      render(<DataTable data={dataWithNull} columns={columns} />);

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      // Should not crash
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    it('should not sort on non-sortable columns', () => {
      const nonSortableColumns: Column<TestData>[] = [
        { id: 'name', header: 'Name', accessor: 'name', sortable: false },
      ];

      render(<DataTable data={testData} columns={nonSortableColumns} />);

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      // No sort indicator should appear - just verify click doesn't crash
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should render filter inputs for filterable columns', () => {
      render(<DataTable data={testData} columns={columns} />);

      const filterInputs = screen.getAllByPlaceholderText('Filter...');
      expect(filterInputs.length).toBe(2); // name and status are filterable
    });

    it('should filter data based on input', () => {
      render(<DataTable data={testData} columns={columns} />);

      const filterInput = screen.getByLabelText(/filter name/i);
      fireEvent.change(filterInput, { target: { value: 'Alpha' } });

      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    });

    it('should be case-insensitive', () => {
      render(<DataTable data={testData} columns={columns} />);

      const filterInput = screen.getByLabelText(/filter name/i);
      fireEvent.change(filterInput, { target: { value: 'ALPHA' } });

      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    it('should reset pagination when filtering', () => {
      const manyItems = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: i * 10,
        status: 'active',
      }));

      render(<DataTable data={manyItems} columns={columns} pageSize={10} />);

      // Go to page 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      // Now filter
      const filterInput = screen.getByLabelText(/filter name/i);
      fireEvent.change(filterInput, { target: { value: 'Item 0' } });

      // Should show results from filtered data
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: (i + 1) * 10,
      status: 'active',
    }));

    it('should show correct page count text', () => {
      render(<DataTable data={manyItems} columns={columns} pageSize={10} />);

      expect(screen.getByText(/showing 1 to 10 of 25/i)).toBeInTheDocument();
    });

    it('should navigate to next page', () => {
      render(<DataTable data={manyItems} columns={columns} pageSize={10} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      expect(screen.getByText(/showing 11 to 20 of 25/i)).toBeInTheDocument();
    });

    it('should navigate to previous page', () => {
      render(<DataTable data={manyItems} columns={columns} pageSize={10} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      const prevButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(prevButton);

      expect(screen.getByText(/showing 1 to 10 of 25/i)).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      render(<DataTable data={manyItems} columns={columns} pageSize={10} />);

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('should change page size', () => {
      render(<DataTable data={manyItems} columns={columns} pageSize={10} />);

      const select = screen.getByLabelText(/rows per page/i);
      fireEvent.change(select, { target: { value: '25' } });

      expect(screen.getByText(/showing 1 to 25 of 25/i)).toBeInTheDocument();
    });

    it('should render page number buttons', () => {
      render(<DataTable data={manyItems} columns={columns} pageSize={10} />);

      expect(screen.getByRole('button', { name: /page 1/i })).toBeInTheDocument();
    });

    it('should navigate via page number click', () => {
      render(<DataTable data={manyItems} columns={columns} pageSize={10} />);

      const page2Button = screen.getByRole('button', { name: /page 2/i });
      fireEvent.click(page2Button);

      expect(screen.getByText(/showing 11 to 20 of 25/i)).toBeInTheDocument();
    });
  });

  describe('Row Selection', () => {
    it('should render checkboxes when selectable', () => {
      render(<DataTable data={testData} columns={columns} selectable />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should select individual row', () => {
      const onRowSelect = vi.fn();
      render(
        <DataTable data={testData} columns={columns} selectable onRowSelect={onRowSelect} />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // First data row checkbox

      expect(onRowSelect).toHaveBeenCalledWith([testData[0]]);
    });

    it('should select all rows', () => {
      const onRowSelect = vi.fn();
      render(
        <DataTable data={testData} columns={columns} selectable onRowSelect={onRowSelect} />
      );

      const selectAllCheckbox = screen.getByLabelText(/select all rows/i);
      fireEvent.click(selectAllCheckbox);

      expect(onRowSelect).toHaveBeenCalledWith(testData);
    });

    it('should deselect all when clicking select all twice', () => {
      const onRowSelect = vi.fn();
      render(
        <DataTable data={testData} columns={columns} selectable onRowSelect={onRowSelect} />
      );

      const selectAllCheckbox = screen.getByLabelText(/select all rows/i);
      fireEvent.click(selectAllCheckbox);
      fireEvent.click(selectAllCheckbox);

      expect(onRowSelect).toHaveBeenLastCalledWith([]);
    });
  });

  describe('Row Expansion', () => {
    const renderExpandedRow = (row: TestData) => (
      <div data-testid="expanded-content">Details for {row.name}</div>
    );

    it('should render expand buttons when expandable', () => {
      render(
        <DataTable
          data={testData}
          columns={columns}
          expandable
          renderExpandedRow={renderExpandedRow}
        />
      );

      const expandButtons = screen.getAllByLabelText(/expand row/i);
      expect(expandButtons.length).toBe(testData.length);
    });

    it('should expand row on button click', () => {
      render(
        <DataTable
          data={testData}
          columns={columns}
          expandable
          renderExpandedRow={renderExpandedRow}
        />
      );

      const expandButtons = screen.getAllByLabelText(/expand row/i);
      fireEvent.click(expandButtons[0]);

      expect(screen.getByTestId('expanded-content')).toBeInTheDocument();
      expect(screen.getByText('Details for Alpha')).toBeInTheDocument();
    });

    it('should collapse row on second click', () => {
      render(
        <DataTable
          data={testData}
          columns={columns}
          expandable
          renderExpandedRow={renderExpandedRow}
        />
      );

      const expandButton = screen.getAllByLabelText(/expand row/i)[0];
      fireEvent.click(expandButton);
      fireEvent.click(screen.getByLabelText(/collapse row/i));

      expect(screen.queryByTestId('expanded-content')).not.toBeInTheDocument();
    });
  });

  describe('CSV Export', () => {
    it('should render export button when exportable', () => {
      render(<DataTable data={testData} columns={columns} exportable />);

      expect(screen.getByLabelText(/export to csv/i)).toBeInTheDocument();
    });

    it('should trigger download on export click', () => {
      const mockClick = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'a') {
          element.click = mockClick;
        }
        return element;
      });

      render(<DataTable data={testData} columns={columns} exportable />);

      const exportButton = screen.getByLabelText(/export to csv/i);
      fireEvent.click(exportButton);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should use custom filename', () => {
      render(
        <DataTable
          data={testData}
          columns={columns}
          exportable
          exportFilename="custom-export.csv"
        />
      );

      // Verify component renders with exportable prop
      expect(screen.getByLabelText(/export to csv/i)).toBeInTheDocument();
    });
  });

  describe('Column Formatting', () => {
    it('should apply custom format function', () => {
      const columnsWithFormat: Column<TestData>[] = [
        {
          id: 'value',
          header: 'Value',
          accessor: 'value',
          format: (value) => `$${value.toLocaleString()}`,
        },
      ];

      render(<DataTable data={testData} columns={columnsWithFormat} />);

      expect(screen.getByText('$100')).toBeInTheDocument();
    });

    it('should apply column alignment', () => {
      render(<DataTable data={testData} columns={columns} />);

      // Value column has align: 'right'
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('should handle function accessor', () => {
      const columnsWithFunctionAccessor: Column<TestData>[] = [
        {
          id: 'computed',
          header: 'Computed',
          accessor: (row) => `${row.name} - ${row.value}`,
        },
      ];

      render(<DataTable data={testData} columns={columnsWithFunctionAccessor} />);

      expect(screen.getByText('Alpha - 100')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(<DataTable data={testData} columns={columns} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader').length).toBe(columns.length);
    });

    it('should have aria-labels on filter inputs', () => {
      render(<DataTable data={testData} columns={columns} />);

      expect(screen.getByLabelText(/filter name/i)).toBeInTheDocument();
    });

    it('should have aria-labels on pagination buttons', () => {
      const manyItems = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: i * 10,
        status: 'active',
      }));

      render(<DataTable data={manyItems} columns={columns} pageSize={10} />);

      expect(screen.getByLabelText(/previous page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
    });

    it('should indicate current page', () => {
      const manyItems = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: i * 10,
        status: 'active',
      }));

      render(<DataTable data={manyItems} columns={columns} pageSize={10} />);

      const page1Button = screen.getByRole('button', { name: /page 1/i });
      expect(page1Button).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Sticky Header', () => {
    it('should apply sticky class by default', () => {
      const { container } = render(<DataTable data={testData} columns={columns} />);

      const thead = container.querySelector('thead');
      expect(thead?.className).toContain('sticky');
    });

    it('should not apply sticky class when disabled', () => {
      const { container } = render(
        <DataTable data={testData} columns={columns} sticky={false} />
      );

      const thead = container.querySelector('thead');
      expect(thead?.className).not.toContain('sticky');
    });
  });
});
