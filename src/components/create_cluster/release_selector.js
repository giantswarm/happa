'use strict';

import React from 'react';
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

  loadReleases() {
    this.setState({
      loading: true,
      error: false
    });

    this.props.dispatch(loadReleases())
    .then(() => {
      this.selectRelease(this.props.activeRelease);

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
          Perhaps our servers are down, please try again later or contact support: info@giantswarm.io
        </div>,
        class: 'danger'
      }));

      throw(error);
    });
  }

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
    if (Object.keys(this.props.releases).length === 1) {
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
                _.map(_.sortBy(this.props.releases, 'version').reverse(), (release) => {
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
  activeRelease: React.PropTypes.string,
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
  var activeRelease = state.entities.releases.activeRelease;

  return {
    activeRelease,
    releases
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReleaseSelector);
