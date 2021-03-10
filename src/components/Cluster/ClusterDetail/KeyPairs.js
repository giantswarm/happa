import differenceInSeconds from 'date-fns/fp/differenceInSeconds';
import toDate from 'date-fns-tz/toDate';
import { spinner } from 'images';
import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Copyable from 'shared/Copyable';
import * as clusterActions from 'stores/cluster/actions';
import { CLUSTER_LOAD_KEY_PAIRS_REQUEST } from 'stores/cluster/constants';
import { selectLoadingFlagByAction } from 'stores/loading/selectors';
import { getLoggedInUser } from 'stores/main/selectors';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import FlashMessage from 'UI/Display/FlashMessage';

import CertificateOrgsLabel from './CertificateOrgsLabel';
import KeypairCreateModal from './KeypairCreateModal/KeyPairCreateModal';
import KeyPairDetailsModal from './KeyPairDetailsModal';

const Disclaimer = styled.p`
  margin: 0 0 20px;
  line-height: 1.2;
`;

const Wrapper = styled.div`
  .loader {
    width: 25px;
    height: 25px;
    margin-bottom: 25px;
  }

  .react-bootstrap-table table {
    table-layout: auto;
  }

  .certificate-orgs-column {
    max-width: 350px;
    white-space: wrap;
    display: table-cell;
    overflow-wrap: normal;
    word-break: break-all;
  }
`;

class KeyPairs extends React.Component {
  static createdCellFormatter(_cell, row) {
    return <small>{relativeDate(row.create_date)}</small>;
  }

  static expireDateCellFormatter(_cell, row) {
    let expiryClass = '';

    const expirationDate = toDate(row.expire_date, { timeZone: 'UTC' });
    const expirySeconds = differenceInSeconds(expirationDate)(new Date());

    // eslint-disable-next-line no-magic-numbers
    if (Math.abs(expirySeconds) < 60 * 60 * 24) {
      expiryClass = 'expiring';
    }

    return (
      <small className={expiryClass}>{relativeDate(row.expire_date)}</small>
    );
  }

  static organizationFormatter(_cell, row) {
    if (row.certificate_organizations !== '') {
      return (
        <Copyable copyText={row.certificate_organizations}>
          <CertificateOrgsLabel value={row.certificate_organizations} />
        </Copyable>
      );
    }

    return <span />;
  }

  state = {
    // eslint-disable-next-line react/no-unused-state
    error: false,
    // eslint-disable-next-line react/no-unused-state
    expireTTL: 720,
    // eslint-disable-next-line react/no-unused-state
    description: '',
    // eslint-disable-next-line react/no-unused-state
    cn_prefix: '',
    // eslint-disable-next-line react/no-unused-state
    cn_prefix_error: null,
    // eslint-disable-next-line react/no-unused-state
    certificate_organizations: '',
    // eslint-disable-next-line react/no-unused-state
    modal: {
      visible: false,
      loading: false,
      template: 'addKeyPair',
    },
    keyPairDetailsModal: {
      visible: false,
      keyPair: null,
    },
  };

  apiEndpointHostname = '';

  componentDidMount() {
    try {
      this.apiEndpointHostname = new URL(
        this.props.cluster.api_endpoint
      ).hostname;
    } catch (error) {
      throw Error(`Api endpoint: ${this.props.cluster.api_endpoint}`);
    }
  }

  // Provides the configuration for the keypairs table
  getKeypairsTableColumnsConfig = () => {
    return [
      {
        dataField: 'common_name',
        text: 'Common Name (CN)',
        sort: true,
        formatter: this.commonNameFormatter,
      },
      {
        dataField: 'certificate_organizations',
        text: 'Organization (O)',
        sort: true,
        formatter: KeyPairs.organizationFormatter,
        classes: 'certificate-orgs-column',
      },
      {
        dataField: 'create_date',
        text: 'Created',
        sort: true,
        formatter: KeyPairs.createdCellFormatter,
      },
      {
        dataField: 'expire_date',
        text: 'Expiry',
        sort: true,
        formatter: KeyPairs.expireDateCellFormatter,
      },
      {
        dataField: 'id',
        text: '',
        sort: false,
        formatter: this.actionsCellFormatter,
      },
    ];
  };

  /**
   * Replaces a common suffix in every CN string, returns it as copyable
   */
  commonNameFormatter = (_cell, row) => {
    let displayName = row.common_name;
    displayName = displayName.replace(`.${this.apiEndpointHostname}`, '...');

    return (
      <Copyable copyText={row.common_name}>
        <small>{displayName}</small>
      </Copyable>
    );
  };

  showKeyPairModal = (row) => {
    this.setState({
      keyPairDetailsModal: {
        visible: true,
        keyPair: row,
      },
    });
  };

  hideKeyPairModal = () => {
    this.setState({
      keyPairDetailsModal: {
        visible: false,
        keyPair: null,
      },
    });
  };

  actionsCellFormatter = (_cell, row) => {
    return (
      <Button bsSize='sm' onClick={this.showKeyPairModal.bind(this, row)}>
        Details
      </Button>
    );
  };

  render() {
    return (
      <Wrapper>
        <Disclaimer>
          Key pairs consist of an RSA private key and certificate, signed by the
          certificate authority (CA) belonging to this cluster. They are used
          for access to the cluster via the Kubernetes API.
        </Disclaimer>

        {(() => {
          if (this.props.loadingKeyPairs) {
            return (
              <p>
                <img className='loader' src={spinner} />
              </p>
            );
          } else if (!this.props.cluster.keyPairs) {
            return (
              <>
                <FlashMessage type='danger'>
                  Something went wrong while trying to load the list of key
                  pairs.
                </FlashMessage>
                <Button onClick={this.loadKeyPairs}>
                  Try loading key pairs again.
                </Button>
              </>
            );
          } else if (
            this.props.cluster.keyPairs &&
            this.props.cluster.keyPairs.length === 0
          ) {
            return (
              <p>No key pairs yet. Why don&apos;t you create your first?</p>
            );
          }

          return (
            <BootstrapTable
              bordered={false}
              columns={this.getKeypairsTableColumnsConfig()}
              data={this.props.cluster.keyPairs}
              defaultSortDirection='asc'
              defaultSorted={[{ dataField: 'create_date', order: 'desc' }]}
              keyField='id'
            />
          );
        })()}
        <KeypairCreateModal
          actions={this.props.actions}
          cluster={this.props.cluster}
          provider={this.props.provider}
          user={this.props.user}
        />
        <KeyPairDetailsModal
          keyPair={this.state.keyPairDetailsModal.keyPair}
          onClose={this.hideKeyPairModal}
          visible={this.state.keyPairDetailsModal.visible}
        />
      </Wrapper>
    );
  }
}

KeyPairs.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object,
  provider: PropTypes.string,
  cluster: PropTypes.object,
  loadingKeyPairs: PropTypes.bool,
};

function mapStateToProps(state) {
  return {
    clusters: state.entities.clusters,
    provider: state.main.info.general.provider,
    user: getLoggedInUser(state),
    loadingKeyPairs: selectLoadingFlagByAction(
      state,
      CLUSTER_LOAD_KEY_PAIRS_REQUEST
    ),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(KeyPairs);
