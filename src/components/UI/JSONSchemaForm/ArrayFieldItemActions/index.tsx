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
  width: 23px;
  height: 23px;
  line-height: 24px;
`;

const DisabledLink = styled(Link)`
  opacity: 0.7; /* matching disabled grommet button's opacity */

  :focus {
    outline: none;
  }

  :hover {
    text-decoration: none;
    cursor: not-allowed;
  }
`;

const StyledList = styled(List)`
  left: 0;
  right: unset;
`;

interface ArrayFieldItemActionsProps {
  disabled: boolean;
  hasMoveDown: boolean;
  hasMoveUp: boolean;
  hasRemove: boolean;
  onMoveDownClick: () => void;
  onMoveUpClick: () => void;
  onDropClick: () => void;
}

const ArrayFieldItemActions: React.FC<ArrayFieldItemActionsProps> = ({
  disabled,
  hasMoveDown,
  hasMoveUp,
  hasRemove,
  onMoveDownClick,
  onMoveUpClick,
  onDropClick,
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
              <StyledList role='menu'>
                {(hasMoveUp || hasMoveDown) && (
                  <li>
                    {disabled || !hasMoveUp ? (
                      <DisabledLink role='button' aria-disabled={true}>
                        <Text>Move up</Text>
                      </DisabledLink>
                    ) : (
                      <Link href='#' onClick={onMoveUpClick}>
                        <Text>Move up</Text>
                      </Link>
                    )}
                  </li>
                )}
                {(hasMoveUp || hasMoveDown) && (
                  <li>
                    {disabled || !hasMoveDown ? (
                      <DisabledLink role='button' aria-disabled={true}>
                        <Text>Move down</Text>
                      </DisabledLink>
                    ) : (
                      <Link href='#' onClick={onMoveDownClick}>
                        <Text>Move down</Text>
                      </Link>
                    )}
                  </li>
                )}
                {hasRemove && (
                  <li>
                    {disabled ? (
                      <DisabledLink role='button' aria-disabled={true}>
                        <Text>Delete item</Text>
                      </DisabledLink>
                    ) : (
                      <Link href='#' onClick={onDropClick}>
                        <Text color='status-critical'>Delete item</Text>
                      </Link>
                    )}
                  </li>
                )}
              </StyledList>
            </Keyboard>
          )}
        </div>
      )}
    />
  );
};

export default ArrayFieldItemActions;
