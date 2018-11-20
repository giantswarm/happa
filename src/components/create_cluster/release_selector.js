'use strict';

import React from 'react';
import cmp from 'semver-compare';
import Button from '../button';
import { connect } from 'react-redux';
import { loadReleases } from '../../actions/releaseActions';
import { flashAdd } from '../../actions/flashMessageActions';
import _ from 'underscore';
import ReleaseDetailsModal from '../modal/release_details_modal';
import PropTypes from 'prop-types';

class ReleaseSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: false,
      selectedRelease: '',
      selectableReleases: [],
    };
  }

  componentDidMount() {
    this.loadReleases();
  }

  /**
   * Loads available releases into this.props.releases.
   * Triggers a flash message if something went wrong.
   */
  loadReleases() {
    this.setState({
      loading: true,
      error: false,
    });

    this.props
      .dispatch(loadReleases())
      .then(() => {
        // Select latest active release as a default.
        // If there is no latest active release, then allow selection from WIP
        // releases, with a info message to non admins that this is a WIP installation.
        let selectableReleases = [];
        if (this.props.activeSortedReleases.length > 0) {
          selectableReleases = this.props.activeSortedReleases;
        } else {
          selectableReleases = _.map(
            this.props.releases,
            release => release.version
          );
          this.informWIP();
        }

        this.selectRelease(selectableReleases[0]);

        this.setState({
          loading: false,
          error: false,
          selectableReleases: selectableReleases,
        });
      })
      .catch(error => {
        this.setState({
          loading: false,
          error: true,
        });

        this.props.dispatch(
          flashAdd({
            message: (
              <div>
                <b>
                  Something went wrong while trying to fetch the list of
                  releases.
                </b>
                <br />
                Perhaps our servers are down, please try again later or contact
                support: support@giantswarm.io
                {error.body && error.body.message ? (
                  <pre>{error.body.message}</pre>
                ) : (
                  ''
                )}
              </div>
            ),
            class: 'danger',
          })
        );

        throw error;
      });
  }

  // Lets non admin users know that creating a cluster will probably fail for them,
  // since all releases are WIP and only admins can create clusters from WIP releases.
  informWIP() {
    if (!this.props.user.isAdmin) {
      if (this.props.provider === 'azure') {
        this.props.dispatch(
          flashAdd({
            message: (
              <div>
                <b>Support for Microsoft Azure is still in an early stage.</b>
                <br />
                There is no active release yet. To create a cluster you will
                need admin permissions.
              </div>
            ),
            class: 'info',
          })
        );
      } else {
        this.props.dispatch(
          flashAdd({
            message: (
              <div>
                <b>No active releases available at the moment.</b>
                <br />
                There is no active release yet. To create a cluster you will
                need admin permissions.
              </div>
            ),
            class: 'info',
          })
        );
      }
    }
  }

  /**
   * Sets the currently selected release
   */
  selectRelease(release) {
    this.setState({
      selectedRelease: release,
    });
    this.props.releaseSelected(release);
  }

  openModal = () => {
    this.releaseDetailsModal.show();
  };

  buttonText() {
    if (this.props.activeSortedReleases.length === 1) {
      return 'Show Details';
    } else {
      return 'Details and Alternatives';
    }
  }

  loadingContent() {
    return (
      <div>
        <p>
          <img
            className='loader'
            src='/images/loader_oval_light.svg'
            width='25px'
            height='25px'
          />
        </p>
      </div>
    );
  }

  loadedContent() {
    if (this.state.selectedRelease) {
      var kubernetes = _.find(
        this.props.releases[this.state.selectedRelease].components,
        component => component.name === 'kubernetes'
      );

      return (
        <div>
          <p>{this.state.selectedRelease}</p>
          <Button onClick={this.openModal}>{this.buttonText()}</Button>
          <br />
          <br />

          {kubernetes ? (
            <div>
              <p>This releases contains:</p>
              <div className='release-selector-modal--component contrast'>
                <span className='release-selector-modal--component--name'>
                  kubernetes
                </span>
                <span className='release-selector-modal--component--version'>
                  {kubernetes.version}
                </span>
              </div>
            </div>
          ) : (
            undefined
          )}
        </div>
      );
    } else {
      return (
        <div>
          <p>
            There is no active release currently availabe for this platform.
          </p>
        </div>
      );
    }
  }

  render() {
    return (
      <div className='new-cluster--release-selector'>
        {this.state.loading
          ? this.loadingContent()
          : this.state.error
          ? undefined
          : this.loadedContent()}

        <ReleaseDetailsModal
          ref={r => {
            this.releaseDetailsModal = r;
          }}
          releases={_.map(this.state.selectableReleases, version => {
            return this.props.releases[version];
          })}
          selectedRelease={this.state.selectedRelease}
          releaseSelected={this.selectRelease.bind(this)}
        />
      </div>
    );
  }
}

ReleaseSelector.propTypes = {
  dispatch: PropTypes.func,
  provider: PropTypes.string,
  releaseSelected: PropTypes.func,
  releases: PropTypes.object, // Version string to a release object i.e.: {"0.1.0": {...}, "0.2.0", {...}}
  activeSortedReleases: PropTypes.array, // Array of strings i.e: ["0.1.0", "0.2.0"]
  user: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

function mapStateToProps(state) {
  var provider = state.app.info.general.provider;
  var releases = Object.assign({}, state.entities.releases.items);

  var activeSortedReleases = _.filter(releases, release => release.active);
  activeSortedReleases = _.map(
    activeSortedReleases,
    release => release.version
  );
  activeSortedReleases.sort(cmp).reverse();

  return {
    activeSortedReleases,
    provider,
    releases,
    user: state.app.loggedInUser,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReleaseSelector);
