import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { IPermissionsUseCase } from 'MAPI/permissions/types';
import { mapOAuth2UserToUser } from 'model/stores/main/utils';
import React from 'react';
import { SWRConfig } from 'swr';
import preloginState from 'test/preloginState';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import PermissionsOverviewGlobal from '../PermissionsOverviewGlobal';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof PermissionsOverviewGlobal>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <PermissionsOverviewGlobal {...p} />
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
    },
    undefined,
    history,
    auth
  );
}

function createMockUseCases(): IPermissionsUseCase[] {
  return [
    {
      name: 'Inspect namespaces',
      category: 'access control',
      description:
        'List namespaces and get an individual namespace&apos;s details',
      scope: { cluster: true },
      permissions: [
        {
          apiGroups: [''],
          resources: ['namespaces'],
          verbs: ['get', 'list'],
        },
      ],
    },
    {
      name: 'Inspect shared app catalogs',
      category: 'app catalogs',
      description:
        'Read catalogs and their entries in the &quot;default&quot; namespace',
      permissions: [
        {
          apiGroups: ['application.giantswarm.io'],
          resources: ['catalogs', 'appcatalogentries'],
          verbs: ['get', 'list'],
        },
      ],
      scope: { namespaces: ['default'] },
    },
  ];
}

jest.unmock(
  'model/services/mapi/authorizationv1/createSelfSubjectAccessReview'
);

describe('PermissionsOverviewGlobal', () => {
  it('renders without crashing', () => {
    render(getComponent({ useCases: createMockUseCases() }));
  });

  it('displays permissions for global use cases', async () => {
    render(
      getComponent({
        useCases: createMockUseCases(),
        permissions: {
          default: {
            '*:*:*': ['*'],
          },
          '': {
            '*:*:*': ['*'],
          },
        },
      })
    );

    expect(await screen.findByText('access control')).toBeInTheDocument();
    expect(screen.queryByText('Inspect namespaces')).not.toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('access control permission status')
      ).getByText('Yes')
    ).toBeInTheDocument();
    // Toggle use case category
    fireEvent.click(screen.getByLabelText('access control'));
    expect(await screen.findByText('Inspect namespaces')).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('Inspect namespaces permission status')
      ).getByText('Yes')
    ).toBeInTheDocument();

    expect(await screen.findByText('app catalogs')).toBeInTheDocument();
    expect(
      within(screen.getByLabelText('app catalogs permission status')).getByText(
        'Yes'
      )
    ).toBeInTheDocument();
    // Toggle use case category
    fireEvent.click(screen.getByLabelText('app catalogs'));
    expect(
      await screen.findByText('Inspect shared app catalogs')
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText('Inspect shared app catalogs permission status')
      ).getByText('Yes')
    ).toBeInTheDocument();
  });
});
