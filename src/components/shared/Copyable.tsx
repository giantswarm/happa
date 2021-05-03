import useCopyToClipboard from 'lib/hooks/useCopyToClipboard';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import styled from 'styled-components';

const TooltipWrapper = styled.div`
  top: 0px;
  right: 0px;
  position: absolute;
  display: inline-block;
  opacity: 0;
`;

const Wrapper = styled.div`
  .copyable {
    padding-right: 20px;
    position: relative;
    overflow: inherit;
    text-overflow: inherit;
    display: inherit;

    &:hover {
      ${TooltipWrapper} {
        opacity: 0.7;
      }
    }
  }
`;

const Content = styled.div`
  position: relative;
  overflow: inherit;
  text-overflow: inherit;
  display: inherit;
`;

interface ICopyableProps extends React.ComponentPropsWithoutRef<'div'> {
  copyText: string;
}

const Copyable: React.FC<ICopyableProps> = ({ children, copyText }) => {
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const handleCopyToClipboard = () => {
    setClipboardContent(copyText);
  };

  const handleDisplayCopyingDone = () => {
    setClipboardContent(null);
  };

  return (
    <Wrapper
      onClick={handleCopyToClipboard}
      onMouseLeave={handleDisplayCopyingDone}
      style={{ cursor: 'pointer' }}
      title='Copy content to clipboard'
    >
      <Content>{children}</Content>

      <TooltipWrapper>
        {hasContentInClipboard ? (
          <i
            aria-hidden='true'
            className='fa fa-done'
            title='Content copied to clipboard'
          />
        ) : (
          <OverlayTrigger
            overlay={<Tooltip id='tooltip'>Copy to clipboard.</Tooltip>}
            placement='top'
          >
            <i aria-hidden='true' className='fa fa-content-copy' />
          </OverlayTrigger>
        )}
      </TooltipWrapper>
    </Wrapper>
  );
};

Copyable.propTypes = {
  children: PropTypes.node,
  copyText: PropTypes.string.isRequired,
};

export default Copyable;
