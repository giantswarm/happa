import Button from 'UI/Button';
import LoadingOverlay from 'UI/LoadingOverlay';
import PropTypes from 'prop-types';
import React from 'react';
import ReleaseComponentLabel from 'UI/release_component_label';
import ReleaseDetailsModal from '../../Modals/ReleaseDetailsModal';
import styled from '@emotion/styled';

const FlexRowDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  line-height: 1;
  p {
    display: inline;
    margin: 0 10px 0 0;
  }
  .progress_button--container {
    position: relative;
    display: inline-block;
    margin-right: 25px;
  }
`;

class ReleaseSelector extends React.Component {
  state = {
    kubernetesVersion: '',
    loading: true,
  };

  componentDidMount() {
    const kubernetesVersion = this.props.selectedRelease
      ? this.props.releases[this.props.selectedRelease].components.find(
          component => component.name === 'kubernetes'
        ).version
      : undefined;

    this.setState({ kubernetesVersion, loading: false });
  }

  render() {
    const { kubernetesVersion } = this.state;

    return (
      <LoadingOverlay loading={this.state.loading}>
        {kubernetesVersion ? (
          <FlexRowDiv>
            <p>{this.props.selectedRelease}</p>
            <Button onClick={() => this.releaseDetailsModal.show()}>
              {this.props.activeSortedReleases.length === 1
                ? 'Show Details'
                : 'Details and Alternatives'}
            </Button>
            <br />
            <br />

            {kubernetesVersion && (
              <>
                <p>This release contains:</p>
                <div style={{ transform: 'translateY(6px)' }}>
                  <ReleaseComponentLabel
                    name='kubernetes'
                    version={kubernetesVersion}
                  />
                </div>
              </>
            )}
          </FlexRowDiv>
        ) : (
          <div>
            <p>
              There is no active release currently availabe for this platform.
            </p>
          </div>
        )}
        <ReleaseDetailsModal
          ref={r => {
            this.releaseDetailsModal = r;
          }}
          releases={this.props.selectableReleases}
          selectRelease={this.props.selectRelease}
          selectedRelease={this.props.selectedRelease}
        />
      </LoadingOverlay>
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
