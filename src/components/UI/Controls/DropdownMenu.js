import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

/*
 * This is a reusable component. It is responsible for:
 *
 * 1. Rendering a styled popover menu
 * 2. Providing state and methods for handling the popover state in an accessible way
 *
 * For further customization - e.g. adding custom positioning - overwrite styles in the
 * component where it is being used
 */

export const List = styled.ul`
  position: absolute;
  right: 7px;
  list-style-type: none;
  margin: 2px 0 0;
  padding: 5px 0;
  width: max-content;
  z-index: 1;
  background-color: ${({ theme }) => theme.colors.dropdownBackground};
  border: none;
  border-radius: 5px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
`;

export const Link = styled.a`
  display: inline-block;
  text-decoration: none;
  color: #fff;
  font-size: 14px;
  font-weight: 400;
  padding: 7px 15px;
  width: 100%;
  &:hover {
    background: ${(props) => props.theme.colors.shade9};
  }
`;

export const DropdownTrigger = styled.button`
  width: 40px;
  height: 40px;
  margin: 0;
  border-radius: 0;
  border: 0;
  padding: 0;
  background: unset;
  transition: background 0.3s;
  &:focus {
    outline: 5px auto -webkit-focus-ring-color;
  }
  &:hover,
  &:focus,
  &:focus-within {
    background: ${(props) => props.theme.colors.shade8};
  }
`;

const MenuWrapper = styled.div`
  position: relative;
`;

function DropdownMenu(props) {
  const [isOpen, setIsOpen] = useState(false);
  const timeOutId = useRef(0);

  useEffect(() => {
    return () => {
      clearTimeout(timeOutId.current);
    };
  }, []);

  const onBlurHandler = () => {
    timeOutId.current = setTimeout(() => {
      setIsOpen(false);
    });
  };

  // If a child receives focus, do not close the popover.
  const onFocusHandler = () => {
    clearTimeout(timeOutId.current);
  };

  const onKeyDownHandler = (event) => {
    if (event.key === 'Escape') setIsOpen(false);
  };

  return (
    <MenuWrapper className={props.className}>
      {props.render({
        isOpen: isOpen,
        onClickHandler: () => setIsOpen(!isOpen),
        onBlurHandler,
        onFocusHandler,
        onKeyDownHandler,
      })}
    </MenuWrapper>
  );
}

DropdownMenu.propTypes = {
  render: PropTypes.func,
  className: PropTypes.string,
};

export default DropdownMenu;
