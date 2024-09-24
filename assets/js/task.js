export class Task {
  name;
  detail;
  isSelected;
  bgColor;

  constructor(name, detail, color) {
    this.name = name;
    this.detail = detail;
    this.isSelected = false;
    this.bgColor = color;
  }

  getTaskObj() {
    return {
      name: this.name,
      detail: this.detail,
      bgColor: this.bgColor,
    };
  }

  getRenderElm(order) {
    return `
      <div class="__task" title="${this.name}">
        <div class="__order">${order}</div>
        <p class="__title">${this.name}</p>
        <p class="__detail">${this.detail}</p>
        <div class="__expand" title="查看详细"></div>
      </div>
      `;
  }

  getBgColor() {
    return this.bgColor;
  }
}
