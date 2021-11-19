import { fireEvent, screen } from '@testing-library/react';
import { Providers } from 'shared/constants';
import { v5ClustersResponse } from 'test/mockHttpCalls';
import { getComponentWithStore, renderWithStore } from 'test/renderUtils';

import View from '../View';

describe('View', () => {
  it('renders without crashing', () => {
    renderWithStore(View);
  });

  it('can delete an organization', () => {
    const organization: IOrganization = {
      id: 'some-id',
    };

    renderWithStore(View, {
      organization,
      clusters: [],
      provider: Providers.AWS,
      credentials: [],
      loadingCredentials: false,
      showCredentialsForm: false,
      membersForTable: [],
      supportsMultiAccount: true,
    });

    expect(
      screen.getByText(
        'All information related to this organization will be deleted. There is no way to undo this action.'
      )
    ).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', {
      name: 'Delete organization',
    });
    fireEvent.click(deleteButton);
  });

  it('cannot delete an organization that has clusters', () => {
    const organization: IOrganization = {
      id: 'some-id',
    };

    renderWithStore(View, {
      organization,
      clusters: v5ClustersResponse,
      credentials: [],
      loadingCredentials: false,
      showCredentialsForm: false,
      membersForTable: [],
      supportsMultiAccount: true,
    });

    expect(
      screen.getByText(
        'This organization cannot be deleted because it contains clusters. Please delete all clusters in order to be able to delete the organization.'
      )
    ).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', {
      name: 'Delete organization',
    });
    expect(deleteButton).toBeDisabled();
  });

  it('cannot delete an organization that has credentials', () => {
    const organization: IOrganization = {
      id: 'some-id',
    };

    const { rerender } = renderWithStore(View, {
      organization,
      clusters: [],
      provider: Providers.AWS,
      credentials: [],
      loadingCredentials: true,
      showCredentialsForm: false,
      membersForTable: [],
      supportsMultiAccount: true,
    });

    expect(
      screen.getByText(
        'All information related to this organization will be deleted. There is no way to undo this action.'
      )
    ).toBeInTheDocument();

    let deleteButton = screen.getByRole('button', {
      name: 'Delete organization',
    });
    expect(deleteButton).toBeDisabled();

    const credentials: ICredential[] = [
      {
        id: '123',
        provider: 'aws',
      },
    ];
    rerender(
      getComponentWithStore(View, {
        organization,
        clusters: [],
        provider: Providers.AWS,
        credentials,
        loadingCredentials: false,
        showCredentialsForm: false,
        membersForTable: [],
        supportsMultiAccount: true,
      })
    );

    expect(
      screen.getByText(
        'This organization cannot be deleted because it has provider credentials. Please remove them in order to be able to delete the organization.'
      )
    ).toBeInTheDocument();

    deleteButton = screen.getByRole('button', {
      name: 'Delete organization',
    });
    expect(deleteButton).toBeDisabled();
  });
});
