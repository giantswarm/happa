'use strict';

import React from 'react';
import { Link } from 'react-router';
import FlashMessage from '../flash_messages/flash_message';
import Button from 'react-bootstrap/lib/Button';
import { connect } from 'react-redux';
import { organizationsLoad, organizationAddMember, organizationRemoveMember } from '../../actions/organizationActions';
import moment from 'moment';

var DomainValidation = React.createClass({
  addDomain() {

  },

  removeDomain(domain) {

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
          </table>
          <Button onClick={this.addDomain} bsStyle='primary' className='small'>Add Domain</Button>
        </div>
      </div>
    );
  }
});

module.exports = DomainValidation;
