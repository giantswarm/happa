import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import DatePicker from 'react-datepicker';

class ExpiryHoursPicker extends React.Component {
  constructor(props) {
    super(props);

    let years = 0;
    let months = 0;
    let days = 0;
    let hours = 0;

    // eslint-disable-next-line no-magic-numbers
    years = Math.floor(props.initialValue / 8760);
    // eslint-disable-next-line no-magic-numbers
    months = Math.floor((props.initialValue - years * 8760) / 720);
    // eslint-disable-next-line no-magic-numbers
    days = Math.floor((props.initialValue - years * 8760 - months * 720) / 24);
    hours = Math.floor(
      // eslint-disable-next-line no-magic-numbers
      props.initialValue - years * 8760 - months * 720 - days * 24
    );

    // eslint-disable-next-line react/state-in-constructor
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
        expireDate: moment(date),
        selectionType: 'date',
      },
      () => {
        this.updateTTL();
      }
    );
  }

  handleYearChange(event) {
    const value = parseInt(event.target.value) || 0;
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
    const value = parseInt(event.target.value) || 0;
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
    const value = parseInt(event.target.value) || 0;
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
    const value = parseInt(event.target.value) || 0;
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
    let expireDate = 0; // The expiration date the user intends
    // This will either come straight from the date picker state
    // or calculated based on values from the various year/month/day/hour
    // inputs.
    let TTL = 0;

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
    }

    // Set date picker to this value too
    this.setState({
      expireDate: expireDate,
    });

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
          <div>
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
          </div>
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
            dateFormat='yyyy-MM-dd'
            dropdownMode='select'
            // eslint-disable-next-line no-magic-numbers
            maxDate={moment().add(30, 'years').toDate()}
            minDate={moment().add(1, 'day').toDate()}
            onChange={this.handleDateChange.bind(this)}
            selected={this.state.expireDate.toDate()}
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
