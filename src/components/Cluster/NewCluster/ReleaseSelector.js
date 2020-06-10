import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Button';
import ReleaseComponentLabel from 'UI/ReleaseComponentLabel';

import ReleaseDetailsModal from '../../Modals/ReleaseDetailsModal';

const FlexRowDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  line-height: 1;
  p {
    display: inline;
    margin: 0 10px 0 0;
    font-size: 14px;
  }
  .progress_button--container {
    position: relative;
    display: inline-block;
    margin-right: 25px;
  }
`;

const MarginlessReleaseComponentLabel = styled(ReleaseComponentLabel)`
  margin: 0;
`;

class ReleaseSelector extends React.PureComponent {
  extractKubernetesVersion = () => {
    const { selectedRelease, releases } = this.props;

    return releases[selectedRelease]?.components.find(
      (component) => component.name === 'kubernetes'
    )?.version;
  };

  render() {
    const kubernetesVersion = this.extractKubernetesVersion();

    return (
      <>
        {kubernetesVersion ? (
          <FlexRowDiv>
            <p>{this.props.selectedRelease}</p>
            <Button onClick={() => this.releaseDetailsModal.show()}>
              {this.props.activeSortedReleases.length === 1
                ? 'Show Details'
                : 'Details and Alternatives'}
            </Button>
            <p>This release contains:</p>
            <MarginlessReleaseComponentLabel
              name='kubernetes'
              version={kubernetesVersion}
            />
          </FlexRowDiv>
        ) : (
          <div>
            <p>
              There is no active release currently availabe for this platform.
            </p>
          </div>
        )}
        <ReleaseDetailsModal
          ref={(r) => {
            this.releaseDetailsModal = r;
          }}
          releases={this.props.selectableReleases}
          selectRelease={(r) => {
            this.releaseDetailsModal.close();
            this.props.selectRelease(r);
          }}
          selectedRelease={this.props.selectedRelease}
        />
      </>
    );
  }
}

ReleaseSelector.propTypes = {
  dispatch: PropTypes.func,
  provider: PropTypes.string,
  selectRelease: PropTypes.func,
  selectedRelease: PropTypes.string,
  selectableReleases: PropTypes.array,
  releases: PropTypes.object, // Version string to a release object i.e.: {"0.1.0": {...}, "0.2.0", {...}}
  activeSortedReleases: PropTypes.array, // Array of strings i.e: ["0.1.0", "0.2.0"]
  user: PropTypes.object,
};

export default ReleaseSelector;
