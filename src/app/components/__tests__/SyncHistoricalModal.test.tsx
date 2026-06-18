import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../shared/api/client', () => ({
  client: { GET: vi.fn().mockResolvedValue({ data: { activities: [] } }), POST: vi.fn() },
  default: { GET: vi.fn().mockResolvedValue({ data: { activities: [] } }), POST: vi.fn() },
}));

import { SyncHistoricalModal } from '../SyncHistoricalModal';

describe('SyncHistoricalModal', () => {
  it('renders the historical import title', () => {
    render(
      <SyncHistoricalModal
        provider="hevy"
        providerManifest={{ name: 'Hevy', icon: '🏋️' }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Import Historical Activities')).toBeInTheDocument();
  });
});
