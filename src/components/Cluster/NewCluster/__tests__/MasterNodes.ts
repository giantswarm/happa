import { fireEvent, screen } from '@testing-library/react';
import MasterNodes from 'Cluster/NewCluster/MasterNodes';
import { getComponentWithTheme, renderWithTheme } from 'test/renderUtils';

describe('MasterNodes', () => {
  it('renders without crashing', () => {
    renderWithTheme(MasterNodes, {});
  });

  it('renders 2 radio inputs with labels that have detailed explanations', () => {
    renderWithTheme(MasterNodes, {});

    const haLabel =
      /Three control plane nodes, each placed in a separate availability zone, selected at random. Preferred for production clusters./i;
    expect(screen.getByLabelText(/high availability/i)).toBeInTheDocument();
    expect(screen.getByText(haLabel)).toBeInTheDocument();

    const singleMasterLabel =
      /One control plane node, placed in an availability zone selected at random./i;
    expect(
      screen.getByLabelText(/single control plane node/i)
    ).toBeInTheDocument();
    expect(screen.getByText(singleMasterLabel)).toBeInTheDocument();
  });

  it('displays the correct radio selected if HA is enabled', () => {
    const { rerender } = renderWithTheme(MasterNodes, {
      isHighAvailability: true,
    });

    let haInput = screen.getByLabelText(/high availability/i);
    expect(haInput).toBeChecked();

    let singleMasterInput = screen.getByLabelText(/single control plane node/i);
    expect(singleMasterInput).not.toBeChecked();

    rerender(getComponentWithTheme(MasterNodes, { isHighAvailability: false }));

    haInput = screen.getByLabelText(/high availability/i);
    expect(haInput).not.toBeChecked();

    singleMasterInput = screen.getByLabelText(/single control plane node/i);
    expect(singleMasterInput).toBeChecked();
  });

  it('calls the value change event callback with the correct value', () => {
    const changeCallbackMock = jest.fn();

    const { rerender } = renderWithTheme(MasterNodes, {
      isHighAvailability: false,
      onChange: changeCallbackMock,
    });

    fireEvent.click(screen.getByLabelText(/high availability/i));
    expect(changeCallbackMock).toBeCalledWith(true);

    rerender(
      getComponentWithTheme(MasterNodes, {
        isHighAvailability: true,
        onChange: changeCallbackMock,
      })
    );

    fireEvent.click(screen.getByLabelText(/single control plane node/i));
    expect(changeCallbackMock).toBeCalledWith(false);
  });
});
