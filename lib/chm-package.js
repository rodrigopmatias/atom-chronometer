import { CompositeDisposable } from 'atom';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import Chronometer from './chm-chronometer';
import dbStore from './chm-db';
import AutoPauseControl from './chm-watch';
import ManagePanel from './chm-manage';


export default class ChronometerPackage {
  config(field, defaultValue, cast) {
    const custom = this.customConfigure;

    cast = (cast || (v => v));

    return cast(
      (custom[field] || atom.config.get(`chronometer.${field}`)) || (defaultValue || null)
    );
  }

  autoPausePeriod() {
    const period = this.config('autoPausePeriod', 0, Number.parseInt);
    return ((period < 15 ? 15 : period) * 1000);
  }

  deactivate() {
    this.subscriptions.dispose();

    if (this.chronometerView) {
      this.chronometerView.destroy();
      this.__chronometerView = null;
    }

    if (this.statusBarTile) {
      this.statusBarTile.destroy();
      this.statusBarTile = null;
    }
  }

  configureProject() {
    let hash;

    if (atom.project.getPaths().length > 0) {
      hash = crypto.createHash('md5');
      hash.update(atom.project.getPaths()[0]);

      this.projectId = hash.digest('hex');
      dbStore.get('accounts', this.projectId)
        .then(
          ([data]) => this.chronometerView.deserialize(data || {})
        );
    }
  }

  configureObservers() {
    atom.config.observe('chronometer.autoPausePeriod', () => {
      this.apControl.period = this.autoPausePeriod();
      this.apControl.restart();
    });

    atom.config.observe('chronometer.locale', () => {
      this.chronometerView.locale = this.config('localce', 'en-us');
    });

    atom.config.observe('chronometer.hourValue', () => {
      this.chronometerView.hourValue = this.config('hourValue', 10, Number.parseFloat);
    });

    atom.config.observe('chronometer.currencySymbol', () => {
      this.chronometerView.currencySymbol = this.config('currencySymbol', 'USD');
    });

    atom.config.observe('chronometer.fractionDigits', () => {
      this.chronometerView.fractionDigits = this.config('fractionDigits', 2, Number.parseInt);
    });

    atom.project.onDidChangePaths(() => this.configureProject());

    atom.workspace.observeTextEditors((editor) => {
      editor.onDidChange(() => {
        this.apControl.restart();
      });
      editor.onDidChangeCursorPosition(() => {
        this.apControl.restart();
      });
    });
  }

  customConfigureLoad() {
    const configs = atom.project.getPaths()
      .map(
        projectDir => path.join(projectDir, '.chronometer.json')
      )
      .filter(
        configPath => fs.existsSync(configPath)
      );

    this.customConfigurePath = (configs.length > 0) ? configs[0] : null;

    if (this.customConfigurePath) {
      fs.watchFile(this.customConfigurePath, () => {
        const older = (this.customConfigure || {});

        fs.readFile(this.customConfigurePath, (err, data) => {
          try {
            this.customConfigure = JSON.parse(data);
          } catch (e) {
            this.customConfigure = older;
          }

          if (this.chronometerView) {
            this.chronometerView.locale = this.config('locale', 'en-us');
            this.chronometerView.hourValue = this.config('hourValue', 10, Number.parseFloat);
            this.chronometerView.currencySymbol = this.config('currencySymbol', 'USD');
            this.chronometerView.fractionDigits = this.config('fractionDigits', 2, Number.parseInt);
          } else {
            console.log('chronometer is not read');
          }
        });
      });

      fs.readFile(this.customConfigurePath, (err, data) => {
        try {
          this.customConfigure = JSON.parse(data);
        } catch (e) {
          this.customConfigure = {};
        }
      });
    } else {
      this.customConfigure = {};
    }
  }

  async activateChronometer(state) {
    this.customConfigureLoad();
    this.subscriptions = new CompositeDisposable();

    this.chronometerView = new Chronometer();
    this.chronometerView.deserialize(state.Chronometer);

    this.manageView = new ManagePanel(this.chronometerView);
    this.managePanel = atom.workspace.addBottomPanel({
      item: this.manageView.element,
      visible: false
    });

    this.chronometerView.on('after-ticker', () => {
      dbStore.get('accounts', this.projectId)
        .then(
          ([data, store]) => {
            const flag = data !== null;

            data = Object.assign(
              data || { id: this.projectId },
              this.chronometerView.serialize()
            );

            if (!flag) {
              store.add({ id: this.projectId });
            } else {
              store.put(data)
                .onerror = () => console.log('error');
            }
          },
          err => console.log(err)
        );
    });

    this.manageView.panel = this.managePanel;

    this.chronometerView.init(
      this.config('locale', 'en-us'),
      this.config('hourValue', 10, Number.parseFloat),
      this.config('currencySymbol', 'USD'),
      this.config('fractionDigits', 2, Number.parseInt)
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
        if (this.chronometerView.threadId) {
          this.chronometerView.pause();
        }
      },
      () => {
        if (this.chronometerView.threadId) {
          this.chronometerView.start();
        }
      }
    );

    this.configureObservers();
  }

  async activate(state) {
    this.state = state;
    this.configureProject();
  }

  toggleManageView() {
    (
      this.managePanel.isVisible() ?
        this.managePanel.hide() :
        this.managePanel.show());
  }

  serialize() {
    return {
      ManagePanel: this.manageView.serialize()
    };
  }

  async consumeStatusBar(statusBar) {
    this.activateChronometer({})
      .then(
        () => {
          this.statusBar = statusBar;

          this.statusBarTile = this.statusBar.addRightTile({
            item: this.chronometerView.element,
            priority: -1
          });

          if (atom.config.get('chronometer.autoStart')) {
            this.chronometerView.toggle();
            this.chronometerView.start();
            this.apControl.restart();
          }
        }
      );
  }
}
