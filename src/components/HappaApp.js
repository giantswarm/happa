'use strict';

var React = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

var imageURL = require('../images/giantswarm_icon.svg');

var HappaApp = React.createClass({
  render: function() {
    return (
      <div className='main'>
        <ReactCSSTransitionGroup transitionAppear={true} transitionAppearTimeout={500} transitionName="fade" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
          <img src={imageURL} />
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});

module.exports = HappaApp;
