import { relativeDate } from 'lib/helpers';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import Copyable from 'shared/Copyable';
import DetailItem from 'UI/DetailList';

import GenericModal from '../../Modals/GenericModal';
import CertificateOrgsLabel from './CertificateOrgsLabel';

class KeyPairDetailsModal extends React.Component {
  static createDate(date) {
    return (
      <span>
        {moment(date).utc().format('D MMM YYYY, HH:mm z')} &ndash;{' '}
        {relativeDate(date)}
      </span>
    );
  }

  static expireDate(expiry) {
    let expiryClass = '';
    // eslint-disable-next-line no-magic-numbers
    const expirySeconds = expiry.utc().diff(moment().utc()) / 1000;

    // eslint-disable-next-line no-magic-numbers
    if (Math.abs(expirySeconds) < 60 * 60 * 24) {
      expiryClass = 'expiring';
    }

    return (
      <span className={expiryClass}>
        {expiry.format('D MMM YYYY, HH:mm z')} &ndash; {relativeDate(expiry)}
      </span>
    );
  }

  render() {
    if (
      this.props.keyPair === null ||
      typeof this.props.keyPair === 'undefined'
    ) {
      return <span />;
    }

    return (
      <GenericModal
        onClose={this.props.onClose}
        title='Key Pair Details'
        visible={this.props.visible}
      >
        <DetailItem title='ID' className='code'>
          <Copyable copyText={this.props.keyPair.id}>
            <span>{this.props.keyPair.id}</span>
          </Copyable>
        </DetailItem>

        <DetailItem title='Common Name (CN)' className='code breaking'>
          {this.props.keyPair.common_name === '' ? (
            <span>n/a</span>
          ) : (
            <Copyable copyText={this.props.keyPair.common_name}>
              <span>{this.props.keyPair.common_name}</span>
            </Copyable>
          )}
        </DetailItem>

        <DetailItem title='Certificate Organizations (O)'>
          {this.props.keyPair.certificate_organizations === '' ? (
            <span>n/a</span>
          ) : (
            <Copyable copyText={this.props.keyPair.certificate_organizations}>
              <CertificateOrgsLabel
                value={this.props.keyPair.certificate_organizations}
              />
            </Copyable>
          )}
        </DetailItem>

        <DetailItem title='Created'>
          {KeyPairDetailsModal.createDate(this.props.keyPair.create_date)}
        </DetailItem>

        <DetailItem title='Expiry'>
          {KeyPairDetailsModal.expireDate(this.props.keyPair.expire_date)}
        </DetailItem>

        <DetailItem title='Description'>
          {this.props.keyPair.description === '' ? (
            <span>n/a</span>
          ) : (
            this.props.keyPair.description
          )}
        </DetailItem>
      </GenericModal>
    );
  }
}

KeyPairDetailsModal.propTypes = {
  keyPair: PropTypes.object,
  onClose: PropTypes.func,
  visible: PropTypes.bool,
};

export default KeyPairDetailsModal;
