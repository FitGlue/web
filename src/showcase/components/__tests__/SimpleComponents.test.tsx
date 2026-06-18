import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AISummaryCard } from '../AISummaryCard';
import { DetailList } from '../DetailList';
import { HorizontalBar } from '../HorizontalBar';
import { IntensityBadge } from '../IntensityBadge';
import { SectionCard } from '../SectionCard';
import { StatBlock } from '../StatBlock';
import { StatPills } from '../StatPills';
import { StatsBar } from '../StatsBar';
import type { DescriptionSection } from '../DescriptionSections';

const section: DescriptionSection = { emoji: '✨', title: 'AI Summary', content: 'A great workout.' };

describe('AISummaryCard', () => {
  it('renders the section title and content', () => {
    render(<AISummaryCard section={section} />);
    expect(screen.getByText(/AI Summary/)).toBeInTheDocument();
    expect(screen.getByText('A great workout.')).toBeInTheDocument();
  });
});

describe('SectionCard', () => {
  it('renders header, subtitle and children', () => {
    render(
      <SectionCard section={{ emoji: '🏃', title: 'Pace', content: '' }} idx={2} subtitle="per km">
        <span>child content</span>
      </SectionCard>,
    );
    expect(screen.getByText(/Pace/)).toBeInTheDocument();
    expect(screen.getByText('per km')).toBeInTheDocument();
    expect(screen.getByText('child content')).toBeInTheDocument();
  });
});

describe('DetailList', () => {
  it('renders one row per item', () => {
    const { container } = render(
      <DetailList items={[{ emoji: '⏱', text: 'Duration' }, { emoji: '📏', text: 'Distance' }]} />,
    );
    expect(container.querySelectorAll('.progress-detail-row').length).toBe(2);
    expect(screen.getByText('Duration')).toBeInTheDocument();
  });
});

describe('HorizontalBar', () => {
  it('renders the label and right content', () => {
    render(<HorizontalBar label="Zone 1" percentage={40} rightContent={<span>40%</span>} />);
    expect(screen.getByText('Zone 1')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('applies a custom fill colour', () => {
    const { container } = render(<HorizontalBar label="Z" percentage={50} fillColor="#fff" fillClass="x" />);
    expect(container.querySelector('.h-bar-fill.x')).toBeTruthy();
  });
});

describe('IntensityBadge', () => {
  it('renders the label', () => {
    render(<IntensityBadge label="Hard" size="large" />);
    expect(screen.getByText('Hard')).toBeInTheDocument();
  });
});

describe('StatBlock', () => {
  it('renders value, label, unit, hint, icon and children', () => {
    render(
      <StatBlock value="42" label="BPM" unit="avg" hint="hint" icon="❤️" sub={<i>sub</i>}>
        <span>extra</span>
      </StatBlock>,
    );
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('BPM')).toBeInTheDocument();
    expect(screen.getByText('avg')).toBeInTheDocument();
    expect(screen.getByText('hint')).toBeInTheDocument();
    expect(screen.getByText('extra')).toBeInTheDocument();
  });
});

describe('StatPills', () => {
  it('renders one pill per item', () => {
    const { container } = render(<StatPills items={['a', 'b', 'c']} className="cls" />);
    expect(container.querySelectorAll('.stat-pill').length).toBe(3);
  });
});

describe('StatsBar', () => {
  it('renders normal and note items', () => {
    render(
      <StatsBar items={[{ value: '10', label: 'Reps', color: '#fff' }, { value: 'A note', note: true }]} />,
    );
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Reps')).toBeInTheDocument();
    expect(screen.getByText('A note')).toBeInTheDocument();
  });
});
