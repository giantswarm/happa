import { fireEvent, render, screen, within } from '@testing-library/react';
import axios from 'axios';
import * as metav1 from 'model/services/mapi/metav1';
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
      .reply(StatusCodes.Ok, rbacv1Mocks.clusterRoleList);
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/roles/?labelSelector=ui.giantswarm.io%2Fdisplay%3Dtrue'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.roleList);
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.roleBindingList);
  });

  afterEach(() => {
    cache.clear();
  });

  it('fetches, formats and renders a cluster role', async () => {
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

    const content = screen.getByRole('main', { name: 'Role details' });
    expect(content).toBeInTheDocument();
    expect(within(content).getAllByTitle('Loading...').length).toBeGreaterThan(
      0
    );

    const listItem = await within(sidebar).findByRole('button', {
      name: 'cluster-admin',
    });
    expect(listItem).toBeInTheDocument();
    expect(within(listItem).getByText('Resources: All')).toBeInTheDocument();
    expect(within(listItem).getByText('Groups: 1')).toBeInTheDocument();
    expect(within(listItem).getByText('Users: None')).toBeInTheDocument();
    expect(
      within(listItem).getByRole('presentation', { name: 'Cluster role' })
    ).toBeInTheDocument();

    fireEvent.click(listItem);

    expect(
      await within(content).findByText('cluster-admin')
    ).toBeInTheDocument();
    expect(within(content).getByText('Cluster role')).toBeInTheDocument();
    expect(within(content).getByText('Managed by you')).toBeInTheDocument();

    const group = within(
      within(content).getByLabelText('Groups')
    ).getByLabelText('Admins');
    expect(group).toBeInTheDocument();
    expect(within(group).getByTitle('Delete')).toBeInTheDocument();

    fireEvent.click(within(content).getByText('Permissions'));

    const rows = within(within(content).getByRole('table')).getAllByRole('row');
    const cells = within(rows[1]).getAllByRole('cell');
    expect(within(cells[0]).getByText('All')).toBeInTheDocument();
    expect(within(cells[1]).getByText('All')).toBeInTheDocument();
    expect(within(cells[2]).getByText('All')).toBeInTheDocument();
    expect(
      within(cells[3]).getByLabelText('Supported verbs: All')
    ).toBeInTheDocument();
  });

  it('fetches, formats and renders a namespaced role', async () => {
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

    const content = screen.getByRole('main', { name: 'Role details' });
    expect(content).toBeInTheDocument();
    expect(within(content).getAllByTitle('Loading...').length).toBeGreaterThan(
      0
    );

    const listItem = await within(sidebar).findByRole('button', {
      name: 'edit-all',
    });
    expect(listItem).toBeInTheDocument();
    expect(within(listItem).getByText('Resources: All')).toBeInTheDocument();
    expect(within(listItem).getByText('Groups: 1')).toBeInTheDocument();
    expect(within(listItem).getByText('Users: 2')).toBeInTheDocument();
    expect(
      within(listItem).queryByRole('presentation', { name: 'Cluster role' })
    ).not.toBeInTheDocument();

    fireEvent.click(listItem);

    expect(await within(content).findByText('edit-all')).toBeInTheDocument();
    expect(within(content).getByText('Namespaced role')).toBeInTheDocument();
    expect(within(content).getByText('Managed by you')).toBeInTheDocument();

    let section = within(content).getByLabelText('Groups');
    expect(section).toBeInTheDocument();
    let subject = within(section).getByLabelText('Admins');
    expect(subject).toBeInTheDocument();
    expect(within(subject).getByTitle('Delete')).toBeInTheDocument();

    section = within(content).getByLabelText('Users');
    expect(section).toBeInTheDocument();
    subject = within(section).getByLabelText('test@test.com');
    expect(subject).toBeInTheDocument();
    expect(within(subject).getByTitle('Delete')).toBeInTheDocument();
    subject = within(section).getByLabelText('system:boss');
    expect(subject).toBeInTheDocument();
    expect(within(subject).queryByTitle('Delete')).not.toBeInTheDocument();

    section = within(content).getByLabelText('Service accounts');
    expect(section).toBeInTheDocument();
    subject = within(section).getByLabelText('el-toro');
    expect(subject).toBeInTheDocument();
    expect(within(subject).getByTitle('Delete')).toBeInTheDocument();

    fireEvent.click(within(content).getByText('Permissions'));

    const rows = within(within(content).getByRole('table')).getAllByRole('row');
    const cells = within(rows[1]).getAllByRole('cell');
    expect(within(cells[0]).getByText('All')).toBeInTheDocument();
    expect(within(cells[1]).getByText('All')).toBeInTheDocument();
    expect(within(cells[2]).getByText('All')).toBeInTheDocument();
    expect(
      within(cells[3]).getByLabelText(
        'Supported verbs: get, list, watch, patch, update'
      )
    ).toBeInTheDocument();
  });

  it('displays an error if fetching data fails', async () => {
    nock.cleanAll();

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/clusterroles/?labelSelector=ui.giantswarm.io%2Fdisplay%3Dtrue'
      )
      .reply(StatusCodes.InternalServerError, {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'Status',
        message: 'There was a huge problem.',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.InternalError,
        code: StatusCodes.InternalServerError,
      });
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/roles/?labelSelector=ui.giantswarm.io%2Fdisplay%3Dtrue'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.roleList);
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.roleBindingList);

    render(
      getComponent({
        organizationName: 'giantswarm',
      })
    );

    expect(
      await screen.findByText('Error loading roles: There was a huge problem.')
    ).toBeInTheDocument();
  });

  it('can create simple subjects', async () => {
    const now = 1617189262247;
    // @ts-expect-error
    Date.now = jest.spyOn(Date, 'now').mockImplementation(() => now);

    const creationRequest = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'RoleBinding',
      metadata: {
        name: `edit-all-${now}`,
        namespace: 'org-giantswarm',
      },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Role',
        name: 'edit-all',
      },
      subjects: [
        {
          name: 'subject1',
          kind: 'Group',
          apiGroup: 'rbac.authorization.k8s.io',
        },
        {
          name: 'subject2',
          kind: 'Group',
          apiGroup: 'rbac.authorization.k8s.io',
        },
        {
          name: 'subject3',
          kind: 'Group',
          apiGroup: 'rbac.authorization.k8s.io',
        },
      ],
    };

    const creationResponse = {
      kind: 'RoleBinding',
      apiVersion: 'rbac.authorization.k8s.io/v1',
      metadata: {
        name: `edit-all-${now}`,
        namespace: 'org-giantswarm',
        selfLink: `/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-${now}`,
        uid: '522ea429-9561-4d80-ba12-6eb656b51145',
        resourceVersion: '284491712',
        creationTimestamp: new Date(now).toISOString(),
      },
      subjects: [
        {
          name: 'subject1',
          kind: 'Group',
          apiGroup: 'rbac.authorization.k8s.io',
        },
        {
          name: 'subject2',
          kind: 'Group',
          apiGroup: 'rbac.authorization.k8s.io',
        },
        {
          name: 'subject3',
          kind: 'Group',
          apiGroup: 'rbac.authorization.k8s.io',
        },
      ],
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Role',
        name: 'edit-all',
      },
    };

    nock(window.config.mapiEndpoint)
      .post(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/',
        creationRequest
      )
      .reply(StatusCodes.Created, creationResponse);

    render(
      getComponent({
        organizationName: 'giantswarm',
      })
    );

    const sidebar = screen.getByRole('complementary', {
      name: 'Role list',
    });
    const currentRole = await within(sidebar).findByRole('button', {
      name: 'edit-all',
    });
    fireEvent.click(currentRole);

    const content = screen.getByRole('main', { name: 'Role details' });
    const section = within(content).getByLabelText('Groups');
    fireEvent.click(within(section).getByRole('button', { name: 'Add' }));

    const input = within(section).getByPlaceholderText(
      'e.g. subject1, subject2, subject3'
    );
    fireEvent.change(input, {
      target: { value: 'subject1, subject2, subject3' },
    });

    fireEvent.click(within(section).getByRole('button', { name: 'OK' }));
    expect(within(section).getByRole('progressbar')).toBeInTheDocument();

    expect(
      await screen.findByText(/Subjects added successfully./)
    ).toBeInTheDocument();

    expect(within(section).getByLabelText('subject1')).toBeInTheDocument();
    expect(within(section).getByLabelText('subject2')).toBeInTheDocument();
    expect(within(section).getByLabelText('subject3')).toBeInTheDocument();
  });

  it('displays an error if creating simple subjects fails', async () => {
    const now = 1617189262247;
    // @ts-expect-error
    Date.now = jest.spyOn(Date, 'now').mockImplementation(() => now);

    const creationRequest = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'RoleBinding',
      metadata: {
        name: `edit-all-${now}`,
        namespace: 'org-giantswarm',
      },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Role',
        name: 'edit-all',
      },
      subjects: [
        {
          name: 'subject1',
          kind: 'Group',
          apiGroup: 'rbac.authorization.k8s.io',
        },
        {
          name: 'subject2',
          kind: 'Group',
          apiGroup: 'rbac.authorization.k8s.io',
        },
        {
          name: 'subject3',
          kind: 'Group',
          apiGroup: 'rbac.authorization.k8s.io',
        },
      ],
    };

    const creationResponse = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'Status',
      message: 'There was a huge problem.',
      status: metav1.K8sStatuses.Failure,
      reason: metav1.K8sStatusErrorReasons.InternalError,
      code: StatusCodes.InternalServerError,
    };

    nock(window.config.mapiEndpoint)
      .post(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/',
        creationRequest
      )
      .reply(creationResponse.code, creationResponse);

    render(
      getComponent({
        organizationName: 'giantswarm',
      })
    );

    const sidebar = screen.getByRole('complementary', {
      name: 'Role list',
    });
    const currentRole = await within(sidebar).findByRole('button', {
      name: 'edit-all',
    });
    fireEvent.click(currentRole);

    const content = screen.getByRole('main', { name: 'Role details' });
    const section = within(content).getByLabelText('Groups');
    fireEvent.click(within(section).getByRole('button', { name: 'Add' }));

    const input = within(section).getByPlaceholderText(
      'e.g. subject1, subject2, subject3'
    );
    fireEvent.change(input, {
      target: { value: 'subject1, subject2, subject3' },
    });

    fireEvent.click(within(section).getByRole('button', { name: 'OK' }));
    expect(within(section).getByRole('progressbar')).toBeInTheDocument();

    expect(
      await screen.findByText(/Could not add subjects:/)
    ).toBeInTheDocument();
    expect(screen.getByText(/There was a huge problem./)).toBeInTheDocument();

    expect(
      within(section).queryByLabelText('subject1')
    ).not.toBeInTheDocument();
    expect(
      within(section).queryByLabelText('subject2')
    ).not.toBeInTheDocument();
    expect(
      within(section).queryByLabelText('subject3')
    ).not.toBeInTheDocument();
  });
});
