'use client';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useViewerKeyboardShortcuts } from '@/components/viewer/useViewerKeyboardShortcuts';

describe('useViewerKeyboardShortcuts', () => {
  const createMockCallbacks = () => ({
    onToggleStress: vi.fn(),
    onToggleWireframe: vi.fn(),
    onToggleCrossSection: vi.fn(),
    onToggleAutoRotate: vi.fn(),
    onToggleLiner: vi.fn(),
  });

  const simulateKeyDown = (key: string, shiftKey = false) => {
    const event = new KeyboardEvent('keydown', {
      key,
      shiftKey,
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call onToggleStress when S key is pressed', () => {
    const callbacks = createMockCallbacks();
    renderHook(() => useViewerKeyboardShortcuts(callbacks));

    simulateKeyDown('s');

    expect(callbacks.onToggleStress).toHaveBeenCalledTimes(1);
  });

  it('should call onToggleWireframe when W key is pressed', () => {
    const callbacks = createMockCallbacks();
    renderHook(() => useViewerKeyboardShortcuts(callbacks));

    simulateKeyDown('w');

    expect(callbacks.onToggleWireframe).toHaveBeenCalledTimes(1);
  });

  it('should call onToggleCrossSection when C key is pressed', () => {
    const callbacks = createMockCallbacks();
    renderHook(() => useViewerKeyboardShortcuts(callbacks));

    simulateKeyDown('c');

    expect(callbacks.onToggleCrossSection).toHaveBeenCalledTimes(1);
  });

  it('should call onToggleAutoRotate when Shift+R is pressed', () => {
    const callbacks = createMockCallbacks();
    renderHook(() => useViewerKeyboardShortcuts(callbacks));

    simulateKeyDown('r', true);

    expect(callbacks.onToggleAutoRotate).toHaveBeenCalledTimes(1);
  });

  it('should NOT call onToggleAutoRotate when R is pressed without Shift', () => {
    const callbacks = createMockCallbacks();
    renderHook(() => useViewerKeyboardShortcuts(callbacks));

    simulateKeyDown('r', false);

    expect(callbacks.onToggleAutoRotate).not.toHaveBeenCalled();
  });

  it('should call onToggleLiner when Shift+L is pressed', () => {
    const callbacks = createMockCallbacks();
    renderHook(() => useViewerKeyboardShortcuts(callbacks));

    simulateKeyDown('l', true);

    expect(callbacks.onToggleLiner).toHaveBeenCalledTimes(1);
  });

  it('should NOT call onToggleLiner when L is pressed without Shift', () => {
    const callbacks = createMockCallbacks();
    renderHook(() => useViewerKeyboardShortcuts(callbacks));

    simulateKeyDown('l', false);

    expect(callbacks.onToggleLiner).not.toHaveBeenCalled();
  });

  it('should handle uppercase keys', () => {
    const callbacks = createMockCallbacks();
    renderHook(() => useViewerKeyboardShortcuts(callbacks));

    simulateKeyDown('S');

    expect(callbacks.onToggleStress).toHaveBeenCalledTimes(1);
  });

  it('should not respond to unknown keys', () => {
    const callbacks = createMockCallbacks();
    renderHook(() => useViewerKeyboardShortcuts(callbacks));

    simulateKeyDown('x');

    expect(callbacks.onToggleStress).not.toHaveBeenCalled();
    expect(callbacks.onToggleWireframe).not.toHaveBeenCalled();
    expect(callbacks.onToggleCrossSection).not.toHaveBeenCalled();
    expect(callbacks.onToggleAutoRotate).not.toHaveBeenCalled();
    expect(callbacks.onToggleLiner).not.toHaveBeenCalled();
  });

  it('should not respond when focus is in an input field', () => {
    const callbacks = createMockCallbacks();
    renderHook(() => useViewerKeyboardShortcuts(callbacks));

    // Create and focus an input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Dispatch keydown event with input as target
    const event = new KeyboardEvent('keydown', {
      key: 's',
      bubbles: true,
    });
    Object.defineProperty(event, 'target', { value: input });
    window.dispatchEvent(event);

    expect(callbacks.onToggleStress).not.toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(input);
  });

  it('should not respond when focus is in a textarea', () => {
    const callbacks = createMockCallbacks();
    renderHook(() => useViewerKeyboardShortcuts(callbacks));

    // Create and focus a textarea element
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    // Dispatch keydown event with textarea as target
    const event = new KeyboardEvent('keydown', {
      key: 's',
      bubbles: true,
    });
    Object.defineProperty(event, 'target', { value: textarea });
    window.dispatchEvent(event);

    expect(callbacks.onToggleStress).not.toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(textarea);
  });

  it('should cleanup event listener on unmount', () => {
    const callbacks = createMockCallbacks();
    const { unmount } = renderHook(() => useViewerKeyboardShortcuts(callbacks));

    unmount();

    simulateKeyDown('s');

    expect(callbacks.onToggleStress).not.toHaveBeenCalled();
  });

  it('should handle multiple key presses', () => {
    const callbacks = createMockCallbacks();
    renderHook(() => useViewerKeyboardShortcuts(callbacks));

    simulateKeyDown('s');
    simulateKeyDown('w');
    simulateKeyDown('c');

    expect(callbacks.onToggleStress).toHaveBeenCalledTimes(1);
    expect(callbacks.onToggleWireframe).toHaveBeenCalledTimes(1);
    expect(callbacks.onToggleCrossSection).toHaveBeenCalledTimes(1);
  });
});
