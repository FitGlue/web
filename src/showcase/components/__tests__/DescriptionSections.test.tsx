import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DescriptionSections, parseDescriptionSections } from '../DescriptionSections';

describe('parseDescriptionSections', () => {
  it('returns an empty array for empty text', () => {
    expect(parseDescriptionSections('')).toEqual([]);
  });

  it('captures a plain description with no headers', () => {
    const sections = parseDescriptionSections('Just a normal run today.');
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe('Description');
    expect(sections[0].content).toContain('normal run');
  });

  it('parses an emoji header ending with a colon', () => {
    const sections = parseDescriptionSections('❤️ Heart Rate:\nAvg 150 bpm');
    const hr = sections.find((s) => s.title === 'Heart Rate');
    expect(hr).toBeTruthy();
    expect(hr!.content).toContain('150');
  });

  it('strips the FitGlue signature', () => {
    const sections = parseDescriptionSections('Great session\n\nPosted via FitGlue 💪');
    expect(sections.map((s) => s.content).join(' ')).not.toContain('Posted via FitGlue');
  });
});

describe('DescriptionSections', () => {
  it('renders nothing for empty text', () => {
    const { container } = render(
      <DescriptionSections text="" hasGraphs={new Set()} hasHybridRace={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a fallback section card for multi-line enricher content', () => {
    const text = '🔥 Notes:\nline one\nline two';
    const { container } = render(
      <DescriptionSections text={text} hasGraphs={new Set()} hasHybridRace={false} />,
    );
    expect(container.querySelector('.showcase-section')).toBeTruthy();
  });
});
