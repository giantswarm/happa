import DropdownMenu from '../../UI/dropdown_menu';
import React from 'react';

const NodePoolDropdownMenu = () => (
  <DropdownMenu
    render={({ isOpen, onClickHandler, onFocusHandler, onBlurHandler }) => (
      <React.Fragment>
        <button
          aria-expanded={isOpen}
          aria-haspopup='true'
          onBlur={onBlurHandler}
          onClick={onClickHandler}
          onFocus={onFocusHandler}
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
      </React.Fragment>
    )}
  />
);

export default NodePoolDropdownMenu;
