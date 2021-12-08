import differenceInSeconds from 'date-fns/fp/differenceInSeconds';
import toDate from 'date-fns-tz/toDate';
import { spinner } from 'images';
import * as clusterActions from 'model/stores/cluster/actions';
import { CLUSTER_LOAD_KEY_PAIRS_REQUEST } from 'model/stores/cluster/constants';
import { selectLoadingFlagByAction } from 'model/stores/loading/selectors';
import { getLoggedInUser } from 'model/stores/main/selectors';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Copyable from 'shared/Copyable';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import DataTable from 'UI/DataTable';
import FormattedDate from 'UI/Display/Date';
import FlashMessage from 'UI/Display/FlashMessage';
import ErrorReporter from 'utils/errors/ErrorReporter';

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
`;

class KeyPairs extends React.Component {
  static createdCellFormatter(data) {
    return <FormattedDate relative={true} value={data.create_date} />;
  }

  static expireDateCellFormatter(data) {
    let expiryClass = '';

    const expirationDate = toDate(data.expire_date, { timeZone: 'UTC' });
    const expirySeconds = differenceInSeconds(expirationDate)(new Date());

    // eslint-disable-next-line no-magic-numbers
    if (Math.abs(expirySeconds) < 60 * 60 * 24) {
      expiryClass = 'expiring';
    }

    return (
      <FormattedDate
        className={expiryClass}
        relative={true}
        value={data.expire_date}
      />
    );
  }

  static organizationFormatter(data) {
    if (data.certificate_organizations !== '') {
      return (
        <Copyable copyText={data.certificate_organizations}>
          <CertificateOrgsLabel value={data.certificate_organizations} />
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
      ErrorReporter.getInstance().notify(error);
    }
  }

  // Provides the configuration for the keypairs table
  getKeypairsTableColumnsConfig = () => {
    return [
      {
        property: 'common_name',
        header: 'Common Name (CN)',
        primary: true,
        render: this.commonNameFormatter,
      },
      {
        property: 'certificate_organizations',
        header: 'Organization (O)',
        render: KeyPairs.organizationFormatter,
      },
      {
        property: 'create_date',
        header: 'Created',
        render: KeyPairs.createdCellFormatter,
        size: 'small',
      },
      {
        property: 'expire_date',
        header: 'Expiry',
        render: KeyPairs.expireDateCellFormatter,
        size: 'small',
      },
      {
        property: 'dummy',
        align: 'end',
        render: this.actionsCellFormatter,
        size: 'xsmall',
      },
    ];
  };

  /**
   * Replaces a common suffix in every CN string, returns it as copyable
   */
  // eslint-disable-next-line class-methods-use-this
  commonNameFormatter = (data) => {
    return (
      <Copyable copyText={data.common_name}>
        <span>{data.common_name}</span>
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

  actionsCellFormatter = (data) => {
    return (
      <Button size='small' onClick={this.showKeyPairModal.bind(this, data)}>
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
            <DataTable
              columns={this.getKeypairsTableColumnsConfig()}
              data={this.props.cluster.keyPairs}
              sort={{ property: 'create_date', direction: 'desc' }}
              sortable={true}
              fill='horizontal'
              margin={{ top: 'small', bottom: 'medium' }}
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

function mapStateToProps(state) {
  return {
    clusters: state.entities.clusters,
    provider: window.config.info.general.provider,
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
