import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { Providers } from 'shared/constants';
import { StatusCodes } from 'shared/constants';
import {
  API_ENDPOINT,
  v4AWSClusterResponse,
  v4AzureClusterResponse,
  v4KVMClusterResponse,
} from 'testUtils/mockHttpCalls';
import { getComponentWithStore } from 'testUtils/renderUtils';

import ScaleClusterModal from '../ScaleClusterModal';

const getComponentWithProps = (props = {}) => {
  const initialState = {};
  const defaultProps = Object.assign(
    {},
    {
      cluster: v4AWSClusterResponse,
      provider: Providers.AWS,
    },
    props
  );

  const element = getComponentWithStore(
    ScaleClusterModal,
    defaultProps,
    initialState
  );

  return element;
};

const renderWithProps = (props = {}) => {
  const elementRef = React.createRef();

  const defaultProps = Object.assign(
    {},
    {
      ref: elementRef,
    },
    props
  );

  const element = render(getComponentWithProps(defaultProps));

  // Make modal visible
  elementRef.current.show();

  return element;
};

describe('ScaleClusterModal', () => {
  it('renders without crashing', () => {
    renderWithProps();
  });

  it('has the cluster id in the title', () => {
    const { getByText } = renderWithProps();

    const titleTextElement = getByText(/edit scaling settings for/i);
    const idElement = titleTextElement.children[0];

    expect(idElement).toHaveTextContent(v4AWSClusterResponse.id);
  });

  it('has a cancel button in the footer, that closes the modal', async () => {
    const { getByText, queryByText } = renderWithProps();

    const cancelButton = getByText('Cancel');

    fireEvent.click(cancelButton);

    await waitFor(() => {
      const modal = queryByText(/edit scaling settings for/i);

      expect(modal).not.toBeInTheDocument();
    });
  });

  it('renders different descriptions if autoscaling is supported or not', () => {
    /**
     * Autoscaling on
     * @provider AWS
     */
    const { getByText, rerender } = renderWithProps({
      provider: Providers.AWS,
      cluster: v4AWSClusterResponse,
    });

    let description = getByText(
      /set the scaling range and let the autoscaler set the effective number of worker nodes based on the usage./i
    );

    expect(description).toBeInTheDocument();

    /**
     * Autoscaling off
     * @provider Azure
     */
    rerender(
      getComponentWithProps({
        provider: Providers.AZURE,
        cluster: v4AzureClusterResponse,
      })
    );

    description = getByText(
      /how many workers would you like your cluster to have?/i
    );

    expect(description).toBeInTheDocument();

    /**
     * Autoscaling off
     * @provider KVM
     */
    rerender(
      getComponentWithProps({
        provider: Providers.KVM,
        cluster: v4KVMClusterResponse,
      })
    );

    description = getByText(
      /how many workers would you like your cluster to have?/i
    );

    expect(description).toBeInTheDocument();
  });

  it('renders a single node counter or multiple, based on the current autoscaling state', () => {
    /**
     * Autoscaling on, shows 2 node counters
     * @provider AWS
     */
    const { getByLabelText, rerender, getByDisplayValue } = renderWithProps({
      provider: Providers.AWS,
      cluster: v4AWSClusterResponse,
    });

    const minInput = getByLabelText(/minimum/i);
    const maxInput = getByLabelText(/maximum/i);

    expect(minInput).toBeInTheDocument();
    expect(maxInput).toBeInTheDocument();

    /**
     * Autoscaling off, shows 1 node counter
     * @provider Azure
     */
    rerender(
      getComponentWithProps({
        provider: Providers.AZURE,
        cluster: v4AzureClusterResponse,
      })
    );

    let valueInput = getByDisplayValue(
      new RegExp(v4AzureClusterResponse.scaling.min)
    );

    expect(valueInput).toBeInTheDocument();

    /**
     * Autoscaling off, shows 1 node counter
     * @provider KVM
     */
    rerender(
      getComponentWithProps({
        provider: Providers.AZURE,
        cluster: v4AzureClusterResponse,
      })
    );

    valueInput = getByDisplayValue(
      new RegExp(v4KVMClusterResponse.scaling.min)
    );

    expect(valueInput).toBeInTheDocument();
  });

  it('shows a warning if scaling down means killing existing nodes', async () => {
    /**
     * Autoscaling on
     * @provider AWS
     */
    const {
      getByLabelText,
      rerender,
      getByDisplayValue,
      findByText,
    } = renderWithProps({
      provider: Providers.AWS,
      cluster: v4AWSClusterResponse,
      workerNodesRunning: 5,
    });

    const maxInput = getByLabelText(/maximum/i);

    fireEvent.change(maxInput, {
      target: {
        value: '4',
      },
    });

    let warningElement = await findByText(
      /the cluster currently has 5 worker nodes running. By setting the maximum lower than that, you enforce the removal of one node. This could result in unscheduled workloads/i
    );

    expect(warningElement).toBeInTheDocument();

    fireEvent.change(maxInput, {
      target: {
        value: v4AzureClusterResponse.scaling.min,
      },
    });

    /**
     * Autoscaling off
     * @provider Azure
     */
    rerender(
      getComponentWithProps({
        provider: Providers.AZURE,
        cluster: v4AzureClusterResponse,
        workerNodesRunning: 5,
      })
    );

    let valueInput = getByDisplayValue(
      new RegExp(v4AzureClusterResponse.scaling.max)
    );

    fireEvent.change(valueInput, {
      target: {
        value: '4',
      },
    });

    warningElement = await findByText(
      /you are about to enforce the removal of one node. Please make sure the cluster has enough capacity to schedule all workloads./i
    );

    expect(warningElement).toBeInTheDocument();

    fireEvent.change(valueInput, {
      target: {
        value: v4KVMClusterResponse.scaling.min,
      },
    });

    /**
     * Autoscaling off
     * @provider KVM
     */
    rerender(
      getComponentWithProps({
        provider: Providers.KVM,
        cluster: v4KVMClusterResponse,
        workerNodesRunning: 5,
      })
    );

    valueInput = getByDisplayValue(
      new RegExp(v4KVMClusterResponse.scaling.max)
    );

    fireEvent.change(valueInput, {
      target: {
        value: '4',
      },
    });

    warningElement = await findByText(
      /you are about to enforce the removal of one node. Please make sure the cluster has enough capacity to schedule all workloads./i
    );

    expect(warningElement).toBeInTheDocument();
  });

  it('shows a warning if you pick less than 3 worker nodes', async () => {
    /**
     * Autoscaling on
     * @provider AWS
     */
    const {
      getByLabelText,
      rerender,
      getByDisplayValue,
      findByText,
    } = renderWithProps({
      provider: Providers.AWS,
      cluster: v4AWSClusterResponse,
    });

    const minInput = getByLabelText(/minimum/i);

    fireEvent.change(minInput, {
      target: {
        value: '2',
      },
    });

    let warningElement = await findByText(
      /we recommend that you run clusters with at least three worker nodes./i
    );

    expect(warningElement).toBeInTheDocument();

    fireEvent.change(minInput, {
      target: {
        value: v4AzureClusterResponse.scaling.min,
      },
    });

    /**
     * Autoscaling off
     * @provider Azure
     */
    rerender(
      getComponentWithProps({
        provider: Providers.AZURE,
        cluster: v4AzureClusterResponse,
      })
    );

    let valueInput = getByDisplayValue(
      new RegExp(v4AzureClusterResponse.scaling.min)
    );

    fireEvent.change(valueInput, {
      target: {
        value: '2',
      },
    });

    warningElement = await findByText(
      /we recommend that you run clusters with at least three worker nodes./i
    );

    expect(warningElement).toBeInTheDocument();

    fireEvent.change(valueInput, {
      target: {
        value: v4KVMClusterResponse.scaling.min,
      },
    });

    /**
     * Autoscaling off
     * @provider KVM
     */
    rerender(
      getComponentWithProps({
        provider: Providers.KVM,
        cluster: v4KVMClusterResponse,
      })
    );

    valueInput = getByDisplayValue(
      new RegExp(v4KVMClusterResponse.scaling.min)
    );

    fireEvent.change(valueInput, {
      target: {
        value: '2',
      },
    });

    warningElement = await findByText(
      /we recommend that you run clusters with at least three worker nodes./i
    );

    expect(warningElement).toBeInTheDocument();
  });

  it('changes button state and text based on number of nodes and validation', async () => {
    /**
     * Autoscaling on
     * @provider AWS
     */
    let component = renderWithProps({
      workerNodesDesired: 3,
      provider: Providers.AWS,
      cluster: v4AWSClusterResponse,
    });

    const minInput = screen.getByLabelText(/minimum/i);
    const maxInput = screen.getByLabelText(/maximum/i);

    fireEvent.change(maxInput, {
      target: {
        value: '6',
      },
    });

    // Everything is valid
    let saveButton = await screen.findByText(/apply/i);
    expect(saveButton.disabled).toBeFalsy();

    fireEvent.change(minInput, {
      target: {
        value: '4',
      },
    });

    saveButton = await screen.findByText(
      /increase minimum number of nodes by 1/i
    );
    expect(saveButton.disabled).toBeFalsy();

    fireEvent.change(minInput, {
      target: {
        value: '1',
      },
    });

    fireEvent.change(maxInput, {
      target: {
        value: '2',
      },
    });

    saveButton = await screen.findByText(/remove 1 worker node/i);
    expect(saveButton.disabled).toBeFalsy();

    fireEvent.change(minInput, {
      target: {
        value: v4AWSClusterResponse.scaling.min,
      },
    });

    fireEvent.change(maxInput, {
      target: {
        value: v4AWSClusterResponse.scaling.min,
      },
    });

    component.unmount();

    /**
     * Autoscaling off
     * @provider Azure
     */
    component = renderWithProps({
      provider: Providers.AZURE,
      cluster: v4AzureClusterResponse,
      workerNodesDesired: 3,
    });

    let valueInput = screen.getByDisplayValue(
      new RegExp(v4AzureClusterResponse.scaling.min)
    );

    fireEvent.change(valueInput, {
      target: {
        value: '4',
      },
    });

    saveButton = await screen.findByText(/add 1 worker node/i);
    expect(saveButton.disabled).toBeFalsy();

    fireEvent.change(valueInput, {
      target: {
        value: '2',
      },
    });

    saveButton = await screen.findByText(/remove 1 worker node/i);
    expect(saveButton.disabled).toBeFalsy();

    fireEvent.change(valueInput, {
      target: {
        value: v4KVMClusterResponse.scaling.min,
      },
    });

    component.unmount();

    /**
     * Autoscaling off
     * @provider KVM
     */
    component = renderWithProps({
      provider: Providers.KVM,
      cluster: v4KVMClusterResponse,
      workerNodesDesired: 3,
    });

    valueInput = screen.getByDisplayValue(
      new RegExp(v4KVMClusterResponse.scaling.min)
    );

    fireEvent.change(valueInput, {
      target: {
        value: '4',
      },
    });

    saveButton = await screen.findByText(/add 1 worker node/i);
    expect(saveButton.disabled).toBeFalsy();

    fireEvent.change(valueInput, {
      target: {
        value: '2',
      },
    });

    saveButton = await screen.findByText(/remove 1 worker node/i);
    expect(saveButton.disabled).toBeFalsy();
  });

  it('sends the correct server request, and closes after the response', async () => {
    const defaultScaling = v4AWSClusterResponse.scaling;
    const increaseByCount = 1;

    const newScaling = {
      min: defaultScaling.min + increaseByCount,
      max: defaultScaling.max + increaseByCount,
    };

    const scaleResponse = {
      ...v4AWSClusterResponse,
      scaling: newScaling,
    };

    // Cluster scale request
    nock(API_ENDPOINT)
      .intercept(`/v4/clusters/${v4AWSClusterResponse.id}/`, 'PATCH')
      .reply(StatusCodes.Ok, scaleResponse);

    const { getByLabelText, findByText, queryByText } = renderWithProps({
      workerNodesDesired: 4,
      workerNodesRunning: 3,
    });

    const maxInput = getByLabelText(/maximum/i);

    fireEvent.change(maxInput, {
      target: {
        value: '6',
      },
    });

    const saveButton = await findByText(/apply/i);
    fireEvent.click(saveButton);

    await findByText(
      /the cluster will be scaled within the next couple of minutes./i
    );

    await waitFor(() => {
      const modal = queryByText(/edit scaling settings for/i);

      expect(modal).not.toBeInTheDocument();
    });
  });

  it('shows an error message if the request fails', async () => {
    const defaultScaling = v4AWSClusterResponse.scaling;
    const increaseByCount = 1;

    const newScaling = {
      min: defaultScaling.min + increaseByCount,
      max: defaultScaling.max + increaseByCount,
    };

    const scaleResponse = {
      ...v4AWSClusterResponse,
      scaling: newScaling,
    };

    // Cluster scale request
    nock(API_ENDPOINT)
      .intercept(`/v4/clusters/${v4AWSClusterResponse.id}/`, 'PATCH')
      .reply(StatusCodes.InternalServerError, scaleResponse);

    const { getByLabelText, findByText, findAllByText } = renderWithProps({
      workerNodesDesired: 4,
      workerNodesRunning: 3,
    });

    const maxInput = getByLabelText(/maximum/i);

    fireEvent.change(maxInput, {
      target: {
        value: '6',
      },
    });

    const saveButton = await findByText(/apply/i);
    fireEvent.click(saveButton);

    await findByText(
      /something went wrong while trying to scale your cluster:/i
    );

    await findAllByText(/internal server error/i);
  });
});
