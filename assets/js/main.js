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
        };
        const confirmAddTask = () => {
          const taskName = taskNameController.value;
          const taskDetail = taskDetailController.value.trim();
          if (taskName === "") {
            setErrorLen("请填写任务名称");
            return;
          }
          App.methods.addTask(new Task(taskName, taskDetail));
          taskNameController.value = "";
          taskDetailController.value = "";
          addTaskPanelMask.style.display = "none";
        };
        App.methods.bindEventWithNoParas(btns[1], "click", cancelAddTask);
        App.methods.bindEventWithNoParas(btns[0], "click", confirmAddTask);
        App.methods.bindEventWithNoParas(
          taskNameController,
          "input",
          clearErrorLen
        );
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
      delTask() {
        const selectedTasksIndex = App.methods.getSelectedTasks(App.tasks);
        if (selectedTasksIndex.length === 0) {
          alert("没有选中任何任务。");
          return;
        }
        const isDel = confirm("确认要删除已选中的所有任务吗？");
        if (!isDel) return;
        const tasks = App.tasks;
        for (const index of selectedTasksIndex) {
          tasks[index] = null;
        }
        App.tasks = tasks.filter((item) => item !== null);
        App.methods.renderTasks(
          App.elms.tasksContainer,
          App.tasks,
          App.events.selectTaskItem
        );
      },
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
      bindEventWithNoParas(elm, eventType, fn) {
        if (typeof eventType !== "string" || typeof fn !== "function")
          throw new Error(
            `invalid parameter...eventType: ${eventType}, fn: ${fn}`
          );
        elm.addEventListener(eventType, fn);
      },
      bindEventWithParas(elm, eventType, fn, paras) {
        if (typeof eventType !== "string" || typeof fn !== "function")
          throw new Error(
            `invalid parameter: eventType: ${eventType}, fn: ${fn}`
          );
        if (!(paras instanceof Array)) {
          throw new Error(
            `invalid parameter 'paras', it can only be an array, but received a ${paras}`
          );
        }
        elm.addEventListener(eventType, fn.bind(App, ...paras));
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
        this.bindEventWithNoParas(menuItems[0].elm, "click", eventFns.addTask);
        this.bindEventWithNoParas(menuItems[1].elm, "click", eventFns.delTask);
        this.bindEventWithNoParas(
          menuItems[2].elm,
          "click",
          eventFns.changeTaskSort
        );
        console.log("menu items events binded successfully.");
      },
      getScreenSize() {
        return App.elms.body.getBoundingClientRect();
      },
      addTask(task) {
        if (task instanceof Task) {
          App.tasks.unshift(task);
          this.renderTasks(
            App.elms.tasksContainer,
            App.tasks,
            App.events.selectTaskItem
          );
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
          const taskElm = parser.parseFromString(
            task.getRenderElm(i + 1),
            "text/html"
          ).body.childNodes[0];
          this.bindEventWithParas(taskElm, "click", selectTaskItemFn, [i]);
          fragment.append(taskElm);
        }
        tasksContainer.append(fragment);
        this.updateTaskElms(App.elms.tasksContainer);
      },
      getAddTaskPanelController(panelElm) {
        return {
          taskNameController: panelElm.querySelector("#-app-task-name"),
          taskDetailController: panelElm.querySelector("#-app-task-detail"),
        };
      },
      updateTaskElms(container) {
        App.elms.taskElms = container.querySelectorAll(".__task");
      },
      getSelectedTasks(tasks) {
        const selectedTasksIndex = [];
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i].isSelected) selectedTasksIndex.push(i);
        }
        return selectedTasksIndex;
      },
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
