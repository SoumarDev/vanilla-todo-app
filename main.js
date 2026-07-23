let inputField = document.querySelector(".input-field");
let form = document.querySelector(".input-container form");
let tbody = document.querySelector(".task-table tbody");
let taskTable = document.querySelector(".task-table");
let burgerIcon = document.querySelector(".logo .icon");
let searchForm = document.querySelector("header form");
let inputSearch = document.querySelector("header form .search");
const SEP = "|";

// Nach Tasks suchen und highlighten
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let labelText = document.querySelectorAll(".task-table label");    

    // Vor dem forEach alle zurücksetzen
    labelText.forEach(label => label.style.backgroundColor = "");

    // Wenn Suchfeld leer ist, dann reset machen
    if (inputSearch.value === "") return;

    // Dann neu markieren
    labelText.forEach(label => {
       if (label.textContent.toLowerCase().includes(inputSearch.value.toLowerCase())) {
        label.style.backgroundColor = "yellow";
       }; 
    });
});

// Highlights entfernen wenn Feld lerr
inputSearch.addEventListener("input", (e) => {
    if (e.target.value === "") {
        let labelText = document.querySelectorAll(".task-table label");
        labelText.forEach(label => label.style.backgroundColor = ""); 
    }
})

// Burger-Menü ist nur für Mobile gedacht,
// auf Tablet/Desktop bleibt die Sidebar immer sichtbar.
burgerIcon.addEventListener("click", (e) => {
    let aside = document.querySelector("aside");
    aside.classList.toggle("open");
})

let taskCounter = 0;

// TD 1: Checkbox + Lable
function createTd1(taskId, taskText, tr) {
    let td1 = document.createElement("td");
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "check-box";
    checkbox.id = taskId;
    
    let label = document.createElement("label");
    label.htmlFor = taskId; // verbindet Lable mit checkbox
    label.textContent = taskText;
    
    td1.appendChild(checkbox);
    td1.appendChild(label);
    
    tr.appendChild(td1);

    return label;
}

// TD 2: Edit
function createTd2(label, tr) {
    let td2 = document.createElement("td");
    let editBtn = document.createElement("button");
    let editIcon = document.createElement("i");
    editIcon.className = "fa-regular fa-pen-to-square edit";
    editBtn.title = "Editieren";
    editBtn.appendChild(editIcon);
    td2.appendChild(editBtn);
    // Inline Editing
    editBtn.addEventListener("click", (e) => {
        let currentText = label.textContent;
        // console.log(currentText);

        // Input erstellen und mit aktuellem Text befüllen
        let editInput = document.createElement("input");
        editInput.type = "text";
        editInput.className = "inputLabel";
        editInput.value = currentText;

        // Lable durch Input ersetzen
        // unddann direkt focousieren also User kan sofort tippen.
        label.replaceWith(editInput);
        editInput.focus(); 

        // wird verwendet um blur zu blockieren
        // um das Speichern der Ergänzung zu ermöglichen
        let saved = false;

        // Beim Drücken von Enter speichen
        editInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && editInput.value !== "") {
                saved = true; // verhindert blur-Aktion
                let oldTex = label.textContent; 
                let newTex = editInput.value;
                // Label aktualisieren
                label.textContent = newTex;
                editInput.replaceWith(label);

                // LocalStorage akualisieren
                let savedTasks = localStorage.getItem("tasks") || "";
                let tasksArray = savedTasks ? savedTasks.split(SEP) : [];
                let updatedTasks = tasksArray.map(task => task === oldTex ? newTex : task);
                localStorage.setItem("tasks", updatedTasks.join(SEP)); 

                //importantTasks aktualisieren
                let savedImportant = localStorage.getItem("importantTasks") || "";
                let importantArr = savedImportant ? savedImportant.split(SEP) : [];
                let updatedImportant = importantArr.map(t => t === oldTex ? newTex : t);
                localStorage.setItem("importantTasks", updatedImportant.join(SEP));

                //checkedTasks
                let savedChecked = localStorage.getItem("checkedTasks") || "";
                let checkedArr = savedChecked ? savedChecked.split(SEP) : "";
                let updatedChecked = checkedArr.map(t => t === oldTex ? newTex : t);
                localStorage.setItem("checkedTasks", updatedChecked.join(SEP)); 

                // Datum-Key umbenennen
                let dates = JSON.parse(localStorage.getItem("dates") || "{}");
                if (dates[oldTex]) {
                    dates[newTex] = dates[oldTex];
                    delete dates[oldTex];
                    localStorage.setItem("dates", JSON.stringify(dates));
                }
            }
        });

        // Bei Klicken außerhalb abbrechen bzw. zurücksetzen
        editInput.addEventListener("blur", () => {
            // Nur abbrechen wenn nicht Enter gedrückt
            if (!saved) {
                editInput.replaceWith(label)
            }
        });
    });

        tr.appendChild(td2);
}

// TD 3: Delete
function createTd3(label, tr) {
    let td3 = document.createElement("td");
    let deleteBtn = document.createElement("button");
    let deleteIcon = document.createElement("i");
    deleteIcon.className = "fa-solid fa-trash-can delete";
    deleteBtn.title = "Löschen";
    deleteBtn.appendChild(deleteIcon);
    td3.appendChild(deleteBtn);

    // Tasks Berinigung 
    deleteBtn.addEventListener("click", (e) => {
       
        // Tasks bereinigen
        let deletedText = label.textContent;
        let savedTasks = localStorage.getItem("tasks") || "";
        let savedArray = savedTasks ? savedTasks.split(SEP) : [];
        savedArray = savedArray.filter(task => task !== deletedText)
        localStorage.setItem("tasks", savedArray.join(SEP));
        
        // ImportantTasks bereinigen
        let savedImportant = localStorage.getItem("importantTasks") || "";
        let importantArray = savedImportant ? savedImportant.split(SEP) : [];
        importantArray = importantArray.filter(t => t !== deletedText);
        localStorage.setItem("importantTasks", importantArray.join(SEP));
        
        // CheckedTasks bereinigen
        let savedChecked = localStorage.getItem("checkedTasks") || "";
        let checkedArray = savedChecked ? savedChecked.split(SEP) : [];
        checkedArray = checkedArray.filter(t => t !== deletedText);
        localStorage.setItem("checkedTasks", checkedArray.join(SEP));

        // Fälligkeitsdatum bereinigen 
        let dates = JSON.parse(localStorage.getItem("dates") || "{}");
        delete dates[deletedText];
        localStorage.setItem("dates", JSON.stringify(dates));

        tr.remove();

        showCountFinished();

        // Nach dem Entfernen aller Tasks wird die Tabelle ausgeblendet
        if (tbody.children.length === 0) {
            taskTable.style.display = "none";
        }
    })

     tr.appendChild(td3);
}

// TD 4: Datum
function createTd4(tr) {

    let td4 = document.createElement("td");
    let inputDate = document.createElement("input");
    inputDate.type = "date";
    inputDate.style.border = "none";
    inputDate.style.backgroundColor ="inherit";
    td4.appendChild(inputDate);

    // Erst speichern wenn User ein Datum auswählt
    inputDate.addEventListener("change", () => {
        let taskText = inputDate.closest("tr").querySelector("label").textContent;
        let dates = JSON.parse(localStorage.getItem("dates") || "{}");
        dates[taskText] = inputDate.value;
        localStorage.setItem("dates",JSON.stringify(dates));
    });
    
     tr.appendChild(td4);
};

// TD 5: Stern-Icon
function createTd5(tr) {

    let td5 = document.createElement("td");
    let starBtn = document.createElement("button");
    let starIcon = document.createElement("i");
    starIcon.className = "fa-regular fa-star star";
    starBtn.appendChild(starIcon);
    td5.appendChild(starBtn);
    
    tr.appendChild(td5);
};

function createTd(taskText) {
// Eindeutige ID für jedes Checkbox-Label-Paar
    let taskId = "task-" + (++taskCounter);
    let tr = document.createElement("tr");
    
    // // TD 1: Checkbox + Lable
    let label = createTd1(taskId, taskText, tr);
    
    // TD 2: Edit
    createTd2(label, tr);
    
    // TD 3: Delete
    createTd3(label, tr);

    // TD 4: Datum
    createTd4(tr);

    // TD 5: Stern-Icon
    createTd5(tr);

    tbody.appendChild(tr);
}

// Tasks zur Seite Hinzufügen
function addTask(taskText) {
    taskTable.style.display = "block";

    createTd(taskText);
}

// Wichtige Tasks counten
function countImportant() {
    let importantTasks = document.querySelectorAll(".task-table .fa-solid.fa-star");
    return importantTasks.length;
}

function showIportantCount() {
// den Count zur Sidebar neben Wichig Span anzeigen
    let improtantLink = document.querySelector(".important-link");
    let count = countImportant();
    improtantLink.dataset.count = count > 0 ? count : "";
}

function countFinished() {
    return document.querySelectorAll(".task-table input[type=checkbox]:checked").length;
}

function showCountFinished() {
    let finishedLink = document.querySelector(".finished-link");
    finishedLink.dataset.count = countFinished() > 0 ? countFinished() : "";
}

// Tasks als wichtig markieren bzw. nicht markieren
// und ins localStorage schreiben
tbody.addEventListener("click", (e) => {
    if (e.target.classList.contains("fa-star")) {
        e.target.classList.toggle("fa-regular");
        e.target.classList.toggle("fa-solid");
        
        // Die Dazugehörigen Tasks holen
        // und ob die wichtig markiert sind?
        let taskLabel = e.target.closest("tr").querySelector("label").textContent;
        let isImportant = e.target.classList.contains("fa-solid");

        // Wichtige Tasks aus localStorage holen
        let saved = localStorage.getItem("importantTasks") || "";
        let importantArray = saved ? saved.split(SEP) : [];

        if (isImportant) {
            // hinzufügen
            importantArray.push(taskLabel);
        } else {
            importantArray = importantArray.filter(t => t !== taskLabel);
        }
        localStorage.setItem("importantTasks", importantArray.join(SEP));
    }
    showIportantCount();
    
})
// Abgeschlossene Tasks counten
tbody.addEventListener("change", (e) => {
    if (e.target.type === "checkbox") {
        // let finishedLink = document.querySelector(".finished-link");
        // finishedLink.dataset.count = countFinished() > 0 ? countFinished() : "";   
        showCountFinished();
        let savedCheckedTasks = localStorage.getItem("checkedTasks") || "";
        let checkedArray = savedCheckedTasks ? savedCheckedTasks.split(SEP) : [];
        let targetTask = e.target.closest("tr").querySelector("label").textContent;
        
        if (e.target.checked) {
            checkedArray.push(targetTask);
        } else {
            checkedArray = checkedArray.filter(t => t !== targetTask);
        }
        localStorage.setItem("checkedTasks", checkedArray.join(SEP));  
    }
})

// Geclickter Sidebar-Title in Main anzeigen
// und je nach Sidebar-Title handeln: 
// - Nur wichtige anzeigen
// - Nur abgeschlossene anzeigen
// - Mein Tag, alle anzeigen
let linksList = document.querySelector(".links");
let mainTitle = document.querySelector(".section-content .open-window span");

linksList.addEventListener("click", (e) => {
    let clickedLink = e.target.closest("a");
    if (clickedLink) {
        mainTitle.textContent = clickedLink.querySelector("span").textContent;    

        let rows = document.querySelectorAll(".task-table tbody tr");
        
        if(clickedLink.classList.contains("important-link")) {
            //Nur wichtige anzeigen
            rows.forEach(row => {
                let star = row.querySelector(".fa-star");
                row.style.display = star.classList.contains("fa-solid") ? "" : "none";
            });
        } else if (clickedLink.classList.contains("finished-link")) {
            // Nur abgeschlossene anzeigen
            rows.forEach(row => {
                let checkbox = row.querySelector("input[type=checkbox]");
                row.style.display = checkbox.checked ? "" : "none"; 
            });
        } else {
            // Mein Tag, alle anzeigen
            rows.forEach(row => {row.style.display = ""});
        }
    } 
 })
 
// Beim Neuladen der Seite Tasks aus LocalStorage holen 
window.onload = function() {
    let savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
        let tasksArray = savedTasks.split(SEP).filter(task => task !=="");
        tasksArray.forEach((task) => {
            addTask(task);
        });
        inputField.value = "";   
    }

    // Wichtige Tasks nach dem load als wichtig anzeigen lassen
    let savedImportant = localStorage.getItem("importantTasks");
    if (savedImportant) {
        let importantArry = savedImportant.split(SEP);
        importantArry.forEach((taskText) => {
            let labels = document.querySelectorAll(".task-table label")
            // Label mit diesem Text suchen
            labels.forEach(label => {
                if (label.textContent === taskText) {
                    // Stern in der gleichen Zeile finden und aktivieren
                    let starIcon = label.closest("tr").querySelector(".fa-star");
                    starIcon.classList.remove("fa-regular");
                    starIcon.classList.add("fa-solid");
                }
            })
        })
    }; 
    // Counter der wichtigen Tasks nach dem Seiten-Load behalten
    showIportantCount();

    // Abgeschlossende Tasks wiederherstellen
    let savedCheckedTask = localStorage.getItem("checkedTasks");
    if (savedCheckedTask) {
        let checkedArray = savedCheckedTask.split(SEP);
        checkedArray.forEach((checkedTask) => {
            let labelToCheck = document.querySelectorAll(".task-table label");
            labelToCheck.forEach(lab => {
                if (lab.textContent === checkedTask) {
                    lab.closest("tr").querySelector("input[type=checkbox]").checked = true;
                };
            });
        }); 
    }
    // Count der abgeschlossenen Tasks nach Seiten-Reload behlaten
    showCountFinished();

    // Fälligkeitsdatum beim Reload wiederherstellen
    let dates = JSON.parse(localStorage.getItem("dates") || "{}");
    document.querySelectorAll(".task-table label").forEach(label => {
        let date = dates[label.textContent];
        if (date) {
            label.closest("tr").querySelector("input[type=date]").value = date;
        }
    });
    
    // Main Tag Standard anzeigen
    let myDaySpan = document.querySelector(".myDay-span");
    mainTitle.textContent = myDaySpan.textContent;
}

// Aktuelles Datum 
function updateDate() {

    let date = document.querySelector(".date-container span");
    
    let dateNow = new Date();
    let daysOfWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    let monthsOfYear = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez", ]

    date.textContent = `${daysOfWeek[dateNow.getDay()]}, ${dateNow.getDate()}.${monthsOfYear[dateNow.getMonth()]}`;
}

// Datum Updaten
updateDate();

// Tasks im LocalStorage speichern
function saveInLocalStorage(taskText) {
    // Prüfen, ob im tasks breits im localStorage 
    // vorhanden sind, diese dann durch komma von neu hinzugefügene Tasks trennen     
    let oldTasks = localStorage.getItem("tasks") || "";
    let newTasks = oldTasks ? oldTasks + SEP + taskText : taskText;
    localStorage.setItem("tasks", newTasks);
}
// Main Function
form.addEventListener("submit", (e) => {
    // kein Seinten-Reload
    e.preventDefault();
    
    let taskText = inputField.value;

    if (taskText !== "") {
        addTask(taskText);
        saveInLocalStorage(taskText);
        inputField.value = "";
    }
})

