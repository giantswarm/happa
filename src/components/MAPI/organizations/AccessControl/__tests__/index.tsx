import { fireEvent, render, screen, within } from '@testing-library/react';
import axios from 'axios';
import * as corev1 from 'model/services/mapi/corev1';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import * as React from 'react';
import { AuthorizationTypes, StatusCodes } from 'shared/constants';
import { LoggedInUserTypes } from 'stores/main/types';
import { cache, SWRConfig } from 'swr';
import * as corev1Mocks from 'testUtils/mockHttpCalls/corev1';
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

  it('can create groups', async () => {
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

    ((Date.now as unknown) as jest.SpyInstance).mockClear();
  });

  it('displays an error if creating groups fails', async () => {
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

    ((Date.now as unknown) as jest.SpyInstance).mockClear();
  });

  it('can create users', async () => {
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
          name: 'subject1@example.com',
          kind: 'User',
          apiGroup: 'rbac.authorization.k8s.io',
        },
        {
          name: 'subject2',
          kind: 'User',
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
          name: 'subject1@example.com',
          kind: 'User',
          apiGroup: 'rbac.authorization.k8s.io',
        },
        {
          name: 'subject2',
          kind: 'User',
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
    const section = within(content).getByLabelText('Users');
    fireEvent.click(within(section).getByRole('button', { name: 'Add' }));

    const input = within(section).getByPlaceholderText(
      'e.g. subject1, subject2, subject3'
    );
    fireEvent.change(input, {
      target: { value: 'subject1@example.com, subject2' },
    });

    fireEvent.click(within(section).getByRole('button', { name: 'OK' }));
    expect(within(section).getByRole('progressbar')).toBeInTheDocument();

    expect(
      await screen.findByText(/Subjects added successfully./)
    ).toBeInTheDocument();

    expect(
      within(section).getByLabelText('subject1@example.com')
    ).toBeInTheDocument();
    expect(within(section).getByLabelText('subject2')).toBeInTheDocument();

    ((Date.now as unknown) as jest.SpyInstance).mockClear();
  });

  it('displays an error if creating users fails', async () => {
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
          name: 'subject1@example.com',
          kind: 'User',
          apiGroup: 'rbac.authorization.k8s.io',
        },
        {
          name: 'subject2',
          kind: 'User',
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
    const section = within(content).getByLabelText('Users');
    fireEvent.click(within(section).getByRole('button', { name: 'Add' }));

    const input = within(section).getByPlaceholderText(
      'e.g. subject1, subject2, subject3'
    );
    fireEvent.change(input, {
      target: { value: 'subject1@example.com, subject2' },
    });

    fireEvent.click(within(section).getByRole('button', { name: 'OK' }));
    expect(within(section).getByRole('progressbar')).toBeInTheDocument();

    expect(
      await screen.findByText(/Could not add subjects:/)
    ).toBeInTheDocument();
    expect(screen.getByText(/There was a huge problem./)).toBeInTheDocument();

    expect(
      within(section).queryByLabelText('subject1@example.com')
    ).not.toBeInTheDocument();
    expect(
      within(section).queryByLabelText('subject2')
    ).not.toBeInTheDocument();

    ((Date.now as unknown) as jest.SpyInstance).mockClear();
  });

  it('can delete a group', async () => {
    const putRequest = {
      metadata: {
        name: 'edit-all-group',
        namespace: 'org-giantswarm',
        selfLink:
          '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-group',
        uid: '27a1682b-c33b-42af-9489-36bf32ba6d52',
        resourceVersion: '281804578',
        creationTimestamp: '2020-09-29T10:42:53Z',
        labels: {
          'giantswarm.io/managed-by': 'rbac-operator',
        },
        finalizers: [
          'operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller',
        ],
      },
      subjects: [
        {
          kind: 'ServiceAccount',
          apiGroup: 'rbac.authorization.k8s.io',
          name: 'el-toro',
          namespace: 'org-giantswarm',
        },
        {
          kind: 'User',
          apiGroup: 'rbac.authorization.k8s.io',
          name: 'system:boss',
        },
      ],
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Role',
        name: 'edit-all',
      },
    };

    const putResponse = {
      metadata: {
        name: 'edit-all-group',
        namespace: 'org-giantswarm',
        selfLink:
          '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-group',
        uid: '27a1682b-c33b-42af-9489-36bf32ba6d52',
        resourceVersion: '281804578',
        creationTimestamp: '2020-09-29T10:42:53Z',
        labels: {
          'giantswarm.io/managed-by': 'rbac-operator',
        },
        finalizers: [
          'operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller',
        ],
      },
      subjects: [
        {
          kind: 'ServiceAccount',
          apiGroup: 'rbac.authorization.k8s.io',
          name: 'el-toro',
          namespace: 'org-giantswarm',
        },
        {
          kind: 'User',
          apiGroup: 'rbac.authorization.k8s.io',
          name: 'system:boss',
        },
      ],
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Role',
        name: 'edit-all',
      },
    };

    nock(window.config.mapiEndpoint)
      .put(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-group/',
        putRequest
      )
      .reply(StatusCodes.Ok, putResponse);

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-group/'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.editAllRoleBinding);

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
    const subject = within(section).getByLabelText('Admins');
    fireEvent.click(within(subject).getByTitle('Delete'));
    fireEvent.click(screen.getByText('Yes, delete it'));

    expect(within(subject).getByRole('progressbar')).toBeInTheDocument();
    expect(
      await screen.findByText(/Subject Admins deleted successfully./)
    ).toBeInTheDocument();

    expect(within(section).queryByLabelText('Admins')).not.toBeInTheDocument();
  });

  it('displays an error if deleting a group fails', async () => {
    const putRequest = {
      metadata: {
        name: 'edit-all-group',
        namespace: 'org-giantswarm',
        selfLink:
          '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-group',
        uid: '27a1682b-c33b-42af-9489-36bf32ba6d52',
        resourceVersion: '281804578',
        creationTimestamp: '2020-09-29T10:42:53Z',
        labels: {
          'giantswarm.io/managed-by': 'rbac-operator',
        },
        finalizers: [
          'operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller',
        ],
      },
      subjects: [
        {
          kind: 'ServiceAccount',
          apiGroup: 'rbac.authorization.k8s.io',
          name: 'el-toro',
          namespace: 'org-giantswarm',
        },
        {
          kind: 'User',
          apiGroup: 'rbac.authorization.k8s.io',
          name: 'system:boss',
        },
      ],
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Role',
        name: 'edit-all',
      },
    };

    const putResponse = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'Status',
      message: 'There was a huge problem.',
      status: metav1.K8sStatuses.Failure,
      reason: metav1.K8sStatusErrorReasons.InternalError,
      code: StatusCodes.InternalServerError,
    };

    nock(window.config.mapiEndpoint)
      .put(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-group/',
        putRequest
      )
      .reply(putResponse.code, putResponse);

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-group/'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.editAllRoleBinding);

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
    const subject = within(section).getByLabelText('Admins');
    fireEvent.click(within(subject).getByTitle('Delete'));
    fireEvent.click(screen.getByText('Yes, delete it'));

    expect(within(subject).getByRole('progressbar')).toBeInTheDocument();
    expect(
      await screen.findByText(/Could not delete subject Admins/)
    ).toBeInTheDocument();
    expect(screen.getByText(/There was a huge problem./)).toBeInTheDocument();

    expect(within(section).getByLabelText('Admins')).toBeInTheDocument();
  });

  it('can delete a user', async () => {
    const putRequest = {
      metadata: {
        name: 'cool',
        namespace: 'org-giantswarm',
        selfLink:
          '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/cool',
        uid: '27a1682b-c33b-42af-9489-36bf32ba6d52',
        resourceVersion: '281804578',
        creationTimestamp: '2020-09-29T10:42:53Z',
        labels: {
          'giantswarm.io/managed-by': 'rbac-operator',
        },
        finalizers: [
          'operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller',
        ],
      },
      subjects: [
        {
          kind: 'User',
          apiGroup: 'rbac.authorization.k8s.io',
          name: 'system:boss',
        },
      ],
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Role',
        name: 'edit-all',
      },
    };

    const putResponse = {
      metadata: {
        name: 'cool',
        namespace: 'org-giantswarm',
        selfLink:
          '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/cool',
        uid: '27a1682b-c33b-42af-9489-36bf32ba6d52',
        resourceVersion: '281804578',
        creationTimestamp: '2020-09-29T10:42:53Z',
        labels: {
          'giantswarm.io/managed-by': 'rbac-operator',
        },
        finalizers: [
          'operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller',
        ],
      },
      subjects: [
        {
          kind: 'User',
          apiGroup: 'rbac.authorization.k8s.io',
          name: 'system:boss',
        },
      ],
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Role',
        name: 'edit-all',
      },
    };

    nock(window.config.mapiEndpoint)
      .put(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/cool/',
        putRequest
      )
      .reply(StatusCodes.Ok, putResponse);

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/cool/'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.coolRoleBinding);

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
    const section = within(content).getByLabelText('Users');
    const subject = within(section).getByLabelText('test@test.com');
    fireEvent.click(within(subject).getByTitle('Delete'));
    fireEvent.click(screen.getByText('Yes, delete it'));

    expect(within(subject).getByRole('progressbar')).toBeInTheDocument();
    expect(
      await screen.findByText(/Subject test@test.com deleted successfully./)
    ).toBeInTheDocument();

    expect(
      within(section).queryByLabelText('test@test.com')
    ).not.toBeInTheDocument();
  });

  it('displays an error if deleting a user fails', async () => {
    const putRequest = {
      metadata: {
        name: 'cool',
        namespace: 'org-giantswarm',
        selfLink:
          '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/cool',
        uid: '27a1682b-c33b-42af-9489-36bf32ba6d52',
        resourceVersion: '281804578',
        creationTimestamp: '2020-09-29T10:42:53Z',
        labels: {
          'giantswarm.io/managed-by': 'rbac-operator',
        },
        finalizers: [
          'operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller',
        ],
      },
      subjects: [
        {
          kind: 'User',
          apiGroup: 'rbac.authorization.k8s.io',
          name: 'system:boss',
        },
      ],
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Role',
        name: 'edit-all',
      },
    };

    const putResponse = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'Status',
      message: 'There was a huge problem.',
      status: metav1.K8sStatuses.Failure,
      reason: metav1.K8sStatusErrorReasons.InternalError,
      code: StatusCodes.InternalServerError,
    };

    nock(window.config.mapiEndpoint)
      .put(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/cool/',
        putRequest
      )
      .reply(putResponse.code, putResponse);

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/cool/'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.coolRoleBinding);

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
    const section = within(content).getByLabelText('Users');
    const subject = within(section).getByLabelText('test@test.com');
    fireEvent.click(within(subject).getByTitle('Delete'));
    fireEvent.click(screen.getByText('Yes, delete it'));

    expect(
      await screen.findByText(/Could not delete subject test@test.com/)
    ).toBeInTheDocument();
    expect(screen.getByText(/There was a huge problem./)).toBeInTheDocument();

    expect(within(section).getByLabelText('test@test.com')).toBeInTheDocument();
  });

  it('deletes the whole rolebinding when deleting the last subject in it', async () => {
    nock(window.config.mapiEndpoint)
      .delete(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/write-all-customer-group/'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.writeAllCustomerRoleBinding);

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/write-all-customer-group/'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.writeAllCustomerRoleBinding);

    render(
      getComponent({
        organizationName: 'giantswarm',
      })
    );

    const sidebar = screen.getByRole('complementary', {
      name: 'Role list',
    });
    const currentRole = await within(sidebar).findByRole('button', {
      name: 'cluster-admin',
    });
    fireEvent.click(currentRole);

    const content = screen.getByRole('main', { name: 'Role details' });
    const section = within(content).getByLabelText('Groups');
    const subject = within(section).getByLabelText('Admins');
    fireEvent.click(within(subject).getByTitle('Delete'));
    fireEvent.click(screen.getByText('Yes, delete it'));

    expect(within(subject).getByRole('progressbar')).toBeInTheDocument();
    expect(
      await screen.findByText(/Subject Admins deleted successfully./)
    ).toBeInTheDocument();

    expect(within(section).queryByLabelText('Admins')).not.toBeInTheDocument();
  });

  it('can create service accounts', async () => {
    const now = 1617189262247;
    // @ts-expect-error
    Date.now = jest.spyOn(Date, 'now').mockImplementation(() => now);

    const serviceAccountCreationRequests = [
      {
        apiVersion: 'v1',
        kind: 'ServiceAccount',
        metadata: { name: 'automation', namespace: 'org-giantswarm' },
      },
      {
        apiVersion: 'v1',
        kind: 'ServiceAccount',
        metadata: { name: 'random', namespace: 'org-giantswarm' },
      },
    ];

    const serviceAccountCreationResponses = [
      corev1Mocks.automationServiceAccount,
      corev1Mocks.randomServiceAccount,
    ];

    const roleBindingCreationRequest = {
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
          name: 'automation',
          kind: 'ServiceAccount',
          apiGroup: '',
          namespace: 'org-giantswarm',
        },
        {
          name: 'random',
          kind: 'ServiceAccount',
          apiGroup: '',
          namespace: 'org-giantswarm',
        },
      ],
    };

    const roleBindingCreationResponse = {
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
          name: 'automation',
          kind: 'ServiceAccount',
          namespace: 'org-giantswarm',
        },
        {
          name: 'random',
          kind: 'ServiceAccount',
          namespace: 'org-giantswarm',
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
        roleBindingCreationRequest
      )
      .reply(StatusCodes.Created, roleBindingCreationResponse);

    for (let i = 0; i < serviceAccountCreationRequests.length; i++) {
      nock(window.config.mapiEndpoint)
        .post(
          '/api/v1/namespaces/org-giantswarm/serviceaccounts/',
          serviceAccountCreationRequests[i]
        )
        .reply(StatusCodes.Created, serviceAccountCreationResponses[i]);
    }

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
    const section = within(content).getByLabelText('Service accounts');
    fireEvent.click(within(section).getByRole('button', { name: 'Add' }));

    const input = within(section).getByPlaceholderText(
      'e.g. subject1, subject2, subject3'
    );
    fireEvent.change(input, {
      target: { value: 'automation random' },
    });

    fireEvent.click(within(section).getByRole('button', { name: 'OK' }));
    expect(within(section).getByRole('progressbar')).toBeInTheDocument();

    expect(
      await screen.findByText(/Subjects added successfully./)
    ).toBeInTheDocument();

    expect(within(section).getByLabelText('automation')).toBeInTheDocument();
    expect(within(section).getByLabelText('random')).toBeInTheDocument();

    ((Date.now as unknown) as jest.SpyInstance).mockClear();
  });

  it('displays an error if creating service accounts fails', async () => {
    const now = 1617189262247;
    // @ts-expect-error
    Date.now = jest.spyOn(Date, 'now').mockImplementation(() => now);

    const serviceAccountCreationRequests = [
      {
        apiVersion: 'v1',
        kind: 'ServiceAccount',
        metadata: { name: 'automation', namespace: 'org-giantswarm' },
      },
      {
        apiVersion: 'v1',
        kind: 'ServiceAccount',
        metadata: { name: 'random', namespace: 'org-giantswarm' },
      },
    ];

    const serviceAccountCreationResponses: (
      | corev1.IServiceAccount
      | metav1.IK8sStatus
    )[] = [
      corev1Mocks.automationServiceAccount as corev1.IServiceAccount,
      {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'Status',
        message: 'There was a huge problem.',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.InternalError,
        code: StatusCodes.InternalServerError,
      },
    ];

    for (let i = 0; i < serviceAccountCreationRequests.length; i++) {
      nock(window.config.mapiEndpoint)
        .post(
          '/api/v1/namespaces/org-giantswarm/serviceaccounts/',
          serviceAccountCreationRequests[i]
        )
        .reply(
          (serviceAccountCreationResponses[i] as metav1.IK8sStatus).code ||
            StatusCodes.Created,
          serviceAccountCreationResponses[i]
        );
    }

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
    const section = within(content).getByLabelText('Service accounts');
    fireEvent.click(within(section).getByRole('button', { name: 'Add' }));

    const input = within(section).getByPlaceholderText(
      'e.g. subject1, subject2, subject3'
    );
    fireEvent.change(input, {
      target: { value: 'automation random' },
    });

    fireEvent.click(within(section).getByRole('button', { name: 'OK' }));
    expect(within(section).getByRole('progressbar')).toBeInTheDocument();

    expect(
      await screen.findByText(/Could not add subjects:/)
    ).toBeInTheDocument();
    expect(screen.getByText(/There was a huge problem./)).toBeInTheDocument();

    expect(
      within(section).queryByLabelText('automation')
    ).not.toBeInTheDocument();
    expect(within(section).queryByLabelText('random')).not.toBeInTheDocument();

    ((Date.now as unknown) as jest.SpyInstance).mockClear();
  });

  it('can delete a service account', async () => {
    const putRequest = {
      metadata: {
        name: 'edit-all-group',
        namespace: 'org-giantswarm',
        selfLink:
          '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-group',
        uid: '27a1682b-c33b-42af-9489-36bf32ba6d52',
        resourceVersion: '281804578',
        creationTimestamp: '2020-09-29T10:42:53Z',
        labels: {
          'giantswarm.io/managed-by': 'rbac-operator',
        },
        finalizers: [
          'operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller',
        ],
      },
      subjects: [
        {
          kind: 'Group',
          apiGroup: 'rbac.authorization.k8s.io',
          name: 'Admins',
        },
        {
          kind: 'User',
          apiGroup: 'rbac.authorization.k8s.io',
          name: 'system:boss',
        },
      ],
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Role',
        name: 'edit-all',
      },
    };

    const putResponse = {
      metadata: {
        name: 'edit-all-group',
        namespace: 'org-giantswarm',
        selfLink:
          '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-group',
        uid: '27a1682b-c33b-42af-9489-36bf32ba6d52',
        resourceVersion: '281804578',
        creationTimestamp: '2020-09-29T10:42:53Z',
        labels: {
          'giantswarm.io/managed-by': 'rbac-operator',
        },
        finalizers: [
          'operatorkit.giantswarm.io/rbac-operator-orgpermissions-controller',
        ],
      },
      subjects: [
        {
          kind: 'Group',
          apiGroup: 'rbac.authorization.k8s.io',
          name: 'Admins',
        },
        {
          kind: 'User',
          apiGroup: 'rbac.authorization.k8s.io',
          name: 'system:boss',
        },
      ],
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Role',
        name: 'edit-all',
      },
    };

    nock(window.config.mapiEndpoint)
      .put(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-group/',
        putRequest
      )
      .reply(StatusCodes.Ok, putResponse);

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-group/'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.editAllRoleBinding);

    nock(window.config.mapiEndpoint)
      .delete('/api/v1/namespaces/org-giantswarm/serviceaccounts/el-toro/')
      .reply(StatusCodes.Ok, corev1Mocks.elToroServiceAccount);

    nock(window.config.mapiEndpoint)
      .get('/api/v1/namespaces/org-giantswarm/serviceaccounts/el-toro/')
      .reply(StatusCodes.Ok, corev1Mocks.elToroServiceAccount);

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
    const section = within(content).getByLabelText('Service accounts');
    const subject = within(section).getByLabelText('el-toro');
    fireEvent.click(within(subject).getByTitle('Delete'));
    fireEvent.click(screen.getByText('Yes, delete it'));

    expect(within(subject).getByRole('progressbar')).toBeInTheDocument();
    expect(
      await screen.findByText(/Subject el-toro deleted successfully./)
    ).toBeInTheDocument();

    expect(within(section).queryByLabelText('el-toro')).not.toBeInTheDocument();
  });

  it('displays an error if deleting a service account fails', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/edit-all-group/'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.editAllRoleBinding);

    nock(window.config.mapiEndpoint)
      .delete('/api/v1/namespaces/org-giantswarm/serviceaccounts/el-toro/')
      .reply(StatusCodes.InternalServerError, {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'Status',
        message: 'There was a huge problem.',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.InternalError,
        code: StatusCodes.InternalServerError,
      });

    nock(window.config.mapiEndpoint)
      .get('/api/v1/namespaces/org-giantswarm/serviceaccounts/el-toro/')
      .reply(StatusCodes.Ok, corev1Mocks.elToroServiceAccount);

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
    const section = within(content).getByLabelText('Service accounts');
    const subject = within(section).getByLabelText('el-toro');
    fireEvent.click(within(subject).getByTitle('Delete'));
    fireEvent.click(screen.getByText('Yes, delete it'));

    expect(within(subject).getByRole('progressbar')).toBeInTheDocument();
    expect(
      await screen.findByText(/Could not delete subject el-toro/)
    ).toBeInTheDocument();
    expect(screen.getByText(/There was a huge problem./)).toBeInTheDocument();

    expect(within(section).getByLabelText('el-toro')).toBeInTheDocument();
  });
});
