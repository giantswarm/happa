'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from 'react-router';

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <h1>Hi there!</h1>
        <p>You've reached a under-development part of Giant Swarm</p>
        <p>
          There isn't too much to see here yet! Chances are you just used this to reset your password.</p>
        <p>
          You might want to go to <a href='https://app.giantswarm.io'>app.giantswarm.io</a> now, or use our CLI to continue working on your things.
        </p>

        <p>If you have any questions, you know where to reach us!</p>
        <p>
          Email: <a href='mailto:support@giantswarm.io'>support@giantswarm.io</a><br/>
          Twitter: <a href='https://www.twitter.com/giantswarm' target='_blank'>@giantswarm</a>
        </p>

      </div>
    );
  }
});