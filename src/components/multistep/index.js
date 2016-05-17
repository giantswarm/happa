var React = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

var Component = React.Component;
var PropTypes = React.PropTypes;

class MultiStep extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      currentStepAsArray: [this.props.steps[0]],
      direction: 'left'
    };

    this.hidden = {
      display: 'none'
    };
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
  }

  setStep(stepNumber) {
    var direction;

    if (stepNumber < this.props.steps.length) {
      if (stepNumber > this.state.currentStep) {
        direction = 'left';
      } else {
        direction = 'right';
      }

      this.setState({
        currentStep: stepNumber,
        currentStepAsArray: [this.props.steps[stepNumber]],
        direction: direction
      });
    } else {
      console.log("At the last step.");
    }
  }

  next() {
    this.setStep(this.state.currentStep + 1);
  }

  previous() {
    this.setStep(this.state.currentStep - 1);
  }

  render() {
    return (
      <div className="multistep--container">
        <ReactCSSTransitionGroup transitionName={`slide-${this.state.direction}`} transitionEnterTimeout={350} transitionLeaveTimeout={350}>
          {this.state.currentStepAsArray}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

module.exports = MultiStep;