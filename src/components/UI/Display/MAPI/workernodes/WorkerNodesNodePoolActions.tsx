import { Keyboard } from 'grommet';
import PropTypes from 'prop-types';
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
  onRenameClick?: () => void;
}

const WorkerNodesNodePoolActions: React.FC<IWorkerNodesNodePoolActionsProps> = ({
  onRenameClick,
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
          >
            &bull;&bull;&bull;
          </StyledDropdownTrigger>

          {isOpen && (
            <Keyboard
              onEsc={onBlurHandler}
              onSpace={handleListKeyDown}
              onEnter={handleListKeyDown}
            >
              <List aria-label='Node pool actions' role='menu'>
                {onRenameClick && (
                  <li>
                    <Link
                      href='#'
                      onClick={(e) => {
                        e.preventDefault();

                        onRenameClick();
                        onBlurHandler();
                      }}
                    >
                      Rename
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

WorkerNodesNodePoolActions.propTypes = {
  onRenameClick: PropTypes.func,
};

export default WorkerNodesNodePoolActions;
