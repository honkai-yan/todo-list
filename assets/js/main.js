import { Task } from "./task.js";

(() => {
  "use strict";
  window.oncontextmenu = () => {
    return false;
  };

  const MAX_TASK_NUM = 20;

  const App = {
    tasks: [],
    menuItems: [
      {
        text: "添加任务",
        color: "lightblue",
        elm: null,
      },
      {
        text: "删除任务",
        color: "rgb(241, 167, 167)",
        elm: null,
      },
      {
        text: "排序方式",
        color: "lightgreen",
        elm: null,
      },
    ],
    elms: {
      body: null,
      menuBox: null,
      tasksContainer: null,
      taskElms: null,
      addTaskPanelMask: null,
    },
    events: {
      addTask() {
        if (App.methods.isListFull()) {
          alert("列表已满，请删除部分任务后再尝试添加任务.");
          return;
        }
        const addTaskPanelMask = App.elms.addTaskPanelMask;
        addTaskPanelMask.style.display = "flex";
        const btns = addTaskPanelMask.querySelectorAll(".__btn-area .__button");
        const errorLen = addTaskPanelMask.querySelector(".__error-len");
        const {
          taskNameController,
          taskDetailController,
          taskDeadTimeController,
        } = App.methods.getAddTaskPanelController(addTaskPanelMask);
        const clearErrorLen = () => {
          errorLen.innerHTML = "";
        };
        const setErrorLen = (str) => {
          errorLen.innerHTML = str;
        };
        const cancelAddTask = () => {
          addTaskPanelMask.style.display = "none";
          App.methods.removeEvent(btns[1], "click", cancelAddTask);
          App.methods.removeEvent(btns[0], "click", confirmAddTask);
          App.methods.removeEvent(taskNameController, "input", clearErrorLen);
          App.methods.removeEvent(
            taskDeadTimeController,
            "change",
            clearErrorLen
          );
        };
        const confirmAddTask = () => {
          const taskName = taskNameController.value;
          const taskDetail = taskDetailController.value.trim();
          const deadTime = taskDeadTimeController.value;
          if (taskName === "") {
            setErrorLen("请填写任务名称");
            return;
          }
          if (deadTime === "") {
            setErrorLen("请选择截至日期");
            return;
          }
          App.methods.addTask(new Task(taskName, taskDetail, deadTime));
          taskNameController.value = "";
          taskDetailController.value = "";
          taskDeadTimeController.value = "";
          addTaskPanelMask.style.display = "none";
        };
        App.methods.bindEvent(btns[1], "click", cancelAddTask);
        App.methods.bindEvent(btns[0], "click", confirmAddTask);
        App.methods.bindEvent(taskNameController, "input", clearErrorLen);
        App.methods.bindEvent(taskDeadTimeController, "change", clearErrorLen);
      },
      selectTaskItem(index) {
        const task = App.tasks[index];
        const taskElm = App.elms.taskElms[index];
        if (task.isSelected) {
          task.isSelected = false;
          taskElm.classList.remove("__task--selected");
        } else {
          task.isSelected = true;
          taskElm.classList.add("__task--selected");
        }
      },
      delTask() {},
      changeTaskSort() {},
    },
    methods: {
      initElms(elms) {
        console.log("start initializing elements...");
        elms.body = document.querySelector("body");
        elms.menuBox = document.querySelector(".menu-box");
        elms.tasksContainer = document.querySelector(".tasks-list");
        elms.addTaskPanelMask = document.querySelector("#add-task-panel");
        console.log("elements loaded.");
      },
      renderMenuBox(menuItems) {
        console.log("start rendering menu box...");
        const menuBox = App.elms.menuBox;
        const fragment = document.createDocumentFragment();
        let i = 0;
        for (const item of menuItems) {
          const div = document.createElement("div");
          div.className = "__menu-item";
          div.innerHTML = item.text;
          div.style.backgroundColor = item.color;
          menuItems[i++].elm = div;
          fragment.appendChild(div);
        }
        menuBox.appendChild(fragment);
        console.log("menu box renderd successfully.");
      },
      bindEvent(elm, eventType, fn) {
        if (typeof eventType !== "string" || typeof fn !== "function")
          throw new Error(
            `invalid parameter...eventType: ${eventType}, fn: ${fn}`
          );
        elm.addEventListener(eventType, fn);
      },
      removeEvent(elm, eventType, fn) {
        if (typeof eventType !== "string" || typeof fn !== "function")
          throw new Error(
            `invalid parameter...eventType: ${eventType}, fn: ${fn}`
          );
        elm.removeEventListener(eventType, fn);
      },
      bindMenuItemEvent(menuItems, eventFns) {
        console.log("start binding menu items events...");
        this.bindEvent(menuItems[0].elm, "click", eventFns.addTask);
        this.bindEvent(menuItems[1].elm, "click", eventFns.delTask);
        this.bindEvent(menuItems[2].elm, "click", eventFns.changeTaskSort);
        console.log("menu items events binded successfully.");
      },
      getScreenSize() {
        return App.elms.body.getBoundingClientRect();
      },
      addTask(task) {
        if (task instanceof Task) {
          App.tasks.unshift(task);
          this.renderTasks(App.elms.tasksContainer, App.tasks, App.events.selectTaskItem);
          this.updateTaskElms(App.elms.tasksContainer);
        } else {
          throw new Error(`invalid task type, the task is ${task}.`);
        }
      },
      isListFull() {
        return App.tasks.length >= MAX_TASK_NUM;
      },
      renderTasks(tasksContainer, tasks, selectTaskItemFn) {
        const fragment = document.createDocumentFragment();
        const parser = new DOMParser();
        tasksContainer.innerHTML = "";
        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i];
          const taskElm = parser.parseFromString(task.getRenderElm(i + 1), "text/html").body.childNodes[0];
          taskElm.addEventListener("click", selectTaskItemFn.bind(App, i));
          fragment.append(taskElm);
        }
        tasksContainer.append(fragment);
      },
      getAddTaskPanelController(panelElm) {
        return {
          taskNameController: panelElm.querySelector("#-app-task-name"),
          taskDetailController: panelElm.querySelector("#-app-task-detail"),
          taskDeadTimeController: panelElm.querySelector("#-app-task-date"),
        };
      },
      updateTaskElms(container) {
        App.elms.taskElms = container.querySelectorAll(".__task");
      }
    },
    initApp() {
      console.log("start initializing App...");
      this.methods.initElms(this.elms);
      this.methods.renderMenuBox(this.menuItems);
      this.methods.bindMenuItemEvent(this.menuItems, this.events);
      console.log("App loaded successfully.");
    },
  };

  App.initApp();
})();
