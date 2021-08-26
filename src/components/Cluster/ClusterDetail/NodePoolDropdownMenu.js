import React from 'react';
import DropdownMenu, {
  DropdownTrigger,
  Link,
  List,
} from 'UI/Controls/DropdownMenu';

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

export default NodePoolDropdownMenu;
