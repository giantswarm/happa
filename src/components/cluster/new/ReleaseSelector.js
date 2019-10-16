import { connect } from 'react-redux';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import { spinner } from 'images';
import _ from 'underscore';
import Button from 'UI/button';
import PropTypes from 'prop-types';
import React from 'react';
import ReleaseComponentLabel from 'UI/release_component_label';
import ReleaseDetailsModal from '../../modals/release_details_modal';
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
    loading: false,
  };

  loadingContent() {
    return (
      <div>
        <p>
          <img className='loader' height='25px' src={spinner} width='25px' />
        </p>
      </div>
    );
  }

  hasActiveReleases() {
    const { selectedRelease } = this.props;

    if (selectedRelease) {
      var kubernetes = _.find(
        this.props.releases[selectedRelease].components,
        component => component.name === 'kubernetes'
      );

      return (
        <FlexRowDiv>
          <p>{selectedRelease}</p>
          <Button onClick={() => this.releaseDetailsModal.show()}>
            {this.props.activeSortedReleases.length === 1
              ? 'Show Details'
              : 'Details and Alternatives'}
          </Button>
          <br />
          <br />

          {kubernetes && (
            <>
              <p>This release contains:</p>
              <div style={{ transform: 'translateY(6px)' }}>
                <ReleaseComponentLabel
                  name='kubernetes'
                  version={kubernetes.version}
                />
              </div>
            </>
          )}
        </FlexRowDiv>
      );
    }

    return (
      <div>
        <p>There is no active release currently availabe for this platform.</p>
      </div>
    );
  }

  render() {
    return (
      <>
        {this.state.loading ? this.loadingContent() : this.hasActiveReleases()}

        <ReleaseDetailsModal
          ref={r => {
            this.releaseDetailsModal = r;
          }}
          releaseSelected={this.props.selectRelease}
          releases={this.props.selectableReleases}
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
