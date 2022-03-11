import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { usePermissionsForAccessControl } from 'MAPI/organizations/permissions/usePermissionsForAccessControl';
import { StatusCodes } from 'model/constants';
import * as corev1 from 'model/services/mapi/corev1';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import * as React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import * as corev1Mocks from 'test/mockHttpCalls/corev1';
import * as rbacv1Mocks from 'test/mockHttpCalls/rbacv1';
import { getComponentWithStore } from 'test/renderUtils';
import * as ui from 'UI/Display/MAPI/AccessControl/types';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import AccessControl from '..';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof AccessControl>
) {
  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <AccessControl {...p} />
    </SWRConfig>
  );

  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  return getComponentWithStore(
    Component,
    props,
    undefined,
    undefined,
    history,
    auth
  );
}

jest.mock('../../permissions/usePermissionsForAccessControl');

describe('AccessControl', () => {
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

    (usePermissionsForAccessControl as jest.Mock).mockReturnValue({
      roles: {
        '': {
          canList: true,
        },
        'org-giantswarm': {
          canList: true,
        },
      },
      subjects: {
        [ui.AccessControlSubjectTypes.Group]: {
          canCreate: true,
          canBind: true,
          canDelete: true,
          canList: true,
        },
        [ui.AccessControlSubjectTypes.User]: {
          canCreate: true,
          canBind: true,
          canDelete: true,
          canList: true,
        },
        [ui.AccessControlSubjectTypes.ServiceAccount]: {
          canCreate: true,
          canBind: true,
          canDelete: true,
          canList: true,
        },
      },
    } as ui.IAccessControlPermissions);
  });

  it('fetches, formats and renders a cluster role', async () => {
    render(
      getComponent({
        organizationName: 'giantswarm',
        organizationNamespace: 'org-giantswarm',
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
    expect(within(listItem).getByLabelText('Groups: 1')).toBeInTheDocument();
    expect(within(listItem).getByLabelText('Users: 0')).toBeInTheDocument();
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

    fireEvent.click(within(content).getByText('Permissions'));

    const rows = within(within(content).getByRole('table')).getAllByRole('row');
    const cells = within(rows[1]).getAllByRole('cell');
    expect(within(cells[0]).getByText('All')).toBeInTheDocument();
    expect(within(cells[1]).getByText('All')).toBeInTheDocument();
    expect(within(cells[2]).getByText('All')).toBeInTheDocument();
    expect(
      within(cells[3]).getByLabelText('Supported verbs: All (*)')
    ).toBeInTheDocument();
  });

  it('fetches, formats and renders a namespaced role', async () => {
    render(
      getComponent({
        organizationName: 'giantswarm',
        organizationNamespace: 'org-giantswarm',
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
    expect(within(listItem).getByLabelText('Groups: 1')).toBeInTheDocument();
    expect(within(listItem).getByLabelText('Users: 2')).toBeInTheDocument();
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

    section = within(content).getByLabelText('Users');
    expect(section).toBeInTheDocument();
    subject = within(section).getByLabelText('test@test.com');
    expect(subject).toBeInTheDocument();
    subject = within(section).getByLabelText('system:boss');
    expect(subject).toBeInTheDocument();
    expect(within(subject).queryByTitle('Delete')).not.toBeInTheDocument();

    section = within(content).getByLabelText('Service accounts');
    expect(section).toBeInTheDocument();
    subject = within(section).getByLabelText('el-toro');
    expect(subject).toBeInTheDocument();

    fireEvent.click(within(content).getByText('Permissions'));

    const rows = within(within(content).getByRole('table')).getAllByRole('row');
    const cells = within(rows[1]).getAllByRole('cell');
    expect(within(cells[0]).getByText('All')).toBeInTheDocument();
    expect(within(cells[1]).getByText('All')).toBeInTheDocument();
    expect(within(cells[2]).getByText('All')).toBeInTheDocument();
    expect(
      within(cells[3]).getByLabelText(
        'Supported verbs: get, watch, list, update, patch'
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
        apiVersion: 'v1',
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
        organizationNamespace: 'org-giantswarm',
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
        organizationNamespace: 'org-giantswarm',
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
      await withMarkup(screen.findByText)(
        'Groups subject1, subject2, subject3 have been bound to the role.'
      )
    ).toBeInTheDocument();

    expect(within(section).getByLabelText('subject1')).toBeInTheDocument();
    expect(within(section).getByLabelText('subject2')).toBeInTheDocument();
    expect(within(section).getByLabelText('subject3')).toBeInTheDocument();

    (Date.now as unknown as jest.SpyInstance).mockClear();
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
      apiVersion: 'v1',
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
        organizationNamespace: 'org-giantswarm',
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
      await withMarkup(screen.findByText)(
        'Could not bind groups subject1, subject2, subject3 :'
      )
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

    (Date.now as unknown as jest.SpyInstance).mockClear();
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
        organizationNamespace: 'org-giantswarm',
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
      await withMarkup(screen.findByText)(
        'Users subject1@example.com, subject2 have been bound to the role.'
      )
    ).toBeInTheDocument();

    expect(
      within(section).getByLabelText('subject1@example.com')
    ).toBeInTheDocument();
    expect(within(section).getByLabelText('subject2')).toBeInTheDocument();

    (Date.now as unknown as jest.SpyInstance).mockClear();
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
      apiVersion: 'v1',
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
        organizationNamespace: 'org-giantswarm',
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
      await withMarkup(screen.findByText)(
        'Could not bind users subject1@example.com, subject2 :'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/There was a huge problem./)).toBeInTheDocument();

    expect(
      within(section).queryByLabelText('subject1@example.com')
    ).not.toBeInTheDocument();
    expect(
      within(section).queryByLabelText('subject2')
    ).not.toBeInTheDocument();

    (Date.now as unknown as jest.SpyInstance).mockClear();
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
        organizationNamespace: 'org-giantswarm',
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
    fireEvent.click(screen.getByText('Remove'));

    expect(within(subject).getByRole('progressbar')).toBeInTheDocument();
    expect(
      await withMarkup(screen.findByText)(
        'The binding for group Admins has been removed.'
      )
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
      apiVersion: 'v1',
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
        organizationNamespace: 'org-giantswarm',
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
    fireEvent.click(screen.getByText('Remove'));

    expect(within(subject).getByRole('progressbar')).toBeInTheDocument();
    expect(
      await withMarkup(screen.findByText)(
        'Could not delete binding for group Admins .'
      )
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
        organizationNamespace: 'org-giantswarm',
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
    fireEvent.click(screen.getByText('Remove'));

    expect(within(subject).getByRole('progressbar')).toBeInTheDocument();
    expect(
      await withMarkup(screen.findByText)(
        'The binding for user test@test.com has been removed.'
      )
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
      apiVersion: 'v1',
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
        organizationNamespace: 'org-giantswarm',
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
    fireEvent.click(screen.getByText('Remove'));

    expect(
      await withMarkup(screen.findByText)(
        'Could not delete binding for user test@test.com .'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/There was a huge problem./)).toBeInTheDocument();

    expect(within(section).getByLabelText('test@test.com')).toBeInTheDocument();
  });

  it('deletes the whole rolebinding when deleting the last subject in it', async () => {
    nock(window.config.mapiEndpoint)
      .delete(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/have-fun/'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.haveFunRoleBinding);

    nock(window.config.mapiEndpoint)
      .get(
        '/apis/rbac.authorization.k8s.io/v1/namespaces/org-giantswarm/rolebindings/have-fun/'
      )
      .reply(StatusCodes.Ok, rbacv1Mocks.haveFunRoleBinding);

    render(
      getComponent({
        organizationName: 'giantswarm',
        organizationNamespace: 'org-giantswarm',
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
    const section = within(content).getByLabelText('Service accounts');
    const subject = within(section).getByLabelText('some-random-account');
    fireEvent.click(within(subject).getByTitle('Delete'));
    fireEvent.click(screen.getByText('Remove'));

    expect(within(subject).getByRole('progressbar')).toBeInTheDocument();
    expect(
      await withMarkup(screen.findByText)(
        'The binding for service account some-random-account has been removed.'
      )
    ).toBeInTheDocument();

    expect(
      within(section).queryByLabelText('some-random-account')
    ).not.toBeInTheDocument();
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
        .get(
          `/api/v1/namespaces/org-giantswarm/serviceaccounts/${serviceAccountCreationRequests[i].metadata.name}/`
        )
        .reply(StatusCodes.NotFound, {
          apiVersion: 'v1',
          kind: 'Status',
          message: 'New service account, who dis?',
          status: metav1.K8sStatuses.Failure,
          reason: metav1.K8sStatusErrorReasons.NotFound,
          code: StatusCodes.NotFound,
        });
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
        organizationNamespace: 'org-giantswarm',
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
      target: { value: 'automation, random' },
    });

    fireEvent.click(within(section).getByRole('button', { name: 'OK' }));
    expect(within(section).getByRole('progressbar')).toBeInTheDocument();

    expect(
      await withMarkup(screen.findByText)(
        'Service accounts automation, random have been created and bound to the role.'
      )
    ).toBeInTheDocument();

    expect(within(section).getByLabelText('automation')).toBeInTheDocument();
    expect(within(section).getByLabelText('random')).toBeInTheDocument();

    (Date.now as unknown as jest.SpyInstance).mockClear();
  });

  it('can re-use existing service accounts', async () => {
    const now = 1617189262247;
    // @ts-expect-error
    Date.now = jest.spyOn(Date, 'now').mockImplementation(() => now);

    const serviceAccountCreationRequest = {
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: { name: 'random', namespace: 'org-giantswarm' },
    };

    const serviceAccountCreationResponse = corev1Mocks.randomServiceAccount;

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

    nock(window.config.mapiEndpoint)
      .get(
        `/api/v1/namespaces/org-giantswarm/serviceaccounts/${serviceAccountCreationRequest.metadata.name}/`
      )
      .reply(StatusCodes.Ok, serviceAccountCreationResponse);

    render(
      getComponent({
        organizationName: 'giantswarm',
        organizationNamespace: 'org-giantswarm',
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
      target: { value: 'random' },
    });

    fireEvent.click(within(section).getByRole('button', { name: 'OK' }));
    expect(within(section).getByRole('progressbar')).toBeInTheDocument();

    expect(
      await withMarkup(screen.findByText)(
        'Service account random has been bound to the role.'
      )
    ).toBeInTheDocument();

    expect(within(section).getByLabelText('random')).toBeInTheDocument();

    (Date.now as unknown as jest.SpyInstance).mockClear();
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
        apiVersion: 'v1',
        kind: 'Status',
        message: 'There was a huge problem.',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.InternalError,
        code: StatusCodes.InternalServerError,
      },
    ];

    for (let i = 0; i < serviceAccountCreationRequests.length; i++) {
      nock(window.config.mapiEndpoint)
        .get(
          `/api/v1/namespaces/org-giantswarm/serviceaccounts/${serviceAccountCreationRequests[i].metadata.name}/`
        )
        .reply(StatusCodes.NotFound, {
          apiVersion: 'v1',
          kind: 'Status',
          message: 'New service account, who dis?',
          status: metav1.K8sStatuses.Failure,
          reason: metav1.K8sStatusErrorReasons.NotFound,
          code: StatusCodes.NotFound,
        });
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
        organizationNamespace: 'org-giantswarm',
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
      target: { value: 'automation, random' },
    });

    fireEvent.click(within(section).getByRole('button', { name: 'OK' }));
    expect(within(section).getByRole('progressbar')).toBeInTheDocument();

    expect(
      await withMarkup(screen.findByText)(
        'Could not create service accounts automation, random :'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/There was a huge problem./)).toBeInTheDocument();

    expect(
      within(section).queryByLabelText('automation')
    ).not.toBeInTheDocument();
    expect(within(section).queryByLabelText('random')).not.toBeInTheDocument();

    (Date.now as unknown as jest.SpyInstance).mockClear();
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

    render(
      getComponent({
        organizationName: 'giantswarm',
        organizationNamespace: 'org-giantswarm',
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
    fireEvent.click(screen.getByText('Remove'));

    expect(within(subject).getByRole('progressbar')).toBeInTheDocument();
    expect(
      await withMarkup(screen.findByText)(
        'The binding for service account el-toro has been removed.'
      )
    ).toBeInTheDocument();

    expect(within(section).queryByLabelText('el-toro')).not.toBeInTheDocument();
  });

  it('displays an error if deleting a service account fails', async () => {
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
      apiVersion: 'v1',
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
        organizationNamespace: 'org-giantswarm',
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
    fireEvent.click(screen.getByText('Remove'));

    expect(within(subject).getByRole('progressbar')).toBeInTheDocument();
    expect(
      await withMarkup(screen.findByText)(
        'Could not delete binding for service account el-toro .'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/There was a huge problem./)).toBeInTheDocument();

    expect(within(section).getByLabelText('el-toro')).toBeInTheDocument();
  });
});
