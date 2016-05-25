'use strict';
var React = require('react');
var Slide = require('../component_slider/slide');
var Markdown = require('./markdown');
var {CodeBlock, Prompt, Output} = require('./codeblock');
var FileBlock = require('./fileblock');

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
            Get started with your Kubernetes cluster
            ========================================

            We'll guide you through the following steps to help you successfully run your own services on your Kubernetes cluster:

            1. Download (or update) kubectl
            2. Configure kubectl for your cluster
            3. Running a simple example
            `}

            <CodeBlock>
              <Prompt>
                {`
                  kubectl --param \\
                            --param=value \\
                            --param=value

                `}
              </Prompt>

              <Output>
                {`output`}
              </Output>

              <Prompt>
                {`some other command`}
              </Prompt>

              <Output>
                {`
                  output output output output output output output output output output output output output output output
                    indented text after newline
                `}
              </Output>

              <Prompt>
                {`docker ps`}
              </Prompt>

              <Output>
                {`
                  CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS                    NAMES
                  938601af2dec        happa               "npm start"         About an hour ago   Up About an hour    0.0.0.0:8000->8000/tcp   admiring_wozniak
                `}
              </Output>
            </CodeBlock>

            <CodeBlock>
              <Prompt>
                {`echo "Hello world"`}
              </Prompt>
            </CodeBlock>

            <FileBlock fileName="kubeconfig">{this.testFileContent()}</FileBlock>
          </Markdown>
          <br/>
          <br/>
          <button className="primary" onClick={this.props.onContinue}>Continue</button><br/>
        </Slide>
      );
    }
});