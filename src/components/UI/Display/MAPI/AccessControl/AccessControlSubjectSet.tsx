import { Box } from 'grommet';
import { parseSubjects } from 'MAPI/organizations/AccessControl/utils';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import AccessControlSubjectAddForm from 'UI/Display/MAPI/AccessControl/AccessControlSubjectAddForm';

export interface IAccessControlSubjectSetRenderer
  extends React.ComponentPropsWithoutRef<typeof Box> {
  name: string;
  isEditable: boolean;
  isLoading: boolean;
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
  renderItem: (params: IAccessControlSubjectSetRenderer) => React.ReactNode;
  onAdd: (values: string[]) => void;
  onToggleAdding: () => void;
  onDeleteItem: (name: string) => void;
  isAdding?: boolean;
  isLoading?: boolean;
}

const AccessControlSubjectSet: React.FC<IAccessControlSubjectSetProps> = ({
  items,
  renderItem,
  onAdd,
  onToggleAdding,
  onDeleteItem,
  isAdding,
  isLoading,
  ...props
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const clearError = () => {
    setErrorMessage('');
  };

  const validateSubjects = (values: string[]): string => {
    const existingNames = [];

    for (const item of items) {
      if (values.includes(item.name)) {
        existingNames.push(item.name);
      }
    }

    if (existingNames.length === 1) {
      return `Subject '${existingNames[0]}' already exists.`;
    } else if (existingNames.length > 1) {
      return `Subjects '${existingNames.join(', ')}' already exist.`;
    }

    return '';
  };

  const handleAdd = (newValue: string) => {
    const values = parseSubjects(newValue);

    const error = validateSubjects(values);
    if (error) {
      setErrorMessage(error);

      return;
    }

    onAdd(values);
  };

  return (
    <Box direction='row' wrap={true} align='start' {...props}>
      {items.map(({ name, isEditable, isLoading: isItemLoading }) => (
        <React.Fragment key={name}>
          {renderItem({
            name,
            isEditable,
            isLoading: isItemLoading,
            onDelete: () => onDeleteItem(name),
          })}
        </React.Fragment>
      ))}
      <AccessControlSubjectAddForm
        margin={{ right: 'small', bottom: 'small' }}
        isAdding={isAdding}
        isLoading={isLoading}
        onAdd={handleAdd}
        onToggleAdding={onToggleAdding}
        errorMessage={errorMessage}
        onClearError={clearError}
      />
    </Box>
  );
};

AccessControlSubjectSet.propTypes = {
  // @ts-expect-error
  items: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  renderItem: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onToggleAdding: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  isAdding: PropTypes.bool,
  isLoading: PropTypes.bool,
};

AccessControlSubjectSet.defaultProps = {
  isLoading: false,
};

export default AccessControlSubjectSet;
