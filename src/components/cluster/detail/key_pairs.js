import * as clusterActions from '../../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { relativeDate } from '../../../lib/helpers.js';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from '../../shared/button';
import CertificateOrgsLabel from './certificate_orgs_label';
import Copyable from '../../shared/copyable';
import KeypairCreateModal from './key_pair_create_modal';
import KeypairDetailModal from './generic_modal';
import moment from 'moment';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from 'react-bootstrap/lib/Tooltip';

class ClusterKeyPairs extends React.Component {
  state = {
    loading: true,
    error: false,
    expireTTL: 720,
    description: '',
    cn_prefix: '',
    cn_prefix_error: null,
    certificate_organizations: '',
    keypairModal: {
      visible: false,
      keypair: {
        id: '',
      },
    },
    modal: {
      visible: false,
      loading: false,
      template: 'addKeyPair',
    },
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.loadKeyPairs();
  }

  loadKeyPairs() {
    this.setState({
      loading: true,
      error: false,
    });

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
        dataField: 'id',
        text: 'Description / ID',
        sort: true,
        formatter: this.descriptionCellFormatter,
        style: { maxWidth: '200px' },
        classes: 'truncate',
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
        dataField: 'common_name',
        text: 'Common Name (CN)',
        sort: true,
        formatter: this.commonNameFormatter,
        classes: 'truncate',
      },
      {
        dataField: 'certificate_organizations',
        text: 'Organization (O)',
        sort: true,
        formatter: this.organizationFormatter,
        classes: 'truncate',
      },
    ];
  };

  descriptionCellFormatter(cell, row) {
    return (
      <React.Fragment>
        <OverlayTrigger
          placement='top'
          overlay={<Tooltip id='tooltip'>{row.description}</Tooltip>}
        >
          <div style={{ overflow: 'hidden' }}>
            <span>{row.description}</span>
          </div>
        </OverlayTrigger>
        <Copyable copyText={row.id.replace(/:/g, '')}>
          <small>ID: {row.id.replace(/:/g, '')}</small>
        </Copyable>
      </React.Fragment>
    );
  }

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

  commonNameFormatter = (cell, row) => {
    return (
      <React.Fragment>
        <Copyable copyText={row.common_name}>
          <small>{row.common_name}</small>
        </Copyable>
        <br />
        <Button onClick={this.showKeypairModal.bind(this, row)}>Details</Button>
      </React.Fragment>
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

  bindShowModal = showFunc => {
    this.showModal = showFunc;
  };

  showKeypairModal = row => {
    this.setState({
      keypairModal: {
        visible: true,
        keypair: {
          id: row.id,
        },
      },
    });
  };

  hideKeypairModal = () => {
    this.setState({
      keypairModal: {
        visible: false,
      },
    });
  };

  render() {
    return (
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
                    <img
                      className='loader'
                      src='/images/loader_oval_light.svg'
                    />
                  </p>
                );
              } else if (this.state.error) {
                return (
                  <div>
                    <div className='flash-messages--flash-message flash-messages--danger'>
                      Something went wrong while trying to load the list of key
                      pairs.
                    </div>
                    <Button onClick={this.loadKeyPairs.bind(this)}>
                      Try loading key pairs again.
                    </Button>
                  </div>
                );
              } else if (this.props.cluster.keyPairs.length === 0) {
                return (
                  <div>
                    <p>
                      No key pairs yet. Why don&apos;t you create your first?
                    </p>
                  </div>
                );
              } else {
                return (
                  <div>
                    <BootstrapTable
                      keyField='id'
                      data={this.props.cluster.keyPairs}
                      columns={this.getKeypairsTableColumnsConfig()}
                      bordered={false}
                      defaultSorted={[
                        { dataField: 'create_date', order: 'desc' },
                      ]}
                      defaultSortDirection='asc'
                    />
                  </div>
                );
              }
            })()}
            <KeypairCreateModal
              user={this.props.user}
              cluster={this.props.cluster}
              actions={this.props.actions}
            />

            <KeypairDetailModal
              visible={this.state.keypairModal.visible}
              title='Key Pair Detail'
              onClose={this.hideKeypairModal}
            >
              ID:
              {this.state.keypairModal.keypair &&
                this.state.keypairModal.keypair.id}
            </KeypairDetailModal>
          </div>
        </div>
      </div>
    );
  }
}

ClusterKeyPairs.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object,
  cluster: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    clusters: state.entities.clusters,
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
