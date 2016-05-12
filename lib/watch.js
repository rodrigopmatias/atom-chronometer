'use babel';

class AutoPauseControl {
    constructor(period, cbPause, cbStart) {
        this.__period = period;
        this.__cbPause = cbPause;
        this.__cbStart = cbStart;
        this.__mode = 1;
        this.__threadId = false;
    }

    start() {
        if(!this.__threadId)
            this.__threadId = setInterval(
                () => {
                    this.__cbPause();
                    this.__mode = 0;

                    clearInterval(this.__threadId);
                    this.__threadId = false;
                },
                this.__period
            );
    }

    restart() {
        if(this.__threadId) {
            clearInterval(this.__threadId);
            this.__threadId = false;
        }

        if(this.__mode === 0) {
            this.__cbStart();
            this.__mode = 1;
        }

        this.start();
    }
}

export default {
    AutoPauseControl: AutoPauseControl
};
