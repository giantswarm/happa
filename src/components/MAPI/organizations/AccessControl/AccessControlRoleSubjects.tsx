import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import React, { useEffect, useReducer } from 'react';
import useSWR from 'swr';
import AccessControlSubjectSet, {
  IAccessControlSubjectSetItem,
} from 'UI/Display/MAPI/AccessControl/AccessControlSubjectSet';
import AccessControlSubjectSetItem from 'UI/Display/MAPI/AccessControl/AccessControlSubjectSetItem';
import * as ui from 'UI/Display/MAPI/AccessControl/types';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClient } from 'utils/hooks/useHttpClient';

import {
  canListSubjects,
  fetchServiceAccountSuggestions,
  fetchServiceAccountSuggestionsKey,
  formatSubjectType,
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

const mapValueToSetItem =
  (stateValue: IStateValue) =>
  (value: ui.IAccessControlRoleSubjectItem): IAccessControlSubjectSetItem => {
    const isLoading = stateValue.namesLoading.includes(value.name);

    return {
      name: value.name,
      isEditable: value.isEditable,
      isLoading,
    };
  };

const compareSubjects = (
  a: ui.IAccessControlRoleSubjectItem,
  b: ui.IAccessControlRoleSubjectItem
) => a.name.localeCompare(b.name);

const formatSubjectNames = (subjectNames: string[]): React.ReactNode => {
  return subjectNames.map((name, idx, arr) => (
    <React.Fragment key={name}>
      <code>{name}</code>
      {idx !== arr.length - 1 && ', '}
    </React.Fragment>
  ));
};

const getStatusMessages = (
  type: ui.AccessControlSubjectTypes,
  statuses: ui.IAccessControlRoleSubjectStatus[]
): React.ReactNode[] => {
  const subjectNamesByStatus = statuses.reduce<
    Record<ui.AccessControlRoleSubjectStatus, string[]>
  >(
    (acc, status) => {
      acc[status.status].push(status.name);

      return acc;
    },
    {
      [ui.AccessControlRoleSubjectStatus.Created]: [],
      [ui.AccessControlRoleSubjectStatus.Bound]: [],
      [ui.AccessControlRoleSubjectStatus.Updated]: [],
    }
  );

  const messages: React.ReactNode[] = [];
  for (const [status, subjectNames] of Object.entries(subjectNamesByStatus)) {
    if (subjectNames.length === 0) continue;

    const key = subjectNames.join();

    switch (status) {
      case ui.AccessControlRoleSubjectStatus.Created:
        if (subjectNames.length === 1) {
          messages.push(
            <React.Fragment key={key}>
              {formatSubjectType(type, subjectNames.length !== 1)}{' '}
              {formatSubjectNames(subjectNames)} has been created and bound to
              the role.
            </React.Fragment>
          );
        } else {
          messages.push(
            <React.Fragment key={key}>
              {formatSubjectType(type, subjectNames.length !== 1)}{' '}
              {formatSubjectNames(subjectNames)} have been created and bound to
              the role.
            </React.Fragment>
          );
        }

        break;

      case ui.AccessControlRoleSubjectStatus.Bound:
        if (subjectNames.length === 1) {
          messages.push(
            <React.Fragment key={key}>
              {formatSubjectType(type, subjectNames.length !== 1)}{' '}
              {formatSubjectNames(subjectNames)} has been bound to the role.
            </React.Fragment>
          );
        } else {
          messages.push(
            <React.Fragment key={key}>
              {formatSubjectType(type, subjectNames.length !== 1)}{' '}
              {formatSubjectNames(subjectNames)} have been bound to the role.
            </React.Fragment>
          );
        }

        break;
    }
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
  ) => Promise<ui.IAccessControlRoleSubjectStatus[]>;
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

  const handleAdd =
    (type: ui.AccessControlSubjectTypes) => async (values: string[]) => {
      if (values.length < 1) {
        dispatch({ type: 'stopAdding', subjectType: type });

        return;
      }

      try {
        dispatch({ type: 'startLoading', subjectType: type });
        const statuses = await onAdd(type, values);
        dispatch({ type: 'stopAdding', subjectType: type });

        const messages = getStatusMessages(type, statuses);

        for (const message of messages) {
          new FlashMessage(message, messageType.SUCCESS, messageTTL.MEDIUM);
        }
      } catch (err) {
        let message: React.ReactNode = {};
        if (type === ui.AccessControlSubjectTypes.ServiceAccount) {
          message = (
            <>
              Could not create{' '}
              {formatSubjectType(type, values.length !== 1).toLowerCase()}{' '}
              {formatSubjectNames(values)} :
            </>
          );
        } else {
          message = (
            <>
              Could not bind{' '}
              {formatSubjectType(type, values.length !== 1).toLowerCase()}{' '}
              {formatSubjectNames(values)} :
            </>
          );
        }

        const errorMessage = (err as Error).message;

        new FlashMessage(
          message,
          messageType.ERROR,
          messageTTL.LONG,
          errorMessage
        );

        ErrorReporter.getInstance().notify(err as Error);
      } finally {
        dispatch({ type: 'stopLoading', subjectType: type });
      }
    };

  const handleDeleting =
    (type: ui.AccessControlSubjectTypes) => async (name: string) => {
      try {
        dispatch({
          type: 'startLoading',
          subjectType: type,
          subjectName: name,
        });
        await onDelete(type, name);

        const subjectType = formatSubjectType(type).toLowerCase();
        const deletionMessage = (
          <>
            The binding for {subjectType} <code>{name}</code> has been removed.
          </>
        );

        new FlashMessage(
          deletionMessage,
          messageType.SUCCESS,
          messageTTL.SHORT
        );
      } catch (err) {
        const subjectType = formatSubjectType(type).toLowerCase();
        const deletionMessage = (
          <>
            Could not delete binding for {subjectType} <code>{name}</code> .
          </>
        );

        new FlashMessage(
          deletionMessage,
          messageType.ERROR,
          messageTTL.LONG,
          (err as Error).message
        );

        ErrorReporter.getInstance().notify(err as Error);
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

  const groupCollection = Object.values(groups).sort(compareSubjects);
  const userCollection = Object.values(users).sort(compareSubjects);
  const serviceAccountCollection =
    Object.values(serviceAccounts).sort(compareSubjects);

  const groupType = state[ui.AccessControlSubjectTypes.Group];
  const userType = state[ui.AccessControlSubjectTypes.User];
  const serviceAccountType = state[ui.AccessControlSubjectTypes.ServiceAccount];

  const groupPermissions =
    permissions.subjects[ui.AccessControlSubjectTypes.Group];
  const userPermissions =
    permissions.subjects[ui.AccessControlSubjectTypes.User];
  const serviceAccountPermissions =
    permissions.subjects[ui.AccessControlSubjectTypes.ServiceAccount];

  const client = useHttpClient();
  const auth = useAuthProvider();

  const serviceAccountSuggestionsKey =
    serviceAccountPermissions.canBind &&
    canListSubjects(serviceAccountCollection, serviceAccountPermissions)
      ? fetchServiceAccountSuggestionsKey(namespace)
      : null;

  const {
    data: serviceAccountSuggestions,
    error: serviceAccountSuggestionsError,
  } = useSWR<string[], GenericResponseError>(serviceAccountSuggestionsKey, () =>
    fetchServiceAccountSuggestions(client, auth, namespace)
  );

  useEffect(() => {
    if (serviceAccountSuggestionsError) {
      ErrorReporter.getInstance().notify(serviceAccountSuggestionsError);
    }
  }, [serviceAccountSuggestionsError]);

  const validateServiceAccountSubjects = (values: string[]): string => {
    if (serviceAccountPermissions.canCreate) return '';

    if (!serviceAccountSuggestions) {
      return `You don't have the required permissions to create new service accounts. You can only bind existing ones.`;
    }

    const uniqueSuggestions = new Set(serviceAccountSuggestions);
    if (values.some((v) => !uniqueSuggestions.has(v))) {
      return `You don't have the required permissions to create new service accounts. You can only bind existing ones.`;
    }

    return '';
  };

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
            onValidate={validateServiceAccountSubjects}
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

export default AccessControlRoleSubjects;
