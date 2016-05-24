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
            Get started with your Kubernetes cluster
            ========================================

            We'll guide you through the following steps to help you successfully run your own services on your Kubernetes cluster:

            1. Download (or update) kubectl
            2. Configure kubectl for your cluster
            3. Running a simple example
            `}

            <CodeBlock>
              <Prompt>
                {`kubectl version \\
                  long \\
                  command`}
              </Prompt>

              <Output>
                {`output`}
              </Output>

              <Prompt>
                {`some other command`}
              </Prompt>

              <Output>
                {`output`}
              </Output>
            </CodeBlock>

            <CodeBlock>
              <Prompt>
                {'echo "Hello world"'}
              </Prompt>
            </CodeBlock>
          </Markdown>
          <br/>
          <br/>
          <button className="primary" onClick={this.props.onContinue}>Continue</button><br/>
        </Slide>
      );
    }
});