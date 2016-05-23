'use strict';
var React = require('react');
var Codemirror = require('react-codemirror');
var yaml = require('codemirror/mode/yaml/yaml');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

var Slide = require('../component_slider/slide');
var actions = require('../reflux_actions/new_service_actions');
var store = require('../reflux_stores/new_service_store');
var Reflux = require('reflux');

module.exports = React.createClass ({
    mixins: [Reflux.connect(store,'newService'), Reflux.listenerMixin],

    componentDidMount: function() {
      this.listenTo(actions.validateServiceDefinition.completed, this.onValidateServiceDefinitionCompleted);

      var codeMirror = this.refs.codeMirror.getCodeMirror();

      function makeMarker() {
        var marker = document.createElement("div");
        marker.style.color = "#d22";
        marker.innerHTML = "●";
        return marker;
      }

      codeMirror.on("gutterClick", function(cm, n) {
        var info = cm.lineInfo(n);
        cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
      });
    },

    getInitialState: function() {
      return {
        buttonText: "Submit Definition"
      };
    },

    // TODO: Figure out how to write this in a way where the view does not listen to actions
    // only the store should be doing that.
    onValidateServiceDefinitionCompleted: function(validationResult) {
      if (validationResult.status === "valid") {
        this.props.onContinue();
      } else {
        this.setState({validating: false});
      }
    },

    updateServiceName(event) {
      var serviceName = event.target.value;
      actions.serviceNameEdited(event.target.value);
    },

    updateCode (newCode) {
      actions.serviceDefinitionEdited(newCode);
    },

    validate(event){
      event.preventDefault();
      this.setState({validating: true});
      actions.validateServiceDefinition(this.state.newService.fields.rawComposeYaml.value);
    },

    hasErrors(fieldName) {
      return this.state.newService.fields[fieldName].validationErrors && this.state.newService.fields[fieldName].validationErrors.length > 0;
    },

    // TODO: Extract into components (like the text field with error states and validation)

    render() {
      return (
        <Slide>
          <h1>Define your service</h1>
          <form onSubmit={this.validate}>
            <div className={"textfield " + (this.hasErrors('serviceName') ? "hasrrors" : null)}>
              <label>Service Name</label>
              <input defaultValue={this.state.newService.fields.serviceName.value} type="text" onChange={this.updateServiceName} />
              <div className="errorContainer">
                {
                  this.hasErrors('serviceName') ? <span className="message">{this.state.newService.fields.serviceName.validationErrors}</span> : null
                }
              </div>
            </div>

            <label>Paste Docker Compose YAML</label>

            <div className="textarea">
              <Codemirror ref="codeMirror" value={this.state.newService.fields.rawComposeYaml.value} onChange={this.updateCode} options={{
                lineNumbers: true,
                mode: "yaml",
                theme: "solarized dark",
                gutters: ["CodeMirror-linenumbers", "breakpoints"]
              }} />
              <div className="errorContainer">
                {
                  this.hasErrors('rawComposeYaml') ? <span className="message">{this.state.newService.fields.rawComposeYaml.validationErrors}</span> : null
                }
              </div>
            </div>
          </form>

          <div className="progress_button--container">
            <button disabled={ this.state.validating } className="primary" onClick={this.validate}>
              {
                this.state.validating ? "Validating ..." : "Submit Definition"
              }
            </button>
            <ReactCSSTransitionGroup transitionName="slide-left" transitionEnterTimeout={200} transitionLeaveTimeout={200}>
            {
              this.state.validating ? <img className="loader" src="/images/loader_oval_light.svg" /> : null
            }
            </ReactCSSTransitionGroup>
          </div>
        </Slide>
      );
    }
});