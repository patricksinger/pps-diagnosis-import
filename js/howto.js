// set variables for scope
var programArray = [];
var currentIndex = "";
var dragging = null;

var clipboard = new ClipboardJS('.btn-copy');

// GLOBAL VARIABLES
const RANK_INCREMENT_MULTIPLIER = 10000;
const CSV_FILE_LOCATION = "import.csv";
const ERROR_DISPLAY_TIME = 10000;

// global variables for scope
const Store = require("electron-store");
const settings = new Store({cwd:"./"});

// event emmitter handler
const events = require("events");
const eventEmmitter = new events.EventEmitter();

eventEmmitter.on('message', (message, displayTime) => {
  displayMessage("message-center", message, displayTime);
});

// IPC handlers
const {ipcRenderer} = require('electron');

ipcRenderer.on('csv-parser-response', (event, responseMessage) => {
  eventEmmitter.emit("message", responseMessage);
});


// dom event handlers
document.getElementById("add-program-btn").addEventListener("click", addProgramHandler);
document.getElementById("program-code-inpt").addEventListener("keyup", addProgramInputHandler)
document.getElementById("program-value-inpt").addEventListener("keyup", addProgramInputHandler)
document.getElementById("clear-program-btn").addEventListener("click", clearProgramHandler);
document.getElementById("generate-sql-btn").addEventListener("click", generateSQLHandler);
document.getElementById("program-list").addEventListener("dblclick", editProgramHandler);

document.getElementById("program-list").addEventListener('dragstart', programListDragHandler);
document.getElementById("program-list").addEventListener('dragover', programListDragOverHandler);
document.getElementById("program-list").addEventListener('dragleave', programListDragLeaveHandler);
document.getElementById("program-list").addEventListener('drop', programListDragDropHandler);

//document.getElementById('select-csv-btn').addEventListener("click", selectCSVFileHandler);
document.getElementById('select-xml-btn').addEventListener("click", selectXMLFileHandler);
document.getElementById('generate-import-btn').addEventListener("click", generateImportHandler);

// add / edit program to list
function addProgramHandler() {
  const currentCode = document.getElementById("program-code-inpt").value;
  const currentValue = document.getElementById("program-value-inpt").value;

  if (currentCode) {
    updateProgramArray(currentCode, currentValue ? currentValue : currentCode);
  } else {
    eventEmmitter.emit("message", "No Program Information Entered");
  }
}

// enter key functionality
function addProgramInputHandler(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    addProgramHandler();
  }
}

function updateProgramArray(code, value) {

  if (currentIndex) {
    // update to existing entry / loaded index
    programArray[currentIndex].code = code;
    programArray[currentIndex].value = value;
    currentIndex = "";
  } else if (programArray.filter(program => program.code === code || program.value === value).length > 0) {
    // code or value already present in list
    eventEmmitter.emit("message", "Program Code or Value Already Entered in List");
  } else {
    // add to list
    programArray.push({
      code,
      value
    });
  }

  // clean up and re-render list
  clearProgramHandler();
  renderProgramList();
}

function clearProgramHandler() {
  // reset entry fields and buttons to original state
  document.getElementById("program-code-inpt").value = '';
  document.getElementById("program-value-inpt").value = '';
  document.getElementById("add-program-btn").innerHTML = "Add Program"
}

function renderProgramList() {
  var listElement;
  var listElementContent;
  var listElementDelete;
  var listElementEdit;
  var programList = document.getElementById("program-list");

  programList.innerHTML = '';

  programArray.forEach(function (program, index) {
    listElement = document.createElement("li");
    listElement.setAttribute("draggable", "true");
    listElement.setAttribute("class", "sortable-bulk");
    listElement.setAttribute("id", index);
    listElement.setAttribute("pcode", program.code);
    listElement.setAttribute("pvalue", program.value);

    listElementContent = document.createTextNode(`Priority : ${(index + 1)} - ${program.code} / ${program.value}`);
    listElement.appendChild(listElementContent);

    listElementEdit = document.createElement("ion-icon");
    listElementEdit.setAttribute("name", "create");
    listElementEdit.setAttribute("target-element", index);
    listElementEdit.addEventListener("click", editProgramHandler);

    listElement.appendChild(listElementEdit);


    listElementDelete = document.createElement("ion-icon");
    listElementDelete.setAttribute("name", "trash");
    listElementDelete.setAttribute("target-element", index);
    listElementDelete.addEventListener("click", deleteElementHandler);

    listElement.appendChild(listElementDelete);

    programList.appendChild(listElement);
  });
}

function editProgramHandler(event) {

  // load target item values in to field inputs
  currentIndex = event.target.getAttribute("id");
  document.getElementById("program-code-inpt").value = programArray[event.target.getAttribute("target-element")].code;
  document.getElementById("program-value-inpt").value = programArray[event.target.getAttribute("target-element")].value;
  document.getElementById("add-program-btn").innerHTML = "Update Value";

}

function reindexList() {
  var list = document.getElementById("program-list");
  var listItems = list.getElementsByTagName("li");

  programArray = [];

  for (var i = 0; i < listItems.length; i++) {
    listItems[i].setAttribute("id", i);
    programArray.push({
      code: listItems[i].getAttribute("pcode"),
      value: listItems[i].getAttribute("pvalue")
    });
  };

  renderProgramList();
}

function deleteElementHandler(event) {
  programArray.splice(event.target.getAttribute("target-element"), 1);
  renderProgramList();
}

function generateSQLHandler() {

  if (programArray.length < 1) {
    eventEmmitter.emit("message", "No Programs Entered for SQL Statement");
  } else {

    var programOutput = programArray.reverse().map(function (program, index) {
      return {
        code: program.code,
        value: program.value,
        weight: (index * RANK_INCREMENT_MULTIPLIER) + RANK_INCREMENT_MULTIPLIER
      }
    });

    var caseStatementPrograms = "";
    programOutput.reverse().forEach(function (value) {
      caseStatementPrograms += `when e.program_code = '${value.code}' then ${value.weight}\n`
    });

    const openEpisodesOnly = settings.get("OPEN_PPS_ONLY") === true ? "WHERE pps.episode_end_date IS NULL" : "";

    // TODO: find better way to address this string / format
    var sql = `select 
    pps.PATID,
    PPS.CUSTHAGO_UID as module_id,
    'E' as main_action,
    (
    select top 1 DIAGC.diagnosis_code
    from (
    select mrank.*
    from (
      select (program_ranking + ranking_multiplier) as total_rank, ranking.*
      from (
      select
      case 
            ${caseStatementPrograms}
        else 0
      end as program_ranking,
      case 
        when e.date_of_discharge IS NULL then 17500
        else e.EPISODE_NUMBER * 5
      end as ranking_multiplier, 
      (select COUNT(ID) from client_diagnosis_entry WHERE PATID = e.PATID and EPISODE_NUMBER = e.EPISODE_NUMBER and diagnosis_status_code = '1' and ranking_code ='1' and (classification_code not in ('1','2','3') or classification_code is null or classification_code = 'No Entry')) as totaldx,
      e.*
      from episode_history as e
      ) as ranking 
      where program_ranking > 0 and totaldx > 0
    ) as mrank
    
    inner join (select PATID, MAX(total_rank) as max_rank from 
    (
    select (program_ranking + ranking_multiplier) as total_rank, ranking.*
      from (
      select
      case 
            ${caseStatementPrograms}
        else 0
      end as program_ranking,
      case 
        when e.date_of_discharge IS NULL then 17500
        else e.EPISODE_NUMBER * 5
      end as ranking_multiplier, 
      (select COUNT(ID) from client_diagnosis_entry WHERE PATID = e.PATID and EPISODE_NUMBER = e.EPISODE_NUMBER and diagnosis_status_code = '1' and ranking_code ='1' and (classification_code not in ('1','2','3') or classification_code is null or classification_code = 'No Entry')) as totaldx,
      e.*
      from episode_history as e
      ) as ranking 
      where program_ranking > 0 and totaldx > 0
    ) a
    
    group by PATID) as maxrank ON mrank.PATID = maxrank.PATID and mrank.total_rank = maxrank.max_rank
    ) as mhdx
    left outer join client_diagnosis_record as DIAGR ON mhdx.PATID = DIAGR.PATID and mhdx.FACILITY = DIAGR.FACILITY and DIAGR.EPISODE_NUMBER = mhdx.EPISODE_NUMBER
    left outer join client_diagnosis_entry as DIAGE ON DIAGE.DiagnosisRecord = DIAGR.ID AND DIAGE.PATID = DIAGR.PATID AND DIAGE.FACILITY = DIAGR.FACILITY
    left outer join client_diagnosis_codes AS DIAGC ON DIAGE.ID = DIAGC.DiagnosisEntry AND DIAGE.PATID = DIAGC.PATID AND DIAGE.FACILITY = DIAGC.FACILITY
    where DIAGC.code_set_code = 'ICD10' and DIAGE.diagnosis_status_code = '1' and DIAGE.ranking_code ='1' and (DIAGE.classification_code not in ('1', '2','3') or DIAGE.classification_code IS NULL or DIAGE.classification_code = 'No Entry') and mhdx.patid = pps.PATID
    group by mhdx.PATID, mhdx.EPISODE_NUMBER, DIAGR.FACILITY, DIAGE.DiagnosisRecord, DIAGR.date_of_diagnosis, DIAGE.billing_order, DIAGC.diagnosis_code, DIAGC.diagnosis_value
    order by DIAGR.date_of_diagnosis DESC
    ) as primary_diagnosis,
    spc.${settings.get("SPC_PK_FIELD")} as spc_id,
    'E' as spc_action
    from ${settings.get("MAIN_TABLE")} as pps
    left outer join ${settings.get("SPC_TABLE")} as spc on spc.PATID = pps.PATID and spc.${settings.get("MAIN_PK_FIELD")} = pps.${settings.get("MAIN_PK_FIELD")}
    ${openEpisodesOnly}`

    document.getElementById("sql-output-text").value = sql;
    if (settings.get("EXPAND_SQL_TEXT")) {
      adjustTextBoxHeight(document.getElementById("sql-output-text"));
    }
  }
}

// function selectCSVFileHandler() {
//     const remote = require('electron').remote;
//     const dialog = remote.dialog;
//     dialog.showOpenDialog(function(fileNames) {
//       if (fileNames === undefined) {
//         console.log('no file selected');
//       } else {
//         document.getElementById("csv-file-path").value = fileNames[0];
//       }
//     });
// }

function selectXMLFileHandler() {
  const remote = require("electron").remote;
  const dialog = remote.dialog;
  // get window from main process to make modal
  const exportLocation = dialog.showSaveDialog();
  if (exportLocation === undefined) {
    console.log("no file selected")
  } else {
    document.getElementById("xml-file-path").value = exportLocation;
  }

}

function generateImportHandler() {
  // change to IPC
  //const remote = require("electron").remote;
  //const csvParser = remote.require('./csvparser'); 
  if (document.getElementById("sql-output-text").value.trim().length == 0 && !document.getElementById("odbc-dsn-inpt").value && !document.getElementById("odbc-user-inpt").value && !document.getElementById("odbc-password-inpt").value && !document.getElementById("xml-file-path").value) {
    eventEmmitter.emit("message", "Please make sure SQL Statement Generated, ODBC DSN, User Name, Password and Export File Location Fields are Entered");
  } else if (document.getElementById("sql-output-text").value.trim().length == 0) {
    eventEmmitter.emit("message", "Please Generate SQL Statement");
  } else if (!document.getElementById("odbc-dsn-inpt").value) {
    eventEmmitter.emit("message", "Please Enter ODBC DSN");
  } else if (!document.getElementById("odbc-user-inpt").value) {
    eventEmmitter.emit("message", "Please Enter Avatar User Name");
  } else if (!document.getElementById("odbc-password-inpt").value) {
    eventEmmitter.emit("message", "Please Enter Avatar Password");
  } else if (!document.getElementById("xml-file-path").value) {
    eventEmmitter.emit("message", "Please Select Export File Location");
  }
  else {
    // @TODO Error Checking if Export Fails and Message Tied to Parsing Result

    if (settingsValidation()) {
      csvParserOptions = {
        sqlText: document.getElementById("sql-output-text").value,
        csvFileLocation: CSV_FILE_LOCATION,
        xmlFileLocation: document.getElementById("xml-file-path").value,
        odbcDSN: document.getElementById("odbc-dsn-inpt").value,
        odbcUser: document.getElementById("odbc-user-inpt").value,
        odbcPassword: document.getElementById("odbc-password-inpt").value
      }
      ipcRenderer.send('csv-parser-invoke', csvParserOptions);

      // try {
      //   csvParser.parseCSV(document.getElementById("sql-output-text").value, CSV_FILE_LOCATION, document.getElementById("xml-file-path").value,document.getElementById("odbc-dsn-inpt").value, document.getElementById("odbc-user-inpt").value, document.getElementById("odbc-password-inpt").value);
      //   eventEmmitter.emit("message", "File Export Complete.");
      // } catch (error) {
      //   eventEmmitter.emit("message", "Error Generating File - " + error, ERROR_DISPLAY_TIME);
      // }
    }
  }
}

// blank settings check function
function settingsValidation() {

  if (settings.get("OPTION_ID") && settings.get("MAIN_TABLE") && settings.get("MAIN_PK_FIELD") && settings.get("SPC_TABLE") && settings.get("SPC_PK_FIELD")) {
    return true;
  } else {
    eventEmmitter.emit("message", "Unable to Process Action Due to Settings Configuration Incomplete. Please Launch Settings.");
    
    return false;
  }

}

// clipboard handler functions
clipboard.on("success", function(e) {
  console.info('Action:', e.action);
  console.info('Text:', e.text);
  console.info('Trigger:', e.trigger);

  e.clearSelection(); 
  displayMessage("message-center", "SQL Copied to Clipboard");
});

clipboard.on('error', function(e) {
  console.error('Action:', e.action);
  console.error('Trigger:', e.trigger);
});

// list drag and drop handler functions
function programListDragHandler(event) {
  dragging = event.target;
  event.dataTransfer.setData('text/html', dragging);
}

function programListDragOverHandler(event) {
  event.preventDefault();
  var bounding = event.target.getBoundingClientRect()
  var offset = bounding.y + (bounding.height / 2);
  if (event.clientY - offset > 0) {
    event.target.style['border-bottom'] = 'solid 4px blue';
    event.target.style['border-top'] = '';
  } else {
    event.target.style['border-top'] = 'solid 4px blue';
    event.target.style['border-bottom'] = '';
  }

}

function programListDragLeaveHandler(event) {
  event.target.style['border-bottom'] = '';
  event.target.style['border-top'] = '';

}

function programListDragDropHandler(event) {
  event.preventDefault();
  if (event.target.style['border-bottom'] !== '') {
    event.target.style['border-bottom'] = '';
    event.target.parentNode.insertBefore(dragging, event.target.nextSibling);
  } else {
    event.target.style['border-top'] = '';
    event.target.parentNode.insertBefore(dragging, event.target);
  }

  reindexList();
}