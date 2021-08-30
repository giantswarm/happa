import { Box } from 'grommet';
import React, { useState } from 'react';
import AccessControlSubjectAddForm from 'UI/Display/MAPI/AccessControl/AccessControlSubjectAddForm';

import { IAccessControlSubjectPermissions } from './types';

function gatherSubjectUsage(acc: Record<string, number>, currValue: string) {
  if (acc.hasOwnProperty(currValue)) {
    acc[currValue]++;
  } else {
    acc[currValue] = 1;
  }

  return acc;
}

export interface IAccessControlSubjectSetRenderer
  extends React.ComponentPropsWithoutRef<typeof Box> {
  name: string;
  isEditable: boolean;
  isLoading: boolean;
  isNewlyAdded: boolean;
  onDelete: () => void;
}

export interface IAccessControlSubjectSetItem {
  name: string;
  isEditable: boolean;
  isLoading: boolean;
}

interface IAccessControlSubjectSetProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  items: IAccessControlSubjectSetItem[];
  permissions: IAccessControlSubjectPermissions;
  renderItem: (params: IAccessControlSubjectSetRenderer) => React.ReactNode;
  onAdd: (values: string[]) => void;
  onToggleAdding: () => void;
  onDeleteItem: (name: string) => void;
  isAdding?: boolean;
  isLoading?: boolean;
  inputSuggestions?: string[];
}

const AccessControlSubjectSet: React.FC<IAccessControlSubjectSetProps> = ({
  items,
  permissions,
  renderItem,
  onAdd,
  onToggleAdding,
  onDeleteItem,
  isAdding,
  isLoading,
  inputSuggestions,
  ...props
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const clearError = () => {
    setErrorMessage('');
  };

  const validateSubjects = (values: string[]): string => {
    /**
     * Gather how many times each value is used in the whole set,
     * including the ones in the input
     * */
    let valueUsage = values.reduce(gatherSubjectUsage, {});
    valueUsage = items
      .map((i) => i.name)
      .reduce(gatherSubjectUsage, valueUsage);

    // Only take names that are used more than once.
    const duplicatedNames = [];
    for (const [name, usage] of Object.entries(valueUsage)) {
      if (usage > 1) {
        duplicatedNames.push(name);
      }
    }

    if (duplicatedNames.length === 1) {
      return `Subject '${duplicatedNames[0]}' already exists.`;
    } else if (duplicatedNames.length > 1) {
      return `Subjects '${duplicatedNames.join(`', '`)}' already exist.`;
    }

    return '';
  };

  const [newlyAddedSubjects, setNewlyAddedSubjects] = useState<string[]>([]);

  const handleAdd = (newValue: string[]) => {
    const error = validateSubjects(newValue);
    if (error) {
      setErrorMessage(error);

      return;
    }

    setNewlyAddedSubjects(newValue);
    onAdd(newValue);
  };

  return (
    <Box direction='row' wrap={true} align='start' {...props}>
      {items.map(({ name, isEditable, isLoading: isItemLoading }) => (
        <React.Fragment key={name}>
          {renderItem({
            name,
            isEditable: permissions.canDelete && isEditable,
            isLoading: isItemLoading,
            isNewlyAdded: newlyAddedSubjects.includes(name),
            onDelete: () => onDeleteItem(name),
          })}
        </React.Fragment>
      ))}

      {permissions.canAdd && (
        <AccessControlSubjectAddForm
          margin={{ right: 'small', bottom: 'small' }}
          isAdding={isAdding}
          isLoading={isLoading}
          onAdd={handleAdd}
          onToggleAdding={onToggleAdding}
          errorMessage={errorMessage}
          onClearError={clearError}
          suggestions={inputSuggestions}
        />
      )}
    </Box>
  );
};

AccessControlSubjectSet.defaultProps = {
  isLoading: false,
};

export default AccessControlSubjectSet;
