export class ManagePanel {

  constructor(chronometer) {
    this.__chronometer = chronometer;
    this.__element = document.createElement('atom-panel');

    this.element.classList.add('chronometer-manager-container');

    this.element.innerHTML =  [
      '<div class="insert-panel">',
        '<div class="panel-heading">',
          '<span>The title</span>',
          '<div class="btn-group to-right">',
            '<div class="btn icon-x"></div>',
          '</div>',
        '</div>',
        '<div class="panel-body padded">',
          '<div class="right">',
            'left',
          '</div>',
          '<div>',
            'right',
          '</div>',
        '</div>',
      '</div>'
    ].join('');

    this.elements = {
      bodyContainer: this.element.querySelector('.insert-panel .panel-body'),
      title: this.element.querySelector('.insert-panel .panel-heading span'),
      buttomClose: this.element.querySelector('.insert-panel .panel-heading .icon-x')
    };

    this.elements.title.innerHTML = 'Chronometer Manager';
    this.elements.buttomClose.onclick = (e) => {
      if(this.panel) {
        (this.panel.isVisible ?
          this.panel.hide() :
          this.panel.show());
      }
    };

    setTimeout(
      () => {
        this.elements.bodyContainer.style.height = '250px';
      },
      250
    );
  }

  get panel() {
    return this.__panel;
  }

  set panel(value) {
    this.__panel = value;
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
