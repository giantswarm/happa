import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { IPermissionsUseCase } from 'MAPI/permissions/types';
import { usePermissions } from 'MAPI/permissions/usePermissions';
import { mapOAuth2UserToUser } from 'model/stores/main/utils';
import { IOrganizationState } from 'model/stores/organization/types';
import { IState } from 'model/stores/state';
import React from 'react';
import { SWRConfig } from 'swr';
import preloginState from 'test/preloginState';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import PermissionsOverviewOrganizations from '../PermissionsOverviewOrganizations';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof PermissionsOverviewOrganizations>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <PermissionsOverviewOrganizations {...p} />
    </SWRConfig>
  );

  return getComponentWithStore(
    Component,
    props,
    {
      ...preloginState,
      main: {
        ...preloginState.main,
        loggedInUser: mapOAuth2UserToUser(auth.loggedInUser!),
      },
      entities: {
        organizations: {
          ...preloginState.entities.organizations,
          items: {
            org1: {
              id: 'org1',
              name: 'org1',
              namespace: 'org-org1',
            },
            org2: {
              id: 'org2',
              name: 'org2',
              namespace: 'org-org2',
            },
          },
        } as IOrganizationState,
      } as IState['entities'],
    },
    undefined,
    history,
    auth
  );
}

function createMockUseCases(): IPermissionsUseCase[] {
  return [
    {
      name: 'Inspect app catalogs',
      category: 'app catalogs',
      description:
        'Read catalogs and their entries in an organization namespace',
      scope: { namespaces: ['*'] },
      permissions: [
        {
          apiGroups: ['application.giantswarm.io'],
          resources: ['catalogs', 'appcatalogentries'],
          verbs: ['get', 'list'],
        },
      ],
    },
    {
      name: 'Inspect apps',
      category: 'apps',
      description:
        'Read resources that define installed apps and their configuration',
      scope: { namespaces: ['*'] },
      permissions: [
        {
          apiGroups: ['application.giantswarm.io'],
          resources: ['apps'],
          verbs: ['get', 'list'],
        },
        {
          apiGroups: [''],
          resources: ['configmaps', 'secrets'],
          verbs: ['get', 'list'],
        },
      ],
    },
    {
      name: 'Manage apps',
      category: 'apps',
      description:
        'Install and uninstall apps to/from workload clusters and create/modify/delete their configuration',
      scope: { namespaces: ['*'] },
      permissions: [
        {
          apiGroups: ['application.giantswarm.io'],
          resources: ['apps'],
          verbs: ['create', 'delete', 'get', 'list', 'patch', 'update'],
        },
        {
          apiGroups: [''],
          resources: ['configmaps', 'secrets'],
          verbs: ['create', 'delete', 'get', 'list', 'patch', 'update'],
        },
      ],
    },
  ];
}

jest.mock('MAPI/permissions/usePermissions');

describe('PermissionsOverviewOrganizations', () => {
  it('renders without crashing', () => {
    (usePermissions as jest.Mock).mockReturnValue({
      default: {
        '*:*:*': ['*'],
      },
    });
    render(getComponent({ useCases: createMockUseCases() }));
  });

  it('displays permissions for categories', async () => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: {
        default: {
          '*:*:*': ['*'],
        },
        'org-org1': {
          '*:*:*': ['*'],
        },
        'org-org2': {
          'application.giantswarm.io:apps:*': ['get', 'list'],
          ':configmaps:*': ['get', 'list'],
          ':secrets:*': ['get', 'list'],
        },
      },
    });

    render(getComponent({ useCases: createMockUseCases() }));

    expect(await screen.findByText('app catalogs')).toBeInTheDocument();
    expect(screen.queryByText('Inspect app catalogs')).not.toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'app catalogs for org1 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'app catalogs for org2 organization permission status'
        )
      ).getByText('No')
    ).toBeInTheDocument();

    expect(await screen.findByText('apps')).toBeInTheDocument();
    expect(screen.queryByText('Inspect apps')).not.toBeInTheDocument();
    expect(screen.queryByText('Manage apps')).not.toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('apps for org1 organization permission status')
      ).getByText('Yes')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('apps for org2 organization permission status')
      ).getByText('Partial')
    ).toBeInTheDocument();
  });

  it('displays permissions for use cases', async () => {
    (usePermissions as jest.Mock).mockReturnValue({
      data: {
        default: {
          '*:*:*': ['*'],
        },
        'org-org1': {
          '*:*:*': ['*'],
        },
        'org-org2': {
          'application.giantswarm.io:apps:*': ['get', 'list'],
          ':configmaps:*': ['get', 'list'],
          ':secrets:*': ['get', 'list'],
        },
      },
    });

    render(getComponent({ useCases: createMockUseCases() }));

    // Toggle app catalogs category
    fireEvent.click(screen.getByLabelText('app catalogs'));
    expect(await screen.findByText('Inspect app catalogs')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Inspect app catalogs for org1 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Inspect app catalogs for org2 organization permission status'
        )
      ).getByText('No')
    ).toBeInTheDocument();

    // Toggle apps category
    fireEvent.click(screen.getByLabelText('apps'));
    expect(await screen.findByText('Inspect apps')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Inspect apps for org1 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Inspect apps for org2 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();

    expect(await screen.findByText('Manage apps')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Manage apps for org1 organization permission status'
        )
      ).getByText('Yes')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(
          'Manage apps for org2 organization permission status'
        )
      ).getByText('No')
    ).toBeInTheDocument();
  });
});
