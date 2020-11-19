import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { Constants } from 'shared/constants';
import { getReleaseEOLStatus } from 'stores/releases/utils';
import Button from 'UI/Button';
import ComponentChangelog from 'UI/ComponentChangelog';
import ReleaseComponentLabel from 'UI/ReleaseComponentLabel';
import { groupBy, sortBy } from 'underscore';

import ReleaseDetailsModalSection from './ReleaseDetailsModalSection';

class ReleaseDetailsModal extends React.Component {
  static formatComponentVersion(release, component) {
    const { name, version } = component;

    if (
      name === 'kubernetes' &&
      release.k8sVersionEOLDate &&
      !version.endsWith(Constants.APP_VERSION_EOL_SUFFIX)
    ) {
      const { isEol } = getReleaseEOLStatus(release.k8sVersionEOLDate);
      if (isEol) {
        return `${version} ${Constants.APP_VERSION_EOL_SUFFIX}`;
      }
    }

    return version;
  }

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
    const { release } = this.props;

    const changes = groupBy(release.changelog, (item) => {
      return item.component;
    });

    const changedComponents = Object.keys(changes).sort();

    return (
      <BootstrapModal
        className='release-selector-modal'
        onHide={this.close}
        show={this.state.modalVisible}
      >
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>
            Details for release {release.version}
          </BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          <div
            className='release-selector-modal--release-details'
            key={release.version}
            data-testid={`release-${release.version}`}
          >
            <p className='release-selector-modal--release-details--date'>
              Released <span>{relativeDate(release.timestamp)}</span>
            </p>

            <div className='release-selector-modal--components'>
              {sortBy(release.components, 'name').map((component) => (
                <ReleaseComponentLabel
                  key={component.name}
                  name={component.name}
                  version={ReleaseDetailsModal.formatComponentVersion(
                    release,
                    component
                  )}
                />
              ))}
            </div>

            <ReleaseDetailsModalSection title='Changes'>
              <dl>
                {changedComponents.map((componentName, index) => {
                  return (
                    <ComponentChangelog
                      changes={changes[componentName].map((c) => {
                        return c.description;
                      })}
                      key={index}
                      name={componentName}
                    />
                  );
                })}
              </dl>
            </ReleaseDetailsModalSection>
          </div>
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <Button onClick={this.close}>Close</Button>
        </BootstrapModal.Footer>
      </BootstrapModal>
    );
  }
}

ReleaseDetailsModal.propTypes = {
  release: PropTypes.object,
};

export default ReleaseDetailsModal;
