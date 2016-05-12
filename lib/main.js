'use babel';
import {CompositeDisposable} from "atom";
import {Chronometer} from './chronometer';
import {AutoPauseControl} from './watch';

export default {

    activate(state) {
        this.state = state;
        console.debug('activate');

        this.subscriptions = new CompositeDisposable();

        this.chronometerView = new Chronometer();
        this.chronometerView.init();

        this.subscriptions.add(atom.commands.add('atom-workspace', {
          'chronometer:toggle': () => this.chronometerView.toggle(),
          'chronometer:start': () => this.chronometerView.start(),
          'chronometer:pause': () => this.chronometerView.pause(),
          'chronometer:stop': () => this.chronometerView.stop()
        }));

        this.apControl = new AutoPauseControl(
            25000,
            () => {
                if(this.chronometerView.threadId)
                    this.chronometerView.pause();
                else
                    console.log('chronometer not started');
            },
            () => {
                if(this.chronometerView.threadId)
                    this.chronometerView.start();
                else
                    console.log('chronometer not started');
            }
       );

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

        this.chronometerView.toggle();
        this.chronometerView.start();
        this.apControl.restart();
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
