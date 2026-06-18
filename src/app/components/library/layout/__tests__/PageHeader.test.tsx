import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PageHeader } from '../PageHeader';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('PageHeader', () => {
  it('renders the title uppercased', () => {
    render(<PageHeader title="Dashboard" />, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { name: 'DASHBOARD' })).toBeInTheDocument();
  });

  it('renders a ReactNode title verbatim', () => {
    render(<PageHeader title={<span>Custom Node</span>} />, { wrapper: Wrapper });
    expect(screen.getByText('Custom Node')).toBeInTheDocument();
  });

  it('renders title accent uppercased', () => {
    render(<PageHeader title="Hello" titleAccent="World" />, { wrapper: Wrapper });
    expect(screen.getByText('WORLD')).toBeInTheDocument();
  });

  it('renders crumbs with links for ancestors', () => {
    render(
      <PageHeader crumbs={['Home', 'Detail']} crumbLinks={['/home']} title="x" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('link', { name: 'HOME' })).toHaveAttribute('href', '/home');
    expect(screen.getByText('DETAIL')).toBeInTheDocument();
  });

  it('renders status pill', () => {
    render(<PageHeader title="x" status={{ label: 'LIVE', tone: 'green' }} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders eyebrow and meta', () => {
    render(<PageHeader title="x" eyebrow="v1.0" meta="last edited" />, {
      wrapper: Wrapper,
    });
    expect(screen.getByText('v1.0')).toBeInTheDocument();
    expect(screen.getByText('last edited')).toBeInTheDocument();
  });

  it('renders actions', () => {
    render(<PageHeader title="x" actions={<button>Act</button>} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument();
  });

  it('derives crumbs from legacy backTo/backLabel props', () => {
    render(
      <PageHeader title="Detail" backTo="/list" backLabel="List" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('link', { name: 'LIST' })).toHaveAttribute('href', '/list');
  });

  it('maps legacy subtitle to meta', () => {
    render(<PageHeader title="x" subtitle="a subtitle" />, { wrapper: Wrapper });
    expect(screen.getByText('a subtitle')).toBeInTheDocument();
  });
});
