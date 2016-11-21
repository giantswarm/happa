'use strict';

import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from '../button';
import * as clusterActions from '../../actions/clusterActions';
import moment from 'moment';
import { relativeDate, truncate } from '../../lib/helpers.js';
import {OverlayTrigger, Tooltip} from 'react-bootstrap/lib';
import ExpiryHoursPicker from './expiry_hours_picker';

class ClusterKeyPairs extends React.Component {
 constructor() {
    super();
    this.state = {
      loading: true,
      expireTTL: 8760,
      modal: {
        visible: true,
        loading: false,
        template: 'addKeyPair',
      }
    };
  }

  handleTTLChange(ttl) {
    console.log(ttl);
    this.setState({
      expireTTL: ttl
    });
  }

  componentDidMount() {
    this.props.actions.clusterLoadKeyPairs(this.props.cluster.id);
  }

  closeModal() {
    this.setState({
      modal: {
        visible: false,
        loading: false
      }
    });
  }

  addKeyPair() {
    this.setState({
      modal: {
        visible: true,
        loading: false,
        template: 'addKeyPair'
      }
    });
  }

  confirmAddKeyPair(e) {
    console.log(this.state.expireDate);
    if (e) {
      e.preventDefault();
    }

    this.setState({
      modal: {
        visible: true,
        loading: true,
        template: 'addKeyPair'
      }
    }, () => {
      this.setState({
        modal: {
          visible: true,
          loading: false,
          template: 'addKeyPairSuccess'
        }
      });
   });
  }

  render() {
    return (
      <div className='row section'>
        <div className='col-3'>
          <h3 className='table-label'>Key Pairs</h3>
        </div>
        <div className='col-9'>
          <p>Key pairs consist of an RSA private key and certificate, signed by the certificate authority (CA) belonging to this cluster. They are used for access to the cluster via the Kubernetes API.</p>
          <br/>
          {
            this.props.cluster.keyPairs.length === 0 ?
            <p>No key pairs yet. Why don't you create your first?</p>
            :
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.props.cluster.keyPairs.map((keyPair) => {
                    return <tr key={keyPair.id}>
                      <td className="code">


                        <OverlayTrigger placement="top" overlay={
                            <Tooltip id="tooltip">{keyPair.id}</Tooltip>
                          }>
                          <span>{truncate(keyPair.id, 10)}</span>
                        </OverlayTrigger>

                      </td>

                      <td>{keyPair.description}</td>
                      <td>{relativeDate(keyPair.create_date)}</td>
                      <td>{relativeDate(keyPair.expire_date)}</td>
                    </tr>;
                  })
                }
              </tbody>
            </table>
          }
          <Button onClick={this.addKeyPair.bind(this)} bsStyle='default' className='small'>Create Key Pair</Button>
        </div>
        {
          (() => {
            switch(this.state.modal.template) {
              case 'addKeyPair':
                return <BootstrapModal show={this.state.modal.visible} onHide={this.closeModal.bind(this)}>
                  <BootstrapModal.Header closeButton>
                    <BootstrapModal.Title>Create New Key Pair</BootstrapModal.Title>
                  </BootstrapModal.Header>
                  <form onSubmit={this.confirmAddKeyPair.bind(this)} >
                    <BootstrapModal.Body>
                      <p>Here you create a key pair that allows for full access to your cluster via the Kubernetes API.</p>
                        <label>Description:</label>
                        <input ref='domainInput' autoFocus type='text'/>
                        <br/>
                        <br/>
                        <label>Expires:</label>
                        <ExpiryHoursPicker
                          selected={this.state.expireTTL}
                          onChange={this.handleTTLChange.bind(this)}
                        />
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                      <Button
                        type='submit'
                        bsStyle='primary'
                        loading={this.state.modal.loading}
                        onClick={this.confirmAddKeyPair.bind(this)}>
                        {
                          this.state.modal.loading ?
                          'Creating Key Pair'
                          :
                          'Create Key Pair'
                        }
                      </Button>

                      {
                        this.state.modal.loading ?
                        null
                        :
                        <Button
                          bsStyle='link'
                          onClick={this.closeModal.bind(this)}>
                          Cancel
                        </Button>
                      }
                    </BootstrapModal.Footer>
                  </form>
                </BootstrapModal>;
            }
          })()
        }
      </div>
    );
  }
}


function mapStateToProps(state, ownProps) {
  return {
    clusters: state.entities.clusters
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClusterKeyPairs);

