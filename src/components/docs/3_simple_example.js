'use strict';
var React = require('react');
var Slide = require('../component_slider/slide');
var Markdown = require('./markdown');
var {CodeBlock, Prompt, Output} = require('./codeblock');

module.exports = React.createClass ({
    render() {
      return (
        <Slide>
          <Markdown>
            {`
            Run a simple example
            ==========================

            `}
            <CodeBlock>
              <Prompt>
                {`kubectl version`}
              </Prompt>
            </CodeBlock>
          </Markdown>
          <button className="primary" onClick={this.props.onContinue}>Continue</button><br/>
          <button onClick={this.props.onPrevious}>Previous</button>
        </Slide>
      );
    }
});