import ColorHash from 'color-hash';
import copy from 'copy-to-clipboard';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import Tooltip from 'react-bootstrap/lib/Tooltip';

var colorHashCache = {};

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
    margin-seft: 5px;
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
    var colorHash = new ColorHash({ lightness: 0.4, saturation: 0.4 });
    var col = colorHash.hex(str);
    colorHashCache[str] = col;
  }

  return colorHashCache[str];
}

class ClusterIDLabel extends React.Component {
  state = {
    copied: false,
  };

  copyToClipboard(e) {
    e.preventDefault();
    e.stopPropagation();
    copy(this.props.clusterID);

    this.setState({
      copied: true,
    });
  }

  mouseLeave() {
    this.setState({
      copied: false,
    });
  }

  render() {
    return (
      <Wrapper onMouseLeave={this.mouseLeave.bind(this)}>
        <Label
          clusterID={this.props.clusterID}
          title={'Unique Cluster ID: ' + this.props.clusterID}
        >
          {this.props.clusterID}
        </Label>

        {this.props.copyEnabled &&
          (this.state.copied ? (
            <i aria-hidden='true' className='fa fa-done' />
          ) : (
            <OverlayTrigger
              overlay={
                <Tooltip id='tooltip'>
                  Copy {this.props.clusterID} to clipboard.
                </Tooltip>
              }
              placement='top'
            >
              <i
                aria-hidden='true'
                className='fa fa-content-copy'
                onClick={this.copyToClipboard.bind(this)}
              />
            </OverlayTrigger>
          ))}
      </Wrapper>
    );
  }
}

ClusterIDLabel.propTypes = {
  clusterID: PropTypes.string,
  copyEnabled: PropTypes.bool,
};

export default ClusterIDLabel;
