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
let tasksByWeek = {};

function formatWeekKey(date) {
/* Format key as YYYY-MM-DD for week Monday */
const monday = getPresentWeek(date);
return monday.toISOString().split('T')[0];
}

/* Load tasks from backend */
async function loadTasksFromBackend() {
    try {
        const response = await fetch('/api/weekly-tasks');
        if (response.ok) {
            tasksByWeek = await response.json();
            updateWeek();
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

/* Save tasks to backend */
async function saveTasksToBackend() {
    try {
        const response = await fetch('/api/weekly-tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tasksByWeek)
        });
        if (!response.ok) {
            console.error('Failed to save tasks');
        }
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
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
              const taskCard = createTaskCard(taskData.text, taskData.status, taskData.id, i);
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
function createTaskCard(text = '', status = 'default', taskId = null, dayIndex = null) {
const taskCard = document.createElement('div');
taskCard.classList.add('task-card');

  /* Generate unique ID if not provided */
  if (!taskId) {
      taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  taskCard.dataset.taskId = taskId;

  /* Set status class */
  taskCard.classList.add(status.toLowerCase().replace(' ', '-') || 'default');

  /* Input box */
  const input = document.createElement('input');
  input.type = 'text';
  input.value = text;
  input.placeholder = 'Enter task';

  /* Button container */
  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.gap = '5px';
  btnContainer.style.marginTop = '5px';

  /* Save/Edit button */
  const saveBtn = document.createElement('button');
  saveBtn.textContent = text ? 'Edit' : 'Save';
  saveBtn.dataset.mode = text ? 'edit' : 'save';
  saveBtn.style.flex = '1';

  /* Delete button */
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.classList.add('delete-btn');
  deleteBtn.style.backgroundColor = '#c00';

  /* Status radio buttons */
  const statusDiv = document.createElement('div');
  statusDiv.classList.add('status');
  const options = ['Completed', 'Abandoned', 'In Process'];
  const radioGroupName = 'status_' + taskId;
  
  options.forEach(opt => {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = radioGroupName;
      radio.value = opt;
      if (opt === status) radio.checked = true;
      if (text) radio.disabled = true; // Disable if already saved
      label.appendChild(radio);
      label.appendChild(document.createTextNode(opt));
      statusDiv.appendChild(label);
  });

  /* If task already has text, show it as saved */
  if (text) {
      const savedText = document.createElement('p');
      savedText.textContent = `${text} - ${status}`;
      savedText.style.margin = '5px 0';
      savedText.style.color = '#000';
      taskCard.appendChild(savedText);
  } else {
      taskCard.appendChild(input);
  }

  btnContainer.appendChild(saveBtn);
  btnContainer.appendChild(deleteBtn);
  taskCard.appendChild(btnContainer);
  taskCard.appendChild(statusDiv);

  /* Delete button handler */
  deleteBtn.addEventListener('click', () => {
      const weekKey = formatWeekKey(date);
      const dayDiv = taskCard.parentElement;
      const dayIdx = parseInt(dayDiv.id.replace('d', '')) - 1;

      /* Remove from tasksByWeek */
      if (tasksByWeek[weekKey] && tasksByWeek[weekKey][dayIdx]) {
          tasksByWeek[weekKey][dayIdx] = tasksByWeek[weekKey][dayIdx].filter(
              t => t.id !== taskId
          );
          
          /* Clean up empty arrays */
          if (tasksByWeek[weekKey][dayIdx].length === 0) {
              delete tasksByWeek[weekKey][dayIdx];
          }
      }

      /* Remove from DOM */
      taskCard.remove();

      /* Save to backend */
      saveTasksToBackend();
  });

  /* Save/Edit click handler */
  saveBtn.addEventListener('click', () => {
      const weekKey = formatWeekKey(date);
      const dayDiv = taskCard.parentElement;
      const dayIdx = parseInt(dayDiv.id.replace('d', '')) - 1;

      if (saveBtn.dataset.mode === 'save') {
          const taskText = input.value.trim();
          if (!taskText) {
              alert('Please enter a task');
              return;
          }

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
          savedText.style.margin = '5px 0';
          savedText.style.color = '#000';
          taskCard.replaceChild(savedText, input);

          /* Disable radios */
          statusDiv.querySelectorAll('input').forEach(r => r.disabled = true);

          /* Switch to edit mode */
          saveBtn.dataset.mode = 'edit';
          saveBtn.textContent = 'Edit';

          /* Store in tasksByWeek */
          if (!tasksByWeek[weekKey]) tasksByWeek[weekKey] = {};
          if (!tasksByWeek[weekKey][dayIdx]) tasksByWeek[weekKey][dayIdx] = [];
          
          tasksByWeek[weekKey][dayIdx].push({
              text: taskText,
              status: taskStatus,
              id: taskId
          });

          /* Save to backend */
          saveTasksToBackend();

      } else if (saveBtn.dataset.mode === 'edit') {
          const existingText = taskCard.querySelector('p').textContent.split(' - ')[0];
          const newInput = document.createElement('input');
          newInput.type = 'text';
          newInput.value = existingText;
          newInput.placeholder = 'Enter task';
          taskCard.replaceChild(newInput, taskCard.querySelector('p'));

          /* Enable radios */
          statusDiv.querySelectorAll('input').forEach(r => r.disabled = false);

          /* Remove old task from storage */
          if (tasksByWeek[weekKey] && tasksByWeek[weekKey][dayIdx]) {
              tasksByWeek[weekKey][dayIdx] = tasksByWeek[weekKey][dayIdx].filter(
                  t => t.id !== taskId
              );
          }

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
const dayIdx = parseInt(dayDiv.id.replace('d', '')) - 1;
const taskCard = createTaskCard('', 'default', null, dayIdx);
dayDiv.appendChild(taskCard);
});
});

/* Initial load */
loadTasksFromBackend();

}); // end DOMContentLoaded
