import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';
import type { components } from '../../../shared/api/schema-public';

type ShowcaseTheme = components['schemas']['ShowcaseTheme'];

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.getElementById('theme-overrides')?.remove();
  });

  it('renders nothing and is a no-op when theme is undefined', () => {
    const { container } = render(<ThemeProvider theme={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('applies theme attributes to the showcase page and injects overrides', () => {
    const page = document.createElement('div');
    page.className = 'showcase-page';
    document.body.appendChild(page);

    const theme = {
      themeId: 'sunset',
      cardStyle: 'solid',
      customAccentColor: '#ff0000',
      animationId: 'none',
    } as ShowcaseTheme;

    render(<ThemeProvider theme={theme} />);

    expect(page.getAttribute('data-theme')).toBe('sunset');
    expect(page.getAttribute('data-card-style')).toBe('solid');
    expect(document.getElementById('theme-overrides')).toBeTruthy();
  });
});
