import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocationSearchMapEditor, labelFromValue } from './LocationSearchMapEditor';

describe('labelFromValue', () => {
  it('returns the label part of a lat|lng|label value', () => {
    expect(labelFromValue('52.99|-0.78|Anasa Fernwood')).toBe('Anasa Fernwood');
  });

  it('rejoins labels that contain pipes', () => {
    expect(labelFromValue('1|2|A|B')).toBe('A|B');
  });

  it('falls back to coords when no label', () => {
    expect(labelFromValue('52.99|-0.78')).toBe('52.99, -0.78');
  });

  it('returns empty string for malformed value', () => {
    expect(labelFromValue('nonsense')).toBe('');
  });
});

describe('LocationSearchMapEditor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders an existing selection as a label with a change affordance', () => {
    const onChange = vi.fn();
    render(
      <LocationSearchMapEditor
        value={JSON.stringify({ 'Pilates Class': '52.99|-0.78|Anasa Fernwood' })}
        onChange={onChange}
      />
    );
    expect(screen.getByText(/Anasa Fernwood/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pilates Class')).toBeInTheDocument();
  });

  it('clearing a selection drops the rule from serialised output', () => {
    const onChange = vi.fn();
    render(
      <LocationSearchMapEditor
        value={JSON.stringify({ 'Pilates Class': '52.99|-0.78|Anasa Fernwood' })}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByTitle('Change place'));
    // value cleared → rule has no value → excluded from serialised map
    expect(onChange).toHaveBeenLastCalledWith('{}');
  });

  it('debounced search selects a place and serialises lat|lng|label', async () => {
    // Real timers here so testing-library's async polling works against the live debounce.
    vi.useRealTimers();
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => [
        { lat: '53.07', lon: '-0.81', display_name: 'Code Fitness, Newark' },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    const onChange = vi.fn();
    render(<LocationSearchMapEditor value="" onChange={onChange} />);

    // Enter the title keyword.
    fireEvent.change(screen.getByPlaceholderText(/Title keyword/), {
      target: { value: 'Hyrox Class' },
    });

    // Type into the place search box and let the debounce fire.
    fireEvent.change(screen.getByPlaceholderText(/Search for a place/), {
      target: { value: 'Code Fitness' },
    });

    // The result appears once the debounce fires and fetch resolves; click it.
    const resultBtn = await screen.findByRole('button', { name: 'Code Fitness, Newark' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('q=Code%20Fitness');

    fireEvent.click(resultBtn);

    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith(
        JSON.stringify({ 'Hyrox Class': '53.07|-0.81|Code Fitness, Newark' })
      );
    });
  });

  it('does not search for queries shorter than 3 characters', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<LocationSearchMapEditor value="" onChange={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/Search for a place/), {
      target: { value: 'ab' },
    });
    await vi.advanceTimersByTimeAsync(700);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
