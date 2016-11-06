'use strict';
import React from 'react';
import Slide from '../component_slider/slide';
import Markdown from './markdown';
import { CodeBlock, Prompt, Output } from './codeblock';
import FileBlock from './fileblock';
import { Link, IndexLink } from 'react-router';

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
            <li><Link to="/getting-started/download">Download (or update) <code>kubectl</code></Link></li>
            <li><Link to="/getting-started/configure">Configure <code>kubectl</code> for your cluster</Link></li>
            <li><Link to="/getting-started/example">Run a simple example</Link></li>
            <li><Link to="/getting-started/inspecting">Inspecting your service and next steps</Link></li>
          </ol>
          <br/>
          <br/>
          <div className="component_slider--nav">
            <button className="primary" onClick={this.props.goToSlide.bind(null, 'download')}>Continue</button>
          </div>
        </Slide>
      );
    }
});