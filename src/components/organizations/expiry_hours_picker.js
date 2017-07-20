import DatePicker from 'react-datepicker';
import React from 'react';
import moment from 'moment';

class ExpiryHoursPicker extends React.Component {
 constructor() {
    super();
    this.state = {
      yearsValue: 1,
      monthsValue: 0,
      daysValue: 0,
      hoursValue: 0,
      expireDate: moment().add(1, 'year').utc(),
      selectionType: 'relative'
    };
  }

  isPlural(number) {
    if (parseInt(number) === 1) {
      return false;
    } else {
      return true;
    }
  }

  pluralLabel(label, number) {
    if (this.isPlural(number)) {
      return label + 's';
    } else {
      return label;
    }
  }

  handleDateChange(date) {
    this.setState({
      expireDate: date,
      selectionType: 'date'
    }, () => { this.updateTTL(); });
  }

  handleYearChange(event) {
    var value = parseInt(event.target.value) || 0;
    this.setState({
      yearsValue: value,
      selectionType: 'relative'
    }, () => { this.updateTTL(); });
  }

  handleMonthChange(event) {
    var value = parseInt(event.target.value) || 0;
    this.setState({
      monthsValue: value,
      selectionType: 'relative'
    }, () => { this.updateTTL(); });
  }

  handleDayChange(event) {
    var value = parseInt(event.target.value) || 0;
    this.setState({
      daysValue: value,
      selectionType: 'relative'
    }, () => { this.updateTTL(); });
  }

  handleHourChange(event) {
    var value = parseInt(event.target.value) || 0;
    this.setState({
      hoursValue: value,
      selectionType: 'relative'
    }, () => { this.updateTTL(); });
  }

  onSelectionTypeChanged(event) {
    this.setState({
      selectionType: event.target.value
    }, () => { this.updateTTL(); });
  }

  updateTTL() {
    var expireDate; // The expiration date the user intends
                    // This will either come straight from the date picker state
                    // or calculated based on values from the various year/month/day/hour
                    // inputs.
    var TTL;

    if (this.state.selectionType === 'date') {
      // expireDate is at the start of the day of whatever the user picked.
      expireDate = this.state.expireDate.utc().startOf('day').clone();

    } else if (this.state.selectionType === 'relative') {
      // Calculate hours based on years, months, days, hours chosen
      expireDate = moment().utc().add(this.state.yearsValue, 'years');
      expireDate.add(this.state.monthsValue, 'months');
      expireDate.add(this.state.daysValue, 'days');
      expireDate.add(this.state.hoursValue, 'hours');

      // Set date picker to this value too
      this.setState({
        expireDate: expireDate
      });
    }

    // Now that we have an expireDate, calculate the difference between it and
    // now in hours.
    TTL = expireDate.diff(moment().utc(), 'hours');

    // Guard against invalid value
    if (TTL < 1) {
      TTL = 0;
    }

    this.props.onChange(TTL);
  }

  render() {
    return (
      <ul className="expiry-hours-picker">
        <li className='expiry-hours-picker--granular'>
          <input type='radio'
                 value="relative"
                 onChange={this.onSelectionTypeChanged.bind(this)}
                 name="selectionType"
                 id="relativeCheck"
                 checked={this.state.selectionType === 'relative'}
          />

          <label htmlFor="relativeCheck">Relatively:</label>
          <input type='text' min="0" max="10" name="years" maxLength={2} ref="years"  value={this.state.yearsValue} onChange={this.handleYearChange.bind(this)} autoComplete="off"/>
          { this.pluralLabel.bind(this, 'Year', this.state.yearsValue)() }

          <input type='text' min="0" max="999" name="months" maxLength={2} ref="months" value={this.state.monthsValue} onChange={this.handleMonthChange.bind(this)} autoComplete="off"/>
          { this.pluralLabel.bind(this, 'Month', this.state.monthsValue)() }

          <input type='text' min="0" max="999" name="days" maxLength={2} ref="days" value={this.state.daysValue} onChange={this.handleDayChange.bind(this)} autoComplete="off"/>
          { this.pluralLabel.bind(this, 'Day', this.state.daysValue)() }

          <input type='text' min="0" max="999" name="hours" maxLength={2} ref="hours" value={this.state.hoursValue} onChange={this.handleHourChange.bind(this)} autoComplete="off"/>
          { this.pluralLabel.bind(this, 'Hour', this.state.hoursValue)() } from now
        </li>
        <li>
          <input type='radio'
                 value="date"
                 onChange={this.onSelectionTypeChanged.bind(this)}
                 name="selectionType"
                 id="dateCheck"
                 checked={this.state.selectionType === 'date'}
          />
          <label htmlFor="dateCheck">Date:</label>
          <DatePicker
            selected={this.state.expireDate}
            onChange={this.handleDateChange.bind(this)}
            dateFormat='YYYY-MM-DD'
            minDate={moment().add(1, 'day')}
            maxDate={moment().add(30, 'years')}
            showMonthDropdown
            showYearDropdown
            dropdownMode='select'
          />
        </li>
      </ul>
    );
  }
}

ExpiryHoursPicker.propTypes = {
  onChange: React.PropTypes.func
};

export default ExpiryHoursPicker;
