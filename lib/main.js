'use babel';
import {CompositeDisposable} from "atom";
import {Chronometer} from './chronometer';
import {AutoPauseControl} from './watch';

export default {

    autoPausePeriod() {
        var period = (atom.config.get('chronometer.autoPausePeriod') || 0);

        if(period < 15) period = 15;

        return (period * 1000);
    },

    activate(state) {
        this.state = state;

        this.subscriptions = new CompositeDisposable();

        this.chronometerView = new Chronometer();
        this.chronometerView.init();

        this.subscriptions.add(atom.commands.add('atom-workspace', {
          'chronometer:toggle': () => this.chronometerView.toggle(),
          'chronometer:start': () => this.chronometerView.start(),
          'chronometer:pause': () => this.chronometerView.pause(),
          'chronometer:stop': () => this.chronometerView.stop(),
          'chronometer:restart': () => this.chronometerView.restart()
        }));

        this.apControl = new AutoPauseControl(
            this.autoPausePeriod(),
            () => {
                if(this.chronometerView.threadId)
                    this.chronometerView.pause();
            },
            () => {
                if(this.chronometerView.threadId)
                    this.chronometerView.start();
            }
       );

       atom.config.observe('chronometer.autoPausePeriod', () => {
           this.apControl.period = this.autoPausePeriod();
       });

        atom.workspace.observeTextEditors((editor) => {
            editor.onDidChange(() => {
                this.apControl.restart();
            });
            editor.onDidChangeCursorPosition(() => {
                this.apControl.restart();
            });
        });
    },

    consumeStatusBar(statusBar) {
        this.statusBar = statusBar;

        this.statusBar.addRightTile({
            item: this.chronometerView,
            priority: -1
        });

        if(atom.config.get('chronometer.autoStart')) {
            this.chronometerView.toggle();
            this.chronometerView.start();
            this.apControl.restart();
        }
    },

    set chronometerView(value) {
        if(this.chronometerView)
            throw 'programing error, status tile is redefined.';
        this.__chronometerView = value;
    },

    get chronometerView() {
        return this.__chronometerView;
    },

    deactivate() {
        console.debug('deactivate');
        this.subscriptions.dispose();
    }
};
