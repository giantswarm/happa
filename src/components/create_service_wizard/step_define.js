'use strict';
var React = require('react');
var Codemirror = require('react-codemirror');
var yaml = require('codemirror/mode/yaml/yaml');

let store = { firstName: '', lastName: '' };

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
      console.log("validating");
      console.log("valid");

      // Signal continue
      this.props.onContinue();
    },

    render() {
      return (
        <div className="multistep--step">
          <h1>Define your service</h1>
          <form>
            <label>Service Name</label>
            <input type="text"/>

            <label>Paste Docker Compose YAML</label>
            <Codemirror value={this.state.code} onChange={this.updateCode} options={{lineNumbers: true, mode: "yaml", theme: "solarized dark"}} />
          </form>
          <button className="primary" onClick={this.validate}>Submit Definition</button><br/>
        </div>
      );
    }
});