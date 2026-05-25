import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { StatCard } from '../src/components/ui/StatCard';

describe('StatCard', () => {
  it('renders value and title', () => {
    render(<StatCard title="Total Orders" value="1,284" />);
    expect(screen.getByText('1,284')).toBeTruthy();
    expect(screen.getByText('Total Orders')).toBeTruthy();
  });

  it('renders loading skeletons when loading=true', () => {
    const { queryByText } = render(<StatCard title="Revenue" value="$100" loading />);
    // Value should not be rendered while loading
    expect(queryByText('$100')).toBeNull();
  });

  it('renders positive change indicator', () => {
    render(
      <StatCard
        title="Revenue"
        value="$5,000"
        change={{ value: '12% this week', positive: true }}
      />,
    );
    expect(screen.getByText(/12% this week/)).toBeTruthy();
  });
});
