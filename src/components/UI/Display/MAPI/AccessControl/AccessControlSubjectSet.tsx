import { Anchor, Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import styled from 'styled-components';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';
import AccessControlSubjectAddForm from 'UI/Display/MAPI/AccessControl/AccessControlSubjectAddForm';

export interface IAccessControlSubjectSetRenderer
  extends React.ComponentPropsWithoutRef<typeof Box> {
  name: string;
  isEditable: boolean;
  isLoading: boolean;
  onDelete: () => void;
}

const StyledLoadingIndicator = styled(LoadingIndicator)`
  margin-left: 3px;
  display: block;
  height: 23px;

  img {
    display: inline-block;
    vertical-align: middle;
    width: 15px;
  }
`;

export interface IAccessControlSubjectSetItem {
  name: string;
  isEditable: boolean;
  isLoading: boolean;
}

interface IAccessControlSubjectSetProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  items: IAccessControlSubjectSetItem[];
  onAdd: (newValue: string) => void;
  onToggleAdding: () => void;
  onDeleteItem: (name: string) => void;
  isAdding?: boolean;
  isLoading?: boolean;
}

const AccessControlSubjectSet: React.FC<IAccessControlSubjectSetProps> = ({
  items,
  onAdd,
  onToggleAdding,
  onDeleteItem,
  isAdding,
  isLoading,
  ...props
}) => {
  const handleDelete = (name: string) => (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();

    onDeleteItem(name);
  };

  return (
    <Box direction='row' wrap={true} {...props}>
      {items.map(({ name, isEditable, isLoading: isItemLoading }) => (
        <Box
          key={name}
          direction='row'
          gap='xsmall'
          pad={{ vertical: 'xsmall', horizontal: 'small' }}
          background='border'
          round='xxsmall'
          align='center'
          margin={{ right: 'small', bottom: 'small' }}
        >
          <Text color='text-weak'>{name}</Text>

          {isItemLoading && (
            <StyledLoadingIndicator
              loading={true}
              loadingPosition='right'
              timeout={0}
            />
          )}

          {isEditable && !isItemLoading && (
            <OverlayTrigger
              overlay={
                <Tooltip id='delete'>
                  <Text size='xsmall'>
                    Remove this group&apos;s binding to this role
                  </Text>
                </Tooltip>
              }
              placement='top'
            >
              <Anchor
                size='large'
                color='text-weak'
                onClick={handleDelete(name)}
              >
                <i
                  className='fa fa-close'
                  role='presentation'
                  title='Delete group'
                />
              </Anchor>
            </OverlayTrigger>
          )}
        </Box>
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
