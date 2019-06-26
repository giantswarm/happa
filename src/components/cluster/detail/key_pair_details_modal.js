import { relativeDate } from '../../../lib/helpers.js';
import CertificateOrgsLabel from './certificate_orgs_label';
import Copyable from '../../shared/copyable';
import GenericModal from '../../modals/generic_modal';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

class KeyPairDetailsModal extends React.Component {
  createDate(date) {
    return (
      <span>
        {moment(date)
          .utc()
          .format('D MMM YYYY, HH:mm z')}{' '}
        &ndash; {relativeDate(date)}
      </span>
    );
  }

  expireDate(expiry) {
    var expiryClass = '';
    var expirySeconds = expiry.utc().diff(moment().utc()) / 1000;
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
        className='keypairdetails'
        onClose={this.props.onClose}
        title='Key Pair Details'
        visible={this.props.visible}
      >
        <div>
          <div className='labelvaluepair'>
            <div className='labelvaluepair--label'>ID</div>
            <div className='labelvaluepair--value code'>
              <Copyable copyText={this.props.keyPair.id}>
                <span>{this.props.keyPair.id}</span>
              </Copyable>
            </div>
          </div>

          <div className='labelvaluepair'>
            <div className='labelvaluepair--label'>Common Name (CN)</div>
            <div className='labelvaluepair--value code breaking'>
              {this.props.keyPair.common_name === '' ? (
                <span>n/</span>
              ) : (
                <Copyable copyText={this.props.keyPair.common_name}>
                  <span>{this.props.keyPair.common_name}</span>
                </Copyable>
              )}
            </div>
          </div>

          <div className='labelvaluepair'>
            <div className='labelvaluepair--label'>
              Certificate Organizations (O)
            </div>
            <div className='labelvaluepair--value'>
              {this.props.keyPair.certificate_organizations === '' ? (
                <span>n/a</span>
              ) : (
                <Copyable
                  copyText={this.props.keyPair.certificate_organizations}
                >
                  <CertificateOrgsLabel
                    value={this.props.keyPair.certificate_organizations}
                  />
                </Copyable>
              )}
            </div>
          </div>

          <div className='labelvaluepair'>
            <div className='labelvaluepair--label'>Created</div>
            <div className='labelvaluepair--value'>
              {this.createDate(this.props.keyPair.create_date)}
            </div>
          </div>

          <div className='labelvaluepair'>
            <div className='labelvaluepair--label'>Expiry</div>
            <div className='labelvaluepair--value'>
              {this.expireDate(this.props.keyPair.expire_date)}
            </div>
          </div>

          <div className='labelvaluepair'>
            <div className='labelvaluepair--label'>Description</div>
            <div className='labelvaluepair--value'>
              {this.props.keyPair.description === '' ? (
                <span>n/a</span>
              ) : (
                this.props.keyPair.description
              )}
            </div>
          </div>
        </div>
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
