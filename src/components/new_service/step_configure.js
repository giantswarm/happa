'use strict';
var React   = require('react');
var Slide   = require('../component_slider/slide');
var actions = require('../../actions/new_service_actions');
var store   = require('../../stores/new_service_store');
var Reflux  = require('reflux');
var _       = require('underscore');

module.exports = React.createClass ({
    mixins: [Reflux.connect(store,'newService')],

    componentWillMount: function() {
      var firstComponent = _.map(this.state.newService.parsedCompose, function(componentData, componentName) {
        return componentName;
      })[0];

      this.setState({
        activeComponent: firstComponent
      });
    },

    validate(){
      this.props.onContinue();
    },

    selectComponent(componentName) {
      // TODO: Turn this into an action?
      // not sure. Maybe this is ok because it is state specific to the visual
      // representation of this component and not really the newService we
      // are making.
      this.setState({
        activeComponent: componentName
      });
    },

    isActiveComponent(componentName) {
      if (this.state.activeComponent === componentName) {
        return "active";
      }
    },

    truncate(string, maxLength) {
      if(string.length > maxLength) {
        return string.substring(0,maxLength-1)+"\u2026";
      } else {
        return string;
      }
    },

    updateComponentRamLimit(componentName, event) {
      var minimum = event.target.value;
      actions.componentRamLimitEdited(componentName, minimum);
    },

    render() {
      return (
        <Slide>
          <h1>Configure your containers</h1>
          <div className="configure_containers--container">
            <ul className="configure_containers--navigation">
              {
                 _.map(this.state.newService.parsedCompose, function(componentData, componentName) {
                  return (
                    <li onClick={this.selectComponent.bind(this, componentName)}
                        className={this.isActiveComponent(componentName)}
                        key={componentName}>
                        {this.truncate(componentName, 12)}
                    </li>
                  );
                }.bind(this))
              }
            </ul>

            <div className="configure_containers--selected-container">
              <h3>Memory Usage Limit</h3>
              <small>How much RAM does your container need?</small>
              <form onSubmit={this.validate}>
                <input type="text"
                       value={this.state.newService.parsedCompose[this.state.activeComponent].ramLimit}
                       onChange={this.updateComponentRamLimit.bind(this, this.state.activeComponent)}
                /> MB
              </form>
              <hr/>
            </div>
          </div>

          <button className="primary" onClick={this.validate}>Continue</button><br/>
          <button onClick={this.props.onPrevious}>Previous</button>
        </Slide>
      );
    }
});