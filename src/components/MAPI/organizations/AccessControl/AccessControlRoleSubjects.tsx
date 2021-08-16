import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClient } from 'lib/hooks/useHttpClient';
import { GenericResponse } from 'model/clients/GenericResponse';
import PropTypes from 'prop-types';
import React, { useEffect, useReducer } from 'react';
import useSWR from 'swr';
import AccessControlSubjectSet, {
  IAccessControlSubjectSetItem,
} from 'UI/Display/MAPI/AccessControl/AccessControlSubjectSet';
import AccessControlSubjectSetItem from 'UI/Display/MAPI/AccessControl/AccessControlSubjectSetItem';
import * as ui from 'UI/Display/MAPI/AccessControl/types';

import {
  canListSubjects,
  fetchServiceAccountSuggestions,
  fetchServiceAccountSuggestionsKey,
  getUserNameParts,
} from './utils';

interface IStateValue {
  isAdding: boolean;
  isLoading: boolean;
  namesLoading: string[];
}

type State = Record<ui.AccessControlSubjectTypes, IStateValue>;

interface IAction {
  type: 'startAdding' | 'stopAdding' | 'startLoading' | 'stopLoading' | 'reset';
  subjectType: ui.AccessControlSubjectTypes;
  subjectName?: string;
}

const initialState: State = {
  [ui.AccessControlSubjectTypes.Group]: {
    isAdding: false,
    isLoading: false,
    namesLoading: [],
  },
  [ui.AccessControlSubjectTypes.User]: {
    isAdding: false,
    isLoading: false,
    namesLoading: [],
  },
  [ui.AccessControlSubjectTypes.ServiceAccount]: {
    isAdding: false,
    isLoading: false,
    namesLoading: [],
  },
};

const reducer: React.Reducer<State, IAction> = (state, action) => {
  const currSubject = state[action.subjectType];

  switch (action.type) {
    case 'startAdding':
      return {
        ...state,
        [action.subjectType]: {
          ...currSubject,
          isAdding: true,
        },
      };

    case 'stopAdding':
      return {
        ...state,
        [action.subjectType]: {
          ...currSubject,
          isAdding: false,
        },
      };

    case 'startLoading':
      if (action.subjectName) {
        const namesLoading = [...currSubject.namesLoading];
        if (!namesLoading.includes(action.subjectName)) {
          namesLoading.push(action.subjectName);
        }

        return {
          ...state,
          [action.subjectType]: {
            ...currSubject,
            namesLoading,
          },
        };
      }

      return {
        ...state,
        [action.subjectType]: {
          ...currSubject,
          isLoading: true,
        },
      };

    case 'stopLoading':
      if (action.subjectName) {
        const namesLoading = currSubject.namesLoading.filter(
          (name) => name !== action.subjectName
        );

        return {
          ...state,
          [action.subjectType]: {
            ...currSubject,
            namesLoading,
          },
        };
      }

      return {
        ...state,
        [action.subjectType]: {
          ...currSubject,
          isLoading: false,
        },
      };

    case 'reset':
      return {
        ...state,
        [action.subjectType]: {
          ...initialState[action.subjectType],
        },
      };

    default:
      return state;
  }
};

const mapValueToSetItem = (stateValue: IStateValue) => (
  value: ui.IAccessControlRoleSubjectItem
): IAccessControlSubjectSetItem => {
  const isLoading = stateValue.namesLoading.includes(value.name);

  return {
    name: value.name,
    isEditable: value.isEditable,
    isLoading,
  };
};

const formatAccountNames = (accountNames: string[]): string => {
  return accountNames
    .map((accountName) => `<code>${accountName}</code>`)
    .join(', ');
};

const getBindServiceAccountSuccessMessages = (
  accounts: ui.IAccessControlServiceAccount[]
): string[] => {
  const accountsByStatus = {} as Record<
    ui.AccessControlRoleSubjectStatus,
    string[]
  >;
  for (const account of accounts) {
    if (!accountsByStatus.hasOwnProperty(account.status)) {
      accountsByStatus[account.status] = [];
    }
    accountsByStatus[account.status].push(account.name);
  }

  const messages = [];

  for (const [status, filteredAccounts] of Object.entries(accountsByStatus)) {
    const isCreatedAccounts =
      status === ui.AccessControlRoleSubjectStatus.Created;
    const isUpdatedAccounts =
      status === ui.AccessControlRoleSubjectStatus.Updated;

    let message = '';
    switch (true) {
      case isCreatedAccounts && filteredAccounts.length > 1:
        message = `Service accounts ${formatAccountNames(
          filteredAccounts
        )} have been created and bound to the role.`;
        break;
      case isCreatedAccounts && filteredAccounts.length === 1:
        message = `Service account ${formatAccountNames(
          filteredAccounts
        )} has been created and bound to the role.`;
        break;
      case isUpdatedAccounts && filteredAccounts.length > 1:
        message = `Service accounts ${formatAccountNames(
          filteredAccounts
        )} have been bound to the role.`;
        break;
      case isUpdatedAccounts && filteredAccounts.length === 1:
        message = `Service account ${formatAccountNames(
          filteredAccounts
        )} has been bound to the role.`;
        break;
    }
    messages.push(message);
  }

  return messages;
};

interface IAccessControlRoleSubjectsProps
  extends Pick<
      ui.IAccessControlRoleItem,
      'groups' | 'users' | 'serviceAccounts'
    >,
    React.ComponentPropsWithoutRef<typeof Box> {
  roleName: string;
  namespace: string;
  permissions: ui.IAccessControlPermissions;
  onAdd: (
    type: ui.AccessControlSubjectTypes,
    names: string[]
  ) => Promise<ui.IAccessControlServiceAccount[]>;
  onDelete: (type: ui.AccessControlSubjectTypes, name: string) => Promise<void>;
}

const AccessControlRoleSubjects: React.FC<IAccessControlRoleSubjectsProps> = ({
  namespace,
  roleName,
  groups,
  users,
  serviceAccounts,
  permissions,
  onAdd,
  onDelete,
  ...props
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleToggleAdding = (type: ui.AccessControlSubjectTypes) => () => {
    if (state[type].isAdding) {
      dispatch({ type: 'stopAdding', subjectType: type });
    } else {
      dispatch({ type: 'startAdding', subjectType: type });
    }
  };

  const handleAdd = (type: ui.AccessControlSubjectTypes) => async (
    values: string[]
  ) => {
    if (values.length < 1) {
      dispatch({ type: 'stopAdding', subjectType: type });

      return;
    }
    const isServiceAccount =
      type === ui.AccessControlSubjectTypes.ServiceAccount;

    try {
      dispatch({ type: 'startLoading', subjectType: type });
      const accounts = await onAdd(type, values);
      dispatch({ type: 'stopAdding', subjectType: type });

      if (isServiceAccount) {
        const messages = getBindServiceAccountSuccessMessages(accounts);

        for (const message of messages) {
          if (message.length > 0) {
            new FlashMessage(message, messageType.SUCCESS, messageTTL.MEDIUM);
          }
        }
      } else {
        let message = '';
        if (values.length > 1) {
          message = 'Subjects added successfully.';
        } else {
          message = 'Subject added successfully.';
        }

        new FlashMessage(message, messageType.SUCCESS, messageTTL.MEDIUM);
      }
    } catch (err: unknown) {
      let message = '';
      switch (true) {
        case isServiceAccount && values.length > 1:
          message = `Could not create service accounts ${formatAccountNames(
            values
          )} :`;
          break;
        case isServiceAccount && values.length === 1:
          message = `Could not create service account ${formatAccountNames(
            values
          )} :`;
          break;
        case values.length > 1:
          message = 'Could not add subjects:';
          break;
        default:
          message = 'Could not add subject:';
      }
      const errorMessage = (err as Error).message;

      new FlashMessage(
        message,
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err as never);
    } finally {
      dispatch({ type: 'stopLoading', subjectType: type });
    }
  };

  const handleDeleting = (type: ui.AccessControlSubjectTypes) => async (
    name: string
  ) => {
    try {
      dispatch({
        type: 'startLoading',
        subjectType: type,
        subjectName: name,
      });
      await onDelete(type, name);

      let deletionMessage = '';
      if (type === ui.AccessControlSubjectTypes.ServiceAccount) {
        deletionMessage = `The binding for service account <code>${name}</code> has been removed.`;
      } else {
        deletionMessage = `Subject <code>${name}</code> deleted successfully.`;
      }

      new FlashMessage(deletionMessage, messageType.SUCCESS, messageTTL.SHORT);
    } catch (err: unknown) {
      const message = (err as Error).message;

      new FlashMessage(
        `Could not delete subject ${name}:`,
        messageType.ERROR,
        messageTTL.LONG,
        message
      );

      ErrorReporter.getInstance().notify(err as never);
    } finally {
      dispatch({ type: 'stopLoading', subjectType: type, subjectName: name });
    }
  };

  useEffect(() => {
    return () => {
      dispatch({
        type: 'reset',
        subjectType: ui.AccessControlSubjectTypes.Group,
      });
      dispatch({
        type: 'reset',
        subjectType: ui.AccessControlSubjectTypes.User,
      });
      dispatch({
        type: 'reset',
        subjectType: ui.AccessControlSubjectTypes.ServiceAccount,
      });
    };
  }, [roleName]);

  const client = useHttpClient();
  const auth = useAuthProvider();

  const {
    data: serviceAccountSuggestions,
    error: serviceAccountSuggestionsError,
  } = useSWR<string[], GenericResponse>(
    fetchServiceAccountSuggestionsKey(namespace),
    () => fetchServiceAccountSuggestions(client, auth, namespace)
  );

  useEffect(() => {
    if (serviceAccountSuggestionsError) {
      ErrorReporter.getInstance().notify(serviceAccountSuggestionsError);
    }
  }, [serviceAccountSuggestionsError]);

  const groupCollection = Object.values(groups);
  const userCollection = Object.values(users);
  const serviceAccountCollection = Object.values(serviceAccounts);

  const groupType = state[ui.AccessControlSubjectTypes.Group];
  const userType = state[ui.AccessControlSubjectTypes.User];
  const serviceAccountType = state[ui.AccessControlSubjectTypes.ServiceAccount];

  const groupPermissions =
    permissions.subjects[ui.AccessControlSubjectTypes.Group];
  const userPermissions =
    permissions.subjects[ui.AccessControlSubjectTypes.User];
  const serviceAccountPermissions =
    permissions.subjects[ui.AccessControlSubjectTypes.ServiceAccount];

  return (
    <Box direction='column' gap='medium' pad={{ top: 'small' }} {...props}>
      {canListSubjects(groupCollection, groupPermissions) && (
        <Box gap='small' direction='column' aria-label='Groups'>
          <Box>
            <Text size='medium' weight='bold'>
              <i className='fa fa-group' /> Groups
            </Text>
          </Box>
          <AccessControlSubjectSet
            items={groupCollection.map(mapValueToSetItem(groupType))}
            permissions={groupPermissions}
            renderItem={(params) => (
              <AccessControlSubjectSetItem
                aria-label={params.name}
                deleteTooltipMessage="Remove this group's binding to this role"
                {...params}
              />
            )}
            onAdd={handleAdd(ui.AccessControlSubjectTypes.Group)}
            onToggleAdding={handleToggleAdding(
              ui.AccessControlSubjectTypes.Group
            )}
            onDeleteItem={handleDeleting(ui.AccessControlSubjectTypes.Group)}
            isAdding={groupType.isAdding}
            isLoading={groupType.isLoading}
          />
          {groupType.isAdding && (
            <Box>
              <Text>
                Enter one or more group identifiers, exactly as defined in your
                identity provider, including upper/lowercase spelling.
              </Text>
            </Box>
          )}
        </Box>
      )}

      {canListSubjects(userCollection, userPermissions) && (
        <Box gap='small' direction='column' aria-label='Users'>
          <Box>
            <Text size='medium' weight='bold'>
              <i className='fa fa-user' /> Users
            </Text>
          </Box>
          <AccessControlSubjectSet
            items={userCollection.map(mapValueToSetItem(userType))}
            permissions={userPermissions}
            renderItem={(params) => {
              const [name, domain] = getUserNameParts(params.name);

              return (
                <AccessControlSubjectSetItem
                  aria-label={params.name}
                  deleteTooltipMessage="Remove this user's binding to this role"
                  {...params}
                  name={
                    <Box direction='row'>
                      <Text color='text-weak'>{name}</Text>
                      {domain && <Text color='text-xweak'>{`@${domain}`}</Text>}
                    </Box>
                  }
                />
              );
            }}
            onAdd={handleAdd(ui.AccessControlSubjectTypes.User)}
            onToggleAdding={handleToggleAdding(
              ui.AccessControlSubjectTypes.User
            )}
            onDeleteItem={handleDeleting(ui.AccessControlSubjectTypes.User)}
            isAdding={userType.isAdding}
            isLoading={userType.isLoading}
          />
          {userType.isAdding && (
            <Box>
              <Text>
                Enter one or more email addresses, exactly as defined in your
                identity provider, including upper/lowercase spelling.
              </Text>
            </Box>
          )}
        </Box>
      )}

      {canListSubjects(serviceAccountCollection, serviceAccountPermissions) && (
        <Box gap='small' direction='column' aria-label='Service accounts'>
          <Box>
            <Text size='medium' weight='bold'>
              <i className='fa fa-service-account' /> Service accounts
            </Text>
          </Box>
          <AccessControlSubjectSet
            items={serviceAccountCollection.map(
              mapValueToSetItem(serviceAccountType)
            )}
            permissions={serviceAccountPermissions}
            renderItem={(params) => (
              <AccessControlSubjectSetItem
                aria-label={params.name}
                deleteTooltipMessage="Remove this service account's binding to this role"
                deleteConfirmationMessage={
                  <Box gap='small' direction='column'>
                    <Text>
                      Remove the binding between service account{' '}
                      <code>{params.name}</code> and role{' '}
                      <code>{roleName}</code> ?
                    </Text>
                    <Text>The service account will stay.</Text>
                  </Box>
                }
                {...params}
              />
            )}
            onAdd={handleAdd(ui.AccessControlSubjectTypes.ServiceAccount)}
            onToggleAdding={handleToggleAdding(
              ui.AccessControlSubjectTypes.ServiceAccount
            )}
            onDeleteItem={handleDeleting(
              ui.AccessControlSubjectTypes.ServiceAccount
            )}
            isAdding={serviceAccountType.isAdding}
            isLoading={serviceAccountType.isLoading}
            inputSuggestions={serviceAccountSuggestions}
          />
          {serviceAccountType.isAdding && (
            <Box>
              <Text>
                Enter one or more account identifiers, including upper/lowercase
                spelling.
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

AccessControlRoleSubjects.propTypes = {
  roleName: PropTypes.string.isRequired,
  // @ts-expect-error
  groups: PropTypes.object.isRequired,
  // @ts-expect-error
  users: PropTypes.object.isRequired,
  // @ts-expect-error
  serviceAccounts: PropTypes.object.isRequired,
  namespace: PropTypes.string.isRequired,
  permissions: (PropTypes.object as PropTypes.Requireable<ui.IAccessControlPermissions>)
    .isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default AccessControlRoleSubjects;
