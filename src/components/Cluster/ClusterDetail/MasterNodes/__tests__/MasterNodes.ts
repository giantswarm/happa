import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import MasterNodes from 'Cluster/ClusterDetail/MasterNodes/MasterNodes';
import { renderWithTheme } from 'testUtils/renderUtils';

describe('MasterNodes', () => {
  it('renders without crashing', () => {
    renderWithTheme(MasterNodes, {});
  });

  it('renders the correct information for a non-HA master node', () => {
    renderWithTheme(MasterNodes, {
      isHA: false,
      availabilityZones: ['b'],
      numOfReadyNodes: 1,
      numOfMaxHANodes: 1,
    });

    expect(screen.getByText(/ready/i)).toBeInTheDocument();
    expect(screen.getByText(/availability zone/i)).toBeInTheDocument();
    expect(screen.getByText(/^b$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/switch to high availability.../i)
    ).toBeInTheDocument();
  });

  it('renders the correct information for a HA master node', () => {
    renderWithTheme(MasterNodes, {
      isHA: true,
      availabilityZones: ['b', 'c', 'd'],
      numOfReadyNodes: 3,
      numOfMaxHANodes: 3,
    });

    expect(screen.getByText(/all 3 master nodes ready/i)).toBeInTheDocument();
    expect(screen.getByText(/availability zones/i)).toBeInTheDocument();
    expect(screen.getByText(/^b$/i)).toBeInTheDocument();
    expect(screen.getByText(/^c$/i)).toBeInTheDocument();
    expect(screen.getByText(/^d$/i)).toBeInTheDocument();
  });

  it('displays availability zones as n/a if they are null in the input', () => {
    renderWithTheme(MasterNodes, {
      isHA: true,
      availabilityZones: null,
      numOfReadyNodes: 3,
      numOfMaxHANodes: 3,
    });

    expect(screen.getByText(/all 3 master nodes ready/i)).toBeInTheDocument();
    expect(screen.getByText(/availability zone/i)).toBeInTheDocument();
    expect(screen.getByText(/^n\/a$/i)).toBeInTheDocument();
  });

  it('can convert non-ha masters to ha', async () => {
    const handleConvertToHAMock = jest.fn();
    handleConvertToHAMock.mockResolvedValueOnce(true);

    renderWithTheme(MasterNodes, {
      isHA: false,
      availabilityZones: ['b'],
      numOfReadyNodes: 1,
      numOfMaxHANodes: 1,
      onConvert: handleConvertToHAMock,
    });

    const switchButton = screen.getByText(/switch to high availability.../i);
    fireEvent.click(switchButton);

    const converterLabel = await screen.findByText(
      /Do you want to convert this cluster to use three instead of one master nodes\?/i
    );
    expect(converterLabel).toBeInTheDocument();

    fireEvent.click(screen.getByText(/^switch to high availability$/i));
    await waitForElementToBeRemoved(() =>
      screen.getByText(/^switch to high availability$/i)
    );

    expect(handleConvertToHAMock).toBeCalled();
  });

  it('can cancel converting to HA', async () => {
    const handleConvertToHAMock = jest.fn();
    handleConvertToHAMock.mockResolvedValueOnce(true);

    renderWithTheme(MasterNodes, {
      isHA: false,
      availabilityZones: ['b'],
      numOfReadyNodes: 1,
      numOfMaxHANodes: 1,
      onConvert: handleConvertToHAMock,
    });

    const switchButton = screen.getByText(/switch to high availability.../i);
    fireEvent.click(switchButton);

    expect(
      await screen.findByText(
        /Do you want to convert this cluster to use three instead of one master nodes\?/i
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(/cancel/i));
    await waitForElementToBeRemoved(() => screen.getByText(/cancel/i));

    expect(handleConvertToHAMock).not.toBeCalled();
  });
});
