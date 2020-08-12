import PropTypes from 'prop-types';
import React from 'react';
import DropdownMenu, { DropdownTrigger, Link, List } from 'UI/DropdownMenu';

const NodePoolDropdownMenu = ({
  triggerEditName,
  deleteNodePool,
  nodePool,
  showNodePoolScalingModal,
  provider,
  ...rest
}) => {
  return (
    <DropdownMenu
      {...rest}
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
                    triggerEditName();
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
                    showNodePoolScalingModal(nodePool);
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
                    deleteNodePool();
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
  provider: PropTypes.string,
  nodePool: PropTypes.object,
  deleteNodePool: PropTypes.func,
  showNodePoolScalingModal: PropTypes.func,
  triggerEditName: PropTypes.func,
};

export default NodePoolDropdownMenu;
