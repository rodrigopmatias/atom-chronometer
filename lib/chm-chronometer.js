import {ManagePanel} from './chm-manage';

export class Chronometer {

  on(name, callback) {
    this._events = (this._events || {});
    this._events[name] = (this._events[name] || []);
    this._events[name].push(callback);
  }

  emmit(name, params) {
    (this._events[name] || []).forEach(
      (fn) => {
        fn(this, params);
      }
    );
  }

  constructor(state) {
    this.element = document.createElement('div');
  }

  serialize() {
    return {
      hours: this.hour(),
      minutes: this.minute(),
      seconds: this.second()
    };
  }

  deserialize(state) {
    state = state || {};

    this.second(state.seconds || 0);
    this.minute(state.minutes || 0);
    this.hour(state.hours || 0);
  }

  get locale() {
    return this._locale || 'en-us';
  }

  set locale(value) {
    this._locale = value;
  }

  get hourValue() {
    return Number.parseFloat(this._hourValue || 0);
  }

  set hourValue(value) {
    this._hourValue = Number.parseFloat(value);
  }

  get currencySimbol() {
    return this._currencySimbol;
  }

  set currencySimbol(value) {
    this._currencySimbol = value;
  }

  destroy() {
    this.stop();

    if(this.icon) {
      this.icon.parentNode.removeChild(this.icon);
      this.__icon = null;
    }

    if(this.display) {
      this.display.parentNode.removeChild(this.display);
      this.__display = null;
    }

    this.parentNode.removeChild(this);
  }

  get fractionDigits() {
    return this._fractionDigits;
  }

  set fractionDigits(value) {
    this._fractionDigits = Number.parseInt(value);

    this._fractionDigits = this._fractionDigits > 6 ?
      6 :
      this._fractionDigits;

    this._fractionDigits = this._fractionDigits < 0 ?
      0 :
      this._fractionDigits;
  }

  value() {
    const fill = (n, size) => Number.parseInt(n || 0).toLocaleString(
      'en-us',
      {minimumIntegerDigits: size, useGrouping: false}
    );

    const value = (this.second() + (this.minute() * 60) + (this.hour() * 3600)) * (this.hourValue / 3600.0);
    const formatedValue = (value || 0).toLocaleString(this.locale, {
      minimumFractionDigits: this.fractionDigits,
      maximumFractionDigits: this.fractionDigits,
      useGrouping: true
    });

    return [
      fill(this.hour(), 2),
      fill(this.minute(), 2),
      fill(this.second(), 2)
    ].join(':') + ' - ' + `${this.currencySimbol} ${formatedValue}`;
  }

  get display() {
    if(!this.__display) {
      this.__display = document.createElement('span');
      this.__display.style = {paddingRight: '3px'};
    }

    return this.__display;
  }

  get icon() {
    if(!this.__icon) {
      this.__icon = document.createElement('span');
      this.__icon.classList.add('chronometer-icon', 'icon', 'icon-pulse');

      var me = this;
      this.__icon.onclick = function() {
        me.action();
      };
    }

    return this.__icon;
  }

  init(locale, hourValue, currencySimbol, fractionDigits) {
    this.locale = (locale || 'en-us');
    this.currencySimbol = currencySimbol || 'USD';
    this.hourValue = Number.parseFloat(hourValue || 0);
    this.fractionDigits = Number.parseFloat(fractionDigits || 0);

    this.element.classList.add('chronometer-hide', 'inline-block', 'chronometer');
    this.element.appendChild(this.icon);
    this.element.appendChild(this.display);

    this.mode = 0;
    this.threadId = false;

    this.observe();
  }

  start() {
    if(!this.threadId)
      this.threadId = setInterval(
        () => {
            this.ticker();
        },
        1000
      );

    if(this.mode === 0) {
      this.icon.classList.remove('text-warning');
      this.icon.classList.add('text-info');
    }

    this.mode = 1;
  }

  ticker() {
    var second = (this.second() || 0);
    var minute = (this.minute() || 0);
    var hour = (this.hour() || 0);
    var size = 0;
    var currentTime;

    this.emmit('before-ticked');

    if(this.mode == 1) {
      currentTime = Date.now();
      if(this.olderTime !== 0) {
        size = Number.parseInt(
          Number.parseFloat(
            (currentTime - this.olderTime) / 1000
          ).toFixed()
        );
      }
      else size = 1;

      this.olderTime = currentTime;

      second += (size || 0);

      while(second > 59) {
        second -= 60;
        minute += 1;
      }

      while(minute > 59) {
        minute -= 60;
        hour += 1;
      }

      this.second(second, true);
      this.minute(minute, true);
      this.hour(hour);

      this.emmit('after-ticker');
    }
  }

  action() {
    this.pause();
  }

  stop() {
    if(this.threadId) {
      clearInterval(this.threadId);
      this.threadId = false;
      this.mode = 0;

      this.second(0, true);
      this.minute(0, true);
      this.hour(0);
      this.olderTime = 0;

      this.icon.classList.remove('text-info');
    }
  }

  restart() {
    this.stop();
    this.start();
  }

  pause() {
    if(this.mode === 1) {
      this.icon.classList.remove('text-info');
      this.icon.classList.add('text-warning');
      this.mode = 0;
      this.olderTime = 0;
    }
    else {
      this.icon.classList.add('text-info');
      this.icon.classList.remove('text-warning');
      this.mode = 1;
    }
  }

  reset() {
    this.hour(0, true);
    this.minute(0, true);
    this.second(0);
  }

  hour(value, silent) {
    silent = (silent || false);

    if(value !== undefined) {
      this.__hour = value;
      if(!silent) this.observe();
    }

    return this.__hour;
  }

  minute(value, silent) {
    silent = (silent || false);

    if(value !== undefined) {
      this.__minute = value;
      if(!silent) this.observe();
    }

    return this.__minute;
  }

  second(value, silent) {
    silent = (silent || false);

    if(value !== undefined) {
      this.__second = value;
      if(!silent) this.observe();
    }

    return this.__second;
  }

  observe() {
    this.display.textContent = this.value();
  }

  toggle() {
    this.element.classList.toggle('chronometer-hide');
  }
}
