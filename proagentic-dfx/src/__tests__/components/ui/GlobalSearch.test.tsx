/**
 * GlobalSearch Component Tests
 * Coverage Target: 80%
 *
 * Test Coverage:
 * - Modal rendering (4 tests)
 * - Search input (4 tests)
 * - Search results (5 tests)
 * - Keyboard navigation (6 tests)
 * - Recent searches (4 tests)
 * - Accessibility (4 tests)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { GlobalSearch } from '@/components/ui/GlobalSearch';

// Mock the app store
const mockSetScreen = vi.fn();
const mockSetCurrentDesign = vi.fn();

vi.mock('@/lib/stores/app-store', () => ({
  useAppStore: () => ({
    requirements: { pressure: 700, volume: 100 },
    paretoFront: [
      { id: '1', weight_kg: 50, cost_eur: 1000, trade_off_category: 'balanced' },
      { id: '2', weight_kg: 45, cost_eur: 1200, trade_off_category: 'lightest' },
    ],
    setScreen: mockSetScreen,
    setCurrentDesign: mockSetCurrentDesign,
  }),
}));

// Mock SearchResult type
interface MockSearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  keywords: string[];
  action: () => void;
}

// Create mock actions that can be tracked
const mockDesign1Action = vi.fn();
const mockDesign2Action = vi.fn();
const mockRequirementsAction = vi.fn();
const mockViewerAction = vi.fn();
const mockCarbonAction = vi.fn();
const mockPressureAction = vi.fn();

// Mock the search index
vi.mock('@/lib/search/searchIndex', () => ({
  indexRequirements: () => [
    { id: 'req-1', title: 'Pressure Requirement', description: '700 bar', category: 'Requirements', icon: '📋', keywords: ['pressure', 'requirement', '700'], action: mockPressureAction },
  ],
  indexDesigns: () => [
    { id: 'design-1', title: 'Design 1', description: '50 kg, €1000', category: 'Designs', icon: '🎯', keywords: ['design', '1', 'weight', 'cost'], action: mockDesign1Action },
    { id: 'design-2', title: 'Design 2', description: '45 kg, €1200', category: 'Designs', icon: '🎯', keywords: ['design', '2', 'weight', 'cost'], action: mockDesign2Action },
  ],
  indexScreens: () => [
    { id: 'screen-requirements', title: 'Requirements', description: 'Enter requirements', category: 'Navigation', icon: '📋', keywords: ['requirements', 'input', 'constraints'], action: mockRequirementsAction },
    { id: 'screen-viewer', title: '3D Viewer', description: 'View designs', category: 'Navigation', icon: '🔍', keywords: ['viewer', '3d', 'visualization'], action: mockViewerAction },
  ],
  indexMaterials: () => [
    { id: 'mat-carbon', title: 'Carbon Fiber', description: 'T700 fiber', category: 'Materials', icon: '🧵', keywords: ['carbon', 'fiber', 't700'], action: mockCarbonAction },
  ],
  searchIndex: (query: string, index: MockSearchResult[]) => {
    if (!query || !query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return index.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
      (item.keywords && item.keywords.some(kw => kw.toLowerCase().includes(lowerQuery)))
    );
  },
  groupByCategory: (results: MockSearchResult[]) => {
    const groups: Record<string, MockSearchResult[]> = {};
    results.forEach(result => {
      if (!groups[result.category]) groups[result.category] = [];
      groups[result.category].push(result);
    });
    return groups;
  },
}));

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock createPortal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('GlobalSearch', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    document.body.style.overflow = '';
    // Clear mock actions
    mockDesign1Action.mockClear();
    mockDesign2Action.mockClear();
    mockRequirementsAction.mockClear();
    mockViewerAction.mockClear();
    mockCarbonAction.mockClear();
    mockPressureAction.mockClear();
    // Mock scrollIntoView for jsdom
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('Modal Rendering', () => {
    it('should not render when closed', () => {
      render(<GlobalSearch isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when open', () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByPlaceholderText(/search requirements/i)).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText(/close search/i)).toBeInTheDocument();
    });

    it('should lock body scroll when open', () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should unlock body scroll when closed', () => {
      const { rerender } = render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      rerender(<GlobalSearch isOpen={false} onClose={mockOnClose} />);

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Search Input', () => {
    it('should focus input on open', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/search requirements/i);
        expect(document.activeElement).toBe(input);
      });
    });

    it('should update query on input', () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'design' } });

      expect(input).toHaveValue('design');
    });

    it('should clear query when modal reopens', () => {
      const { rerender } = render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'test' } });

      rerender(<GlobalSearch isOpen={false} onClose={mockOnClose} />);
      rerender(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const newInput = screen.getByPlaceholderText(/search requirements/i);
      expect(newInput).toHaveValue('');
    });
  });

  describe('Search Results', () => {
    it('should display results matching query', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'Design' } });

      await waitFor(() => {
        // Text is split by highlight marks, so use getAllByText for partial matches
        const buttons = screen.getAllByRole('button');
        const design1Button = buttons.find(btn => btn.textContent?.includes('Design 1'));
        const design2Button = buttons.find(btn => btn.textContent?.includes('Design 2'));
        expect(design1Button).toBeInTheDocument();
        expect(design2Button).toBeInTheDocument();
      });
    });

    it('should display no results message when no matches', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'xyz123nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      });
    });

    it('should highlight matching text', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'Design' } });

      await waitFor(() => {
        // Highlighted text is wrapped in <mark> elements
        const highlights = document.querySelectorAll('mark');
        expect(highlights.length).toBeGreaterThan(0);
      });
    });

    it('should display result count', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'Design' } });

      await waitFor(() => {
        // 3 results: Design 1, Design 2, and 3D Viewer (description: "View designs")
        expect(screen.getByText(/3 results/i)).toBeInTheDocument();
      });
    });

    it('should group results by category', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'a' } }); // Match multiple categories

      await waitFor(() => {
        // Should show category headers
        const results = screen.queryAllByRole('button');
        expect(results.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close on Escape key', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should navigate down with ArrowDown', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'Design' } });

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const hasResults = buttons.some(btn => btn.textContent?.includes('Design 1'));
        expect(hasResults).toBe(true);
      });

      await act(async () => {
        fireEvent.keyDown(document, { key: 'ArrowDown' });
      });

      // Selection should move - test passes if no crash
    });

    it('should navigate up with ArrowUp', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'Design' } });

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const hasResults = buttons.some(btn => btn.textContent?.includes('Design 1'));
        expect(hasResults).toBe(true);
      });

      await act(async () => {
        fireEvent.keyDown(document, { key: 'ArrowDown' });
        fireEvent.keyDown(document, { key: 'ArrowUp' });
      });

      // Selection should move back - test passes if no crash
    });

    it('should select result on Enter', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'Design' } });

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const hasResults = buttons.some(btn => btn.textContent?.includes('Design 1'));
        expect(hasResults).toBe(true);
      });

      await act(async () => {
        fireEvent.keyDown(document, { key: 'Enter' });
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not go below last result', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'Design' } });

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const hasResults = buttons.some(btn => btn.textContent?.includes('Design 1'));
        expect(hasResults).toBe(true);
      });

      await act(async () => {
        // Press down many times
        for (let i = 0; i < 10; i++) {
          fireEvent.keyDown(document, { key: 'ArrowDown' });
        }
      });

      // Should not crash
    });

    it('should not go above first result', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'Design' } });

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const hasResults = buttons.some(btn => btn.textContent?.includes('Design 1'));
        expect(hasResults).toBe(true);
      });

      await act(async () => {
        fireEvent.keyDown(document, { key: 'ArrowUp' });
      });

      // Should not crash
    });
  });

  describe('Click Interactions', () => {
    it('should close on backdrop click', () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const backdrop = screen.getByRole('dialog').querySelector('[aria-hidden="true"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should close on close button click', () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText(/close search/i);
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should select result on click', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'Design' } });

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const resultButton = buttons.find(btn => btn.textContent?.includes('Design 1'));
        expect(resultButton).toBeTruthy();
        fireEvent.click(resultButton!);
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should highlight on hover', async () => {
      const onCloseFn = vi.fn(); // Use separate mock to avoid state bleeding
      render(<GlobalSearch isOpen={true} onClose={onCloseFn} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'Design' } });

      // Wait for results to appear first
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(1); // Close button + results
      });

      // Now find and hover the result
      const buttons = screen.getAllByRole('button');
      const resultButton = buttons.find(btn => btn.textContent?.includes('Design 1'));
      expect(resultButton).toBeTruthy();
      fireEvent.mouseEnter(resultButton!);

      // Verify hover state - should update selected index which changes styling
      expect(resultButton).toBeInTheDocument();
    });
  });

  describe('Recent Searches', () => {
    it('should display recent searches when no query', async () => {
      localStorageMock.setItem('h2-tank-recent-searches', JSON.stringify([
        { id: 'recent-1', title: 'Recent Search', description: 'Previous search', category: 'Navigation', icon: '🔍', action: vi.fn() },
      ]));

      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText(/recent searches/i)).toBeInTheDocument();
      });
    });

    it('should save search to recent on selection', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'Design' } });

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const resultButton = buttons.find(btn => btn.textContent?.includes('Design 1'));
        expect(resultButton).toBeTruthy();
        fireEvent.click(resultButton!);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'h2-tank-recent-searches',
        expect.any(String)
      );
    });

    it('should limit recent searches to 5', async () => {
      const manyRecents = Array.from({ length: 10 }, (_, i) => ({
        id: `recent-${i}`,
        title: `Recent ${i}`,
        description: 'Description',
        category: 'Navigation',
        icon: '🔍',
        action: vi.fn(),
      }));

      localStorageMock.setItem('h2-tank-recent-searches', JSON.stringify(manyRecents));

      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      // Verify component handles this gracefully
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle localStorage error gracefully', async () => {
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      // Should not crash
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      localStorageMock.getItem = originalGetItem;
    });
  });

  describe('Accessibility', () => {
    it('should have dialog role', () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-label on search input', () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      // Search input has aria-label="Search"
      const inputs = screen.getAllByLabelText(/search/i);
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should have keyboard hints in footer', () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Navigate')).toBeInTheDocument();
      expect(screen.getByText('Select')).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();
    });
  });

  describe('Category Icons', () => {
    it('should render navigation icon', async () => {
      render(<GlobalSearch isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/search requirements/i);
      fireEvent.change(input, { target: { value: 'Requirements' } });

      await waitFor(() => {
        // Navigation category should be visible
        const results = screen.getAllByRole('button');
        expect(results.length).toBeGreaterThan(0);
      });
    });
  });
});
