import PropTypes from 'prop-types';
import React from 'react';
import DropdownMenu from 'UI/DropdownMenu';

const NodePoolDropdownMenu = ({
  triggerEditName,
  deleteNodePool,
  nodePool,
  showNodePoolScalingModal,
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
          <button
            aria-expanded={isOpen}
            aria-haspopup='true'
            className='dropdown-trigger'
            onClick={onClickHandler}
            onKeyDown={onKeyDownHandler}
            type='button'
          >
            •••
          </button>
          {isOpen && (
            <ul aria-labelledby='node_pools_dropdown' role='menu'>
              <li>
                <a
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    triggerEditName();
                  }}
                >
                  Rename
                </a>
              </li>
              <li>
                <a
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    showNodePoolScalingModal(nodePool);
                  }}
                >
                  Edit scaling limits
                </a>
              </li>
              <li>
                <a
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    deleteNodePool();
                  }}
                >
                  Delete
                </a>
              </li>
            </ul>
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
