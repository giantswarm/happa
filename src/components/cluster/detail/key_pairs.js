import * as clusterActions from 'actions/clusterActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { relativeDate } from 'lib/helpers.js';
import { spinner } from 'images';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'UI/button';
import CertificateOrgsLabel from './certificate_orgs_label';
import Copyable from 'shared/copyable';
import KeypairCreateModal from './key_pair_create_modal';
import KeyPairDetailsModal from './key_pair_details_modal';
import LoadingOverlay from 'UI/loading_overlay';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

class ClusterKeyPairs extends React.Component {
  state = {
    loading: true,
    error: false,
    expireTTL: 720,
    description: '',
    cn_prefix: '',
    cn_prefix_error: null,
    certificate_organizations: '',
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
    this.loadKeyPairs();

    this.apiEndpointHostname = new URL(
      this.props.cluster.api_endpoint
    ).hostname;
  }

  loadKeyPairs() {
    // this.setState({
    //   loading: true,
    //   error: false,
    // });

    return this.props.actions
      .clusterLoadKeyPairs(this.props.cluster.id)
      .then(() => {
        this.setState({
          loading: false,
          error: false,
        });
      })
      .catch(() => {
        // In case of error delay a half second so that the user gets a chance to
        // see the spinner before we blast the error state.
        setTimeout(() => {
          this.setState({
            loading: false,
            error: true,
          });
        }, 500);
      });
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
        formatter: this.organizationFormatter,
        classes: 'certificate-orgs-column',
      },
      {
        dataField: 'create_date',
        text: 'Created',
        sort: true,
        formatter: this.createdCellFormatter,
      },
      {
        dataField: 'expire_date',
        text: 'Expiry',
        sort: true,
        formatter: this.expireDateCellFormatter,
      },
      {
        dataField: 'id',
        text: '',
        sort: false,
        formatter: this.actionsCellFormatter,
      },
    ];
  };

  createdCellFormatter(cell, row) {
    return <small>{relativeDate(row.create_date)}</small>;
  }

  expireDateCellFormatter(cell, row) {
    var expiryClass = '';
    var expirySeconds =
      moment(row.expire_date)
        .utc()
        .diff(moment().utc()) / 1000;
    if (Math.abs(expirySeconds) < 60 * 60 * 24) {
      expiryClass = 'expiring';
    }

    return (
      <small className={expiryClass}>{relativeDate(row.expire_date)}</small>
    );
  }

  /**
   * Replaces a common suffix in every CN string, returns it as copyable
   */
  commonNameFormatter = (cell, row) => {
    let displayName = row.common_name;
    displayName = displayName.replace('.' + this.apiEndpointHostname, '...');

    return (
      <Copyable copyText={row.common_name}>
        <small>{displayName}</small>
      </Copyable>
    );
  };

  organizationFormatter(cell, row) {
    if (row.certificate_organizations !== '') {
      return (
        <Copyable copyText={row.certificate_organizations}>
          <CertificateOrgsLabel value={row.certificate_organizations} />
        </Copyable>
      );
    }
    return <span />;
  }

  showKeyPairModal = row => {
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

  actionsCellFormatter = (cell, row) => {
    return (
      <Button onClick={this.showKeyPairModal.bind(this, row)}>Details</Button>
    );
  };

  render() {
    return (
      <LoadingOverlay loading={this.state.loading}>
        <div className='row cluster_key_pairs col-12'>
          <div className='row'>
            <p>
              Key pairs consist of an RSA private key and certificate, signed by
              the certificate authority (CA) belonging to this cluster. They are
              used for access to the cluster via the Kubernetes API.
            </p>
          </div>

          <div className='row'>
            <div className='col-12'>
              {(() => {
                if (this.state.loading) {
                  return (
                    <p>
                      <img className='loader' src={spinner} />
                    </p>
                  );
                } else if (this.state.error) {
                  return (
                    <div>
                      <div className='flash-messages--flash-message flash-messages--danger'>
                        Something went wrong while trying to load the list of
                        key pairs.
                      </div>
                      <Button onClick={this.loadKeyPairs.bind(this)}>
                        Try loading key pairs again.
                      </Button>
                    </div>
                  );
                } else if (
                  this.props.cluster.keyPairs &&
                  this.props.cluster.keyPairs.length === 0
                ) {
                  return (
                    <div>
                      <p>
                        No key pairs yet. Why don&apos;t you create your first?
                      </p>
                    </div>
                  );
                } else if (this.props.cluster.keyPairs) {
                  return (
                    <div>
                      <BootstrapTable
                        bordered={false}
                        columns={this.getKeypairsTableColumnsConfig()}
                        data={this.props.cluster.keyPairs}
                        defaultSortDirection='asc'
                        defaultSorted={[
                          { dataField: 'create_date', order: 'desc' },
                        ]}
                        keyField='id'
                      />
                    </div>
                  );
                }
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
            </div>
          </div>
        </div>
      </LoadingOverlay>
    );
  }
}

ClusterKeyPairs.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object,
  provider: PropTypes.string,
  cluster: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    clusters: state.entities.clusters,
    provider: state.app.info.general.provider,
    user: state.app.loggedInUser,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClusterKeyPairs);
