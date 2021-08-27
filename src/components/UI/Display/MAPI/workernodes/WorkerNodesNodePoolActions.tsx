import { Keyboard, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import DropdownMenu, {
  DropdownTrigger,
  Link,
  List,
} from 'UI/Controls/DropdownMenu';

const StyledDropdownTrigger = styled(DropdownTrigger)`
  border-radius: ${({ theme }) => theme.rounding}px;
`;

interface IWorkerNodesNodePoolActionsProps
  extends React.ComponentPropsWithoutRef<'div'> {
  onDeleteClick?: () => void;
  onScaleClick?: () => void;
}

const WorkerNodesNodePoolActions: React.FC<IWorkerNodesNodePoolActionsProps> = ({
  onDeleteClick,
  onScaleClick,
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
                {onScaleClick && (
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
                )}
                {onDeleteClick && (
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
