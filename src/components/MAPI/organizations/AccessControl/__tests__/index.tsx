import { render, screen, within } from '@testing-library/react';
import axios from 'axios';
import nock from 'nock';
import * as React from 'react';
import { AuthorizationTypes, StatusCodes } from 'shared/constants';
import { LoggedInUserTypes } from 'stores/main/types';
import { cache, SWRConfig } from 'swr';
import * as rbacv1Mocks from 'testUtils/mockHttpCalls/rbacv1';
import { getComponentWithStore } from 'testUtils/renderUtils';

import AccessControl from '..';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof AccessControl>
) {
  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <AccessControl {...p} />
    </SWRConfig>
  );

  return getComponentWithStore(Component, props, {
    main: {
      selectedOrganization: 'giantswarm',
      loggedInUser: {
        email: 'developer@giantswarm.io',
        auth: { scheme: AuthorizationTypes.BEARER, token: 'a-valid-token' },
        isAdmin: true,
        type: LoggedInUserTypes.MAPI,
      },
    },
  });
}

describe('AccessControl', () => {
  beforeAll(() => {
    nock.enableNetConnect();
    axios.defaults.adapter = require('axios/lib/adapters/http');
  });

  afterAll(() => {
    axios.defaults.adapter = require('axios/lib/adapters/xhr');
  });

  beforeEach(() => {
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/clusterroles/?labelSelector=ui.giantswarm.io%2Fdisplay%3Dtrue'
      )
      .reply(
        StatusCodes.Ok,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rbacv1Mocks.clusterRoleList as any
      )
      .persist();
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/roles/?labelSelector=ui.giantswarm.io%2Fdisplay%3Dtrue'
      )
      .reply(
        StatusCodes.Ok,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rbacv1Mocks.roleList as any
      )
      .persist();
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/'
      )
      .reply(
        StatusCodes.Ok,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rbacv1Mocks.roleBindingList as any
      )
      .persist();
  });

  afterEach(() => {
    cache.clear();
    nock.cleanAll();
  });

  it('fetches, formats and renders all the data from the API', async () => {
    render(
      getComponent({
        organizationName: 'giantswarm',
      })
    );

    const sidebar = screen.getByRole('complementary', { name: 'Role list' });
    expect(sidebar).toBeInTheDocument();
    expect(within(sidebar).getAllByTitle('Loading...').length).toBeGreaterThan(
      0
    );

    let listItem = await within(sidebar).findByRole('button', {
      name: 'cluster-admin',
    });
    expect(listItem).toBeInTheDocument();
    expect(within(listItem).getByText('Resources: All')).toBeInTheDocument();
    expect(within(listItem).getByText('Groups: 1')).toBeInTheDocument();
    expect(within(listItem).getByText('Users: None')).toBeInTheDocument();
    expect(
      within(listItem).getByRole('presentation', { name: 'Cluster role' })
    ).toBeInTheDocument();

    listItem = await within(sidebar).findByRole('button', {
      name: 'read-apps',
    });
    expect(listItem).toBeInTheDocument();
    expect(within(listItem).getByText('Resources: All')).toBeInTheDocument();
    expect(within(listItem).getByText('Groups: None')).toBeInTheDocument();
    expect(within(listItem).getByText('Users: None')).toBeInTheDocument();
    expect(
      within(listItem).getByRole('presentation', { name: 'Cluster role' })
    ).toBeInTheDocument();

    listItem = await within(sidebar).findByRole('button', {
      name: 'edit-all',
    });
    expect(listItem).toBeInTheDocument();
    expect(within(listItem).getByText('Resources: All')).toBeInTheDocument();
    expect(within(listItem).getByText('Groups: None')).toBeInTheDocument();
    expect(within(listItem).getByText('Users: None')).toBeInTheDocument();
    expect(
      within(listItem).queryByRole('presentation', { name: 'Cluster role' })
    ).not.toBeInTheDocument();
  });
});
