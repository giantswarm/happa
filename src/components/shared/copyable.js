import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';

const Copyable = ({ children, copyText }) => {
  const [isCopiedToClipboard, setCopyToClipboard] = useCopyToClipboard();

  const handleCopyToClipboard = () => {
    setCopyToClipboard(copyText);
  };

  const handleDisplayCopyingDone = () => {
    setCopyToClipboard(null);
  };

  return (
    <div
      className='copyable'
      onClick={handleCopyToClipboard}
      onMouseLeave={handleDisplayCopyingDone}
      style={{ cursor: 'pointer' }}
    >
      <div className='copyable-content'>{children}</div>

      <div className='copyable-tooltip'>
        {isCopiedToClipboard ? (
          <i aria-hidden='true' className='fa fa-done' />
        ) : (
          <OverlayTrigger
            overlay={<Tooltip id='tooltip'>Copy to clipboard.</Tooltip>}
            placement='top'
          >
            <i aria-hidden='true' className='fa fa-content-copy' />
          </OverlayTrigger>
        )}
      </div>
    </div>
  );
};

Copyable.propTypes = {
  children: PropTypes.object,
  copyText: PropTypes.string,
};

export default Copyable;
