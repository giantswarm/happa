'use strict';

import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import {Link}  from 'react-router-dom';
import { connect } from 'react-redux';
import * as OrganizationActions from '../../actions/organizationActions';
import { bindActionCreators } from 'redux';
import { formatDate } from '../../lib/helpers.js';
import DocumentTitle from 'react-document-title';
import _ from 'underscore';
import ClusterIDLabel from '../shared/cluster_id_label';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';

class OrganizationDetail extends React.Component {
  componentDidMount() {
    this.props.actions.organizationsLoad();
  }

  addMember = () => {
    this.props.actions.organizationAddMember(this.props.organization.id);
  }

  removeMember = (email) => {
    this.props.actions.organizationRemoveMember(this.props.organization.id, email);
  }

  openClusterDetails = (cluster) => {
    this.props.dispatch(push('/organizations/' + this.props.organization.id + '/clusters/' + cluster));
  }

  render() {
    if (this.props.organization) {
      return (
        <DocumentTitle title={'Organization Details | ' + this.props.organization.id +  ' | Giant Swarm'}>
          <div>
            <div className='row'>
              <div className='col-12'>
                <h1>Organization: {this.props.match.params.orgId}</h1>
              </div>
            </div>

            <div className='row section'>
              <div className='col-3'>
                <h3 className='table-label'>Clusters</h3>
              </div>
              <div className='col-9'>
                {
                  this.props.clusters.length === 0 ?
                  <p>No clusters here yet, <Link to='/new-cluster'>create your first!</Link></p>
                  :
                  <table>
                    <thead>
                      <tr>
                        <th>Cluster ID</th>
                        <th>Name</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        _.map(_.sortBy(this.props.clusters, (cluster) => cluster.name ), (cluster) => {
                          return (
                            <tr className="clickable" key={cluster.id} onClick={this.openClusterDetails.bind(this, cluster.id)}>
                              <td><ClusterIDLabel clusterID={cluster.id} copyEnabled/></td>
                              <td>{cluster.name}</td>
                              <td>{formatDate(cluster.create_date)}</td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                }

              </div>
            </div>

            <div className='row section'>
              <div className='col-3'>
                <h3 className='table-label'>Members</h3>
              </div>
              <div className='col-9'>
                {
                  this.props.organization.members.length === 0 ?
                  <p>This organization has no members, which shouldn&apos;t really be possible</p>
                  :
                  <table>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        _.sortBy(this.props.organization.members, 'email').map((member) => {
                          return (
                            <tr key={member.email}>
                              <td>{member.email}</td>
                              <td>
                                <div className='contextual'>
                                  <i className='fa fa-times clickable'
                                     title='Remove this member'
                                     onClick={this.removeMember.bind(this, member.email)} />
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                }
                <Button onClick={this.addMember} bsStyle='default'>Add Member</Button>
              </div>
            </div>

            {
              /*
              }
              <DomainValidation
                loadDomains={this.props.actions.organizationLoadDomains.bind(this, this.props.organization.id)}
                addDomain={this.props.actions.organizationAddDomain.bind(this, this.props.organization.id)}
                deleteDomain={this.props.actions.organizationDeleteDomain.bind(this, this.props.organization.id)}
                organization={this.props.organization}

              />
              */
            }
{
  /*
    <div className='row section'>
            <div className='col-3'>
              <h3 className='table-label'>Invoices</h3>
            </div>
            <div className='col-9'>
              <table>
                <thead>
                  <tr>
                    <th>Invoice month</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>August 2016</td>
                    <td>53,27€</td>
                    <td>Open</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>July 2016</td>
                    <td>46,81€</td>
                    <td>Open</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>June 2016</td>
                    <td>47,21€</td>
                    <td>Open</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
              <FlashMessage class='info'>
                Automate all the things! Learn how to access invoices, usage
                reports and cost estimates via the API. More
              </FlashMessage>
            </div>
          </div>
           <div className='row section'>
            <div className='col-3'>
              <h3 className='table-label'>Billing Address</h3>
            </div>
            <div className='col-9'>
              <p>
                The address we will use on invoice documents. Note that the selected
                country has influence on invoice details and taxes.
              </p>
              <form>
                <div className='textfield small'>
                  <label>Name</label>
                  <input id='name' ref='name'/>
                </div>

                <div className='textfield small'>
                  <label>Address</label>
                  <input id='address_1' ref='address_1'/>
                  <input id='address_2' ref='address_2'/>
                </div>

                <div className='textfield small'>
                  <label>Postal Code</label>
                  <input id='postal_code' ref='postal_code'/>
                </div>

                <div className='textfield small'>
                  <label>City</label>
                  <input id='city' ref='city'/>
                </div>

                <div className='textfield small'>
                  <label>State/Province</label>
                  <input id='state_province' ref='state_province'/>
                </div>

                <div className='textfield small'>
                  <label>Country</label>
                  <input id='country' ref='country'/>
                </div>
              </form>
            </div>
          </div>

          <div className='row section'>
            <div className='col-3'>
              <h3 className='table-label'>VAT ID</h3>
            </div>
            <div className='col-9'>
              <p>
                Please provide your VAT ID if you have one.
              </p>
              <form>
                <div className='textfield small'>
                  <label>VAT ID</label>
                  <input id='vat_id' ref='vat_id'/>
                </div>
              </form>
            </div>
          </div>

          <div className='row section'>
            <div className='col-3'>
              <h3 className='table-label'>Credit Card</h3>
            </div>
            <div className='col-9'>
              <p>
                Your Credit Card
              </p>
              <form>
                <div className='textfield small'>
                  <label>Cardholder Name</label>
                  <input id='cardholder_name' ref='cardholder_name'/>
                </div>

                <div className='textfield small'>
                  <label>Card Number</label>
                  <input id='card_number' ref='card_number'/>
                </div>

                <div className='textfield small'>
                  <label>Expiry Month/Year</label>
                  <input id='expiry_month_year' ref='expiry_month_year'/>
                </div>

                <div className='textfield small'>
                  <label>CVC Code</label>
                  <input id='cvc_code' ref='cvc_code'/>
                </div>
                <Button bsStyle='primary' className='small'>Save Card</Button>
              </form>
            </div>
          </div>
   */
}
          </div>
        </DocumentTitle>
      );
    } else {
      // 404 or fetching
      return <h1>404 or fetching</h1>;
    }
  }
}

OrganizationDetail.contextTypes = {
  router: PropTypes.object
};

OrganizationDetail.propTypes = {
  actions: PropTypes.object,
  clusters: PropTypes.array,
  organization: PropTypes.object,
  dispatch: PropTypes.func,
  match: PropTypes.object
};

function mapStateToProps(state, ownProps) {
  var allClusters = state.entities.clusters.items;
  var clusters = [];

  clusters = _.filter(allClusters, (cluster) => {
    return cluster.owner === ownProps.match.params.orgId;
  });

  return {
    organization: state.entities.organizations.items[ownProps.match.params.orgId],
    clusters: clusters
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(OrganizationActions, dispatch),
    dispatch: dispatch
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(OrganizationDetail);
