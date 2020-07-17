import PropTypes from 'prop-types';
import React from 'react';
import DropdownMenu, { DropdownTrigger, Link, List } from 'UI/DropdownMenu';

const NodePoolDropdownMenu = (props) => {
  return (
    <DropdownMenu
      render={({
        isOpen,
        onClickHandler,
        onFocusHandler,
        onBlurHandler,
        onKeyDownHandler,
      }) => (
        <div onBlur={onBlurHandler} onFocus={onFocusHandler}>
          <DropdownTrigger
            aria-expanded={isOpen}
            aria-haspopup='true'
            onClick={onClickHandler}
            onKeyDown={onKeyDownHandler}
            type='button'
          >
            •••
          </DropdownTrigger>
          {isOpen && (
            <List aria-labelledby='node_pools_dropdown' role='menu'>
              <li>
                <Link
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    props.triggerEditName();
                  }}
                >
                  Rename
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    props.showNodePoolScalingModal(props.nodePool);
                  }}
                >
                  Edit scaling limits
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    props.deleteNodePool();
                  }}
                >
                  Delete
                </Link>
              </li>
            </List>
          )}
        </div>
      )}
    />
  );
};

NodePoolDropdownMenu.propTypes = {
  clusterId: PropTypes.string,
  nodePool: PropTypes.object,
  deleteNodePool: PropTypes.func,
  showNodePoolScalingModal: PropTypes.func,
  triggerEditName: PropTypes.func,
};

export default NodePoolDropdownMenu;
