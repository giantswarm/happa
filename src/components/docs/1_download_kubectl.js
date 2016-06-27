'use strict';
var React = require('react');
var Slide = require('../component_slider/slide');
var Markdown = require('./markdown');
var {CodeBlock, Prompt, Output} = require('./codeblock');
var platform = require('../../lib/platform');

module.exports = React.createClass ({
  getInitialState: function() {
    return {
      selectedPlatform: platform
    };
  },

  selectPlatform: function(platform) {
    this.setState({
      selectedPlatform: platform
    });
  },

  isSelectedPlatform: function(platform) {
    return (this.state.selectedPlatform === platform);
  },

  selectedInstallInstructions: function() {
    switch(this.state.selectedPlatform) {
      case "Windows":
        return <div>
          <p>Currently, there&apos;s no official release of <code>kubectl</code> for Windows. Please refer to <a href="https://github.com/eirslett/kubectl-windows" target="_blank">https://github.com/eirslett/kubectl-windows</a> for a binary download and instructions on how to build the <code>kubectl</code> client for Windows.</p>
        </div>;
      case "MacWithoutBrew":
        return <div>
          <p>Installation without homebrew:</p>

          <CodeBlock>
            <Prompt>
              {`curl -O https://storage.googleapis.com/bin.kuar.io/darwin/kubectl`}
            </Prompt>
            <Prompt>
              {`chmod +x kubectl`}
            </Prompt>
            <Prompt>
              {`sudo cp kubectl /usr/local/bin/kubectl`}
            </Prompt>
          </CodeBlock>

          <CodeBlock>
            <Prompt>
              {`kubectl version`}
            </Prompt>
          </CodeBlock>
        </div>;
      case "Mac":
        return <div>
          <p>Installation via <a href="http://brew.sh/" target="_blank">homebrew</a>:</p>

          <CodeBlock>
            <Prompt>
              {`brew update`}
            </Prompt>
            <Prompt>
              {`brew install kubernetes-cli`}
            </Prompt>
          </CodeBlock>

          <p>If you get an error that you already have a version installed, simply do</p>

          <CodeBlock>
            <Prompt>
              {`brew upgrade kubernetes-cli`}
            </Prompt>
          </CodeBlock>

          <p>That should be it. To verify you have <code>kubectl</code> available in your path, do this little check:</p>

          <CodeBlock>
            <Prompt>
              {`kubectl version`}
            </Prompt>
          </CodeBlock>

        </div>;
      case "Linux":
        return <div>
          <p>To download and install the client, do:</p>

          <CodeBlock>
            <Prompt>
              {`curl -O https://storage.googleapis.com/bin.kuar.io/linux/kubectl`}
            </Prompt>
            <Prompt>
              {`chmod +x kubectl`}
            </Prompt>
            <Prompt>
              {`sudo cp kubectl /usr/local/bin/kubectl`}
            </Prompt>
          </CodeBlock>

          <p>To verify you have <code>kubectl</code> available in your path, do this little check:</p>

          <CodeBlock>
            <Prompt>
              {`kubectl version`}
            </Prompt>
          </CodeBlock>

        </div>;
      case "Unknown":
        return <h1>Installation Instructions for Mac</h1>;
      default:
        return <h1>Installation Instructions for Mac</h1>;

    }
  },

  render() {
    return (
      <Slide>
        <Markdown>
          {`
          # Download or update kubectl

          Let’s make sure you have the current stable version of \`kubectl\`, the Kubernetes client CLI, available.

          <i class="fa fa-graduation-cap" title="For learners"></i> \`kubectl\` is the CLI you’ll use to work with your cluster mostly. Some things can be
          done using the web-based Kubernetes Dashboard, but only the CLI provides access to all Kubernetes functionality.

          If you already have \`kubectl\`, you should have at least version 1.2.x installed. To check the version number, do the following:
          `}
          <CodeBlock>
            <Prompt>
              {`kubectl version`}
            </Prompt>
          </CodeBlock>

          <ul className="platform_selector">
            <li className={this.isSelectedPlatform('Linux') ? "active" : null}
                onClick={this.selectPlatform.bind(this, 'Linux')}>Linux</li>

            <li className={this.isSelectedPlatform('Mac') ? "active" : null}
                onClick={this.selectPlatform.bind(this, 'Mac')}>Mac</li>

            <li className={this.isSelectedPlatform('MacWithoutBrew') ? "active" : null}
                onClick={this.selectPlatform.bind(this, 'MacWithoutBrew')}>Mac (without homebrew)</li>

            <li className={this.isSelectedPlatform('Windows') ? "active" : null}
                onClick={this.selectPlatform.bind(this, 'Windows')}>Windows</li>
          </ul>

          {this.selectedInstallInstructions()}

        </Markdown>
        <button className="primary" onClick={this.props.goToSlide.bind(null, 'configure')}>Continue</button><br/>
        <button onClick={this.props.goToSlide.bind(null, 'overview')}>Previous</button>
      </Slide>
    );
  }
});