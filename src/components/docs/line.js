'use strict';

// Line
// Used in CodeBlock and FileBlock
// <Line prompt={true} text='Some text' />;
//
// prompt: Display this line as a prompt or not (adds the dollar sign before the text)
// text: The text that this line should display

import React from 'react';

module.exports = React.createClass ({
  render: function() {
    return (
      <div className={this.props.prompt ? 'codeblock--line codeblock--prompt' : 'codeblock--line'}>
        <span className='codeblock--prompt-indicator'>{this.props.prompt ? '$ ' : null}</span>
        {this.props.text}
      </div>
    );
  }
});