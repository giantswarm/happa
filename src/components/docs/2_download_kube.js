'use strict';
var React = require('react');
var Slide = require('../component_slider/slide');
var Markdown = require('./markdown');
var CodeBlock = require('./codeblock');

module.exports = React.createClass ({
    render() {
      return (
        <Slide>
          <Markdown>
            {`
            Download or update kubectl
            ==========================

            Let’s make sure you have the current stable version of kubectl, the Kubernetes client CLI, available.

            🐣 To the newbie: kubectl is the CLI you’ll use to work with your cluster mostly. Some things can be done using the Kubernetes web dashboard, but only the CLI provides access to all Kubernetes functionality.

            If you already have kubectl, you should have at least version 1.2.x installed. To check the version number, do the following:
            `}
            <CodeBlock>
            {`kubectl version`}
            </CodeBlock>
          </Markdown>
          <button className="primary" onClick={this.props.onContinue}>Continue</button><br/>
          <button onClick={this.props.onPrevious}>Previous</button>
        </Slide>
      );
    }
});