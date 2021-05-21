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

import {
  AccessControlSubjectTypes,
  IAccessControlRoleItem,
  IAccessControlRoleSubjectItem,
} from '../../../UI/Display/MAPI/AccessControl/types';
import {
  fetchServiceAccountSuggestions,
  fetchServiceAccountSuggestionsKey,
  getUserNameParts,
} from './utils';

interface IStateValue {
  isAdding: boolean;
  isLoading: boolean;
  namesLoading: string[];
}

type State = Record<AccessControlSubjectTypes, IStateValue>;

interface IAction {
  type: 'startAdding' | 'stopAdding' | 'startLoading' | 'stopLoading' | 'reset';
  subjectType: AccessControlSubjectTypes;
  subjectName?: string;
}

const initialState: State = {
  [AccessControlSubjectTypes.Group]: {
    isAdding: false,
    isLoading: false,
    namesLoading: [],
  },
  [AccessControlSubjectTypes.User]: {
    isAdding: false,
    isLoading: false,
    namesLoading: [],
  },
  [AccessControlSubjectTypes.ServiceAccount]: {
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
  value: IAccessControlRoleSubjectItem
): IAccessControlSubjectSetItem => {
  const isLoading = stateValue.namesLoading.includes(value.name);

  return {
    name: value.name,
    isEditable: value.isEditable,
    isLoading,
  };
};

interface IAccessControlRoleSubjectsProps
  extends Pick<IAccessControlRoleItem, 'groups' | 'users' | 'serviceAccounts'>,
    React.ComponentPropsWithoutRef<typeof Box> {
  roleName: string;
  namespace: string;
  onAdd: (type: AccessControlSubjectTypes, names: string[]) => Promise<void>;
  onDelete: (type: AccessControlSubjectTypes, name: string) => Promise<void>;
}

const AccessControlRoleSubjects: React.FC<IAccessControlRoleSubjectsProps> = ({
  namespace,
  roleName,
  groups,
  users,
  serviceAccounts,
  onAdd,
  onDelete,
  ...props
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleToggleAdding = (type: AccessControlSubjectTypes) => () => {
    if (state[type].isAdding) {
      dispatch({ type: 'stopAdding', subjectType: type });
    } else {
      dispatch({ type: 'startAdding', subjectType: type });
    }
  };

  const handleAdd = (type: AccessControlSubjectTypes) => async (
    values: string[]
  ) => {
    if (values.length < 1) {
      dispatch({ type: 'stopAdding', subjectType: type });

      return;
    }

    try {
      dispatch({ type: 'startLoading', subjectType: type });
      await onAdd(type, values);
      dispatch({ type: 'stopAdding', subjectType: type });

      let message = '';
      if (values.length > 1) {
        message = 'Subjects added successfully.';
      } else {
        message = 'Subject added successfully.';
      }

      new FlashMessage(message, messageType.SUCCESS, messageTTL.SHORT);
    } catch (err: unknown) {
      let message = '';
      if (values.length > 1) {
        message = 'Could not add subjects:';
      } else {
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

  const handleDeleting = (type: AccessControlSubjectTypes) => async (
    name: string
  ) => {
    try {
      dispatch({
        type: 'startLoading',
        subjectType: type,
        subjectName: name,
      });
      await onDelete(type, name);

      new FlashMessage(
        `Subject ${name} deleted successfully.`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
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
      dispatch({ type: 'reset', subjectType: AccessControlSubjectTypes.Group });
      dispatch({ type: 'reset', subjectType: AccessControlSubjectTypes.User });
      dispatch({
        type: 'reset',
        subjectType: AccessControlSubjectTypes.ServiceAccount,
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

  const groupType = state[AccessControlSubjectTypes.Group];
  const userType = state[AccessControlSubjectTypes.User];
  const serviceAccountType = state[AccessControlSubjectTypes.ServiceAccount];

  return (
    <Box direction='column' gap='medium' pad={{ top: 'small' }} {...props}>
      <Box gap='small' direction='column' aria-label='Groups'>
        <Box>
          <Text size='medium' weight='bold'>
            <i className='fa fa-group' /> Groups
          </Text>
        </Box>
        <AccessControlSubjectSet
          items={Object.values(groups).map(mapValueToSetItem(groupType))}
          renderItem={(params) => (
            <AccessControlSubjectSetItem
              aria-label={params.name}
              deleteTooltipMessage="Remove this group's binding to this role"
              {...params}
            />
          )}
          onAdd={handleAdd(AccessControlSubjectTypes.Group)}
          onToggleAdding={handleToggleAdding(AccessControlSubjectTypes.Group)}
          onDeleteItem={handleDeleting(AccessControlSubjectTypes.Group)}
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
      <Box gap='small' direction='column' aria-label='Users'>
        <Box>
          <Text size='medium' weight='bold'>
            <i className='fa fa-user' /> Users
          </Text>
        </Box>
        <AccessControlSubjectSet
          items={Object.values(users).map(mapValueToSetItem(userType))}
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
          onAdd={handleAdd(AccessControlSubjectTypes.User)}
          onToggleAdding={handleToggleAdding(AccessControlSubjectTypes.User)}
          onDeleteItem={handleDeleting(AccessControlSubjectTypes.User)}
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
      <Box gap='small' direction='column' aria-label='Service accounts'>
        <Box>
          <Text size='medium' weight='bold'>
            <i className='fa fa-service-account' /> Service accounts
          </Text>
        </Box>
        <AccessControlSubjectSet
          items={Object.values(serviceAccounts).map(
            mapValueToSetItem(serviceAccountType)
          )}
          renderItem={(params) => (
            <AccessControlSubjectSetItem
              aria-label={params.name}
              deleteTooltipMessage="Remove this service account's binding to this role"
              {...params}
            />
          )}
          onAdd={handleAdd(AccessControlSubjectTypes.ServiceAccount)}
          onToggleAdding={handleToggleAdding(
            AccessControlSubjectTypes.ServiceAccount
          )}
          onDeleteItem={handleDeleting(
            AccessControlSubjectTypes.ServiceAccount
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
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default AccessControlRoleSubjects;
