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
import { formatDate, relativeDate, toTitleCase } from '../../lib/helpers.js';
import ReactTimeout from 'react-timeout';

const DOMAIN_POLL_INTERVAL = 60000; // 60 Seconds

var DomainValidation = React.createClass({
  componentDidMount: function() {
    this.loadDomains();

    this.props.setInterval(() => {
      this.props.loadDomains();
    }, DOMAIN_POLL_INTERVAL);
  },

  loadDomains: function() {
    this.props.loadDomains()
    .catch((error) => {
      this.props.dispatch(flashAdd({
        message: <div><strong>Something went wrong while trying to get the list of domains for this organization</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}</div>,
        class: 'danger'
      }));
    })
    .then(() => {
      var newState = Object.assign({}, this.state, {loading: false});
      this.setState(newState);
    });
  },

  getInitialState() {
    return {
      loading: true,
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
      .then(response => {
        this.setState({
          modal: {
            visible: true,
            loading: false,
            template: 'addDomainSuccess',
            domain: response
          }
        });
      })
      .then(this.props.loadDomains)
      .catch(error => {
        this.setState({
          modal: {
            visible: false
          }
        });

        this.props.dispatch(flashAdd({
          message: <div><strong>Something went wrong while trying to add this domain</strong><br/>{error.body ? error.body.message : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}</div>,
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
          message: <div><strong>Something went wrong while trying to delete this domain</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}</div>,
          class: 'danger'
        }));
      });
    });
  },

  showDomainDetails(domain) {
    this.setState({
      modal: {
        visible: true,
        loading: false,
        template: 'domainDetails',
        domain: domain
      }
    });
  },

  validationTokenClick() {
    this.refs.validationTokenInput.select();
  },

  render() {
    return (
      <div className='row section'>
        <div className='col-3'>
          <h3 className='table-label'>Domains</h3>
        </div>
        <div className='col-9'>
          <p>Here you can manage domains to be used within your clusters. To learn more about making your services available under a custom domain name, read our <a href="https://docs.giantswarm.io/guides/managing-domains/" target="_blank">guide on Managing Domains</a></p>
          <div className="domain-list">
            {
              this.state.loading ? <img className='loader' src='/images/loader_oval_light.svg' /> : undefined
            }

            {
              this.props.organization.domains && this.props.organization.domains.length > 0 ?
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
                    _.map(this.props.organization.domains, domain => {
                      return (
                        <tr key={domain.domain}>
                          <td className="code">{domain.domain}</td>
                          <td>
                            {toTitleCase(domain.status)}
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
                          <td>{relativeDate(domain.creation_date)}</td>
                          <td>
                            <div className='contextual'>
                              <i className='fa fa-info-circle clickable'
                                 title='Delete this organization'
                                 onClick={this.showDomainDetails.bind(this, domain)} />
                              {' '}
                              <i className='fa fa-trash clickable'
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

              :
              undefined
            }
          </div>
          <Button onClick={this.addDomain} bsStyle='default' className='small'>Add Domain</Button>
        </div>

        {
          (() => {
            switch(this.state.modal.template) {
              case 'addDomain':
                return <BootstrapModal show={this.state.modal.visible} onHide={this.closeModal}>
                  <BootstrapModal.Header closeButton>
                    <BootstrapModal.Title>Add a Domain</BootstrapModal.Title>
                  </BootstrapModal.Header>
                  <BootstrapModal.Body>
                    <h4>Domain name:</h4>
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
                        'Adding Domain'
                        :
                        'Add Domain'
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

              case 'addDomainSuccess':
                return <BootstrapModal show={this.state.modal.visible} onHide={this.closeModal}>
                  <BootstrapModal.Header closeButton>
                    <BootstrapModal.Title>Add a Domain</BootstrapModal.Title>
                  </BootstrapModal.Header>
                  <BootstrapModal.Body>
                    <p>To allow validation, please add a TXT record to the DNS entry of this domain with the following content:</p>
                    <form>
                      <input
                        key="validationTokenInput"
                        className="validation-token-input"
                        onClick={this.validationTokenClick}
                        ref="validationTokenInput"
                        type="text"
                        readOnly
                        value={'Giant Swarm validation: ' + this.state.modal.domain.validation_token}
                      />
                    </form>
                    <p>To learn more about the domain validation process, please read our <a href="https://docs.giantswarm.io/guides/managing-domains/" target="_blank">guide on Managing Domains</a>.</p>
                  </BootstrapModal.Body>
                  <BootstrapModal.Footer>
                    <Button
                      bsStyle='link'
                      onClick={this.closeModal}>
                      Close
                    </Button>
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

              case 'domainDetails':
                return <BootstrapModal show={this.state.modal.visible} onHide={this.closeModal}>
                  <BootstrapModal.Header closeButton>
                    <BootstrapModal.Title>Domain validation details</BootstrapModal.Title>
                  </BootstrapModal.Header>
                    <table className="details-table">
                      <tbody>
                        <tr>
                          <td style={{width: 180}}>Domain</td>
                          <td className="code">{this.state.modal.domain.domain}</td>
                        </tr>
                        <tr>
                          <td>Status</td>
                          <td>{toTitleCase(this.state.modal.domain.status)}</td>
                        </tr>
                        <tr>
                          <td>Created</td>
                          <td>{relativeDate(this.state.modal.domain.creation_date)}</td>
                        </tr>
                        <tr>
                          <td>Last check</td>
                          <td>{relativeDate(this.state.modal.last_validation_attempt_date)}</td>
                        </tr>
                        <tr>
                          <td>Validation comment</td>
                          <td>{this.state.modal.domain.validation_comment}</td>
                        </tr>
                        <tr>
                          <td>Expected TXT record</td>
                          <td className="code">Giant Swarm validation: {this.state.modal.domain.validation_token}</td>
                        </tr>
                      </tbody>
                    </table>
                    <BootstrapModal.Body>
                      To learn more about the domain validation process, please read our <a href="https://docs.giantswarm.io/guides/managing-domains/" target="_blank">guide on Managing Domains</a>.
                      </BootstrapModal.Body>
                  <BootstrapModal.Footer>
                    <Button
                      bsStyle='link'
                      onClick={this.closeModal}>
                      Close
                    </Button>
                  </BootstrapModal.Footer>
                </BootstrapModal>;

            }
          })()
        }
      </div>
    );
  }
});

export default connect()(ReactTimeout(DomainValidation));
