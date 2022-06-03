import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useUseCasesPermissions } from 'MAPI/permissions/useUseCasesPermissions';
import { mapOAuth2UserToUser } from 'model/stores/main/utils';
import { IOrganizationState } from 'model/stores/organization/types';
import { IState } from 'model/stores/state';
import React from 'react';
import { SWRConfig } from 'swr';
import preloginState from 'test/preloginState';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import Permissions from '../Permissions';

function getComponent() {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = () => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <Permissions />
    </SWRConfig>
  );

  return getComponentWithStore(
    Component,
    undefined,
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
              id: 'giantswarm',
              name: 'giantswarm',
              namespace: 'org-giantswarm',
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

function createDefaultPermissions() {
  return {
    '': {
      'rbac.authorization.k8s.io:clusterroles:*': ['list'],
      'rbac.authorization.k8s.io:clusterrolebindings:*': ['list'],
      'rbac.authorization.k8s.io:roles:*': ['list'],
      'rbac.authorization.k8s.io:rolebindings:*': ['list'],
    },
    default: {
      '*:*:*': ['*'],
    },
    'org-giantswarm': {
      '*:*:*': ['*'],
    },
  };
}

jest.unmock(
  'model/services/mapi/authorizationv1/createLocalSubjectAccessReview'
);
jest.mock('MAPI/permissions/useUseCasesPermissions');

describe('Permissions', () => {
  it('renders without crashing', () => {
    (useUseCasesPermissions as jest.Mock).mockReturnValue({});
    render(getComponent());
  });

  it('displays permissions for the logged in user on initial load', () => {
    (useUseCasesPermissions as jest.Mock).mockReturnValue({
      data: createDefaultPermissions(),
    });
    render(getComponent());

    expect(screen.getByLabelText('Myself')).toBeChecked();
  });

  it('does not display permissions inspection form if the user does not have permissions to do so', () => {
    (useUseCasesPermissions as jest.Mock).mockReturnValue({});
    render(getComponent());

    expect(screen.queryByLabelText('Myself')).not.toBeInTheDocument();
  });
});
