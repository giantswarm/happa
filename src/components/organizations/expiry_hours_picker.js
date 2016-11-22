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
      expireDate: moment().add(1, 'day').utc(),
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
    var expireDate;
    var TTL;

    if (this.state.selectionType === 'date') {
      // Calculate hours difference between now and selected date
      var expireDate = this.state.expireDate.utc().startOf('day')

    } else if (this.state.selectionType === 'relative') {
      // Calculate hours based on years, months, days, hours chosen
      var expireDate = moment().utc().add(this.state.yearsValue, 'years');
      expireDate.add(this.state.monthsValue, 'months');
      expireDate.add(this.state.daysValue, 'days');
      expireDate.add(this.state.hoursValue, 'hours');
    }

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
          { this.pluralLabel.bind(this, 'Hour', this.state.hoursValue)() }

          <small>from now</small>
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
            dateFormat='DD/MM/YYYY'
            minDate={moment().add(1, 'day')}
            maxDate={moment().add(5, 'years')}
            showMonthDropdown
            showYearDropdown
            dropdownMode='select'
          />
        </li>
      </ul>
    );
  }
}

export default ExpiryHoursPicker;