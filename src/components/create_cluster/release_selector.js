'use strict';

import React from 'react';
import cmp from 'semver-compare';
import Button from '../button';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import {connect} from 'react-redux';
import { loadReleases } from '../../actions/releaseActions';
import { flashAdd } from '../../actions/flashMessageActions';
import _ from 'underscore';
import { relativeDate } from '../../lib/helpers.js';

class ReleaseSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: false,
      selectedRelease: '',
      modal: {
        visible: false
      }
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
      error: false
    });

    this.props.dispatch(loadReleases())
    .then(() => {
      // select latest release as a default
      var allVersions = Object.keys(this.props.releases);
      if (allVersions.length > 0) {
        allVersions.sort(cmp).reverse();
        var defaulVersion = allVersions[0];
        this.selectRelease(defaulVersion);
      }

      this.setState({
        loading: false,
        error: false
      });
    })
    .catch((error) => {
      this.setState({
        loading: false,
        error: true
      });

      this.props.dispatch(flashAdd({
        message: <div>
          <b>Something went wrong while trying to fetch the list of releases.</b><br/>
          {error.body ? error.body.message : ''}
          <br/>
          Perhaps our servers are down, please try again later or contact support: support@giantswarm.io
        </div>,
        class: 'danger'
      }));

      throw(error);
    });
  }

  /**
   * Sets the currently selected release
   */
  selectRelease(release) {
    this.setState({
      selectedRelease: release
    });
    this.props.releaseSelected(release);
  }

  closeModal = () => {
    this.setState({
      modal: {
        visible: false
      }
    });
  }

  openModal = () => {
    this.setState({
      modal: {
        visible: true
      }
    });
  }

  buttonText() {
    var activeReleases = _.filter(this.props.releases, (x) => {return x.active;});

    if (activeReleases.length === 1) {
      return 'Show Details';
    } else {
      return 'Details and Alternatives';
    }
  }

  loadingContent() {
    return <div>
      <p><img className='loader' src='/images/loader_oval_light.svg' width="25px" height="25px" /></p>
    </div>;
  }

  loadedContent() {
    return <div>
      <p>{ this.state.selectedRelease }</p>
      <Button onClick={this.openModal}>{ this.buttonText() }</Button>
    </div>;
  }

  render() {
    var allVersions = Object.keys(this.props.releases);
    allVersions.sort(cmp).reverse();
    return (
      <div className='new-cluster--release-selector' >
        {
          this.state.loading ? this.loadingContent() :
            this.state.error ? this.loadingContent() :
              this.loadedContent()
        }

        <BootstrapModal className='release-selector-modal' show={this.state.modal.visible} onHide={this.closeModal}>
          <BootstrapModal.Header closeButton>
            <BootstrapModal.Title>Select a release</BootstrapModal.Title>
          </BootstrapModal.Header>
            <BootstrapModal.Body>
              {
                _.map(allVersions, (version) => {
                  var release = this.props.releases[version];
                  if (release.active) {
                    return <div className='release-selector-modal--release-details' key={release.version}>
                      <h2>Version {release.version} {
                        this.state.selectedRelease === release.version ?
                          <span className='selected'>Selected</span>
                          :
                          <Button onClick={this.selectRelease.bind(this, release.version)}>Select</Button>
                      }</h2>
                      <p className='release-selector-modal--release-details--date'>Released <span>{relativeDate(release.timestamp)}</span></p>

                      <div className='release-selector-modal--components'>
                        {
                           _.map(_.sortBy(release.components, 'name'), (component) => {
                            return <div className='release-selector-modal--component' key={component.name}>
                              <span className='release-selector-modal--component--name'>{component.name}</span>
                              <span className='release-selector-modal--component--version'>{component.version}</span>
                            </div>;
                          })
                        }
                      </div>
                      <p>Changes</p>
                      <ul>
                        {
                          _.map(release.changelog, (changelog) => {
                            return <li key={changelog.component}>{changelog.description}</li>;
                          })
                        }
                      </ul>
                    </div>;
                  }
              })
            }
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button onClick={this.closeModal}>Close</Button>
            </BootstrapModal.Footer>
        </BootstrapModal>
      </div>
    );
  }
}

ReleaseSelector.propTypes = {
  dispatch: React.PropTypes.func,
  releaseSelected: React.PropTypes.func,
  releases: React.PropTypes.object
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

function mapStateToProps(state) {
  var releases = Object.assign({}, state.entities.releases.items);

  releases["1.2.0"] = {"active":true,"changelog":[{"component":"kubernetes","description":"Updated to kubernetes 1.8.4. Fixes a goroutine leak in the k8s api."},{"component":"vault","description":"Vault version updated."}],"components":[{"name":"calico","version":"2.6.2"},{"name":"docker","version":"1.12.6"},{"name":"etcd","version":"3.2.7"},{"name":"kubedns","version":"1.14.5"},{"name":"kubernetes","version":"1.8.4"},{"name":"nginx-ingress-controller","version":"0.9.0"},{"name":"vault","version":"0.7.3"}],"timestamp":"2017-12-05T13:00:00Z","version":"1.2.0"}

  return {
    releases
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReleaseSelector);
