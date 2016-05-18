'use strict';
var React = require('react');
var Codemirror = require('react-codemirror');
var yaml = require('codemirror/mode/yaml/yaml');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

let store = { serviceName: '', composeYaml: '' };

module.exports = React.createClass ({
    getInitialState() {
      return {
        serviceName: store.serviceName,
        composeYaml: store.composeYaml,
        buttonText: "Submit Definition"
      };
    },

    updateServiceName(event) {
      store.serviceName = event.target.value;

      this.setState({
        serviceName: store.serviceName
      });
    },

    updateCode (newCode) {
      store.composeYaml = newCode;
      this.setState({
        composeYaml: store.composeYaml
      });
    },

    validate(){
      // Do some validation
      this.setState({
        loading: true,
        buttonText: "Validating..."
      });

      setTimeout(function() {
        this.props.onContinue();
      }.bind(this), 1000);
    },

    // TOOD: Extract into components (like the text field with error states and validation)

    render() {
      return (
        <div className="multistep--step">
          <h1>Define your service</h1>
          <form>
            <div className="textfield">
              <label>Service Name</label>
              <input value={this.state.serviceName} type="text" onChange={this.updateServiceName}/>
              {
                this.state.error ? <span className="message">Service Name must be made up of lower case letters and hyphens</span> : null
              }
            </div>

            <label>Paste Docker Compose YAML</label>
            <Codemirror value={this.state.composeYaml} onChange={this.updateCode} options={{lineNumbers: true, mode: "yaml", theme: "solarized dark"}} />
          </form>

          <div className="progress_button--container">
            <button disabled={ this.state.loading } className="primary" onClick={this.validate}>{this.state.buttonText}</button>
            <ReactCSSTransitionGroup transitionName="slide-left" transitionEnterTimeout={200} transitionLeaveTimeout={200}>
            {
              this.state.loading ? <img className="loader" src="/images/loader_oval_light.svg" /> : null
            }
            </ReactCSSTransitionGroup>
          </div>
        </div>
      );
    }
});