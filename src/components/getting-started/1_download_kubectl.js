'use strict';
import React from 'react';
import Slide from '../component_slider/slide';
import Markdown from './markdown';
import { CodeBlock, Prompt } from './codeblock';
import platform from '../../lib/platform';

class DownloadKubeCTL extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedPlatform: platform
    };
  }

  selectPlatform(platform) {
    this.setState({
      selectedPlatform: platform
    });
  }

  isSelectedPlatform(platform) {
    return (this.state.selectedPlatform === platform);
  }

  selectedInstallInstructions() {
    switch(this.state.selectedPlatform) {
      case 'Windows':
        return <div>
          <p>Download <code>kubectl</code> from <a href='https://storage.googleapis.com/kubernetes-release/release/v1.4.6/bin/windows/amd64/kubectl.exe' target='_blank'>https://storage.googleapis.com/kubernetes-release/release/v1.4.6/bin/windows/amd64/kubectl.exe</a> to a folder of your choice and make it available in your environment PATH variable.</p>
        </div>;
      case 'MacWithoutBrew':
        return <div>
          <p>Installation without homebrew:</p>

          <CodeBlock>
            <Prompt>
              {`curl -O https://storage.googleapis.com/kubernetes-release/release/v1.4.6/bin/darwin/amd64/kubectl`}
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
      case 'Mac':
        return <div>
          <p>Installation via <a href='http://brew.sh/' target='_blank'>homebrew</a>:</p>

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
      case 'Linux':
        return <div>
          <p>To download and install the client, do:</p>

          <CodeBlock>
            <Prompt>
              {`curl -O https://storage.googleapis.com/kubernetes-release/release/v1.4.6/bin/linux/amd64/kubectl`}
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
      case 'Unknown':
        return <h1>Installation Instructions for Mac</h1>;
      default:
        return <h1>Installation Instructions for Mac</h1>;

    }
  }

  render() {
    return (
      <Slide>
        <Markdown>
          {`
          # Download or update kubectl

          Let’s make sure you have the current stable version of \`kubectl\`, the Kubernetes client CLI, available.

          <div class="aside">
            <p>
              <i class='fa fa-graduation-cap' title='For learners'></i> \`kubectl\` is the CLI you’ll use to work with your cluster mostly. Some things can be
              done using the web-based Kubernetes Dashboard, but only the CLI provides access to all Kubernetes functionality.
            </p>
          </div>

          If you already have \`kubectl\`, you should have at least version 1.4.x installed. To check the version number, do the following:
          `}
          <CodeBlock>
            <Prompt>
              {`kubectl version`}
            </Prompt>
          </CodeBlock>

          <div className="platform_selector">
            <ul className='platform_selector--tabs'>
              <li className={this.isSelectedPlatform('Linux') ? 'active' : null}
                  onClick={this.selectPlatform.bind(this, 'Linux')}>Linux</li>

              <li className={this.isSelectedPlatform('Mac') ? 'active' : null}
                  onClick={this.selectPlatform.bind(this, 'Mac')}>Mac</li>

              <li className={this.isSelectedPlatform('MacWithoutBrew') ? 'active' : null}
                  onClick={this.selectPlatform.bind(this, 'MacWithoutBrew')}>Mac (without homebrew)</li>

              <li className={this.isSelectedPlatform('Windows') ? 'active' : null}
                  onClick={this.selectPlatform.bind(this, 'Windows')}>Windows</li>
            </ul>

            <div className="platform_selector--content">
              {this.selectedInstallInstructions()}
            </div>
          </div>

        </Markdown>
        <div className="component_slider--nav">
          <button onClick={this.props.goToSlide.bind(null, 'overview')}><i className="fa fa-caret-left"></i>Back</button>
          <button className='primary' onClick={this.props.goToSlide.bind(null, 'configure')}>Continue <i className="fa fa-caret-right"></i></button>
        </div>
      </Slide>
    );
  }
}

DownloadKubeCTL.propTypes = {
  goToSlide: React.PropTypes.func
};

export default DownloadKubeCTL;
