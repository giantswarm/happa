import ColorHash from 'color-hash';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';

const colorHashCache = {};

const Wrapper = styled.div`
  display: inline-block;

  &:hover {
    i {
      opacity: 0.7;
    }
  }

  i {
    cursor: pointer;
    font-size: 14px;
    margin-left: 5px;
    margin-right: 5px;
    opacity: 0;

    &:hover {
      opacity: 1;
      text-shadow: 0px 0px 15px ${props => props.theme.colors.shade1};
    }
  }
`;

const Label = styled.span`
  background-color: ${props => calculateColour(props.clusterID)};
  font-family: ${props => props.theme.fontFamilies.console};
  padding: 0.2em 0.4em;
  border-radius: 0.2em;
`;

function calculateColour(str) {
  if (!colorHashCache[str]) {
    const colorHash = new ColorHash({ lightness: 0.4, saturation: 0.4 });
    const colorAsHex = colorHash.hex(str);
    colorHashCache[str] = colorAsHex;
  }

  return colorHashCache[str];
}

const ClusterIDLabel = ({ clusterID, copyEnabled }) => {
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  const copyToClipboard = e => {
    e.preventDefault();
    e.stopPropagation();

    setClipboardContent(clusterID);
  };

  return (
    <Wrapper onMouseLeave={() => setClipboardContent(null)}>
      <Label clusterID={clusterID} title={`Unique Cluster ID: ${  clusterID}`}>
        {clusterID}
      </Label>

      {copyEnabled &&
        (hasContentInClipboard ? (
          <i aria-hidden='true' className='fa fa-done' />
        ) : (
          <OverlayTrigger
            overlay={
              <Tooltip id='tooltip'>Copy {clusterID} to clipboard.</Tooltip>
            }
            placement='top'
          >
            <i
              aria-hidden='true'
              className='fa fa-content-copy'
              onClick={copyToClipboard}
            />
          </OverlayTrigger>
        ))}
    </Wrapper>
  );
};

ClusterIDLabel.propTypes = {
  clusterID: PropTypes.string,
  copyEnabled: PropTypes.bool,
};

export default ClusterIDLabel;
