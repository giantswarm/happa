"use strict";

import React from 'react';

class OrganizationRow extends React.Component {
  render() {
    return (
      <tr>
        <td className="clickable" onClick={this.props.onClick}>{this.props.organizationName}</td>
        <td className="clickable" onClick={this.props.onClick}>{this.props.clusterCount}</td>
        <td className="clickable" onClick={this.props.onClick}>{this.props.memberCount}</td>
        <td>
          <div className="contextual">
            <i className="fa fa-times clickable"
               title="Delete this organization"
               onClick={this.props.onDelete} />
            &nbsp;
            <i className="fa fa-flag clickable"
               title="Switch to this organization"
               onClick={this.props.onSelect} />
          </div>
        </td>
      </tr>
    );
  }
}

export default OrganizationRow;