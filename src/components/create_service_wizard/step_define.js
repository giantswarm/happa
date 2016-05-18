'use strict';
var React = require('react');
var Codemirror = require('react-codemirror');
var yaml = require('codemirror/mode/yaml/yaml');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var Lorry = require('../lorry');
var Slide = require('../component_slider/slide');
var actions = require('../reflux_actions/new_service_actions');
var store = require('../reflux_stores/new_service_store');
var Reflux = require('reflux');

module.exports = React.createClass ({
    mixins: [Reflux.connect(store,'newService')],

    getInitialState: function() {
      return {
        buttonText: "Submit Definition"
      };
    },

    updateServiceName(event) {
      actions.serviceNameEdited(event.target.value);
    },

    updateCode (newCode) {
      actions.serviceDefinitionEdited(newCode);
    },

    validate(){
      // TODO: Turn this into an action
      this.setState({
        loading: true,
        buttonText: "Validating..."
      });

      var lorry = new Lorry();

      lorry.validate(this.state.newService.composeYaml).then(function(response) {
        console.log(response);
        if (response.status === "valid") {
          this.props.onContinue();
        } else {
          this.setState({
            loading: false,
            buttonText: "Submit Definition"
          });
        }

      }.bind(this));
    },

    // TODO: Extract into components (like the text field with error states and validation)

    render() {
      return (
        <Slide>
          <h1>Define your service</h1>
          <form>
            <div className="textfield">
              <label>Service Name</label>
              <input value={this.state.newService.serviceName} type="text" onChange={this.updateServiceName}/>
              {
                this.state.error ? <span className="message">Service Name must be made up of lower case letters and hyphens</span> : null
              }
            </div>

            <label>Paste Docker Compose YAML</label>
            <Codemirror value={this.state.newService.composeYaml} onChange={this.updateCode} options={{lineNumbers: true, mode: "yaml", theme: "solarized dark"}} />
          </form>

          <div className="progress_button--container">
            <button disabled={ this.state.loading } className="primary" onClick={this.validate}>{this.state.buttonText}</button>
            <ReactCSSTransitionGroup transitionName="slide-left" transitionEnterTimeout={200} transitionLeaveTimeout={200}>
            {
              this.state.loading ? <img className="loader" src="/images/loader_oval_light.svg" /> : null
            }
            </ReactCSSTransitionGroup>
          </div>
        </Slide>
      );
    }
});