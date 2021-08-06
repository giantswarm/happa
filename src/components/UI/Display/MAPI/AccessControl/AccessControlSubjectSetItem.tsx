import { Anchor, Box, Drop, Keyboard, Text } from 'grommet';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';
import { IAccessControlSubjectSetRenderer } from 'UI/Display/MAPI/AccessControl/AccessControlSubjectSet';

const StyledLoadingIndicator = styled(LoadingIndicator)`
  margin-left: 5px;
  display: block;
  height: 23px;
  width: 18px;

  img {
    display: inline-block;
    vertical-align: middle;
    width: 15px;
  }
`;

const StyledAnchor = styled(Anchor)`
  :focus {
    outline: 0;
  }

  :focus:not(:focus-visible) {
    box-shadow: none;
  }

  i:focus {
    outline: 0;
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
  const deleteButtonRef = useRef<HTMLAnchorElement>(null);

  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const showConfirmation = (
    e?:
      | React.MouseEvent<HTMLElement>
      | React.FocusEvent<HTMLElement>
      | React.KeyboardEvent<HTMLElement>
  ) => {
    e?.preventDefault();

    setConfirmationVisible(true);
  };

  const hideConfirmation = (
    e?:
      | React.MouseEvent<HTMLElement>
      | React.FocusEvent<HTMLElement>
      | React.KeyboardEvent<HTMLElement>
  ) => {
    e?.preventDefault();

    window.setTimeout(() => {
      setConfirmationVisible(false);
    });
  };

  const handleDelete = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    setConfirmationVisible(false);
    onDelete();
  };

  return (
    <Box
      direction='row'
      pad={{ vertical: 'xsmall', horizontal: 'small' }}
      height='38px'
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
          <StyledAnchor
            ref={deleteButtonRef}
            size='large'
            color='text-weak'
            onClick={showConfirmation}
            margin={{ left: 'xsmall' }}
            tabIndex={0}
          >
            <i className='fa fa-close' role='presentation' title='Delete' />
          </StyledAnchor>
        </OverlayTrigger>
      )}

      {isEditable && !isLoading && !deleteTooltipMessage && (
        <StyledAnchor
          ref={deleteButtonRef}
          size='large'
          color='text-weak'
          onClick={showConfirmation}
          margin={{ left: 'xsmall' }}
          tabIndex={0}
        >
          <i className='fa fa-close' role='presentation' title='Delete' />
        </StyledAnchor>
      )}

      {confirmationVisible && deleteButtonRef.current && (
        <Keyboard onEsc={hideConfirmation}>
          <Drop
            align={{ bottom: 'top', right: 'right' }}
            target={deleteButtonRef.current}
            plain={true}
            trapFocus={true}
          >
            <Box
              background='background-front'
              pad='medium'
              round='small'
              direction='column'
              gap='small'
              border={{ color: 'text-xweak' }}
            >
              <Box>
                <Text>Are you sure?</Text>
              </Box>
              <Box direction='row'>
                <Button danger={true} onClick={handleDelete}>
                  Yes, delete it
                </Button>
                <Button link={true} onClick={hideConfirmation}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Drop>
        </Keyboard>
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
