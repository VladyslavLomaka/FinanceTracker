import React from 'react';
import { act, render, fireEvent, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../../src/screens/HomeScreen';
import { AssetsProvider } from '../../src/context/AssetsContext';

jest.useFakeTimers();

const Stack = createNativeStackNavigator();

const renderHomeScreen = () =>
  render(
    <AssetsProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AssetsProvider>,
  );

describe('HomeScreen — rendering', () => {
  it('renders all assets on initial load', () => {
    renderHomeScreen();
    expect(screen.getAllByText('Apple Inc.')).toHaveLength(2);
    expect(screen.getAllByText('Bitcoin')).toHaveLength(2);
    expect(screen.getByText('Tesla Inc.')).toBeTruthy();
    expect(screen.getByText('Ethereum')).toBeTruthy();
  });
  it('displays asset count badge matching total mock assets (7)', () => {
    renderHomeScreen();
    expect(screen.getByText('7 assets')).toBeTruthy();
  });
});

describe('HomeScreen — performance filter', () => {
  it('shows only gainers (DPC > 0) when Gainers filter is applied', () => {
    renderHomeScreen();
    fireEvent.press(screen.getByText('↑ Gainers'));
    // Gainers: id=1 Apple (3.5), id=3 Tesla (1.2), id=6 Apple (2.3) → 3 items
    expect(screen.getAllByText('Apple Inc.')).toHaveLength(2);
    expect(screen.getByText('Tesla Inc.')).toBeTruthy();
    // Losers should not appear
    expect(screen.queryByText('Bitcoin')).toBeNull();
    expect(screen.queryByText('Ethereum')).toBeNull();
    // Neutral (0.0) should not appear either
    expect(screen.queryByText('Amazon.com Inc.')).toBeNull();
  });

  it('shows count of 3 after applying Gainers filter', () => {
    renderHomeScreen();
    fireEvent.press(screen.getByText('↑ Gainers'));
    expect(screen.getByText('3 assets')).toBeTruthy();
  });

  it('shows only losers (DPC < 0) when Losers filter is applied', () => {
    renderHomeScreen();
    fireEvent.press(screen.getByText('↓ Losers'));
    // Losers: id=2 Bitcoin (-2.1), id=4 Ethereum (-0.5), id=7 Bitcoin (-1.8) → 3 items
    expect(screen.getAllByText('Bitcoin')).toHaveLength(2);
    expect(screen.getByText('Ethereum')).toBeTruthy();
    // Gainers and neutral should not appear
    expect(screen.queryByText('Tesla Inc.')).toBeNull();
    expect(screen.queryByText('Amazon.com Inc.')).toBeNull();
  });

  it('shows count of 3 after applying Losers filter', () => {
    renderHomeScreen();
    fireEvent.press(screen.getByText('↓ Losers'));
    expect(screen.getByText('3 assets')).toBeTruthy();
  });

  it('restores all assets after resetting performance to All', () => {
    renderHomeScreen();
    fireEvent.press(screen.getByText('↑ Gainers'));
    // Press the first "All" pill (performance row)
    fireEvent.press(screen.getAllByText('All')[0]);
    expect(screen.getAllByText('Bitcoin')).toHaveLength(2);
    expect(screen.getByText('Tesla Inc.')).toBeTruthy();
    expect(screen.getByText('7 assets')).toBeTruthy();
  });
});

describe('HomeScreen — type filter', () => {
  it('shows only stocks when Stocks filter is applied', () => {
    renderHomeScreen();
    fireEvent.press(screen.getByText('Stocks'));
    // Stocks: Apple×2, Tesla, Amazon → 4 items
    expect(screen.getAllByText('Apple Inc.')).toHaveLength(2);
    expect(screen.getByText('Tesla Inc.')).toBeTruthy();
    expect(screen.getByText('Amazon.com Inc.')).toBeTruthy();
    // Crypto should be hidden
    expect(screen.queryByText('Bitcoin')).toBeNull();
    expect(screen.queryByText('Ethereum')).toBeNull();
  });

  it('shows count of 4 after applying Stocks filter', () => {
    renderHomeScreen();
    fireEvent.press(screen.getByText('Stocks'));
    expect(screen.getByText('4 assets')).toBeTruthy();
  });

  it('shows only crypto when Crypto filter is applied', () => {
    renderHomeScreen();
    fireEvent.press(screen.getByText('Crypto'));
    expect(screen.getAllByText('Bitcoin')).toHaveLength(2);
    expect(screen.getByText('Ethereum')).toBeTruthy();
    expect(screen.queryByText('Tesla Inc.')).toBeNull();
    expect(screen.queryByText('Apple Inc.')).toBeNull();
  });
});

describe('HomeScreen — combined filters', () => {
  it('gainers + crypto returns 0 results (no crypto gainers in mock data)', () => {
    renderHomeScreen();
    fireEvent.press(screen.getByText('↑ Gainers'));
    fireEvent.press(screen.getByText('Crypto'));

    expect(screen.queryByText('Apple Inc.')).toBeNull();
    expect(screen.queryByText('Bitcoin')).toBeNull();
    expect(screen.getByText('0 assets')).toBeTruthy();
  });

  it('losers + stock returns 0 results (no stock losers in mock data)', () => {
    renderHomeScreen();
    fireEvent.press(screen.getByText('↓ Losers'));
    fireEvent.press(screen.getByText('Stocks'));

    expect(screen.queryByText('Apple Inc.')).toBeNull();
    expect(screen.getByText('0 assets')).toBeTruthy();
  });
});

describe('HomeScreen — sort', () => {
  it('switches sort on button press without crashing', () => {
    renderHomeScreen();
    fireEvent.press(screen.getByText('Perf ↓'));
    fireEvent.press(screen.getByText('Perf ↑'));
    fireEvent.press(screen.getByText('Name ↓'));
    fireEvent.press(screen.getByText('Name ↑'));
    expect(screen.getByText('Tesla Inc.')).toBeTruthy();
  });
});

describe('HomeScreen — price update interval', () => {
  it('does not crash when price update interval fires', () => {
    renderHomeScreen();
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText('Portfolio Tracker')).toBeTruthy();
  });

  it('cleans up interval on unmount (no memory leak)', () => {
    const clearSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = renderHomeScreen();
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
