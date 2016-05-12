'use babel';
import {format} from "util";

class Chronometer extends HTMLElement {

    value() {
        function fill(number) {
            var out = number.toString();

            while(out.length < 2)
                out = '0' + out;

            return out;
        }

        return [
            fill(this.hour() || 0),
            fill(this.minute() || 0),
            fill(this.second() || 0)
        ].join(':');
    }

    get display() {
        if(!this.__display)
            this.__display = document.createElement('span');

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

    init() {
        this.classList.add('chronometer-hide', 'inline-block');
        this.appendChild(this.display);
        this.appendChild(this.icon);

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

        if(this.mode == 1) {
            second += 1;

            if(second > 59) {
                second = 0;
                minute += 1;
            }

            if(minute > 59) {
                minute = 0;
                hour += 1;
            }

            this.second(second, true);
            this.minute(minute, true);
            this.hour(hour);
        }
    }

    stop() {
        if(this.threadId) {
            clearInterval(this.threadId);
            this.threadId = false;
            this.mode = 0;

            this.second(0, true);
            this.minute(0, true);
            this.hour(0);

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
        this.classList.toggle('chronometer-hide');
    }
}

export default {
    Chronometer: document.registerElement('chronometer-view', {
        prototype: Chronometer.prototype,
        extend: 'div'
    })
};