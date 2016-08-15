"use strict";

var React               = require('react');
var {Link}              = require('react-router');
var flashMessageActions = require('../../actions/flash_message_actions');
var FlashMessage = require("../flash_messages/flash_message");
import Button from 'react-bootstrap/lib/Button';
import {connect} from 'react-redux';
import {organizationsLoad} from '../../actions/organizationActions';

var OrganizationDetail = React.createClass({
  componentDidMount() {
    this.props.dispatch(organizationsLoad());
  },

  render: function() {
    if (this.props.organization) {
      return (
        <div>
          <div className="row">
            <div className="col-3">
            </div>
            <div className="col-9">
              <h1>{this.props.params.orgId}</h1>
            </div>
          </div>

          <div className="row section">
            <div className="col-3">
              <h3 className="table-label">Clusters</h3>
            </div>
            <div className="col-9">
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
                        console.log(cluster);
                        return (
                          <tr key={cluster}>
                            <td>{cluster}</td>
                            <td></td>
                          </tr>
                        );
                      })
                    }

                  </tbody>
                </table>
              }

            </div>
          </div>

          <div className="row section">
            <div className="col-3">
              <h3 className="table-label">Members</h3>
            </div>
            <div className="col-9">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>brad@example.com</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>george@example.com</td>
                    <td>the_george</td>
                  </tr>
                  <tr>
                    <td>testuser@example.com</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
              <Button bsStyle="primary" className="small">Add Member</Button>
            </div>
          </div>

          <div className="row section">
            <div className="col-3">
              <h3 className="table-label">Invoices</h3>
            </div>
            <div className="col-9">
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
              <FlashMessage class="info">
                Automate all the things! Learn how to access invoices, usage
                reports and cost estimates via the API. More
              </FlashMessage>
            </div>
          </div>

          <div className="row section">
            <div className="col-3">
              <h3 className="table-label">Billing Address</h3>
            </div>
            <div className="col-9">
              <p>
                The address we will use on invoice documents. Note that the selected
                country has influence on invoice details and taxes.
              </p>
              <form>
                <div className="textfield small">
                  <label>Name</label>
                  <input id="name" ref="name"/>
                </div>

                <div className="textfield small">
                  <label>Address</label>
                  <input id="address_1" ref="address_1"/>
                  <input id="address_2" ref="address_2"/>
                </div>

                <div className="textfield small">
                  <label>Postal Code</label>
                  <input id="postal_code" ref="postal_code"/>
                </div>

                <div className="textfield small">
                  <label>City</label>
                  <input id="city" ref="city"/>
                </div>

                <div className="textfield small">
                  <label>State/Province</label>
                  <input id="state_province" ref="state_province"/>
                </div>

                <div className="textfield small">
                  <label>Country</label>
                  <input id="country" ref="country"/>
                </div>
              </form>
            </div>
          </div>

          <div className="row section">
            <div className="col-3">
              <h3 className="table-label">VAT ID</h3>
            </div>
            <div className="col-9">
              <p>
                Please provide your VAT ID if you have one.
              </p>
              <form>
                <div className="textfield small">
                  <label>VAT ID</label>
                  <input id="vat_id" ref="vat_id"/>
                </div>
              </form>
            </div>
          </div>

          <div className="row section">
            <div className="col-3">
              <h3 className="table-label">Credit Card</h3>
            </div>
            <div className="col-9">
              <p>
                Your Credit Card
              </p>
              <form>
                <div className="textfield small">
                  <label>Cardholder Name</label>
                  <input id="cardholder_name" ref="cardholder_name"/>
                </div>

                <div className="textfield small">
                  <label>Card Number</label>
                  <input id="card_number" ref="card_number"/>
                </div>

                <div className="textfield small">
                  <label>Expiry Month/Year</label>
                  <input id="expiry_month_year" ref="expiry_month_year"/>
                </div>

                <div className="textfield small">
                  <label>CVC Code</label>
                  <input id="cvc_code" ref="cvc_code"/>
                </div>
                <Button bsStyle="primary" className="small">Save Card</Button>
              </form>
            </div>
          </div>
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
