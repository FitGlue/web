import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'jotai';

import { PipelineRunDetailModal } from '../PipelineRunDetailModal';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}

describe('PipelineRunDetailModal', () => {
  it('renders nothing when no run is selected', () => {
    const { container } = render(<PipelineRunDetailModal />, { wrapper: Wrapper });
    expect(container).toBeEmptyDOMElement();
  });
});
