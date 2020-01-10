import useCopyToClipboard from 'lib/effects/useCopyToClipboard';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

const Copyable = ({ children, copyText }) => {
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const handleCopyToClipboard = () => {
    setClipboardContent(copyText);
  };

  const handleDisplayCopyingDone = () => {
    setClipboardContent(null);
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
        {hasContentInClipboard ? (
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
