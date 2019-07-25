import DropdownMenu from 'UI/dropdown_menu';
import React from 'react';

const NodePoolDropdownMenu = () => (
  <DropdownMenu
    render={({
      isOpen,
      onClickHandler,
      onFocusHandler,
      onBlurHandler,
      onKeyDownHandler,
    }) => (
      <>
        <button
          aria-expanded={isOpen}
          aria-haspopup='true'
          onBlur={onBlurHandler}
          onClick={onClickHandler}
          onFocus={onFocusHandler}
          onKeyDown={onKeyDownHandler}
          type='button'
        >
          •••
        </button>
        {isOpen && (
          <ul>
            <li>
              <a href='#'>Rename</a>
            </li>
            <li>
              <a href='#'>Edit scaling limits</a>
            </li>
            <li>
              <a href='#'>Delete</a>
            </li>
          </ul>
        )}
      </>
    )}
  />
);

export default NodePoolDropdownMenu;
