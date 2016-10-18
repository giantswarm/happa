'use strict';

import React from 'react';
import { Link } from 'react-router';
import FlashMessage from '../flash_messages/flash_message';
import Button from 'react-bootstrap/lib/Button';
import { connect } from 'react-redux';
import { organizationsLoad, organizationAddMember, organizationRemoveMember } from '../../actions/organizationActions';
import moment from 'moment';

var OrganizationDetail = React.createClass({
  componentDidMount() {
    this.props.dispatch(organizationsLoad());
  },

  addMember() {
    this.props.dispatch(organizationAddMember(this.props.organization.id));
  },

  removeMember(username) {
    this.props.dispatch(organizationRemoveMember(this.props.organization.id, username));
  },

  formatDate(ISO8601DateString) {
    // http://momentjs.com/docs/#/displaying/
    return moment(ISO8601DateString).utc().format('D MMM YYYY, h:mm z');
  },

  render: function() {
    if (this.props.organization) {
      return (
        <div>
          <div className='row'>
            <div className='col-12'>
              <h1>Details for: {this.props.params.orgId}</h1>
            </div>
          </div>

          <div className='row section'>
            <div className='col-3'>
              <h3 className='table-label'>Clusters</h3>
            </div>
            <div className='col-9'>
              {
                this.props.organization.clusters.length === 0 ?
                <p>No clusters here yet, contact Giant Swarm to add a cluster to this
                organization</p>
                :
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.props.organization.clusters.map((cluster) => {
                        return (
                          <tr key={cluster}>
                            <td>{cluster}</td>
                            <td>{this.formatDate(this.props.clusters.items[cluster].create_date)}</td>
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
                <p>This organization has no members, which shouldn't really be possible</p>
                :
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.props.organization.members.map((username) => {
                        return (
                          <tr key={username}>
                            <td>{username}</td>
                            <td>
                              <div className='contextual'>
                                <i className='fa fa-times clickable'
                                   title='Delete this organization'
                                   onClick={this.removeMember.bind(this, username)} />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              }
              <Button onClick={this.addMember} bsStyle='primary' className='small'>Add Member</Button>
            </div>
          </div>
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
      );
    } else {
      // 404 or fetching
      return <h1>404 or fetching</h1>;
    }
  }
});

function mapStateToProps(state, ownProps) {
  return {
    organization: state.entities.organizations.items[ownProps.params.orgId],
    clusters: state.entities.clusters
  };
}

module.exports = connect(mapStateToProps)(OrganizationDetail);
