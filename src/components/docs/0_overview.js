'use strict';
var React = require('react');
var Slide = require('../component_slider/slide');
var Markdown = require('./markdown');
var {CodeBlock, Prompt, Output} = require('./codeblock');
var FileBlock = require('./fileblock');
var flashActions = require('../reflux_actions/flash_message_actions');

module.exports = React.createClass ({
    testFileContent() {
      return (`
        The contents of the file

        Indentation
        -----------
          Indentation should be preserved based on where the first line
          started in the code.
      `);
    },

    addFlash() {
      flashActions.add({
        icon: "warning",
        message: "I am a cool flash message",
        class: "success"
      });
    },

    render() {
      return (
        <Slide>

          <Markdown>
            {`
            # Get started with your Kubernetes cluster

            Follow these steps to get started quickly:

            1. Download (or update) \`kubectl\`
            2. Configure \`kubectl\` for your cluster
            3. Run a simple example
            `}
          </Markdown>
          <br/>
          <br/>
          <button className="primary" onClick={this.props.onContinue}>Continue</button><br/>
          <button className="primary" onClick={this.addFlash}>flash</button><br/>
        </Slide>
      );
    }
});