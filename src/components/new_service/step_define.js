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
      actions.validateServiceDefinition(this.state.newService.rawComposeYaml);
    },

    // TODO: Extract into components (like the text field with error states and validation)

    render() {
      return (
        <Slide>
          <h1>Define your service</h1>
          <form onSubmit={this.validate}>
            <div className="textfield">
              <label>Service Name</label>
              <input value={this.state.newService.serviceName} type="text" onChange={this.updateServiceName}/>
              {
                this.state.error ? <span className="message">Service Name must be made up of lower case letters and hyphens</span> : null
              }
            </div>

            <label>Paste Docker Compose YAML</label>
            <Codemirror ref="codeMirror" value={this.state.newService.rawComposeYaml} onChange={this.updateCode} options={{
              lineNumbers: true,
              mode: "yaml",
              theme: "solarized dark",
              gutters: ["CodeMirror-linenumbers", "breakpoints"]
            }} />
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