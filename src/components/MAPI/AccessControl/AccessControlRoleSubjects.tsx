import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import React, { useReducer } from 'react';
import AccessControlSubjectSet, {
  IAccessControlSubjectSetItem,
} from 'UI/Display/MAPI/AccessControl/AccessControlSubjectSet';

import {
  AccessControlSubjects,
  IAccessControlRoleItem,
  IAccessControlRoleSubjectItem,
} from '../../UI/Display/MAPI/AccessControl/types';

interface IStateValue {
  isAdding: boolean;
  isLoading: boolean;
  namesLoading: string[];
}

type State = Record<AccessControlSubjects, IStateValue>;

interface IAction {
  type: 'toggleAdding' | 'startLoading' | 'stopLoading';
  subjectType: AccessControlSubjects;
  subjectName?: string;
}

const initialState: State = {
  [AccessControlSubjects.Group]: {
    isAdding: false,
    isLoading: false,
    namesLoading: [],
  },
  [AccessControlSubjects.User]: {
    isAdding: false,
    isLoading: false,
    namesLoading: [],
  },
  [AccessControlSubjects.ServiceAccount]: {
    isAdding: false,
    isLoading: false,
    namesLoading: [],
  },
};

const reducer: React.Reducer<State, IAction> = (state, action) => {
  const currSubject = state[action.subjectType];

  switch (action.type) {
    case 'toggleAdding':
      return {
        ...state,
        [action.subjectType]: {
          ...currSubject,
          isAdding: !currSubject.isAdding,
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
  onAdd: (type: AccessControlSubjects, names: string[]) => Promise<void>;
  onDelete: (type: AccessControlSubjects, name: string) => Promise<void>;
}

const AccessControlRoleSubjects: React.FC<IAccessControlRoleSubjectsProps> = ({
  groups,
  onAdd,
  onDelete,
  ...props
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleToggleAdding = (type: AccessControlSubjects) => () => {
    dispatch({ type: 'toggleAdding', subjectType: type });
  };

  const handleAdd = (type: AccessControlSubjects) => async (
    newValue: string
  ) => {
    const desiredValue = newValue.trim();
    if (desiredValue.length < 1) {
      dispatch({ type: 'toggleAdding', subjectType: type });

      return;
    }

    const values = [desiredValue];

    try {
      dispatch({ type: 'startLoading', subjectType: type });
      await onAdd(type, values);
      dispatch({ type: 'toggleAdding', subjectType: type });
    } catch (err) {
      // TODO(axbarsan): Handle errors.
    } finally {
      dispatch({ type: 'stopLoading', subjectType: type });
    }
  };

  const handleDeleting = (type: AccessControlSubjects) => async (
    name: string
  ) => {
    try {
      dispatch({ type: 'startLoading', subjectType: type, subjectName: name });
      await onDelete(type, name);
    } catch (err) {
      // TODO(axbarsan): Handle errors.
    } finally {
      dispatch({ type: 'stopLoading', subjectType: type, subjectName: name });
    }
  };

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
            mapValueToSetItem(state[AccessControlSubjects.Group])
          )}
          onAdd={handleAdd(AccessControlSubjects.Group)}
          onToggleAdding={handleToggleAdding(AccessControlSubjects.Group)}
          onDeleteItem={handleDeleting(AccessControlSubjects.Group)}
          isAdding={state[AccessControlSubjects.Group].isAdding}
          isLoading={state[AccessControlSubjects.Group].isLoading}
        />
      </Box>
      <Box gap='small' direction='column'>
        <Box>
          <Text size='medium' weight='bold'>
            <i className='fa fa-user' /> Users
          </Text>
        </Box>
      </Box>
      <Box gap='small' direction='column'>
        <Box>
          <Text size='medium' weight='bold'>
            <i className='fa fa-service-account' /> Service accounts
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

AccessControlRoleSubjects.propTypes = {
  // @ts-expect-error
  groups: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default AccessControlRoleSubjects;
