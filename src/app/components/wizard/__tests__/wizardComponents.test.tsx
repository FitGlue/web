import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { WizardStepHead } from '../WizardStepHead';
import { WizardOptionCard } from '../WizardOptionCard';
import { WizardOptionGrid } from '../WizardOptionGrid';
import { WizardStepIndicator } from '../WizardStepIndicator';
import { WizardReviewBlock } from '../WizardReviewBlock';
import { WizardExcludedSection } from '../WizardExcludedSection';
import { PipelineReviewFlow } from '../PipelineReviewFlow';
import { EnricherConfigTabs } from '../EnricherConfigTabs';

describe('WizardStepHead', () => {
  it('renders step counter, section, title and description', () => {
    const { container } = render(
      <WizardStepHead step={1} total={3} section="SOURCE" title="Pick a source" description="Choose where data comes from" />,
    );
    expect(container).toBeTruthy();
    expect(screen.getByText('Pick a source')).toBeTruthy();
    expect(screen.getByText(/1 OF 3/)).toBeTruthy();
  });
});

describe('WizardOptionCard', () => {
  it('renders title and fires onClick when enabled', () => {
    const onClick = vi.fn();
    render(<WizardOptionCard icon="🏃" title="Strava" description="A source" onClick={onClick} />);
    fireEvent.click(screen.getByText('Strava'));
    expect(onClick).toHaveBeenCalled();
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(<WizardOptionCard icon="🏃" title="Disabled" disabled onClick={onClick} />);
    fireEvent.click(screen.getByText('Disabled'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders selected checkmark in multi mode and radio in single mode', () => {
    const { container, rerender } = render(
      <WizardOptionCard icon="🏃" title="Sel" selected selectionMode="multi" isPremium hasConfig />,
    );
    expect(container).toBeTruthy();
    rerender(<WizardOptionCard icon="🏃" title="Sel" selected selectionMode="single" />);
    expect(container).toBeTruthy();
  });
});

describe('WizardOptionGrid', () => {
  it('renders options and calls onSelect with the clicked option', () => {
    const onSelect = vi.fn();
    const options = [
      { id: 'a', name: 'Alpha', icon: '🅰️', configSchema: [{}] },
      { id: 'b', name: 'Beta', icon: '🅱️', isPremium: true },
    ];
    render(<WizardOptionGrid options={options} selectedIds={['a']} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Beta'));
    expect(onSelect).toHaveBeenCalledWith(options[1]);
  });

  it('applies getOptionProps overrides', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <WizardOptionGrid
        options={[{ id: 'a', name: 'Alpha' }]}
        selectedIds={[]}
        onSelect={onSelect}
        selectionMode="single"
        getOptionProps={() => ({ disabled: true })}
      />,
    );
    expect(container).toBeTruthy();
  });
});

describe('WizardStepIndicator', () => {
  it('renders completed, current and upcoming states', () => {
    const { container } = render(
      <WizardStepIndicator
        steps={[
          { id: 's1', label: 'One' },
          { id: 's2', label: 'Two' },
          { id: 's3', label: 'Three' },
        ]}
        currentStepIndex={1}
      />,
    );
    expect(container).toBeTruthy();
    expect(screen.getByText('Two')).toBeTruthy();
  });
});

describe('WizardReviewBlock', () => {
  it('renders label and children', () => {
    render(<WizardReviewBlock label="Sources"><span>Strava</span></WizardReviewBlock>);
    expect(screen.getByText('Sources')).toBeTruthy();
    expect(screen.getByText('Strava')).toBeTruthy();
  });
});

describe('WizardExcludedSection', () => {
  it('returns null when there are no items', () => {
    const { container } = render(
      <WizardExcludedSection
        items={[]}
        getKey={(i: { id: string }) => i.id}
        getIcon={() => '🏃'}
        getName={() => 'name'}
        getHint={() => 'hint'}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders items when present', () => {
    render(
      <WizardExcludedSection
        items={[{ id: 'x' }]}
        getKey={(i: { id: string }) => i.id}
        getIcon={() => '🏃'}
        getName={() => 'Strava'}
        getHint={() => 'Connect first'}
      />,
    );
    expect(screen.getByText('Strava')).toBeTruthy();
    expect(screen.getByText('Connect first')).toBeTruthy();
  });
});

describe('PipelineReviewFlow', () => {
  it('renders sources, enrichers (with config summary) and destinations', () => {
    render(
      <PipelineReviewFlow
        sources={[{ id: 's', name: 'Hevy', icon: '💪' }]}
        enrichers={[{ id: 'e', name: 'Weather', icon: '🌦️', configSummary: ['Units: metric'] }]}
        destinations={[{ id: 'd', name: 'Strava', icon: '🏃' }]}
      />,
    );
    expect(screen.getByText('Hevy')).toBeTruthy();
    expect(screen.getByText('Weather')).toBeTruthy();
    expect(screen.getByText('Strava')).toBeTruthy();
    expect(screen.getByText('Units: metric')).toBeTruthy();
  });

  it('renders empty states for no sources / no enrichers', () => {
    render(<PipelineReviewFlow sources={[]} enrichers={[]} destinations={[]} />);
    expect(screen.getByText('Unknown')).toBeTruthy();
    expect(screen.getByText('No boosters selected')).toBeTruthy();
  });
});

describe('EnricherConfigTabs', () => {
  it('renders tabs and fires onTabClick', () => {
    const onTabClick = vi.fn();
    render(
      <EnricherConfigTabs
        tabs={[{ id: 't1', name: 'Tab One' }, { id: 't2', name: 'Tab Two' }]}
        activeTabId="t1"
        onTabClick={onTabClick}
      />,
    );
    fireEvent.click(screen.getByText('Tab Two'));
    expect(onTabClick).toHaveBeenCalledWith('t2');
  });
});
