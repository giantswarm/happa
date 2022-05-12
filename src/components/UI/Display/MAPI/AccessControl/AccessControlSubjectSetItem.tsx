import { Anchor, Box, Drop, Keyboard, Text } from 'grommet';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';
import { IAccessControlSubjectSetRenderer } from 'UI/Display/MAPI/AccessControl/AccessControlSubjectSet';
import RefreshableLabel from 'UI/Display/RefreshableLabel';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

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

const StyledDrop = styled(Drop)`
  z-index: 1071; /* To appear above the Bootstrap Tooltip, which has a z-index of 1070 */
`;

interface IAccessControlSubjectSetItemProps
  extends Omit<IAccessControlSubjectSetRenderer, 'name'>,
    React.ComponentPropsWithoutRef<typeof Box> {
  name: React.ReactNode;
  deleteTooltipMessage?: string;
  deleteConfirmationMessage?: React.ReactNode;
}

const AccessControlSubjectSetItem: React.FC<
  React.PropsWithChildren<IAccessControlSubjectSetItemProps>
> = ({
  name,
  isEditable,
  isLoading,
  isNewlyAdded,
  removeFromNewlyAdded,
  onDelete,
  deleteTooltipMessage,
  deleteConfirmationMessage,
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

  useEffect(() => {
    if (isNewlyAdded) {
      removeFromNewlyAdded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <RefreshableLabel value={Number(isNewlyAdded)}>
        {typeof name === 'string' ? (
          <Text color='text-weak'>{name}</Text>
        ) : (
          name
        )}
      </RefreshableLabel>
      {isLoading && (
        <StyledLoadingIndicator
          loading={true}
          loadingPosition='right'
          timeout={0}
        />
      )}

      {isEditable && !isLoading && deleteTooltipMessage && (
        <TooltipContainer
          target={deleteButtonRef}
          content={<Tooltip id='delete'>{deleteTooltipMessage}</Tooltip>}
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
        </TooltipContainer>
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
          <StyledDrop
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
              gap='medium'
              border={{ color: 'text-xweak' }}
            >
              <Box>{deleteConfirmationMessage}</Box>
              <Box direction='row' gap='small'>
                <Button danger={true} onClick={handleDelete}>
                  Remove
                </Button>
                <Button link={true} onClick={hideConfirmation}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </StyledDrop>
        </Keyboard>
      )}
    </Box>
  );
};

AccessControlSubjectSetItem.defaultProps = {
  deleteConfirmationMessage: <Text>Are you sure?</Text>,
};

export default AccessControlSubjectSetItem;
