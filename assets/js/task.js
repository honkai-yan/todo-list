export class Task {
  name;
  detail;
  deadTime;
  isSelected;

  constructor(name, detail, deadTime) {
    this.name = name;
    this.detail = detail;
    this.deadTime = deadTime;
    this.isSelected = false;
  }

  getTaskObj() {
    return {
      name: this.name,
      detail: this.detail,
      deadTime: this.deadTime,
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
}
