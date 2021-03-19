import { Box, Text } from 'grommet';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React, { useEffect, useReducer } from 'react';
import AccessControlSubjectSet, {
  IAccessControlSubjectSetItem,
} from 'UI/Display/MAPI/AccessControl/AccessControlSubjectSet';

import {
  AccessControlSubjectTypes,
  IAccessControlRoleItem,
  IAccessControlRoleSubjectItem,
} from '../../UI/Display/MAPI/AccessControl/types';
import { parseSubjects } from './utils';

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
  onAdd: (type: AccessControlSubjectTypes, names: string[]) => Promise<void>;
  onDelete: (type: AccessControlSubjectTypes, name: string) => Promise<void>;
}

const AccessControlRoleSubjects: React.FC<IAccessControlRoleSubjectsProps> = ({
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
    newValue: string
  ) => {
    const values = parseSubjects(newValue);
    if (values.length < 1) {
      dispatch({ type: 'stopAdding', subjectType: type });

      return;
    }

    try {
      dispatch({ type: 'startLoading', subjectType: type });
      await onAdd(type, values);
      dispatch({ type: 'stopAdding', subjectType: type });

      new FlashMessage(
        'Subjects added successfully.',
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err: unknown) {
      const message = (err as Error).message;

      new FlashMessage(
        'Could not add subject:',
        messageType.ERROR,
        messageTTL.LONG,
        message
      );
    } finally {
      dispatch({ type: 'stopLoading', subjectType: type });
    }
  };

  const handleDeleting = (type: AccessControlSubjectTypes) => async (
    name: string
  ) => {
    try {
      dispatch({ type: 'startLoading', subjectType: type, subjectName: name });
      await onDelete(type, name);

      new FlashMessage(
        'Subject deleted successfully.',
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err: unknown) {
      const message = (err as Error).message;

      new FlashMessage(
        'Could not delete subject:',
        messageType.ERROR,
        messageTTL.LONG,
        message
      );
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

  return (
    <Box direction='column' gap='medium' pad={{ top: 'small' }} {...props}>
      <Box gap='small' direction='column'>
        <Box>
          <Text size='medium' weight='bold'>
            <i className='fa fa-group' /> Groups
          </Text>
        </Box>
        <AccessControlSubjectSet
          items={groups.map(
            mapValueToSetItem(state[AccessControlSubjectTypes.Group])
          )}
          onAdd={handleAdd(AccessControlSubjectTypes.Group)}
          onToggleAdding={handleToggleAdding(AccessControlSubjectTypes.Group)}
          onDeleteItem={handleDeleting(AccessControlSubjectTypes.Group)}
          isAdding={state[AccessControlSubjectTypes.Group].isAdding}
          isLoading={state[AccessControlSubjectTypes.Group].isLoading}
        />
      </Box>
      <Box gap='small' direction='column'>
        <Box>
          <Text size='medium' weight='bold'>
            <i className='fa fa-user' /> Users
          </Text>
        </Box>
        <AccessControlSubjectSet
          items={users.map(
            mapValueToSetItem(state[AccessControlSubjectTypes.User])
          )}
          onAdd={handleAdd(AccessControlSubjectTypes.User)}
          onToggleAdding={handleToggleAdding(AccessControlSubjectTypes.User)}
          onDeleteItem={handleDeleting(AccessControlSubjectTypes.User)}
          isAdding={state[AccessControlSubjectTypes.User].isAdding}
          isLoading={state[AccessControlSubjectTypes.User].isLoading}
        />
      </Box>
      <Box gap='small' direction='column'>
        <Box>
          <Text size='medium' weight='bold'>
            <i className='fa fa-service-account' /> Service accounts
          </Text>
        </Box>
        <AccessControlSubjectSet
          items={serviceAccounts.map(
            mapValueToSetItem(state[AccessControlSubjectTypes.ServiceAccount])
          )}
          onAdd={handleAdd(AccessControlSubjectTypes.ServiceAccount)}
          onToggleAdding={handleToggleAdding(
            AccessControlSubjectTypes.ServiceAccount
          )}
          onDeleteItem={handleDeleting(
            AccessControlSubjectTypes.ServiceAccount
          )}
          isAdding={state[AccessControlSubjectTypes.ServiceAccount].isAdding}
          isLoading={state[AccessControlSubjectTypes.ServiceAccount].isLoading}
        />
      </Box>
    </Box>
  );
};

AccessControlRoleSubjects.propTypes = {
  roleName: PropTypes.string.isRequired,
  // @ts-expect-error
  groups: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  // @ts-expect-error
  users: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  // @ts-expect-error
  serviceAccounts: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default AccessControlRoleSubjects;
