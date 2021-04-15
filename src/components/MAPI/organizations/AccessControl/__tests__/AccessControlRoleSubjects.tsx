import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderWithTheme } from 'testUtils/renderUtils';

import AccessControlRoleSubjects from '../AccessControlRoleSubjects';

describe('AccessControlRoleSubjects', () => {
  it('renders without crashing', () => {
    renderWithTheme(AccessControlRoleSubjects, {
      groups: {},
      users: {},
      serviceAccounts: {},
      roleName: 'test-role',
      onAdd: jest.fn(),
      onDelete: jest.fn(),
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleSubjects>);
  });

  it('renders all provided subjects', () => {
    renderWithTheme(AccessControlRoleSubjects, {
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
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleSubjects>);

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
    renderWithTheme(AccessControlRoleSubjects, {
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
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleSubjects>);

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
    const onAddMockfn = jest.fn(() => {
      // eslint-disable-next-line no-magic-numbers
      return new Promise((resolve) => setTimeout(resolve, 1000));
    });

    renderWithTheme(AccessControlRoleSubjects, {
      groups: {},
      users: {},
      serviceAccounts: {},
      roleName: 'test-role',
      onAdd: onAddMockfn,
      onDelete: jest.fn(),
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleSubjects>);

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

    jest.runAllTimers();

    await waitFor(() => {
      expect(
        within(section).queryByRole('progressbar')
      ).not.toBeInTheDocument();
    });
    expect(input).not.toBeInTheDocument();

    expect(
      screen.getByText(/Subjects added successfully./)
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

    jest.runAllTimers();

    await waitFor(() => {
      expect(input).not.toBeInTheDocument();
    });

    screen.getByText(/Subject added successfully./);

    jest.useRealTimers();
  });

  it('can delete subjects', async () => {
    jest.useFakeTimers();
    const onDeleteMockFn = jest.fn(() => {
      // eslint-disable-next-line no-magic-numbers
      return new Promise((resolve) => setTimeout(resolve, 1000));
    });

    renderWithTheme(AccessControlRoleSubjects, {
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
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleSubjects>);

    const subject = screen.getByLabelText('test-group1');
    const deleteButton = within(subject).getByTitle('Delete');

    fireEvent.click(deleteButton);

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Yes, delete it'));

    await waitFor(() => {
      expect(within(subject).queryByRole('progressbar')).toBeInTheDocument();
    });

    jest.runAllTimers();

    await waitFor(() => {
      expect(
        within(subject).queryByRole('progressbar')
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(/Subject test-group1 deleted successfully./)
    ).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('can cancel deleting subjects', async () => {
    const onDeleteMockFn = jest.fn();

    renderWithTheme(AccessControlRoleSubjects, {
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
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleSubjects>);

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

    renderWithTheme(AccessControlRoleSubjects, {
      groups: {},
      users: {},
      serviceAccounts: {},
      roleName: 'test-role',
      onAdd: onAddMockfn,
      onDelete: jest.fn(),
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleSubjects>);

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
      await screen.findByText(/Could not add subjects:/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/There was a huge error. Abort the mission./)
    ).toBeInTheDocument();

    fireEvent.change(input, {
      target: { value: 'group1' },
    });

    fireEvent.click(submitButton);

    expect(
      await screen.findByText(/Could not add subject:/)
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

    renderWithTheme(AccessControlRoleSubjects, {
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
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleSubjects>);

    const subject = screen.getByLabelText('test-group1');
    const deleteButton = within(subject).getByTitle('Delete');

    fireEvent.click(deleteButton);

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Yes, delete it'));

    expect(
      await screen.findByText(/Could not delete subject test-group1/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/There was a huge error. Abort the mission./)
    ).toBeInTheDocument();
  });

  it('closes the input if trying to add an empty subject', () => {
    const onAddMockfn = jest.fn();

    renderWithTheme(AccessControlRoleSubjects, {
      groups: {},
      users: {},
      serviceAccounts: {},
      roleName: 'test-role',
      onAdd: onAddMockfn,
      onDelete: jest.fn(),
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleSubjects>);

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

    renderWithTheme(AccessControlRoleSubjects, {
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
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleSubjects>);

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

    renderWithTheme(AccessControlRoleSubjects, {
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
    } as React.ComponentPropsWithoutRef<typeof AccessControlRoleSubjects>);

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
});
