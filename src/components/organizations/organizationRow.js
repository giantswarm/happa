'use strict';

import React from 'react';

class OrganizationRow extends React.Component {
  render() {
    return (
      <tr>
        <td className='clickable' onClick={this.props.onClick}>{this.props.organization.id}</td>
        <td className='clickable centered' onClick={this.props.onClick}>{this.props.clusters.length}</td>
        <td className='clickable centered' onClick={this.props.onClick}>{this.props.organization.members.length}</td>
        <td>
          <div className='contextual'>
            <i className='fa fa-times clickable'
               title='Delete this organization'
               onClick={this.props.onDelete} />
          </div>
        </td>
      </tr>
    );
  }
}

OrganizationRow.propTypes = {
  onClick: React.PropTypes.func,
  onDelete: React.PropTypes.func,
  onSelect: React.PropTypes.func,
  organization: React.PropTypes.object,
  clusters: React.PropTypes.object
};

export default OrganizationRow;
