'use babel';

export class ManagePanel {

  constructor(chronometer) {
    this.__chronometer = chronometer;
    this.__element = document.createElement('atom-panel');

    this.element.classList.add('chronometer-manager-container');

    this.element.innerHTML =  [
      '<div class="insert-panel">',
        '<div class="panel-heading">',
          '<span>The title</span>',
          '<div class="btn-group right">',
            '<div class="btn icon-chevron-down"></div>',
            '<div class="btn icon-x"></div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  __factoryToggleButtom() {
    const el = document.createElement('div');

    el.classList.add('btn-group');
    el.innerHTML = '<span class="btn icon icon-dash"></span>';

    return el;
  }

  __factoryTitleElement() {
    const el = document.createElement('div');

    el.classList.add('title');
    el.innerHTML = [
      '<div class="insert-panel">',
        '<div class="panel-heading">The title</div>',
      '</div>'
    ].join('');

    return el;
  }

  get element() {
    return this.__element;
  }

  serialize() {
    return {};
  }
}
