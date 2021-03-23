import { Anchor, Box, Text } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import styled from 'styled-components';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';
import { IAccessControlSubjectSetRenderer } from 'UI/Display/MAPI/AccessControl/AccessControlSubjectSet';

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

interface IAccessControlSubjectSetItemProps
  extends Omit<IAccessControlSubjectSetRenderer, 'name'>,
    React.ComponentPropsWithoutRef<typeof Box> {
  name: React.ReactNode;
  deleteTooltipMessage?: string;
}

const AccessControlSubjectSetItem: React.FC<IAccessControlSubjectSetItemProps> = ({
  name,
  isEditable,
  isLoading,
  onDelete,
  deleteTooltipMessage,
  ...props
}) => {
  const handleDelete = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    onDelete();
  };

  return (
    <Box
      direction='row'
      gap='xsmall'
      pad={{ vertical: 'xsmall', horizontal: 'small' }}
      background='border'
      round='xxsmall'
      align='center'
      margin={{ right: 'small', bottom: 'small' }}
      {...props}
    >
      {typeof name === 'string' ? <Text color='text-weak'>{name}</Text> : name}

      {isLoading && (
        <StyledLoadingIndicator
          loading={true}
          loadingPosition='right'
          timeout={0}
        />
      )}

      {isEditable && !isLoading && deleteTooltipMessage && (
        <OverlayTrigger
          overlay={
            <Tooltip id='delete'>
              <Text size='xsmall'>{deleteTooltipMessage}</Text>
            </Tooltip>
          }
          placement='top'
        >
          <Anchor size='large' color='text-weak' onClick={handleDelete}>
            <i className='fa fa-close' role='presentation' title='Delete' />
          </Anchor>
        </OverlayTrigger>
      )}

      {isEditable && !isLoading && !deleteTooltipMessage && (
        <Anchor size='large' color='text-weak' onClick={handleDelete}>
          <i className='fa fa-close' role='presentation' title='Delete' />
        </Anchor>
      )}
    </Box>
  );
};

AccessControlSubjectSetItem.propTypes = {
  name: PropTypes.node.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  deleteTooltipMessage: PropTypes.string,
};

export default AccessControlSubjectSetItem;
