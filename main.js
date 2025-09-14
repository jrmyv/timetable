let timetableData;

window.onload = () => {
    init();
}

function init() {
    document.getElementById('fileInput').addEventListener('change', function(event) { handleFile(event.target.files[0]) });
}

async function handleFile(file) {
    timetableData = await readFile(file);
    renderSelect(document.getElementById('courseSelection'), getCourses(timetableData));
}

async function readFile(file) {
    const reader = new FileReader();

    const rawData = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e.target.error);
        reader.readAsText(file);
    });

    return JSON.parse(rawData);
}

function getCourses(ttData) {
    const courses = [];

    for(let day of ttData.days) {
        for(let period of day.periods) {
            for(let course of period.courses) {
                if(courses.find(listedCourse => listedCourse.id === course.id)) continue;
                courses.push(course);
            }
        }
    }

    return courses.sort((a, b) => a.subject.localeCompare(b.subject));
}

function renderSelect(parent, list) {
    const div = document.createElement('div');

    for(let course of list) {
        div.appendChild(createSelectElement(course));
    }

    parent.appendChild(div);

    const button = document.createElement('button');
    button.textContent = "Submit";
    button.addEventListener('click', function() { handleCourseSelection(div) });
    parent.appendChild(button);
}

function createSelectElement(content) {
    const div = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = content.id;
    checkbox.value = content.id;

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = checkbox.id;
    
    div.appendChild(checkbox);
    div.appendChild(label);

    return div;
}

function handleCourseSelection(range) {
    const checkboxes = range.querySelectorAll('input:checked');
    const selected = Array.from(checkboxes).map(cb => cb.value);
    renderTTData(filterTTData(selected));
}

function filterTTData(selected) {
    const filteredTTData = {...timetableData};

    for(let day of filteredTTData.days) {
        for(let period of day.periods) {
            const filterSet = new Set(selected);
            const result = period.courses.filter(obj => filterSet.has(obj.id));
            period.courses = result;
        }
    }

    return filteredTTData;
}

function renderTTData(data) {
    console.log(data);
}