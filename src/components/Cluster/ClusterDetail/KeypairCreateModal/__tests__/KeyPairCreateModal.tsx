import { fireEvent, render, RenderResult } from '@testing-library/react';
import KeyPairCreateModal from 'Cluster/ClusterDetail/KeypairCreateModal/KeyPairCreateModal';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Providers, StatusCodes } from 'shared/constants';
import {
  USER_EMAIL,
  v4AWSClusterResponse,
  v4AzureClusterResponse,
} from 'test/mockHttpCalls';
import { getComponentWithTheme } from 'test/renderUtils';

const mockUser = {
  email: USER_EMAIL,
};

const mockActions = {
  clusterLoadKeyPairs: jest.fn(),
  clusterCreateKeyPair: jest.fn(),
};

const getComponent = (
  props: Partial<React.ComponentProps<typeof KeyPairCreateModal>> = {}
): React.ReactElement => {
  const boundProps = Object.assign(
    {},
    {
      user: mockUser,
      actions: mockActions,
      cluster: v4AWSClusterResponse,
      provider: Providers.AWS,
      animate: false,
    },
    props
  );

  return getComponentWithTheme(KeyPairCreateModal, boundProps);
};

const renderComponent = (
  props?: Partial<React.ComponentProps<typeof KeyPairCreateModal>>
): RenderResult => {
  return render(getComponent(props));
};

describe('KeyPairCreateModal', () => {
  it('renders without crashing', () => {
    renderComponent();
  });

  it(`opens modal by clicking on the 'create keypair' button`, () => {
    const { getByText } = renderComponent();

    const openButton = getByText(/create key pair and kubeconfig/i);
    fireEvent.click(openButton);

    expect(
      getByText(
        /a key pair grants you access to the kubernetes api of this cluster/i
      )
    ).toBeInTheDocument();
  });

  it(`validates the 'common name prefix' input`, async () => {
    const { getByText, getByLabelText, findByText } = renderComponent();

    const openButton = getByText(/create key pair and kubeconfig/i);
    fireEvent.click(openButton);

    const cnNamePrefixInput = getByLabelText(/common name prefix/i);

    fireEvent.change(cnNamePrefixInput, {
      target: {
        value: '@asd213@@1asd',
      },
    });
    let validationText = await findByText(/the CN prefix must contain only/i);
    expect(validationText).toBeInTheDocument();

    fireEvent.change(cnNamePrefixInput, {
      target: {
        value: '',
      },
    });
    expect(validationText).not.toBeInTheDocument();

    fireEvent.change(cnNamePrefixInput, {
      target: {
        value: 'adasdassd@@',
      },
    });
    validationText = await findByText(/the CN prefix must end with/i);
    expect(validationText).toBeInTheDocument();

    fireEvent.change(cnNamePrefixInput, {
      target: {
        value: '123goodValue',
      },
    });
    expect(validationText).not.toBeInTheDocument();
  });

  it('displays a warning if the expiration TTL is too far away', async () => {
    const { getByText, findByText } = renderComponent();

    const openButton = getByText(/create key pair and kubeconfig/i);
    fireEvent.click(openButton);

    const monthsLabel = getByText(/months/i);
    const monthsInput = (monthsLabel.parentNode as HTMLElement).querySelector(
      '[name=months]'
    ) as HTMLElement;
    fireEvent.change(monthsInput, {
      target: {
        value: 2,
      },
    });

    expect(
      await findByText(/the desired expiry date is pretty far away./i)
    ).toBeInTheDocument();
  });

  it('only displays the kubernetes api endpoint section for aws installations', () => {
    const { getByText, queryByText, rerender } = renderComponent();

    const openButton = getByText(/create key pair and kubeconfig/i);
    fireEvent.click(openButton);

    expect(
      getByText(/use alternative internal api endpoint/i)
    ).toBeInTheDocument();

    rerender(
      getComponent({
        provider: Providers.AZURE,
        cluster: v4AzureClusterResponse as never,
      })
    );

    expect(
      queryByText(/use alternative internal api endpoint/i)
    ).not.toBeInTheDocument();
  });

  it('displays an error if the creation fails', async () => {
    const { getByText, findByText } = renderComponent();

    mockActions.clusterCreateKeyPair.mockRejectedValueOnce(
      new Error('some random error')
    );

    const openButton = getByText(/create key pair and kubeconfig/i);
    fireEvent.click(openButton);

    let createButton: HTMLElement | null = null;
    await act(async () => {
      createButton = getByText(/^create key pair$/i);
      fireEvent.click(createButton);
      expect(
        await findByText(
          /perhaps our servers are down, please try again later or contact support/i
        )
      ).toBeInTheDocument();
    });

    expect(createButton).toHaveTextContent(/retry/i);
  });

  it('displays a specific error if the creation fails with a 503 error', async () => {
    const { getByText, findByText } = renderComponent();

    mockActions.clusterCreateKeyPair.mockRejectedValueOnce({
      status: StatusCodes.ServiceUnavailable,
    });

    const openButton = getByText(/create key pair and kubeconfig/i);
    fireEvent.click(openButton);

    let errorMessage: HTMLElement | null = null;
    await act(async () => {
      fireEvent.click(getByText(/^create key pair$/i));
      errorMessage = await findByText(
        /backend is not yet available. Please try again in a moment./i
      );
    });
    expect(errorMessage).toBeInTheDocument();

    const pkiLabel = getByText(/pki/i);
    fireEvent.mouseOver(pkiLabel);
    expect(getByText(/Public Key Infrastructure/i)).toBeInTheDocument();
  });

  it('displays a success pane if the keypair creation worked, and reloads keypairs', async () => {
    jest.useFakeTimers();

    window.URL.createObjectURL = jest.fn();
    mockActions.clusterCreateKeyPair.mockResolvedValueOnce({});

    const { getByText, getByLabelText, findByText } = renderComponent();

    const openButton = getByText(/create key pair and kubeconfig/i);
    fireEvent.click(openButton);

    const organizationInput = getByLabelText(/organization/i);
    fireEvent.change(organizationInput, {
      target: { value: 'admin' },
    });

    const descriptionInput = getByLabelText(/description/i);
    fireEvent.change(descriptionInput, {
      target: { value: 'some description' },
    });

    const useAlternativeEndpoint = getByLabelText('Kubernetes API Endpoint');
    fireEvent.click(useAlternativeEndpoint);

    const createButton = getByText(/^create key pair$/i);
    fireEvent.click(createButton);

    expect(
      await findByText(
        /copy the text below and save it to a text file named kubeconfig on your/i
      )
    ).toBeInTheDocument();

    expect(mockActions.clusterCreateKeyPair).toHaveBeenCalled();
    expect(mockActions.clusterLoadKeyPairs).toHaveBeenCalled();
  });
});
