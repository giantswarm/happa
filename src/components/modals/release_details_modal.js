import { relativeDate } from '../../lib/helpers.js';
import _ from 'underscore';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from '../UI/button';
import PropTypes from 'prop-types';
import React from 'react';

class ReleaseDetailsModal extends React.Component {
  state = {
    modalVisible: false,
  };

  show = () => {
    this.setState({
      modalVisible: true,
    });
  };

  close = () => {
    this.setState({
      modalVisible: false,
    });
  };

  selectRelease = version => {
    this.props.releaseSelected(version);
  };

  render() {
    return (
      <BootstrapModal
        className='release-selector-modal'
        onHide={this.close}
        show={this.state.modalVisible}
      >
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>Release Details</BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          {this.props.releases.map(release => {
            return (
              <div
                className='release-selector-modal--release-details'
                key={release.version}
              >
                <h2>
                  Version {release.version}{' '}
                  {// If we have a way of selecting a release, show the selection
                  // buttons. This way the create cluster screen can show the
                  // select button, and the cluster detail screen can omit it.
                  this.props.releaseSelected ? (
                    this.props.selectedRelease === release.version ? (
                      <span className='selected'>Selected</span>
                    ) : (
                      <Button
                        onClick={this.selectRelease.bind(this, release.version)}
                      >
                        Select
                      </Button>
                    )
                  ) : (
                    undefined
                  )}
                </h2>
                <p className='release-selector-modal--release-details--date'>
                  Released <span>{relativeDate(release.timestamp)}</span>
                </p>

                <div className='release-selector-modal--components'>
                  {_.sortBy(release.components, 'name').map(component => {
                    return (
                      <div
                        className='release-selector-modal--component'
                        key={component.name}
                      >
                        <span className='release-selector-modal--component--name'>
                          {component.name}
                        </span>
                        <span className='release-selector-modal--component--version'>
                          {component.version}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p>Changes</p>
                <ul>
                  {release.changelog.map((changelog, i) => {
                    return (
                      <li key={changelog.component + i}>
                        <b>{changelog.component}:</b> {changelog.description}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <Button onClick={this.close}>Close</Button>
        </BootstrapModal.Footer>
      </BootstrapModal>
    );
  }
}

ReleaseDetailsModal.propTypes = {
  releases: PropTypes.array,
  selectedRelease: PropTypes.string,
  releaseSelected: PropTypes.func,
};

export default ReleaseDetailsModal;
