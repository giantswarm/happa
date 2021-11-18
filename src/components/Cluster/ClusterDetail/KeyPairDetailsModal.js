import differenceInSeconds from 'date-fns/fp/differenceInSeconds';
import toDate from 'date-fns-tz/toDate';
import React from 'react';
import Copyable from 'shared/Copyable';
import FormattedDate from 'UI/Display/Date';
import NotAvailable from 'UI/Display/NotAvailable';
import DetailItem from 'UI/Layout/DetailList';
import Modal from 'UI/Layout/Modal';

import CertificateOrgsLabel from './CertificateOrgsLabel';

class KeyPairDetailsModal extends React.Component {
  static createDate(date) {
    return (
      <span>
        <FormattedDate value={date} /> &ndash;{' '}
        <FormattedDate relative={true} value={date} />
      </span>
    );
  }

  static expireDate(expiry) {
    let expiryClass = '';

    const expirationDate = toDate(expiry, { timeZone: 'UTC' });
    const expirySeconds = differenceInSeconds(expirationDate)(new Date());

    // eslint-disable-next-line no-magic-numbers
    if (expirySeconds < 60 * 60 * 24) {
      expiryClass = 'expiring';
    }

    return (
      <span className={expiryClass}>
        <FormattedDate value={expiry} /> &ndash;{' '}
        <FormattedDate relative={true} value={expiry} />
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
      <Modal
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
            <NotAvailable />
          ) : (
            <Copyable copyText={this.props.keyPair.common_name}>
              <span>{this.props.keyPair.common_name}</span>
            </Copyable>
          )}
        </DetailItem>

        <DetailItem title='Certificate Organizations (O)'>
          {this.props.keyPair.certificate_organizations === '' ? (
            <NotAvailable />
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
            <NotAvailable />
          ) : (
            this.props.keyPair.description
          )}
        </DetailItem>
      </Modal>
    );
  }
}

export default KeyPairDetailsModal;
