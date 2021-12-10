import { Keyboard, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import DropdownMenu, {
  DropdownTrigger,
  Link,
  List,
} from 'UI/Controls/DropdownMenu';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

const StyledDropdownTrigger = styled(DropdownTrigger)`
  border-radius: ${({ theme }) => theme.rounding}px;
`;

const UnauthorizedLink = styled(Link)`
  opacity: 0.7; /* matching disabled grommet button's opacity */

  :focus {
    outline: none;
  }

  :hover {
    text-decoration: none;
    cursor: not-allowed;
  }
`;

interface IWorkerNodesNodePoolActionsProps
  extends React.ComponentPropsWithoutRef<'div'> {
  onDeleteClick?: () => void;
  onScaleClick?: () => void;
  disabled?: boolean;
  canUpdateNodePools?: boolean;
  canDeleteNodePools?: boolean;
}

const WorkerNodesNodePoolActions: React.FC<
  IWorkerNodesNodePoolActionsProps
> = ({
  onDeleteClick,
  onScaleClick,
  disabled,
  canUpdateNodePools,
  canDeleteNodePools,
  ...props
}) => {
  const handleListKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();

    (e.target as HTMLElement).click();
  };

  return (
    <DropdownMenu
      {...props}
      render={({
        isOpen,
        onClickHandler,
        onFocusHandler,
        onBlurHandler,
        onKeyDownHandler,
      }) => (
        <div onBlur={onBlurHandler} onFocus={onFocusHandler}>
          <StyledDropdownTrigger
            aria-expanded={isOpen}
            aria-haspopup='true'
            onClick={onClickHandler}
            onKeyDown={onKeyDownHandler}
            type='button'
            aria-label='Actions'
            disabled={disabled}
          >
            &bull;&bull;&bull;
          </StyledDropdownTrigger>

          {isOpen && (
            <Keyboard
              onEsc={onBlurHandler}
              onSpace={handleListKeyDown}
              onEnter={handleListKeyDown}
            >
              <List role='menu'>
                {canUpdateNodePools && onScaleClick ? (
                  <li>
                    <Link
                      href='#'
                      onClick={(e) => {
                        e.preventDefault();

                        onScaleClick();
                        onBlurHandler();
                      }}
                    >
                      <Text>Edit scaling limits</Text>
                    </Link>
                  </li>
                ) : (
                  <TooltipContainer
                    content={
                      <Tooltip>
                        Editing the scaling limits requires additional
                        permissions
                      </Tooltip>
                    }
                  >
                    <li>
                      <UnauthorizedLink
                        role='button'
                        aria-disabled={true}
                        aria-label='Editing the scaling limits requires additional permissions'
                      >
                        <Text>Edit scaling limits</Text>
                      </UnauthorizedLink>
                    </li>
                  </TooltipContainer>
                )}
                {canDeleteNodePools && onDeleteClick ? (
                  <li>
                    <Link
                      href='#'
                      onClick={(e) => {
                        e.preventDefault();

                        onDeleteClick();
                        onBlurHandler();
                      }}
                    >
                      <Text color='status-critical'>Delete</Text>
                    </Link>
                  </li>
                ) : (
                  <TooltipContainer
                    content={
                      <Tooltip>
                        Deleting the node pool requires additional permissions
                      </Tooltip>
                    }
                  >
                    <li>
                      <UnauthorizedLink
                        role='button'
                        aria-disabled={true}
                        aria-label='Deleting the node pool requires additional permissions'
                      >
                        <Text>Delete</Text>
                      </UnauthorizedLink>
                    </li>
                  </TooltipContainer>
                )}
              </List>
            </Keyboard>
          )}
        </div>
      )}
    />
  );
};

export default WorkerNodesNodePoolActions;
