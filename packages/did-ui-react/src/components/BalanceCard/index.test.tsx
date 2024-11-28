/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, jest } from '@jest/globals';
// Import the component to test
import BalanceCard from './index';

describe('BalanceCard component', () => {
  it('renders Buy button when isShowRamp and isMainnet are true', () => {
    render(<BalanceCard isShowRamp={true} isMainnet={true} />);

    const buyButton = screen.getByText('Buy');
    expect(buyButton).toBeInTheDocument();
  });

  it('does not render Buy button when isShowRamp is false', () => {
    render(<BalanceCard isShowRamp={false} isMainnet={true} />);

    const buyButton = screen.queryByText('Buy');
    expect(buyButton).not.toBeInTheDocument();
  });

  it('renders Faucet button when isShowFaucet is true and isMainnet is false', () => {
    render(<BalanceCard isShowFaucet={true} isMainnet={false} />);

    const faucetButton = screen.getByText('Faucet');
    expect(faucetButton).toBeInTheDocument();
  });

  it('calls onBuy when Buy button is clicked', () => {
    const onBuyMock = jest.fn();
    render(<BalanceCard isShowRamp={true} isMainnet={true} onBuy={onBuyMock} />);

    const buyButton = screen.getByText('Buy');
    fireEvent.click(buyButton);

    expect(onBuyMock).toHaveBeenCalled();
  });

  it('calls onFaucet when Faucet button is clicked', () => {
    const onFaucetMock = jest.fn();
    render(<BalanceCard isShowFaucet={true} isMainnet={false} onFaucet={onFaucetMock} />);

    const faucetButton = screen.getByText('Faucet');
    fireEvent.click(faucetButton);

    expect(onFaucetMock).toHaveBeenCalled();
  });

  it('calls onSend when Send button is clicked', () => {
    const onSendMock = jest.fn();
    render(<BalanceCard onSend={onSendMock} />);

    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);

    expect(onSendMock).toHaveBeenCalled();
  });

  it('calls onReceive when Receive button is clicked', () => {
    const onReceiveMock = jest.fn();
    render(<BalanceCard onReceive={onReceiveMock} />);

    const receiveButton = screen.getByText('Receive');
    fireEvent.click(receiveButton);

    expect(onReceiveMock).toHaveBeenCalled();
  });
});
