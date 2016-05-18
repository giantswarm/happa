'use strict';
var React = require('react');
var Codemirror = require('react-codemirror');
var yaml = require('codemirror/mode/yaml/yaml');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

let store = { firstName: '', lastName: '', buttonText: "Submit Definition" };

module.exports = React.createClass ({
    getInitialState() {
        return store;
    },

    handleFirstNameChanged(event) {
      store.firstName = event.target.value;
      this.setState(store);
    },

    handleLastNameChanged(event) {
      store.lastName = event.target.value;
      this.setState(store);
    },

    updateCode (newCode) {
      console.log(newCode);
      this.setState({
        code: newCode
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
      }.bind(this), 2000);
    },

    render() {
      return (
        <div className="multistep--step">
          <h1>Define your service</h1>
          <form>
            <div className="textfield">
              <label>Service Name</label>
              <input type="text"/>
              <span className="message">Service Name must be made up of lower case letters and hyphens</span>
            </div>

            <label>Paste Docker Compose YAML</label>
            <Codemirror value={this.state.code} onChange={this.updateCode} options={{lineNumbers: true, mode: "yaml", theme: "solarized dark"}} />
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