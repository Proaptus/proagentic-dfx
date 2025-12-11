/**
 * Badge Component Tests
 * Coverage Target: 80%
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, StatusBadge, PriorityBadge, ComplianceBadge } from '@/components/ui/Badge';

describe('Badge', () => {
  describe('Basic Rendering', () => {
    it('should render with default variant', () => {
      render(<Badge>Default</Badge>);
      expect(screen.getByText('Default')).toBeInTheDocument();
    });

    it('should render with default size (md)', () => {
      render(<Badge>Default</Badge>);
      expect(screen.getByText('Default')).toHaveClass('px-2.5', 'py-0.5');
    });
  });

  describe('All Variants', () => {
    it('should render default variant', () => {
      render(<Badge variant="default">Default</Badge>);
      expect(screen.getByText('Default')).toHaveClass('bg-gray-100');
    });

    it('should render success variant', () => {
      render(<Badge variant="success">Success</Badge>);
      expect(screen.getByText('Success')).toHaveClass('bg-green-100');
    });

    it('should render warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>);
      expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100');
    });

    it('should render error variant', () => {
      render(<Badge variant="error">Error</Badge>);
      expect(screen.getByText('Error')).toHaveClass('bg-red-100');
    });

    it('should render info variant', () => {
      render(<Badge variant="info">Info</Badge>);
      expect(screen.getByText('Info')).toHaveClass('bg-blue-100');
    });

    it('should render pass variant', () => {
      render(<Badge variant="pass">Pass</Badge>);
      expect(screen.getByText('Pass')).toHaveClass('bg-green-100');
    });

    it('should render fail variant', () => {
      render(<Badge variant="fail">Fail</Badge>);
      expect(screen.getByText('Fail')).toHaveClass('bg-red-100');
    });

    it('should render pending variant', () => {
      render(<Badge variant="pending">Pending</Badge>);
      expect(screen.getByText('Pending')).toHaveClass('bg-gray-100');
    });

    it('should render primary variant', () => {
      render(<Badge variant="primary">Primary</Badge>);
      expect(screen.getByText('Primary')).toHaveClass('bg-blue-100');
    });

    it('should render secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      expect(screen.getByText('Secondary')).toHaveClass('bg-purple-100');
    });
  });

  describe('All Sizes', () => {
    it('should render sm size', () => {
      render(<Badge size="sm">Small</Badge>);
      expect(screen.getByText('Small')).toHaveClass('px-2', 'py-0.5', 'text-xs');
    });

    it('should render md size', () => {
      render(<Badge size="md">Medium</Badge>);
      expect(screen.getByText('Medium')).toHaveClass('px-2.5', 'py-0.5', 'text-sm');
    });

    it('should render lg size', () => {
      render(<Badge size="lg">Large</Badge>);
      expect(screen.getByText('Large')).toHaveClass('px-3', 'py-1', 'text-base');
    });
  });

  describe('Icon Rendering', () => {
    it('should render default icon for success variant', () => {
      const { container } = render(<Badge variant="success">Success</Badge>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render default icon for error variant', () => {
      const { container } = render(<Badge variant="error">Error</Badge>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render default icon for warning variant', () => {
      const { container } = render(<Badge variant="warning">Warning</Badge>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render default icon for info variant', () => {
      const { container } = render(<Badge variant="info">Info</Badge>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render default icon for pending variant', () => {
      const { container } = render(<Badge variant="pending">Pending</Badge>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render default icon for pass variant', () => {
      const { container } = render(<Badge variant="pass">Pass</Badge>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render default icon for fail variant', () => {
      const { container } = render(<Badge variant="fail">Fail</Badge>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should not render icon for default variant', () => {
      const { container } = render(<Badge variant="default">Default</Badge>);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('should render custom icon as ReactNode', () => {
      render(<Badge icon={<span data-testid="custom-icon">*</span>}>Custom</Badge>);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should render icon with correct size for sm', () => {
      const { container } = render(<Badge variant="success" size="sm">Sm</Badge>);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-3', 'h-3');
    });

    it('should render icon with correct size for md', () => {
      const { container } = render(<Badge variant="success" size="md">Md</Badge>);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-4', 'h-4');
    });

    it('should render icon with correct size for lg', () => {
      const { container } = render(<Badge variant="success" size="lg">Lg</Badge>);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-5', 'h-5');
    });
  });

  describe('Dot Indicator', () => {
    it('should not render dot by default', () => {
      const { container } = render(<Badge>No Dot</Badge>);
      const dots = container.querySelectorAll('.rounded-full');
      // The badge itself is rounded-full, so we need to check for the small dot
      expect(dots.length).toBe(1); // Only the badge container
    });

    it('should render dot when dot=true', () => {
      const { container } = render(<Badge dot>With Dot</Badge>);
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots.length).toBe(2); // Badge + dot
    });

    it('should render dot with correct size for sm', () => {
      const { container } = render(<Badge dot size="sm">Sm</Badge>);
      const dot = container.querySelector('.w-1\\.5.h-1\\.5');
      expect(dot).toBeInTheDocument();
    });

    it('should render dot with correct size for md', () => {
      const { container } = render(<Badge dot size="md">Md</Badge>);
      const dot = container.querySelector('.w-2.h-2');
      expect(dot).toBeInTheDocument();
    });

    it('should render dot with correct size for lg', () => {
      const { container } = render(<Badge dot size="lg">Lg</Badge>);
      const dot = container.querySelector('.w-2\\.5.h-2\\.5');
      expect(dot).toBeInTheDocument();
    });

    it('should render dot with success color', () => {
      const { container } = render(<Badge dot variant="success">Success</Badge>);
      const dot = container.querySelector('.bg-green-600');
      expect(dot).toBeInTheDocument();
    });

    it('should render dot with pass color', () => {
      const { container } = render(<Badge dot variant="pass">Pass</Badge>);
      const dot = container.querySelector('.bg-green-600');
      expect(dot).toBeInTheDocument();
    });

    it('should render dot with error color', () => {
      const { container } = render(<Badge dot variant="error">Error</Badge>);
      const dot = container.querySelector('.bg-red-600');
      expect(dot).toBeInTheDocument();
    });

    it('should render dot with fail color', () => {
      const { container } = render(<Badge dot variant="fail">Fail</Badge>);
      const dot = container.querySelector('.bg-red-600');
      expect(dot).toBeInTheDocument();
    });

    it('should render dot with warning color', () => {
      const { container } = render(<Badge dot variant="warning">Warning</Badge>);
      const dot = container.querySelector('.bg-yellow-600');
      expect(dot).toBeInTheDocument();
    });

    it('should render dot with info color', () => {
      const { container } = render(<Badge dot variant="info">Info</Badge>);
      const dot = container.querySelector('.bg-blue-600');
      expect(dot).toBeInTheDocument();
    });

    it('should render dot with pending color', () => {
      const { container } = render(<Badge dot variant="pending">Pending</Badge>);
      const dot = container.querySelector('.bg-gray-600');
      expect(dot).toBeInTheDocument();
    });

    it('should render dot with default color', () => {
      const { container } = render(<Badge dot variant="default">Default</Badge>);
      const dot = container.querySelector('.bg-gray-600');
      expect(dot).toBeInTheDocument();
    });

    it('should render dot with primary color', () => {
      const { container } = render(<Badge dot variant="primary">Primary</Badge>);
      const dot = container.querySelector('.bg-blue-600');
      expect(dot).toBeInTheDocument();
    });

    it('should render dot with secondary color', () => {
      const { container } = render(<Badge dot variant="secondary">Secondary</Badge>);
      const dot = container.querySelector('.bg-purple-600');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<Badge className="custom-badge">Test</Badge>);
      expect(screen.getByText('Test')).toHaveClass('custom-badge');
    });
  });
});

describe('StatusBadge', () => {
  it('should render pass status', () => {
    render(<StatusBadge status="pass">Pass</StatusBadge>);
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toHaveClass('bg-green-100');
  });

  it('should render fail status', () => {
    render(<StatusBadge status="fail">Fail</StatusBadge>);
    expect(screen.getByText('Fail')).toBeInTheDocument();
    expect(screen.getByText('Fail')).toHaveClass('bg-red-100');
  });

  it('should render warning status', () => {
    render(<StatusBadge status="warning">Warning</StatusBadge>);
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100');
  });

  it('should render pending status', () => {
    render(<StatusBadge status="pending">Pending</StatusBadge>);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toHaveClass('bg-gray-100');
  });

  it('should render custom children', () => {
    render(<StatusBadge status="pass">Custom Pass</StatusBadge>);
    expect(screen.getByText('Custom Pass')).toBeInTheDocument();
  });
});

describe('PriorityBadge', () => {
  it('should render low priority', () => {
    render(<PriorityBadge priority="low">Low</PriorityBadge>);
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Low')).toHaveClass('bg-gray-100');
  });

  it('should render medium priority', () => {
    render(<PriorityBadge priority="medium">Medium</PriorityBadge>);
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toHaveClass('bg-blue-100');
  });

  it('should render high priority', () => {
    render(<PriorityBadge priority="high">High</PriorityBadge>);
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('High')).toHaveClass('bg-yellow-100');
  });

  it('should render critical priority', () => {
    render(<PriorityBadge priority="critical">Critical</PriorityBadge>);
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toHaveClass('bg-red-100');
  });

  it('should render custom children', () => {
    render(<PriorityBadge priority="high">P1</PriorityBadge>);
    expect(screen.getByText('P1')).toBeInTheDocument();
  });
});

describe('ComplianceBadge', () => {
  it('should render compliant status', () => {
    render(<ComplianceBadge compliant={true}>Compliant</ComplianceBadge>);
    expect(screen.getByText('Compliant')).toBeInTheDocument();
    expect(screen.getByText('Compliant')).toHaveClass('bg-green-100');
  });

  it('should render non-compliant status', () => {
    render(<ComplianceBadge compliant={false}>Non-Compliant</ComplianceBadge>);
    expect(screen.getByText('Non-Compliant')).toBeInTheDocument();
    expect(screen.getByText('Non-Compliant')).toHaveClass('bg-red-100');
  });

  it('should render custom children when compliant', () => {
    render(<ComplianceBadge compliant={true}>Passed</ComplianceBadge>);
    expect(screen.getByText('Passed')).toBeInTheDocument();
  });

  it('should render custom children when non-compliant', () => {
    render(<ComplianceBadge compliant={false}>Failed</ComplianceBadge>);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });
});
