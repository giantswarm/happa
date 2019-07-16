import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from '@emotion/styled';

/*
 * This is a reusable component. It is responsible for:
 *
 * 1. Rendering a styled popover menu
 * 2. Provinding state and methods for handling the popover state in an accessible way
 *
 * For further customization - e.g. adding custom positioning - overwrite styles in the
 * component where it is being used
 */

const MenuWrapper = styled.div`
  button {
    width: 40px;
    height: 40px;
    /* Overrides for bootstrap */
    margin: 0;
    border-radius: 0;
    padding: 0;
    background: unset;
    &:focus {
      outline: 5px auto -webkit-focus-ring-color;
    }
  }
  ul {
    position: absolute;
    right: 7px;
    list-style-type: none;
    padding: 12px 15px;
    margin: 0;
    width: 180px;
    background: ${props => props.theme.colors.shade2};
    border: 1px solid ${props => props.theme.colors.white3};
    z-index: 1;
  }
  a {
    text-decoration: none;
  }
`;

function DropdownMenu(props) {
  const [isOpen, setIsOpen] = useState(false);
  let timeOutId = null;

  const onBlurHandler = () => {
    timeOutId = setTimeout(() => {
      setIsOpen(false);
    });
  };

  // If a child receives focus, do not close the popover.
  const onFocusHandler = () => clearTimeout(timeOutId);

  return (
    <MenuWrapper>
      {props.render({
        isOpen: isOpen,
        onClickHandler: () => setIsOpen(!isOpen),
        onBlurHandler,
        onFocusHandler,
      })}
    </MenuWrapper>
  );
}

DropdownMenu.propTypes = {
  render: PropTypes.func,
};

export default DropdownMenu;
