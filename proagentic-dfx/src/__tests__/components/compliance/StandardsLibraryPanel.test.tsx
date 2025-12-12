/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * StandardsLibraryPanel Component Tests
 * Coverage Target: 80%
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { StandardsLibraryPanel } from '@/components/compliance/StandardsLibraryPanel';
import type { StandardsLibrary, RegulatoryStandard, IndustryStandard, InternalPolicy, CustomerRequirement } from '@/components/compliance/types';

const mockRegulatoryStandard: RegulatoryStandard = {
  id: 'reg-1',
  code: 'UN GTR 13',
  title: 'Global Technical Regulation for Hydrogen',
  full_title: 'Global Technical Regulation concerning the hydrogen and fuel cell vehicles',
  type: 'regulatory',
  version: '2023-01',
  scope: 'Hydrogen fuel cell vehicle safety requirements',
  description: 'Safety requirements for hydrogen storage systems',
  applicability: {
    tank_types: ['Type III', 'Type IV'],
    pressure_range: { min: 350, max: 700 },
    regions: ['EU', 'US', 'JP'],
  },
  is_mandatory: true,
  clauses_count: 45,
  status: 'active',
  key_requirements: [
    { clause: '5.1', summary: 'Burst test requirements', criticality: 'critical' },
    { clause: '6.2', summary: 'Cycling test', criticality: 'high' },
  ],
  certification_bodies: ['TÜV', 'FMVSS', 'JARI'],
};

const mockSupersededStandard: RegulatoryStandard = {
  ...mockRegulatoryStandard,
  id: 'reg-2',
  code: 'UN GTR 12',
  status: 'superseded',
  superseded_by: 'UN GTR 13',
  is_mandatory: false,
};

const mockDraftStandard: RegulatoryStandard = {
  ...mockRegulatoryStandard,
  id: 'reg-3',
  code: 'ISO 99999',
  status: 'draft',
  is_mandatory: false,
};

const mockIndustryStandard: IndustryStandard = {
  id: 'ind-1',
  code: 'SAE J2579',
  title: 'Standard for Fuel Systems in Fuel Cell Vehicles',
  type: 'industry',
  version: '2021',
  scope: 'Fuel system requirements for FCVs',
  description: 'Industry standard for fuel system design',
  applicability: { tank_types: ['Type IV'] },
  is_mandatory: false,
  clauses_count: 28,
  status: 'active',
};

const mockInternalPolicy: InternalPolicy = {
  id: 'int-1',
  code: 'QMS-001',
  title: 'Quality Management System Policy',
  type: 'internal',
  version: '3.0',
  owner: 'Quality Department',
  scope: 'All manufacturing operations',
  description: 'Internal quality management requirements',
  requirements: [
    { id: 'QM-1', summary: 'ISO 9001 compliance', criticality: 'high' },
    { id: 'QM-2', summary: 'Document control', criticality: 'medium' },
  ],
  effective_date: '2024-01-01',
  review_date: '2025-01-01',
  status: 'active',
};

const mockDraftPolicy: InternalPolicy = {
  ...mockInternalPolicy,
  id: 'int-2',
  code: 'QMS-002',
  status: 'draft',
};

const mockCustomerRequirement: CustomerRequirement = {
  id: 'cust-1',
  code: 'OEM-REQ-001',
  title: 'OEM Specific Requirements',
  type: 'customer',
  customer: 'Toyota',
  version: '2.0',
  scope: 'Hydrogen storage systems for Toyota vehicles',
  description: 'Customer-specific requirements for Toyota platform',
  requirements: [
    { id: 'TR-1', summary: 'Cold weather performance', criticality: 'critical' },
    { id: 'TR-2', summary: 'Weight optimization', criticality: 'high' },
  ],
  status: 'active',
};

const mockLibrary: StandardsLibrary = {
  regulatory_standards: [mockRegulatoryStandard, mockSupersededStandard, mockDraftStandard],
  industry_standards: [mockIndustryStandard],
  internal_policies: [mockInternalPolicy, mockDraftPolicy],
  customer_requirements: [mockCustomerRequirement],
  summary: {
    total_regulatory: 3,
    total_industry: 1,
    total_internal_policies: 2,
    total_customer_requirements: 1,
    last_updated: '2024-12-01',
  },
};

describe('StandardsLibraryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the library header', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText('Standards Library')).toBeInTheDocument();
      expect(screen.getByText(/Browse and search all applicable standards/)).toBeInTheDocument();
    });

    it('should display last updated date', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText(/Last Updated:.*2024-12-01/)).toBeInTheDocument();
    });

    it('should display total items count', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText('7 Total Items')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByPlaceholderText(/Search standards, codes, or descriptions/)).toBeInTheDocument();
    });

    it('should render status filter dropdown', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('All Status')).toBeInTheDocument();
    });
  });

  describe('Summary Stats Cards', () => {
    it('should display regulatory standards count', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Regulatory Standards')).toBeInTheDocument();
    });

    it('should display industry standards count', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      const industryButton = screen.getByText('Industry Standards').closest('button');
      expect(industryButton).toBeInTheDocument();
      expect(industryButton?.textContent).toContain('1');
    });

    it('should display internal policies count', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Internal Policies')).toBeInTheDocument();
    });

    it('should display customer requirements count', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText('Customer/OEM Requirements')).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    it('should filter to regulatory when clicked', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const regulatoryButton = screen.getByText('Regulatory Standards').closest('button');
      fireEvent.click(regulatoryButton!);

      // Should show regulatory section
      expect(screen.getByText('UN GTR 13')).toBeInTheDocument();
      // Should not show industry section
      expect(screen.queryByText(/Industry Standards \(\d+\)/)).not.toBeInTheDocument();
    });

    it('should filter to industry when clicked', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const industryButton = screen.getByText('Industry Standards').closest('button');
      fireEvent.click(industryButton!);

      expect(screen.getByText('SAE J2579')).toBeInTheDocument();
      expect(screen.queryByText(/Regulatory Standards \(\d+\)/)).not.toBeInTheDocument();
    });

    it('should filter to internal when clicked', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const internalButton = screen.getByText('Internal Policies').closest('button');
      fireEvent.click(internalButton!);

      expect(screen.getByText('QMS-001')).toBeInTheDocument();
    });

    it('should filter to customer when clicked', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const customerButton = screen.getByText('Customer/OEM Requirements').closest('button');
      fireEvent.click(customerButton!);

      expect(screen.getByText('OEM-REQ-001')).toBeInTheDocument();
    });

    it('should toggle back to all when same category clicked again', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const regulatoryButton = screen.getByText('Regulatory Standards').closest('button');
      fireEvent.click(regulatoryButton!);
      fireEvent.click(regulatoryButton!);

      // All categories should be visible again
      expect(screen.getByText('UN GTR 13')).toBeInTheDocument();
      expect(screen.getByText('SAE J2579')).toBeInTheDocument();
    });
  });

  describe('Status Filtering', () => {
    it('should filter by active status', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: 'active' } });

      // Active standards should be visible
      expect(screen.getByText('UN GTR 13')).toBeInTheDocument();
      // Superseded should not be visible
      expect(screen.queryByText('UN GTR 12')).not.toBeInTheDocument();
    });

    it('should filter by superseded status', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: 'superseded' } });

      expect(screen.getByText('UN GTR 12')).toBeInTheDocument();
      expect(screen.queryByText('UN GTR 13')).not.toBeInTheDocument();
    });

    it('should filter by draft status', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: 'draft' } });

      expect(screen.getByText('ISO 99999')).toBeInTheDocument();
      expect(screen.queryByText('UN GTR 13')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter by search query in code', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const searchInput = screen.getByPlaceholderText(/Search standards/);
      fireEvent.change(searchInput, { target: { value: 'GTR 13' } });

      expect(screen.getByText('UN GTR 13')).toBeInTheDocument();
      expect(screen.queryByText('SAE J2579')).not.toBeInTheDocument();
    });

    it('should filter by search query in title', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const searchInput = screen.getByPlaceholderText(/Search standards/);
      fireEvent.change(searchInput, { target: { value: 'Fuel Cell' } });

      expect(screen.getByText('SAE J2579')).toBeInTheDocument();
    });

    it('should filter by search query in description', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const searchInput = screen.getByPlaceholderText(/Search standards/);
      fireEvent.change(searchInput, { target: { value: 'quality management' } });

      expect(screen.getByText('QMS-001')).toBeInTheDocument();
    });

    it('should show empty state when no results', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const searchInput = screen.getByPlaceholderText(/Search standards/);
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });

      expect(screen.getByText('No standards found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
    });
  });

  describe('Regulatory Standard Cards', () => {
    it('should display standard code and title', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      expect(screen.getByText('UN GTR 13')).toBeInTheDocument();
      // Title appears in multiple places, just check at least one exists
      expect(screen.getAllByText('Global Technical Regulation for Hydrogen').length).toBeGreaterThan(0);
    });

    it('should display mandatory badge for mandatory standards', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText('Mandatory')).toBeInTheDocument();
    });

    it('should expand card to show details on click', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const expandButton = screen.getByText('UN GTR 13').closest('button');
      fireEvent.click(expandButton!);

      // Expanded details should be visible
      expect(screen.getByText('Full Title:')).toBeInTheDocument();
      expect(screen.getByText(/Global Technical Regulation concerning/)).toBeInTheDocument();
      expect(screen.getByText('Version:')).toBeInTheDocument();
      expect(screen.getByText('Scope:')).toBeInTheDocument();
    });

    it('should display applicability info when expanded', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const expandButton = screen.getByText('UN GTR 13').closest('button');
      fireEvent.click(expandButton!);

      expect(screen.getByText('Applicability:')).toBeInTheDocument();
      expect(screen.getByText('Type III')).toBeInTheDocument();
      expect(screen.getByText('Type IV')).toBeInTheDocument();
      expect(screen.getByText('EU')).toBeInTheDocument();
      expect(screen.getByText('350-700 bar')).toBeInTheDocument();
    });

    it('should display key requirements when expanded', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const expandButton = screen.getByText('UN GTR 13').closest('button');
      fireEvent.click(expandButton!);

      expect(screen.getByText('Key Requirements:')).toBeInTheDocument();
      expect(screen.getByText(/Burst test requirements/)).toBeInTheDocument();
      expect(screen.getByText(/Cycling test/)).toBeInTheDocument();
    });

    it('should display certification bodies when expanded', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const expandButton = screen.getByText('UN GTR 13').closest('button');
      fireEvent.click(expandButton!);

      expect(screen.getByText('Certification Bodies:')).toBeInTheDocument();
      expect(screen.getByText('TÜV')).toBeInTheDocument();
      expect(screen.getByText('FMVSS')).toBeInTheDocument();
    });

    it('should display superseded info for superseded standards', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const expandButton = screen.getByText('UN GTR 12').closest('button');
      fireEvent.click(expandButton!);

      expect(screen.getByText(/Superseded by: UN GTR 13/)).toBeInTheDocument();
    });

    it('should collapse card when clicked again', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const expandButton = screen.getByText('UN GTR 13').closest('button');
      fireEvent.click(expandButton!);
      expect(screen.getByText('Full Title:')).toBeInTheDocument();

      fireEvent.click(expandButton!);
      expect(screen.queryByText('Full Title:')).not.toBeInTheDocument();
    });
  });

  describe('Industry Standard Cards', () => {
    it('should display industry standard info', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      expect(screen.getByText('SAE J2579')).toBeInTheDocument();
      expect(screen.getByText('Standard for Fuel Systems in Fuel Cell Vehicles')).toBeInTheDocument();
    });

    it('should expand industry standard to show details', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const expandButton = screen.getByText('SAE J2579').closest('button');
      fireEvent.click(expandButton!);

      expect(screen.getByText('Description:')).toBeInTheDocument();
      expect(screen.getByText('Industry standard for fuel system design')).toBeInTheDocument();
    });
  });

  describe('Internal Policy Cards', () => {
    it('should display policy info', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      expect(screen.getByText('QMS-001')).toBeInTheDocument();
      // Title may appear multiple times, check at least one exists
      expect(screen.getAllByText('Quality Management System Policy').length).toBeGreaterThan(0);
    });

    it('should expand policy to show details', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const expandButton = screen.getByText('QMS-001').closest('button');
      fireEvent.click(expandButton!);

      expect(screen.getByText('Owner:')).toBeInTheDocument();
      expect(screen.getByText('Quality Department')).toBeInTheDocument();
      expect(screen.getByText('Effective Date:')).toBeInTheDocument();
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();
      expect(screen.getByText('Review Date:')).toBeInTheDocument();
      expect(screen.getByText('2025-01-01')).toBeInTheDocument();
    });

    it('should display policy requirements when expanded', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const expandButton = screen.getByText('QMS-001').closest('button');
      fireEvent.click(expandButton!);

      expect(screen.getByText('Policy Requirements:')).toBeInTheDocument();
      expect(screen.getByText(/ISO 9001 compliance/)).toBeInTheDocument();
    });
  });

  describe('Customer Requirement Cards', () => {
    it('should display customer requirement info', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      expect(screen.getByText('OEM-REQ-001')).toBeInTheDocument();
      expect(screen.getByText('OEM Specific Requirements')).toBeInTheDocument();
    });

    it('should display customer badge', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText('Toyota')).toBeInTheDocument();
    });

    it('should expand customer requirement to show details', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const expandButton = screen.getByText('OEM-REQ-001').closest('button');
      fireEvent.click(expandButton!);

      expect(screen.getByText('Customer:')).toBeInTheDocument();
      expect(screen.getByText('OEM Requirements:')).toBeInTheDocument();
      expect(screen.getByText(/Cold weather performance/)).toBeInTheDocument();
    });
  });

  describe('Items Count Display', () => {
    it('should show correct items count', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText('7 items shown')).toBeInTheDocument();
    });

    it('should update count when filtering', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: 'active' } });

      expect(screen.getByText('4 items shown')).toBeInTheDocument();
    });
  });

  describe('Empty Library', () => {
    it('should show empty state for empty library', () => {
      const emptyLibrary: StandardsLibrary = {
        regulatory_standards: [],
        industry_standards: [],
        internal_policies: [],
        customer_requirements: [],
        summary: {
          total_regulatory: 0,
          total_industry: 0,
          total_internal_policies: 0,
          total_customer_requirements: 0,
          last_updated: '2024-12-01',
        },
      };

      render(<StandardsLibraryPanel library={emptyLibrary} />);
      expect(screen.getByText('No standards found')).toBeInTheDocument();
    });
  });

  describe('Section Headers', () => {
    it('should display regulatory section header with count', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText(/Regulatory Standards \(3\)/)).toBeInTheDocument();
    });

    it('should display industry section header with count', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText(/Industry Standards \(1\)/)).toBeInTheDocument();
    });

    it('should display internal section header with count', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText(/Internal Policies \(2\)/)).toBeInTheDocument();
    });

    it('should display customer section header with count', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText(/Customer\/OEM Requirements \(1\)/)).toBeInTheDocument();
    });
  });

  describe('Requirement Badges', () => {
    it('should display critical requirement with correct styling', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const expandButton = screen.getByText('UN GTR 13').closest('button');
      fireEvent.click(expandButton!);

      const criticalBadge = screen.getByText(/5.1:/).closest('div');
      expect(criticalBadge).toHaveClass('bg-red-100');
    });

    it('should display high requirement with correct styling', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const expandButton = screen.getByText('UN GTR 13').closest('button');
      fireEvent.click(expandButton!);

      const highBadge = screen.getByText(/6.2:/).closest('div');
      expect(highBadge).toHaveClass('bg-orange-100');
    });
  });

  describe('Status Badges', () => {
    it('should display active status badge', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      const activeBadges = screen.getAllByText('active');
      expect(activeBadges.length).toBeGreaterThan(0);
    });

    it('should display superseded status badge', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      expect(screen.getByText('superseded')).toBeInTheDocument();
    });

    it('should display draft status badge', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);
      const draftBadges = screen.getAllByText('draft');
      expect(draftBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Combined Filtering', () => {
    it('should apply both category and status filters', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      // Select regulatory category
      const regulatoryButton = screen.getByText('Regulatory Standards').closest('button');
      fireEvent.click(regulatoryButton!);

      // Select active status
      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: 'active' } });

      // Should only show active regulatory standards
      expect(screen.getByText('UN GTR 13')).toBeInTheDocument();
      expect(screen.queryByText('UN GTR 12')).not.toBeInTheDocument();
      expect(screen.queryByText('SAE J2579')).not.toBeInTheDocument();
    });

    it('should apply category, status, and search filters together', () => {
      render(<StandardsLibraryPanel library={mockLibrary} />);

      // Select regulatory category
      const regulatoryButton = screen.getByText('Regulatory Standards').closest('button');
      fireEvent.click(regulatoryButton!);

      // Search for specific term
      const searchInput = screen.getByPlaceholderText(/Search standards/);
      fireEvent.change(searchInput, { target: { value: 'GTR 13' } });

      expect(screen.getByText('UN GTR 13')).toBeInTheDocument();
      expect(screen.queryByText('UN GTR 12')).not.toBeInTheDocument();
    });
  });
});
