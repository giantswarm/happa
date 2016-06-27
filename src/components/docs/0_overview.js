'use strict';
var React = require('react');
var Slide = require('../component_slider/slide');
var Markdown = require('./markdown');
var {CodeBlock, Prompt, Output} = require('./codeblock');
var FileBlock = require('./fileblock');
var {Link, IndexLink}  = require('react-router');

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

    render() {
      return (
        <Slide>

          <Markdown>
            {`
            # Get started with your Kubernetes cluster

            Follow these steps to get started quickly:
            `}
          </Markdown>
          <ol>
            <li><Link to="/docs/download">Download (or update) <code>kubectl</code></Link></li>
            <li><Link to="/docs/configure">Configure <code>kubectl</code> for your cluster</Link></li>
            <li><Link to="/docs/example">Run a simple example</Link></li>
            <li><Link to="/docs/inspecting">Inspecting your service and next steps</Link></li>
          </ol>
          <br/>
          <br/>
          <button className="primary" onClick={this.props.goToSlide.bind(null, 'download')}>Continue</button><br/>
        </Slide>
      );
    }
});