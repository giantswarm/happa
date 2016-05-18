// Multislide
// Takes an array of components, and lets you transition between them

var React = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

var Component = React.Component;
var PropTypes = React.PropTypes;

module.exports = class ComponentSlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSlide: 0,
      currentSlideAsArray: [this.props.slides[0]],
      direction: 'left'
    };

    this.hidden = {
      display: 'none'
    };
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
  }

  setSlide(slideNumber) {
    var direction;

    if (slideNumber < this.props.slides.length) {
      if (slideNumber > this.state.currentSlide) {
        direction = 'left';
      } else {
        direction = 'right';
      }

      this.setState({
        currentSlide: slideNumber,
        currentSlideAsArray: [this.props.slides[slideNumber]],
        direction: direction
      });
    } else {
      console.log("At the last slide.");
    }
  }

  next() {
    this.setSlide(this.state.currentSlide + 1);
  }

  previous() {
    this.setSlide(this.state.currentSlide - 1);
  }

  render() {
    return (
      <div className="component_slider--container">
        <ReactCSSTransitionGroup transitionName={`slide-${this.state.direction}`} transitionEnterTimeout={200} transitionLeaveTimeout={200}>
          {this.state.currentSlideAsArray}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
};