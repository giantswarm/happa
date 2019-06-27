import DatePicker from 'react-datepicker';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

class ExpiryHoursPicker extends React.Component {
  constructor(props) {
    super(props);

    let years = 0;
    let months = 0;
    let days = 0;
    let hours = 0;

    years = Math.floor(props.initialValue / 8760);
    months = Math.floor((props.initialValue - years * 8760) / 720);
    days = Math.floor((props.initialValue - years * 8760 - months * 720) / 24);
    hours = Math.floor(
      props.initialValue - years * 8760 - months * 720 - days * 24
    );

    this.state = {
      yearsValue: years,
      monthsValue: months,
      daysValue: days,
      hoursValue: hours,
      expireDate: moment()
        .add(props.initialValue, 'hours')
        .utc(),
      selectionType: 'relative',
    };

    // to set the week start to Monday
    moment.updateLocale('en', {
      week: {
        dow: 1,
      },
    });
  }

  handleDateChange(date) {
    this.setState(
      {
        expireDate: date,
        selectionType: 'date',
      },
      () => {
        this.updateTTL();
      }
    );
  }

  handleYearChange(event) {
    var value = parseInt(event.target.value) || 0;
    this.setState(
      {
        yearsValue: value,
        selectionType: 'relative',
      },
      () => {
        this.updateTTL();
      }
    );
  }

  handleMonthChange(event) {
    var value = parseInt(event.target.value) || 0;
    this.setState(
      {
        monthsValue: value,
        selectionType: 'relative',
      },
      () => {
        this.updateTTL();
      }
    );
  }

  handleDayChange(event) {
    var value = parseInt(event.target.value) || 0;
    this.setState(
      {
        daysValue: value,
        selectionType: 'relative',
      },
      () => {
        this.updateTTL();
      }
    );
  }

  handleHourChange(event) {
    var value = parseInt(event.target.value) || 0;
    this.setState(
      {
        hoursValue: value,
        selectionType: 'relative',
      },
      () => {
        this.updateTTL();
      }
    );
  }

  onSelectionTypeChanged(event) {
    this.setState(
      {
        selectionType: event.target.value,
      },
      () => {
        this.updateTTL();
      }
    );
  }

  updateTTL() {
    var expireDate; // The expiration date the user intends
    // This will either come straight from the date picker state
    // or calculated based on values from the various year/month/day/hour
    // inputs.
    var TTL;

    if (this.state.selectionType === 'date') {
      // expireDate is at the start of the day of whatever the user picked.
      expireDate = this.state.expireDate
        .utc()
        .startOf('day')
        .clone();
    } else if (this.state.selectionType === 'relative') {
      // Calculate hours based on years, months, days, hours chosen
      expireDate = moment()
        .utc()
        .add(this.state.yearsValue, 'years');
      expireDate.add(this.state.monthsValue, 'months');
      expireDate.add(this.state.daysValue, 'days');
      expireDate.add(this.state.hoursValue, 'hours');

      // Set date picker to this value too
      this.setState({
        expireDate: expireDate,
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
      <ul className='expiry-hours-picker'>
        <li className='expiry-hours-picker--granular'>
          <input
            checked={this.state.selectionType === 'relative'}
            id='relativeCheck'
            name='selectionType'
            onChange={this.onSelectionTypeChanged.bind(this)}
            type='radio'
            value='relative'
          />
          <label htmlFor='relativeCheck'>Relatively:</label>
          <input
            autoComplete='off'
            max='10'
            maxLength={2}
            min='0'
            name='years'
            onChange={this.handleYearChange.bind(this)}
            ref={i => {
              this.years = i;
            }}
            type='text'
            value={this.state.yearsValue}
          />{' '}
          years
          <input
            autoComplete='off'
            max='999'
            maxLength={2}
            min='0'
            name='months'
            onChange={this.handleMonthChange.bind(this)}
            ref={i => {
              this.months = i;
            }}
            type='text'
            value={this.state.monthsValue}
          />{' '}
          months
          <input
            autoComplete='off'
            max='999'
            maxLength={2}
            min='0'
            name='days'
            onChange={this.handleDayChange.bind(this)}
            ref={i => {
              this.days = i;
            }}
            type='text'
            value={this.state.daysValue}
          />{' '}
          days
          <input
            autoComplete='off'
            max='999'
            maxLength={2}
            min='0'
            name='hours'
            onChange={this.handleHourChange.bind(this)}
            ref={i => {
              this.hours = i;
            }}
            type='text'
            value={this.state.hoursValue}
          />{' '}
          hours from now
        </li>
        <li>
          <input
            checked={this.state.selectionType === 'date'}
            id='dateCheck'
            name='selectionType'
            onChange={this.onSelectionTypeChanged.bind(this)}
            type='radio'
            value='date'
          />
          <label htmlFor='dateCheck'>Date:</label>
          <DatePicker
            dateFormat='YYYY-MM-DD'
            dropdownMode='select'
            maxDate={moment().add(30, 'years')}
            minDate={moment().add(1, 'day')}
            onChange={this.handleDateChange.bind(this)}
            selected={this.state.expireDate}
            showMonthDropdown
            showYearDropdown
          />
        </li>
      </ul>
    );
  }
}

ExpiryHoursPicker.propTypes = {
  onChange: PropTypes.func,
  initialValue: PropTypes.number,
};

export default ExpiryHoursPicker;
