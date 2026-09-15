const STORAGE_KEY = "yasser-task-manager";
const form = document.querySelector(".task-form");
const input = document.querySelector(".task-input");
const list = document.querySelector(".task-list");
const count = document.querySelector(".task-count");
const emptyState = document.querySelector(".empty-state");
const message = document.querySelector(".form-message");

let tasks = loadTasks();

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateSummary() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  count.textContent = total === 1 ? "1 task" : `${total} tasks`;
  count.setAttribute("aria-label", `${completed} of ${total} tasks completed`);
  emptyState.hidden = total > 0;
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = "task";
  item.dataset.id = task.id;
  if (task.completed) item.classList.add("task--completed");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task__check";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `Mark ${task.title} as completed`);

  const title = document.createElement("span");
  title.className = "task__title";
  title.textContent = task.title;

  const actions = document.createElement("div");
  actions.className = "task__actions";

  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "task__button task__button--edit";
  edit.textContent = "Edit";
  edit.setAttribute("aria-label", `Edit ${task.title}`);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "task__button task__button--delete";
  remove.textContent = "Delete";
  remove.setAttribute("aria-label", `Delete ${task.title}`);

  actions.append(edit, remove);
  item.append(checkbox, title, actions);
  return item;
}

function render() {
  list.replaceChildren(...tasks.map(createTaskElement));
  updateSummary();
}

function announce(text) {
  message.textContent = "";
  requestAnimationFrame(() => {
    message.textContent = text;
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = input.value.trim();

  if (!title) {
    announce("Enter a task before adding it.");
    input.focus();
    return;
  }

  tasks.unshift({ id: crypto.randomUUID(), title, completed: false });
  saveTasks();
  render();
  form.reset();
  announce("Task added.");
  input.focus();
});

list.addEventListener("change", (event) => {
  if (!event.target.matches(".task__check")) return;
  const task = tasks.find(({ id }) => id === event.target.closest(".task").dataset.id);
  task.completed = event.target.checked;
  saveTasks();
  render();
  announce(task.completed ? "Task completed." : "Task reopened.");
});

list.addEventListener("click", (event) => {
  const item = event.target.closest(".task");
  if (!item) return;

  const index = tasks.findIndex(({ id }) => id === item.dataset.id);

  if (event.target.matches(".task__button--delete")) {
    tasks.splice(index, 1);
    saveTasks();
    render();
    announce("Task deleted.");
  }

  if (event.target.matches(".task__button--edit")) {
    const nextTitle = window.prompt("Edit task", tasks[index].title)?.trim();
    if (!nextTitle || nextTitle === tasks[index].title) return;
    tasks[index].title = nextTitle;
    saveTasks();
    render();
    announce("Task updated.");
  }
});

render();