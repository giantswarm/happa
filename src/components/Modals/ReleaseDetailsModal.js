import { relativeDate } from 'lib/helpers.js';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import theme from 'styles/theme';
import Button from 'UI/Button';
import ComponentChangelog from 'UI/ComponentChangelog';
import ReleaseComponentLabel from 'UI/ReleaseComponentLabel';
import _ from 'underscore';

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
    if (this.props.releases && this.props.releases.length > 0) {
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
              // group changes by component
              const changes = _.groupBy(release.changelog, item => {
                return item.component;
              });

              const changedComponents = Object.keys(changes).sort();

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
                    this.props.selectedRelease ? (
                      this.props.selectedRelease === release.version ? (
                        <span className='selected'>Selected</span>
                      ) : (
                        <Button
                          onClick={() =>
                            this.props.selectRelease(release.version)
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
      );
    } 
      
return (
        <p style={{ color: theme.colors.error, fontWeight: 400 }}>
          No releases found.
        </p>
      );
    
  }
}

ReleaseDetailsModal.propTypes = {
  releases: PropTypes.array,
  selectedRelease: PropTypes.string,
  selectRelease: PropTypes.func,
};

export default ReleaseDetailsModal;
