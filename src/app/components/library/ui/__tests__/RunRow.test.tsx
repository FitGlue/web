import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RunRow } from '../RunRow';
import { PipelineRun, PipelineRunStatus } from '../../../../../types/pb/user';
import { ActivityType } from '../../../../../types/pb/standardized_activity';

function makeRun(overrides: Partial<PipelineRun> = {}): PipelineRun {
  return {
    id: 'run1',
    pipelineId: 'pipe1',
    activityId: 'act1',
    source: 'strava',
    sourceActivityId: 'src1',
    title: 'Morning Run',
    description: '',
    type: ActivityType.ACTIVITY_TYPE_RUN,
    status: PipelineRunStatus.PIPELINE_RUN_STATUS_SYNCED,
    boosters: [],
    destinations: [],
    originalPayloadUri: '',
    enrichedEventUri: '',
    steps: [],
    nonBlockingPendingInputIds: [],
    ...overrides,
  };
}

describe('RunRow', () => {
  it('renders the title (feed variant)', () => {
    render(<RunRow run={makeRun()} />);
    expect(screen.getByText('Morning Run')).toBeInTheDocument();
  });

  it('renders the synced status label', () => {
    render(<RunRow run={makeRun()} />);
    expect(screen.getByText('SYNCED')).toBeInTheDocument();
  });

  it('renders failed status label', () => {
    render(
      <RunRow run={makeRun({ status: PipelineRunStatus.PIPELINE_RUN_STATUS_FAILED })} />
    );
    expect(screen.getByText('FAILED')).toBeInTheDocument();
  });

  it('renders dashboard variant with pipeline name', () => {
    render(<RunRow run={makeRun()} variant="dashboard" pipelineName="My Pipe" />);
    expect(screen.getByText('VIA My Pipe')).toBeInTheDocument();
  });

  it('fires onClick', async () => {
    const handler = vi.fn();
    render(<RunRow run={makeRun()} onClick={handler} />);
    await userEvent.click(screen.getByText('Morning Run'));
    expect(handler).toHaveBeenCalled();
  });
});
