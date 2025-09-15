let timetableData;
let filteredTTData;

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
        div.appendChild(createSelectElement(div, course));
    }

    parent.appendChild(div);
    handleCourseSelection(div); //Initial Table Render
}

function createSelectElement(selectionRange, content) {
    const div = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = content.id;
    checkbox.value = content.id;
    checkbox.addEventListener('change', function() { handleCourseSelection(selectionRange) });

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
    filteredTTData = filterTTData(selected);
    renderTTData(filteredTTData);
}

function filterTTData(selected) {
    const filtered = JSON.parse(JSON.stringify(timetableData)); //"dirty" deep copy
    if(selected.length === 0) return filtered;

    for(let day of filtered.days) {
        for(let period of day.periods) {
            const filterSet = new Set(selected);
            const result = period.courses.filter(obj => filterSet.has(obj.id));
            period.courses = result;
        }
    }

    return filtered;
}

function renderTTData(data) {
    const oldTable = document.getElementById('ttTable')
    if(oldTable) oldTable.remove();

    const transposed = transposeTTData(data);

    const table = document.createElement('table');
    table.id = "ttTable";
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    const emptyth = document.createElement('th');
    tr.appendChild(emptyth);
    for(let day of data.days) {
        const th = document.createElement('th');
        th.textContent = day.name;
        tr.appendChild(th);
    }
    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for(let period of transposed.periods) {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = period.name;
        tr.appendChild(th);
        for(let day of period.days) {
            const td = document.createElement('td');
            let content = "";
            if(day.courses?.length > 0) {
                for(let course of day.courses) {
                    content = content + course.name + "\n";
                }
            }
            td.textContent = content;
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    document.getElementById('output').appendChild(table);
}

function transposeTTData(data) {
    const result = { version: data.version, periods: [] };

    // Collect all unique period names
    const allPeriods = new Set();
    for (let day of data.days) {
        for (let period of day.periods) {
            allPeriods.add(period.name);
        }
    }

    // Build result.periods with all days
    for (let periodName of allPeriods) {
        const periodObj = { name: periodName, days: [] };

        for (let day of data.days) {
            const dayPeriod = day.periods.find(p => p.name === periodName);
            periodObj.days.push({
                name: day.name,
                courses: dayPeriod ? dayPeriod.courses : []
            });
        }

        result.periods.push(periodObj);
    }

    return result;
}