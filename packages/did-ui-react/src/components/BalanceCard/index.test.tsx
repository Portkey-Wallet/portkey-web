/**
 * @vitest-environment happy-dom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
// Import the component to test
import BalanceCard from './index';

describe('BalanceCard component', () => {
  it('renders Buy button when isShowRamp and isMainnet are true', () => {
    render(<BalanceCard isShowRamp={true} isMainnet={true} />);
    waitFor(() => {
      const buyButton = screen.getByText('Buy');
      expect(buyButton).toBeInTheDocument();
    });
  });

  it('does not render Buy button when isShowRamp is false', () => {
    render(<BalanceCard isShowRamp={false} isMainnet={true} />);
    waitFor(() => {
      const buyButton = screen.queryByText('Buy');
      expect(buyButton).not.toBeInTheDocument();
    });
  });

  it('renders Faucet button when isShowFaucet is true and isMainnet is false', () => {
    render(<BalanceCard isShowFaucet={true} isMainnet={false} />);
    waitFor(() => {
      const faucetButton = screen.getByText('Faucet');
      expect(faucetButton).toBeInTheDocument();
    });
  });

  it('calls onBuy when Buy button is clicked', () => {
    const onBuyMock = vi.fn();
    render(<BalanceCard isShowRamp={true} isMainnet={true} onBuy={onBuyMock} />);
    waitFor(() => {
      const buyButton = screen.getByText('Buy');
      fireEvent.click(buyButton);

      expect(onBuyMock).toHaveBeenCalled();
    });
  });

  it('calls onFaucet when Faucet button is clicked', () => {
    const onFaucetMock = vi.fn();
    render(<BalanceCard isShowFaucet={true} isMainnet={false} onFaucet={onFaucetMock} />);
    waitFor(() => {
      const faucetButton = screen.getByText('Faucet');
      fireEvent.click(faucetButton);

      expect(onFaucetMock).toHaveBeenCalled();
    });
  });

  it('calls onSend when Send button is clicked', () => {
    const onSendMock = vi.fn();
    render(<BalanceCard onSend={onSendMock} />);
    waitFor(() => {
      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);

      expect(onSendMock).toHaveBeenCalled();
    });
  });

  it('calls onReceive when Receive button is clicked', () => {
    const onReceiveMock = vi.fn();
    render(<BalanceCard onReceive={onReceiveMock} />);
    waitFor(() => {
      const receiveButton = screen.getByText('Receive');
      fireEvent.click(receiveButton);

      expect(onReceiveMock).toHaveBeenCalled();
    });
  });
});
