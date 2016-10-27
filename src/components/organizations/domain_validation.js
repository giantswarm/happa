'use strict';

import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import {OverlayTrigger, Tooltip} from 'react-bootstrap/lib';
import { Link } from 'react-router';
import { flashAdd } from '../../actions/flashMessageActions';
import Button from '../button';
import { connect } from 'react-redux';
import { organizationsLoad, organizationAddMember, organizationRemoveMember } from '../../actions/organizationActions';
import DomainValidator from '../../lib/domain_validator_client';
import { formatDate } from '../../lib/helpers.js';

var DomainValidation = React.createClass({
  getInitialState() {
    return {
      modal: {
        visible: false,
        loading: false,
        template: 'addDomain'
      }
    };
  },

  closeModal() {
    this.setState({
      modal: {
        visible: false,
        loading: false
      }
    });
  },

  addDomain() {
    this.setState({
      modal: {
        visible: true,
        loading: false,
        template: 'addDomain'
      }
    });
  },

  confirmAddDomain(e) {
    if (e) {
      e.preventDefault();
    }

    this.setState({
      modal: {
        visible: true,
        loading: true,
        template: 'addDomain'
      }
    }, () => {
      this.props.addDomain(this.refs.domainInput.value)
      .then(this.props.loadDomains)
      .then(response => {
        this.setState({
          modal: {
            visible: false
          }
        });
      })
      .catch(error => {
        this.setState({
          modal: {
            visible: false
          }
        });

        this.props.dispatch(flashAdd({
          message: <div><strong>Something went wrong while trying to add this domain</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: info@giantswarm.io'}</div>,
          class: 'danger'
        }));
      });
    });
  },

  deleteDomain(domain) {
    this.setState({
      modal: {
        visible: true,
        loading: false,
        template: 'deleteDomain',
        domain: domain
      }
    });
  },

  confirmDeleteDomain() {
    var domain = this.state.modal.domain;
    this.setState({
      modal: {
        visible: true,
        loading: true,
        template: 'deleteDomain',
        domain: domain
      }
    }, () => {
      this.props.deleteDomain(domain)
      .then(this.props.loadDomains)
      .then(response => {
        this.setState({
          modal: {
            visible: false
          }
        });
      })
      .catch(error => {
        this.setState({
          modal: {
            visible: false
          }
        });

        this.props.dispatch(flashAdd({
          message: <div><strong>Something went wrong while trying to delete this domain</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: info@giantswarm.io'}</div>,
          class: 'danger'
        }));
      });
    });
  },

  render() {
    return (
      <div className='row section'>
        <div className='col-3'>
          <h3 className='table-label'>Domains</h3>
        </div>
        <div className='col-9'>
          <p>Here you can manage domains to be used within your clusters. To learn more about making your services available under a custom domain name, read our guide on Managing Domains.</p>
          <table>
            <thead>
              <tr>
                <th>DOMAIN</th>
                <th>STATUS</th>
                <th>CREATED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                _.map(this.props.domains, domain => {
                  return (
                    <tr key={domain.domain}>
                      <td>{domain.domain}</td>
                      <td>
                        {domain.status}
                        {' '}
                        {
                          domain.validation_comment ?
                          <OverlayTrigger placement="top" overlay={
                            <Tooltip id="tooltip">{domain.validation_comment}</Tooltip>
                          }>
                            <i className='fa fa-exclamation-triangle clickable' />
                          </OverlayTrigger>
                          :
                          undefined
                        }

                      </td>
                      <td>{formatDate(domain.creation_date)}</td>
                      <td>
                        <div className='contextual'>
                          <i className='fa fa-times clickable'
                             title='Delete this organization'
                             onClick={this.deleteDomain.bind(this, domain.domain)} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
          <Button onClick={this.addDomain} bsStyle='primary' className='small'>Add Domain</Button>
        </div>

        {
          (() => {
            switch(this.state.modal.template) {
              case 'addDomain':
                return <BootstrapModal show={this.state.modal.visible} onHide={this.closeModal}>
                  <BootstrapModal.Header closeButton>
                    <BootstrapModal.Title>Add a domain</BootstrapModal.Title>
                  </BootstrapModal.Header>
                  <BootstrapModal.Body>
                    <h4>Domain Name:</h4>
                    <form onSubmit={this.confirmAddDomain} >
                      <input ref='domainInput' autoFocus type='text'/>
                    </form>
                  </BootstrapModal.Body>
                  <BootstrapModal.Footer>
                    <Button
                      type='submit'
                      bsStyle='primary'
                      loading={this.state.modal.loading}
                      onClick={this.confirmAddDomain}>
                      {
                        this.state.modal.loading ?
                        'Creating Organization'
                        :
                        'Create Organization'
                      }
                    </Button>

                    {
                      this.state.modal.loading ?
                      null
                      :
                      <Button
                        bsStyle='link'
                        onClick={this.closeModal}>
                        Cancel
                      </Button>
                    }
                  </BootstrapModal.Footer>
                </BootstrapModal>;

              case 'deleteDomain':
                return <BootstrapModal show={this.state.modal.visible} onHide={this.closeModal}>
                  <BootstrapModal.Header closeButton>
                    <BootstrapModal.Title>Delete a domain</BootstrapModal.Title>
                  </BootstrapModal.Header>
                  <BootstrapModal.Body>
                    <h4>Are you sure you want to delete <code>{this.state.modal.domain}</code>?</h4>
                  </BootstrapModal.Body>
                  <BootstrapModal.Footer>
                    <Button
                      type='submit'
                      bsStyle='danger'
                      loading={this.state.modal.loading}
                      onClick={this.confirmDeleteDomain}>
                      {
                        this.state.modal.loading ?
                        'Deleting Domain'
                        :
                        'Delete Domain'
                      }
                    </Button>

                    {
                      this.state.modal.loading ?
                      null
                      :
                      <Button
                        bsStyle='link'
                        onClick={this.closeModal}>
                        Cancel
                      </Button>
                    }
                  </BootstrapModal.Footer>
                </BootstrapModal>;

            }
          })()
        }
      </div>
    );
  }
});

export default connect()(DomainValidation);
