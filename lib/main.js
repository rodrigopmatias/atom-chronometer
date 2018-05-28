'use babel';
import electron from 'electron';

import {CompositeDisposable} from "atom";
import {Chronometer} from './chronometer';
import {ManagePanel} from './manage';
import {AutoPauseControl} from './watch';

import fs from 'fs';
import path from 'path';

export default {

  autoPausePeriod() {
    var period = ((this.customConfigure.autoPausePeriod || atom.config.get('chronometer.autoPausePeriod')) || 0);
    if(period < 15) period = 15;
    return (period * 1000);
  },

  deactivate() {
    this.subscriptions.dispose();

    if(this.chronometerView) {
      this.chronometerView.destroy();
      this.__chronometerView = null;
    }

    if(this.statusBarTile) {
      this.statusBarTile.destroy();
      this.statusBarTile = null;
    }
  },

  configureObservers() {
    atom.config.observe('chronometer.autoPausePeriod', () => {
     this.apControl.period = this.autoPausePeriod();
     this.apControl.restart();
    });

    atom.config.observe('chronometer.locale', () => {
     this.chronometerView.locale = (this.customConfigure.localce || atom.config.get('chronometer.locale'));
    });

    atom.config.observe('chronometer.hourValue', () => {
     this.chronometerView.hourValue = (this.customConfigure.hourValue || atom.config.get('chronometer.hourValue'));
    });

    atom.config.observe('chronometer.currencySimbol', () => {
     this.chronometerView.currencySimbol = (this.customConfigure.currencySimbol || atom.config.get('chronometer.currencySimbol'));
    });

    atom.config.observe('chronometer.fractionDigits', () => {
     this.chronometerView.fractionDigits = (this.customConfigure.fractionDigits || atom.config.get('chronometer.fractionDigits'));
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

  customConfigureLoad() {
    const configs = atom.project.getPaths()
      .map(
        (projectDir) => path.join(projectDir, '.chronometer.json')
      )
      .filter(
        (configPath) => fs.existsSync(configPath)
      );

    this.customConfigurePath = (configs.length > 0) ? configs[0] : null;

    if(this.customConfigurePath) {
      fs.watchFile(this.customConfigurePath, () => {
        const older = (this.customConfigure || {});

        fs.readFile(this.customConfigurePath, (err, data) => {
          try {
            this.customConfigure = JSON.parse(data);
          } catch(e) {
            console.log(e);
            this.customConfigure = older;
          }

          if(this.chronometerView) {
            console.log(this.customConfigure);
            this.chronometerView.locale = (this.customConfigure.locale || atom.config.get('chronometer.locale'));
            this.chronometerView.hourValue = (this.customConfigure.hourValue || atom.config.get('chronometer.hourValue'));
            this.chronometerView.currencySimbol = (this.customConfigure.currencySimbol || atom.config.get('chronometer.currencySimbol'));
            this.chronometerView.fractionDigits = (this.customConfigure.fractionDigits || atom.config.get('chronometer.fractionDigits'));
          } else {
            console.log('chronometer is not read');
          }
        })
      });

      try {
        this.customConfigure = require(this.customConfigurePath, {nocache: true});
      } catch(e) {
        this.customConfigure = {};
      }
    } else {
      this.customConfigure = {};
    }
  },

  activate(state) {
    this.customConfigureLoad();

    this.state = state;

    this.subscriptions = new CompositeDisposable();

    this.chronometerView = new Chronometer();
    this.chronometerView.deserialize(state.Chronometer);

    this.manageView = new ManagePanel(this.chronometerView);

    this.managePanel = atom.workspace.addBottomPanel({
      item: this.manageView.element,
      visible: false
    });

    this.manageView.panel = this.managePanel;

    this.chronometerView.init(
      (this.customConfigure.locale || atom.config.get('chronometer.locale')),
      (this.customConfigure.hourValue || atom.config.get('chronometer.hourValue')),
      (this.customConfigure.currencySimbol || atom.config.get('chronometer.currencySimbol')),
      (this.customConfigure.fractionDigits || atom.config.get('chronometer.fractionDigits'))
    );

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'chronometer:toggleManage': () => this.toggleManageView(),
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

    this.configureObservers();
  },

  toggleManageView() {
    (
      this.managePanel.isVisible() ?
        this.managePanel.hide() :
        this.managePanel.show());
  },

  serialize() {
    return {
      Chronometer: this.chronometerView.serialize(),
      ManagePanel: this.manageView.serialize()
    };
  },

  consumeStatusBar(statusBar) {
    this.statusBar = statusBar;

    this.statusBarTile = this.statusBar.addRightTile({
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
  }
};
