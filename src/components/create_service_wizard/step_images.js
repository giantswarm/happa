'use strict';
var React = require('react');

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
            <h1>Analyzing images</h1>
            <button className="primary" onClick={this.validate}>Continue</button><br/>
            <button onClick={this.props.onPrevious}>Previous</button>
          </div>
        );
    }
});