import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewerControls } from '@/components/viewer/ViewerControls';
import type { ViewerControlsProps } from '@/components/viewer/ViewerControls';

describe('ViewerControls', () => {
  const defaultProps: ViewerControlsProps = {
    onViewPreset: vi.fn(),
    onResetView: vi.fn(),
    onZoomChange: vi.fn(),
    onAutoRotateToggle: vi.fn(),
    onScreenshot: vi.fn(),
    cameraState: {
      position: [0, 0, 2],
      rotation: [0.3, 0],
      zoom: 1,
    },
    autoRotate: false,
    zoom: 1,
  };

  it('renders all camera preset buttons', () => {
    render(<ViewerControls {...defaultProps} />);

    // Check for all 6 orthographic view presets + isometric
    expect(screen.getByText('Front')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
    expect(screen.getByText('Top')).toBeInTheDocument();
    expect(screen.getByText('Bottom')).toBeInTheDocument();
    expect(screen.getByText('Iso')).toBeInTheDocument();
  });

  it('calls onViewPreset with correct preset when Front button is clicked', () => {
    const onViewPreset = vi.fn();
    render(<ViewerControls {...defaultProps} onViewPreset={onViewPreset} />);

    const frontButton = screen.getByText('Front');
    fireEvent.click(frontButton);

    expect(onViewPreset).toHaveBeenCalledWith('front');
  });

  it('calls onViewPreset with correct preset when Back button is clicked', () => {
    const onViewPreset = vi.fn();
    render(<ViewerControls {...defaultProps} onViewPreset={onViewPreset} />);

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(onViewPreset).toHaveBeenCalledWith('back');
  });

  it('calls onViewPreset with correct preset when Left button is clicked', () => {
    const onViewPreset = vi.fn();
    render(<ViewerControls {...defaultProps} onViewPreset={onViewPreset} />);

    const leftButton = screen.getByText('Left');
    fireEvent.click(leftButton);

    expect(onViewPreset).toHaveBeenCalledWith('left');
  });

  it('calls onViewPreset with correct preset when Right button is clicked', () => {
    const onViewPreset = vi.fn();
    render(<ViewerControls {...defaultProps} onViewPreset={onViewPreset} />);

    const rightButton = screen.getByText('Right');
    fireEvent.click(rightButton);

    expect(onViewPreset).toHaveBeenCalledWith('right');
  });

  it('calls onViewPreset with correct preset when Top button is clicked', () => {
    const onViewPreset = vi.fn();
    render(<ViewerControls {...defaultProps} onViewPreset={onViewPreset} />);

    const topButton = screen.getByText('Top');
    fireEvent.click(topButton);

    expect(onViewPreset).toHaveBeenCalledWith('top');
  });

  it('calls onViewPreset with correct preset when Bottom button is clicked', () => {
    const onViewPreset = vi.fn();
    render(<ViewerControls {...defaultProps} onViewPreset={onViewPreset} />);

    const bottomButton = screen.getByText('Bottom');
    fireEvent.click(bottomButton);

    expect(onViewPreset).toHaveBeenCalledWith('bottom');
  });

  it('calls onViewPreset with correct preset when Iso button is clicked', () => {
    const onViewPreset = vi.fn();
    render(<ViewerControls {...defaultProps} onViewPreset={onViewPreset} />);

    const isoButton = screen.getByText('Iso');
    fireEvent.click(isoButton);

    expect(onViewPreset).toHaveBeenCalledWith('isometric');
  });

  it('highlights the active preset button', () => {
    const { rerender } = render(<ViewerControls {...defaultProps} />);

    const frontButton = screen.getByText('Front');
    fireEvent.click(frontButton);

    // Re-render to reflect the active state
    rerender(<ViewerControls {...defaultProps} />);

    // The button should have the active styling
    expect(frontButton).toHaveClass('bg-blue-600', 'text-white');
  });

  it('calls onResetView when Reset button is clicked', () => {
    const onResetView = vi.fn();
    render(<ViewerControls {...defaultProps} onResetView={onResetView} />);

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(onResetView).toHaveBeenCalled();
  });

  it('displays camera position correctly', () => {
    render(<ViewerControls {...defaultProps} />);

    // Check camera position display
    expect(screen.getByText(/Position:/)).toBeInTheDocument();
    expect(screen.getByText(/\(0\.00, 0\.00, 2\.00\)/)).toBeInTheDocument();
  });

  it('displays camera rotation correctly', () => {
    render(<ViewerControls {...defaultProps} />);

    // Check camera rotation display
    expect(screen.getByText(/Rotation:/)).toBeInTheDocument();
    // 0.3 radians ≈ 17 degrees
    expect(screen.getByText(/\(17°, 0°\)/)).toBeInTheDocument();
  });

  it('displays zoom level correctly', () => {
    render(<ViewerControls {...defaultProps} />);

    expect(screen.getByText(/Zoom:/)).toBeInTheDocument();
    // Use getAllByText since there are two "100%" elements (camera state display and zoom slider)
    const zoomElements = screen.getAllByText('100%');
    expect(zoomElements.length).toBeGreaterThan(0);
  });

  it('calls onZoomChange when zoom slider is changed', () => {
    const onZoomChange = vi.fn();
    render(<ViewerControls {...defaultProps} onZoomChange={onZoomChange} />);

    const zoomSlider = screen.getByRole('slider');
    fireEvent.change(zoomSlider, { target: { value: '1.5' } });

    expect(onZoomChange).toHaveBeenCalledWith(1.5);
  });

  it('calls onAutoRotateToggle when auto-rotate checkbox is toggled', () => {
    const onAutoRotateToggle = vi.fn();
    render(<ViewerControls {...defaultProps} onAutoRotateToggle={onAutoRotateToggle} />);

    const autoRotateCheckbox = screen.getByRole('checkbox');
    fireEvent.click(autoRotateCheckbox);

    expect(onAutoRotateToggle).toHaveBeenCalledWith(true);
  });

  it('calls onScreenshot when Capture Screenshot button is clicked', () => {
    const onScreenshot = vi.fn();
    render(<ViewerControls {...defaultProps} onScreenshot={onScreenshot} />);

    const screenshotButton = screen.getByText('Capture Screenshot');
    fireEvent.click(screenshotButton);

    expect(onScreenshot).toHaveBeenCalled();
  });
});
