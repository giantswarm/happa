import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import nock from 'nock';
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import * as corev1Mocks from 'test/mockHttpCalls/corev1';
import { getComponentWithStore } from 'test/renderUtils';
import * as ui from 'UI/Display/MAPI/AccessControl/types';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import AccessControlRoleSubjects from '../AccessControlRoleSubjects';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof AccessControlRoleSubjects>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <AccessControlRoleSubjects {...p} />
    </SWRConfig>
  );

  return getComponentWithStore(
    Component,
    props,
    undefined,
    undefined,
    history,
    auth
  );
}

const defaultPermissions: ui.IAccessControlPermissions = {
  roles: {
    '': {
      canList: true,
    },
    'org-test': {
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
};

describe('AccessControlRoleSubjects', () => {
  it('renders without crashing', () => {
    render(
      getComponent({
        namespace: 'org-test',
        permissions: defaultPermissions,
        groups: {},
        users: {},
        serviceAccounts: {},
        roleName: 'test-role',
        onAdd: jest.fn(),
        onDelete: jest.fn(),
      })
    );
  });

  it('renders all provided subjects', () => {
    render(
      getComponent({
        namespace: 'org-test',
        permissions: defaultPermissions,
        groups: {
          'test-group1': {
            name: 'test-group1',
            isEditable: true,
            roleBindings: [],
          },
          'test-group2': {
            name: 'test-group2',
            isEditable: true,
            roleBindings: [],
          },
          'test-group3': {
            name: 'test-group3',
            isEditable: true,
            roleBindings: [],
          },
        },
        users: {
          'test-user1@domain.com': {
            name: 'test-user1@domain.com',
            isEditable: true,
            roleBindings: [],
          },
          'test-user2': {
            name: 'test-user2',
            isEditable: true,
            roleBindings: [],
          },
          'test-user3': {
            name: 'test-user3',
            isEditable: true,
            roleBindings: [],
          },
        },
        serviceAccounts: {
          'test-account1': {
            name: 'test-account1',
            isEditable: true,
            roleBindings: [],
          },
          'test-account2': {
            name: 'test-account2',
            isEditable: true,
            roleBindings: [],
          },
          'test-account3': {
            name: 'test-account3',
            isEditable: true,
            roleBindings: [],
          },
        },
        roleName: 'test-role',
        onAdd: jest.fn(),
        onDelete: jest.fn(),
      })
    );

    expect(screen.getByText('test-group1')).toBeInTheDocument();
    expect(screen.getByText('test-group2')).toBeInTheDocument();
    expect(screen.getByText('test-group3')).toBeInTheDocument();

    expect(screen.getByText('test-user1')).toBeInTheDocument();
    expect(screen.getByText('@domain.com')).toBeInTheDocument();
    expect(screen.getByText('test-user2')).toBeInTheDocument();
    expect(screen.getByText('test-user3')).toBeInTheDocument();

    expect(screen.getByText('test-account1')).toBeInTheDocument();
    expect(screen.getByText('test-account2')).toBeInTheDocument();
    expect(screen.getByText('test-account3')).toBeInTheDocument();
  });

  it('displays a delete button next to editable subjects', () => {
    render(
      getComponent({
        namespace: 'org-test',
        permissions: defaultPermissions,
        groups: {
          'test-group1': {
            name: 'test-group1',
            isEditable: true,
            roleBindings: [],
          },
          'test-group2': {
            name: 'test-group2',
            isEditable: false,
            roleBindings: [],
          },
        },
        users: {
          'test-user1': {
            name: 'test-user1@domain.com',
            isEditable: true,
            roleBindings: [],
          },
          'test-user2': {
            name: 'test-user2',
            isEditable: false,
            roleBindings: [],
          },
        },
        serviceAccounts: {
          'test-account1': {
            name: 'test-account1',
            isEditable: true,
            roleBindings: [],
          },
          'test-account2': {
            name: 'test-account2',
            isEditable: false,
            roleBindings: [],
          },
        },
        roleName: 'test-role',
        onAdd: jest.fn(),
        onDelete: jest.fn(),
      })
    );

    let subject = screen.getByLabelText('test-group1');
    let deleteButton = within(subject).getByTitle('Delete');

    expect(deleteButton).toBeInTheDocument();
    fireEvent.mouseEnter(deleteButton);
    expect(screen.getByText(`Remove this group's binding to this role`));
    fireEvent.mouseLeave(deleteButton);

    subject = screen.getByLabelText('test-group2');
    expect(within(subject).queryByTitle('Delete')).not.toBeInTheDocument();

    subject = screen.getByLabelText('test-user1@domain.com');
    deleteButton = within(subject).getByTitle('Delete');

    expect(deleteButton).toBeInTheDocument();
    fireEvent.mouseEnter(deleteButton);
    expect(screen.getByText(`Remove this user's binding to this role`));
    fireEvent.mouseLeave(deleteButton);

    subject = screen.getByLabelText('test-user2');
    expect(within(subject).queryByTitle('Delete')).not.toBeInTheDocument();

    subject = screen.getByLabelText('test-account1');
    deleteButton = within(subject).getByTitle('Delete');

    expect(deleteButton).toBeInTheDocument();
    fireEvent.mouseEnter(deleteButton);
    expect(
      screen.getByText(`Remove this service account's binding to this role`)
    );
    fireEvent.mouseLeave(deleteButton);

    subject = screen.getByLabelText('test-account2');
    expect(within(subject).queryByTitle('Delete')).not.toBeInTheDocument();
  });

  it('can add subjects', async () => {
    jest.useFakeTimers();
    const onAddMockfn = jest.fn();

    onAddMockfn.mockImplementationOnce(() => {
      return new Promise<ui.IAccessControlRoleSubjectStatus[]>((resolve) =>
        setTimeout(
          () =>
            resolve([
              {
                name: 'group1',
                status: ui.AccessControlRoleSubjectStatus.Bound,
              },
              {
                name: 'group2',
                status: ui.AccessControlRoleSubjectStatus.Bound,
              },
              {
                name: 'group3',
                status: ui.AccessControlRoleSubjectStatus.Bound,
              },
            ]),
          // eslint-disable-next-line no-magic-numbers
          1000
        )
      );
    });

    onAddMockfn.mockImplementationOnce(() => {
      return new Promise<ui.IAccessControlRoleSubjectStatus[]>((resolve) =>
        setTimeout(
          () =>
            resolve([
              {
                name: 'group1',
                status: ui.AccessControlRoleSubjectStatus.Bound,
              },
            ]),
          // eslint-disable-next-line no-magic-numbers
          1000
        )
      );
    });

    render(
      getComponent({
        namespace: 'org-test',
        permissions: defaultPermissions,
        groups: {},
        users: {},
        serviceAccounts: {},
        roleName: 'test-role',
        onAdd: onAddMockfn,
        onDelete: jest.fn(),
      })
    );

    const section = screen.getByLabelText('Groups');
    fireEvent.click(within(section).getByRole('button', { name: 'Add' }));

    let input = within(section).getByPlaceholderText(
      'e.g. subject1, subject2, subject3'
    ) as HTMLInputElement;
    expect(document.activeElement).toBe(input);

    expect(
      screen.getByText(
        'Enter one or more group identifiers, exactly as defined in your identity provider, including upper/lowercase spelling.'
      )
    ).toBeInTheDocument();

    let submitButton = screen.getByRole('button', { name: 'OK' });
    fireEvent.change(input, {
      target: { value: 'group1, group2, group3' },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(within(section).queryByRole('progressbar')).toBeInTheDocument();
    });

    expect(input.readOnly).toBeTruthy();
    expect(submitButton).toBeDisabled();

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(
        within(section).queryByRole('progressbar')
      ).not.toBeInTheDocument();
    });
    expect(input).not.toBeInTheDocument();

    expect(
      await withMarkup(screen.findByText)(
        'Groups group1, group2, group3 have been bound to the role.'
      )
    ).toBeInTheDocument();

    fireEvent.click(within(section).getByRole('button', { name: 'Add' }));

    input = within(section).getByPlaceholderText(
      'e.g. subject1, subject2, subject3'
    ) as HTMLInputElement;
    submitButton = screen.getByRole('button', { name: 'OK' });
    fireEvent.change(input, {
      target: { value: 'group1' },
    });

    fireEvent.click(submitButton);

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(input).not.toBeInTheDocument();
    });

    expect(
      await withMarkup(screen.findByText)(
        'Group group1 has been bound to the role.'
      )
    ).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('can delete subjects', async () => {
    jest.useFakeTimers();
    const onDeleteMockFn = jest.fn(() => {
      // eslint-disable-next-line no-magic-numbers
      return new Promise<void>((resolve) => setTimeout(resolve, 1000));
    });

    render(
      getComponent({
        namespace: 'org-test',
        permissions: defaultPermissions,
        groups: {
          'test-group1': {
            name: 'test-group1',
            isEditable: true,
            roleBindings: [],
          },
          'test-group2': {
            name: 'test-group2',
            isEditable: false,
            roleBindings: [],
          },
        },
        users: {},
        serviceAccounts: {},
        roleName: 'test-role',
        onAdd: jest.fn(),
        onDelete: onDeleteMockFn,
      })
    );

    const subject = screen.getByLabelText('test-group1');
    const deleteButton = within(subject).getByTitle('Delete');

    fireEvent.click(deleteButton);

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(within(subject).queryByRole('progressbar')).toBeInTheDocument();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(
        within(subject).queryByRole('progressbar')
      ).not.toBeInTheDocument();
    });

    expect(
      await withMarkup(screen.findByText)(
        'The binding for group test-group1 has been removed.'
      )
    ).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('can cancel deleting subjects', async () => {
    const onDeleteMockFn = jest.fn();

    render(
      getComponent({
        namespace: 'org-test',
        permissions: defaultPermissions,
        groups: {
          'test-group1': {
            name: 'test-group1',
            isEditable: true,
            roleBindings: [],
          },
          'test-group2': {
            name: 'test-group2',
            isEditable: false,
            roleBindings: [],
          },
        },
        users: {},
        serviceAccounts: {},
        roleName: 'test-role',
        onAdd: jest.fn(),
        onDelete: onDeleteMockFn,
      })
    );

    const subject = screen.getByLabelText('test-group1');
    const deleteButton = within(subject).getByTitle('Delete');

    fireEvent.click(deleteButton);

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });
    expect(onDeleteMockFn).not.toHaveBeenCalled();
  });

  it('displays an error if adding subjects fails', async () => {
    const onAddMockfn = jest.fn(() => {
      return Promise.reject(
        new Error('There was a huge error. Abort the mission.')
      );
    });

    render(
      getComponent({
        namespace: 'org-test',
        permissions: defaultPermissions,
        groups: {},
        users: {},
        serviceAccounts: {},
        roleName: 'test-role',
        onAdd: onAddMockfn,
        onDelete: jest.fn(),
      })
    );

    const section = screen.getByLabelText('Groups');
    fireEvent.click(within(section).getByRole('button', { name: 'Add' }));

    const input = within(section).getByPlaceholderText(
      'e.g. subject1, subject2, subject3'
    ) as HTMLInputElement;

    const submitButton = screen.getByRole('button', { name: 'OK' });
    fireEvent.change(input, {
      target: { value: 'group1, group2, group3' },
    });

    fireEvent.click(submitButton);

    expect(
      await withMarkup(screen.findByText)(
        'Could not bind groups group1, group2, group3 :'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/There was a huge error. Abort the mission./)
    ).toBeInTheDocument();

    fireEvent.change(input, {
      target: { value: 'group1' },
    });

    fireEvent.click(submitButton);

    expect(
      await withMarkup(screen.findByText)('Could not bind group group1 :')
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/There was a huge error. Abort the mission./)
    ).toHaveLength(2);
  });

  it('displays an error if deleting subjects fails', async () => {
    const onDeleteMockFn = jest.fn(() => {
      return Promise.reject(
        new Error('There was a huge error. Abort the mission.')
      );
    });

    render(
      getComponent({
        namespace: 'org-test',
        permissions: defaultPermissions,
        groups: {
          'test-group1': {
            name: 'test-group1',
            isEditable: true,
            roleBindings: [],
          },
          'test-group2': {
            name: 'test-group2',
            isEditable: false,
            roleBindings: [],
          },
        },
        users: {},
        serviceAccounts: {},
        roleName: 'test-role',
        onAdd: jest.fn(),
        onDelete: onDeleteMockFn,
      })
    );

    const subject = screen.getByLabelText('test-group1');
    const deleteButton = within(subject).getByTitle('Delete');

    fireEvent.click(deleteButton);

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Remove'));

    expect(
      await withMarkup(screen.findByText)(
        'Could not delete binding for group test-group1 .'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/There was a huge error. Abort the mission./)
    ).toBeInTheDocument();
  });

  it('closes the input if trying to add an empty subject', () => {
    const onAddMockfn = jest.fn();

    render(
      getComponent({
        namespace: 'org-test',
        permissions: defaultPermissions,
        groups: {},
        users: {},
        serviceAccounts: {},
        roleName: 'test-role',
        onAdd: onAddMockfn,
        onDelete: jest.fn(),
      })
    );

    const section = screen.getByLabelText('Groups');
    fireEvent.click(within(section).getByRole('button', { name: 'Add' }));

    const input = within(section).getByPlaceholderText(
      'e.g. subject1, subject2, subject3'
    ) as HTMLInputElement;

    const submitButton = screen.getByRole('button', { name: 'OK' });
    fireEvent.change(input, {
      target: { value: '' },
    });

    fireEvent.click(submitButton);

    expect(input).not.toBeInTheDocument();
    expect(onAddMockfn).not.toHaveBeenCalled();
  });

  it('does not allow adding a subject that is already in the list', () => {
    const onAddMockfn = jest.fn();

    render(
      getComponent({
        namespace: 'org-test',
        permissions: defaultPermissions,
        groups: {
          'test-group1': {
            name: 'test-group1',
            isEditable: true,
            roleBindings: [],
          },
        },
        users: {},
        serviceAccounts: {},
        roleName: 'test-role',
        onAdd: onAddMockfn,
        onDelete: jest.fn(),
      })
    );

    const section = screen.getByLabelText('Groups');
    fireEvent.click(within(section).getByRole('button', { name: 'Add' }));

    const input = within(section).getByPlaceholderText(
      'e.g. subject1, subject2, subject3'
    ) as HTMLInputElement;

    const submitButton = screen.getByRole('button', { name: 'OK' });
    fireEvent.change(input, {
      target: { value: 'test-group1' },
    });

    fireEvent.click(submitButton);

    expect(screen.getByText(`Subject 'test-group1' already exists.`));

    expect(input).toBeInTheDocument();
    expect(onAddMockfn).not.toHaveBeenCalled();

    fireEvent.change(input, {
      target: { value: '' },
    });

    expect(
      screen.queryByText(`Subject 'test-group1' already exists.`)
    ).not.toBeInTheDocument();
  });

  it('does not allow adding the same subject multiple times', () => {
    const onAddMockfn = jest.fn();

    render(
      getComponent({
        namespace: 'org-test',
        permissions: defaultPermissions,
        groups: {
          'test-group1': {
            name: 'test-group1',
            isEditable: true,
            roleBindings: [],
          },
        },
        users: {},
        serviceAccounts: {},
        roleName: 'test-role',
        onAdd: onAddMockfn,
        onDelete: jest.fn(),
      })
    );

    const section = screen.getByLabelText('Groups');
    fireEvent.click(within(section).getByRole('button', { name: 'Add' }));

    const input = within(section).getByPlaceholderText(
      'e.g. subject1, subject2, subject3'
    ) as HTMLInputElement;

    const submitButton = screen.getByRole('button', { name: 'OK' });
    fireEvent.change(input, {
      target: {
        value:
          'test-group1 test-group2 test-group1 test-group1 test-group3 test-group2',
      },
    });

    fireEvent.click(submitButton);

    expect(
      screen.getByText(`Subjects 'test-group1', 'test-group2' already exist.`)
    );

    expect(input).toBeInTheDocument();
    expect(onAddMockfn).not.toHaveBeenCalled();

    fireEvent.change(input, {
      target: { value: '' },
    });

    expect(
      screen.queryByText(`Subjects 'test-group1', 'test-group2' already exist.`)
    ).not.toBeInTheDocument();
  });

  it('gives the user suggestions for re-using existing service accounts', async () => {
    jest.useFakeTimers();

    nock(window.config.mapiEndpoint)
      .get('/api/v1/namespaces/org-test/serviceaccounts/')
      .reply(StatusCodes.Ok, corev1Mocks.serviceAccountList);

    render(
      getComponent({
        namespace: 'org-test',
        permissions: defaultPermissions,
        groups: {},
        users: {},
        serviceAccounts: {},
        roleName: 'test-role',
        onAdd: jest.fn(),
        onDelete: jest.fn(),
      })
    );

    const section = screen.getByLabelText('Service accounts');
    fireEvent.click(within(section).getByRole('button', { name: 'Add' }));

    const input = within(section).getByPlaceholderText(
      'e.g. subject1, subject2, subject3'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'random auto' } });

    act(() => {
      jest.runAllTimers();
    });

    const selectedSuggestion = await screen.findByText('automation');
    expect(selectedSuggestion).toBeInTheDocument();
    // An existing account is not shown.
    await waitFor(() =>
      expect(screen.queryByText('random')).not.toBeInTheDocument()
    );

    fireEvent.click(selectedSuggestion);

    await waitFor(() => expect(input).toHaveValue('random automation, '));

    jest.useRealTimers();
  });
});
