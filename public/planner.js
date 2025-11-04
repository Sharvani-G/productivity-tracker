document.addEventListener('DOMContentLoaded', () => {

/* Format date on left */
const today = new Date();
const options = { year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById("date").textContent = today.toLocaleDateString(undefined, options);

/* Setting dates for week grid */
const date = new Date();

function getPresentWeek(date) {
/* getDay() gives 0-6 representing Sun=0, setDate() sets the date you pass */
const day = date.getDay();
const tosubtractdays = day === 0 ? -6 : 1 - day;
const monday = new Date(date);
monday.setDate(date.getDate() + tosubtractdays);
return monday;
}

const left = document.getElementById('pre-week');
const right = document.getElementById('post-week');

/* Object to store tasks by week start date */
const tasksByWeek = {};

function formatWeekKey(date) {
/* Format key as YYYY-MM-DD for week Monday */
const monday = getPresentWeek(date);
return monday.toISOString().split('T')[0];
}

function updateWeek() {
const monday = getPresentWeek(date);
const weekKey = formatWeekKey(date);

  /* Set day numbers in the week */
  for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      const dayDiv = document.getElementById('d' + (i + 1));
      dayDiv.querySelector('.date').textContent = dayDate.getDate();

      /* Clear existing tasks in the day div */
      const existingTasks = dayDiv.querySelectorAll('.task-card');
      existingTasks.forEach(t => t.remove());

      /* Load tasks for this week if any */
      if (tasksByWeek[weekKey] && tasksByWeek[weekKey][i]) {
          tasksByWeek[weekKey][i].forEach(taskData => {
              const taskCard = createTaskCard(taskData.text, taskData.status);
              dayDiv.appendChild(taskCard);
          });
      }
  }

}

/* Previous / Next week buttons */
left.addEventListener("click", () => {
date.setDate(date.getDate() - 7);
updateWeek();
});

right.addEventListener("click", () => {
date.setDate(date.getDate() + 7);
updateWeek();
});

/* Function to create task card element */
function createTaskCard(text = '', status = 'default') {
const taskCard = document.createElement('div');
taskCard.classList.add('task-card');

  /* Set status class */
  taskCard.classList.add(status.toLowerCase().replace(' ', '-') || 'default');

  /* Input box */
  const input = document.createElement('input');
  input.type = 'text';
  input.value = text;
  input.placeholder = 'Enter task';

  /* Save/Edit button */
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.dataset.mode = 'save';

  /* Status radio buttons */
  const statusDiv = document.createElement('div');
  statusDiv.classList.add('status');
  const options = ['Completed', 'Abandoned', 'In Process'];
  options.forEach(opt => {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'status_' + Date.now(); // unique
      radio.value = opt;
      if (opt === status) radio.checked = true;
      label.appendChild(radio);
      label.appendChild(document.createTextNode(opt));
      statusDiv.appendChild(label);
  });

  taskCard.appendChild(input);
  taskCard.appendChild(saveBtn);
  taskCard.appendChild(statusDiv);

  /* Save/Edit click handler */
  saveBtn.addEventListener('click', () => {
      const weekKey = formatWeekKey(date);

      const dayDiv = taskCard.parentElement;
      const dayIndex = parseInt(dayDiv.id.replace('d', '')) - 1;

      if (saveBtn.dataset.mode === 'save') {
          const taskText = input.value.trim();
          const selectedRadio = statusDiv.querySelector('input[type="radio"]:checked');
          const taskStatus = selectedRadio ? selectedRadio.value : 'No status';

          /* Remove previous status classes */
          taskCard.classList.remove('completed', 'abandoned', 'in-process', 'default');

          /* Add new class */
          if (taskStatus === 'No status') taskCard.classList.add('default');
          else if (taskStatus === 'Completed') taskCard.classList.add('completed');
          else if (taskStatus === 'Abandoned') taskCard.classList.add('abandoned');
          else if (taskStatus === 'In Process') taskCard.classList.add('in-process');

          /* Replace input with text */
          const savedText = document.createElement('p');
          savedText.textContent = `${taskText} - ${taskStatus}`;
          taskCard.replaceChild(savedText, input);

          /* Disable radios */
          statusDiv.querySelectorAll('input').forEach(r => r.disabled = true);

          /* Switch to edit mode */
          saveBtn.dataset.mode = 'edit';
          saveBtn.textContent = 'Edit';

          /* Store in tasksByWeek */
          if (!tasksByWeek[weekKey]) tasksByWeek[weekKey] = {};
          if (!tasksByWeek[weekKey][dayIndex]) tasksByWeek[weekKey][dayIndex] = [];
          tasksByWeek[weekKey][dayIndex].push({
              text: taskText,
              status: taskStatus
          });
      } else if (saveBtn.dataset.mode === 'edit') {
          const existingText = taskCard.querySelector('p').textContent.split(' - ')[0];
          const newInput = document.createElement('input');
          newInput.type = 'text';
          newInput.value = existingText;
          taskCard.replaceChild(newInput, taskCard.querySelector('p'));

          /* Enable radios */
          statusDiv.querySelectorAll('input').forEach(r => r.disabled = false);

          saveBtn.dataset.mode = 'save';
          saveBtn.textContent = 'Save';
      }
  });

  return taskCard;

}

/* Attach +Task button functionality */
const addBtns = document.querySelectorAll('.add-task');
addBtns.forEach(addBtn => {
addBtn.addEventListener('click', () => {
const dayDiv = addBtn.closest('.day') || addBtn.closest('.content') || addBtn.parentElement;
const taskCard = createTaskCard();
dayDiv.appendChild(taskCard);
});
});

/* Initial week load */
updateWeek();

}); // end DOMContentLoaded