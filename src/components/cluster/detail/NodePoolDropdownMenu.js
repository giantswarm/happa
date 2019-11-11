import DropdownMenu from 'UI/dropdown_menu';
import PropTypes from 'prop-types';
import React from 'react';

const NodePoolDropdownMenu = props => {
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
          <button
            aria-expanded={isOpen}
            aria-haspopup='true'
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
                  onClick={e => {
                    e.preventDefault();
                    props.triggerEditName();
                  }}
                >
                  Rename
                </a>
              </li>
              <li>
                <a
                  href='#'
                  onClick={e => {
                    e.preventDefault();
                    props.showNodePoolScalingModal(props.nodePool);
                  }}
                >
                  Edit scaling limits
                </a>
              </li>
              <li>
                <a
                  href='#'
                  onClick={e => {
                    e.preventDefault();
                    props.deleteNodePool();
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
