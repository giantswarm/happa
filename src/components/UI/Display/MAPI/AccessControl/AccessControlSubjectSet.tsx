import { Box } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
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
  onAdd: (newValue: string) => void;
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
  return (
    <Box direction='row' wrap={true} {...props}>
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
        onAdd={onAdd}
        onToggleAdding={onToggleAdding}
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
