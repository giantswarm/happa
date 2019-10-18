import { relativeDate } from 'lib/helpers.js';
import _ from 'underscore';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'UI/button';
import ComponentChangelog from 'UI/component_changelog';
import LoadingOverlay from 'UI/loading_overlay';
import PropTypes from 'prop-types';
import React from 'react';
import ReleaseComponentLabel from 'UI/release_component_label';

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

  render() {
    return (
      <LoadingOverlay
        loading={this.props.releases && this.props.releases.length > 0}
      >
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
              // group changes by component
              let changes = _.groupBy(release.changelog, item => {
                return item.component;
              });

              let changedComponents = Object.keys(changes).sort();

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
                          onClick={() =>
                            this.props.releaseSelected(release.version)
                          }
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
                        <ReleaseComponentLabel
                          key={component.name}
                          name={component.name}
                          version={component.version}
                        />
                      );
                    })}
                  </div>

                  <p>Changes</p>

                  <dl>
                    {changedComponents.map((componentName, index) => {
                      return (
                        <ComponentChangelog
                          changes={changes[componentName].map(c => {
                            return c.description;
                          })}
                          key={index}
                          name={componentName}
                        />
                      );
                    })}
                  </dl>
                </div>
              );
            })}
          </BootstrapModal.Body>
          <BootstrapModal.Footer>
            <Button onClick={this.close}>Close</Button>
          </BootstrapModal.Footer>
        </BootstrapModal>
      </LoadingOverlay>
    );
  }
}

ReleaseDetailsModal.propTypes = {
  releases: PropTypes.array,
  selectedRelease: PropTypes.string,
  releaseSelected: PropTypes.func,
};

export default ReleaseDetailsModal;
