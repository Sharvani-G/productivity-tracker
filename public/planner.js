document.addEventListener('DOMContentLoaded', () => {

    // format date om left
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("date").textContent = today.toLocaleDateString(undefined, options);


    // to swtich between week and month view
    // 1. Get references to the buttons and content sections
    const weekBtn = document.getElementById('week-btn');
    const monthBtn = document.getElementById('month-btn');
    const weeklyContent = document.getElementById('weekly-content');
    const monthlyContent = document.getElementById('monthly-content');
    const buttons = document.querySelectorAll('.planner-header button');

    // Function to switch content
    function switchView(viewToShow) {
        if (viewToShow === 'week') {
            weeklyContent.classList.remove('hidden'); // show weekly
            monthlyContent.classList.add('hidden');   // hide monthly
        } else if (viewToShow === 'month') {
            weeklyContent.classList.add('hidden');    // hide weekly
            monthlyContent.classList.remove('hidden'); // show monthly
        }
    }

    // Function to highlight the clicked button
    function updateActiveButton(clickedButton) {
        buttons.forEach(button => button.classList.remove('active')); // remove highlight from all
        clickedButton.classList.add('active'); // highlight the clicked one
    }

    // 3. Add click listeners to buttons
    weekBtn.addEventListener('click', () => {
        switchView('week');           // show weekly content
        updateActiveButton(weekBtn);  // highlight Week button
    });

    monthBtn.addEventListener('click', () => {
        switchView('month');          // show monthly content
        updateActiveButton(monthBtn); // highlight Month button
    });


    // setting dates for week grid
    const date = new Date();

    function getPresentWeek(date) {
        const day = date.getDay();
        const tosubtractdays = day === 0 ? -6 : 1 - day;
        const monday = new Date(date);
        monday.setDate(date.getDate() + tosubtractdays);
        return monday;
    }
    // getday() gives 0-6 representing sun=0,setDate() set the data u pass as parameter

    const left = document.getElementById('pre-week');
    const right = document.getElementById('post-week');

    function updateWeek() {
        const monday = getPresentWeek(date);
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(monday);
            dayDate.setDate(monday.getDate() + i);
            document.getElementById('d' + (i + 1)).querySelector('.date').textContent = dayDate.getDate();
        }
    }

    // On page load
    updateWeek();

    // On button clicks
    left.addEventListener("click", () => {
        date.setDate(date.getDate() - 7);
        updateWeek();
    });

    right.addEventListener("click", () => {
        date.setDate(date.getDate() + 7);
        updateWeek();
    });


    // to create dynamic div

    const addBtns = document.querySelectorAll('.add-task');

    addBtns.forEach(addBtn => {
const dayDiv = addBtn.closest('.day') || addBtn.closest('.content') || addBtn.parentElement;

        addBtn.addEventListener('click', () => {
            // This code runs when you click + Task
            const taskCard = document.createElement('div'); // creates <div></div>
            taskCard.classList.add('task-card'); // adds the class for CSS styling

            const input = document.createElement('input'); // creates <input>
            input.type = 'text'; // sets type="text"
            input.placeholder = 'Enter task'; // placeholder text

            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Save';

            const statusDiv = document.createElement('div');
            statusDiv.classList.add('status');

            const options = ['Completed', 'Abandoned', 'In Process'];

            options.forEach(opt => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'status_' + Date.now(); // unique name for each task
                radio.value = opt;
                label.appendChild(radio);
                label.appendChild(document.createTextNode(opt));
                statusDiv.appendChild(label);
            });


            taskCard.appendChild(input);      // input box inside task card
            taskCard.appendChild(saveBtn);    // save button inside task card
            taskCard.appendChild(statusDiv);  // radio buttons container inside task card
            dayDiv.appendChild(taskCard); // adds the newly created task card to the day



            saveBtn.dataset.mode = 'save'; // 1️⃣ initially the button is in "save" mode
saveBtn.addEventListener('click', () => {
    if (saveBtn.dataset.mode === 'save') {
        const taskText = input.value.trim();
        const selectedRadio = statusDiv.querySelector('input[type="radio"]:checked');
        const status = selectedRadio ? selectedRadio.value : 'No status';

        // remove previous status classes
        taskCard.classList.remove('completed', 'abandoned', 'in-process', 'default');

        // add new class based on status
        if (status === 'No status') {
            taskCard.classList.add('default');
        } else if (status === 'Completed') {
            taskCard.classList.add('completed');
        } else if (status === 'Abandoned') {
            taskCard.classList.add('abandoned');
        } else if (status === 'In Process') {
            taskCard.classList.add('in-process');
        }

        // replace input with saved text
        const savedText = document.createElement('p');
        savedText.textContent = `${taskText} - ${status}`;
        taskCard.replaceChild(savedText, input);

        // disable radio buttons after saving
        statusDiv.querySelectorAll('input').forEach(r => r.disabled = true);

        // switch button to "edit" mode
        saveBtn.dataset.mode = 'edit';
        saveBtn.textContent = 'Edit';

        // ====== ADDED: Send task to server ======
        const summaryData = {
            date: today.toISOString().split('T')[0], // today's date in YYYY-MM-DD
            tasks: [
                {
                    text: taskText,
                    status: status,
                    id: 'task_' + Date.now() // unique id for the task
                }
            ]
        };

        fetch('/save-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(summaryData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log('Saved to server ✅'); // confirm in console
            }
        })
        .catch(err => console.error('Error saving to server:', err));
        // ====== END ADDED ======
    }
    else if (saveBtn.dataset.mode === 'edit') {
        // switch back to "save" mode for editing
        const existingText = taskCard.querySelector('p').textContent.split(' - ')[0];
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.value = existingText;
        taskCard.replaceChild(newInput, taskCard.querySelector('p'));

        // enable radio buttons again
        statusDiv.querySelectorAll('input').forEach(r => r.disabled = false);

        saveBtn.dataset.mode = 'save';
        saveBtn.textContent = 'Save';
    }
});
        });
    });

}); // end DOMContentLoaded

