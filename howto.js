// set variables for scope
var programArray = [];
var currentIndex = "";
var dragging = null;

const RANK_INCREMENT_MULTIPLIER = 100;

// event handlers
document.getElementById("add-program-btn").addEventListener("click", addProgramHandler);
document.getElementById("clear-program-btn").addEventListener("click", clearProgramHandler);
document.getElementById("generate-sql-btn").addEventListener("click", generateSQLHandler);
document.getElementById("program-list").addEventListener("dblclick", editProgramHandler);

document.getElementById("program-list").addEventListener('dragstart', programListDragHandler);
document.getElementById("program-list").addEventListener('dragover', programListDragOverHandler);
document.getElementById("program-list").addEventListener('dragleave', programListDragLeaveHandler);
document.getElementById("program-list").addEventListener('drop', programListDragDropHandler);

// add / edit program to list
function addProgramHandler() {
  const currentCode = document.getElementById("program-code-inpt").value;
  const currentValue = document.getElementById("program-value-inpt").value;

  if (currentCode) {
    updateProgramArray(currentCode, currentValue ? currentValue : currentCode);
  } else {
    // TODO: output to alert style component on page
    console.log("No Program Information Entered");
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
    // TODO: output to alert style component on page
    console.log("Program Code or Value Already Entered in List");
  } else {
    // add to list
    programArray.push({
      code,
      value
    });
    console.log(programArray);
  }

  // clean up and re-render list
  clearProgramHandler();
  renderProgramList()
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

    // icon delete icon
    listElementDelete = document.createElement("ion-icon");
    listElementDelete.setAttribute("name", "heart");
    
    listElement.appendChild(listElementDelete);

    programList.appendChild(listElement);
  });
}

function editProgramHandler(event) {

  // TODO: load target item in to editor view
  currentIndex = event.target.getAttribute("id");
  document.getElementById("program-code-inpt").value = event.target.getAttribute("pcode");
  document.getElementById("program-value-inpt").value = event.target.getAttribute("pvalue");
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

  // re-render list
  renderProgramList();
}


function generateSQLHandler() {

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

  var sql = `
  select 
pps.PATID,
PPS.CUSTHAGO_UID as module_id,
'E' as main_action,
diagnosis.diagnosis_code as primary_diagnosis,
spc. CUSTHAGQ_UID as spc_id,
'E' as spc_action
from user_pps_mh_NonEpisodic as pps
left outer join user_pps_mh_spc as spc on spc.PATID = pps.PATID and spc.CUSTHAGO_UID = pps.CUSTHAGO_UID
inner join (
select E.PATID, E.EPISODE_NUMBER, DIAGR.FACILITY, DIAGE.DiagnosisRecord, DIAGR.date_of_diagnosis, DIAGE.billing_order, DIAGC.diagnosis_code, DIAGC.diagnosis_value
from (
	select e.*
	from (
		select (program_ranking * ranking_multiplier) as total_rank, ranking.*
		from (
		select
		case 
      ${caseStatementPrograms}
			else 0
		end as program_ranking,
		case 
			when e.date_of_discharge IS NULL then 20
			else 5 + e.EPISODE_NUMBER
		end as ranking_multiplier, 
		(select COUNT(ID) from client_diagnosis_entry WHERE PATID = e.PATID and EPISODE_NUMBER = e.EPISODE_NUMBER and diagnosis_status_code = '1' and ranking_code ='1' and (classification_code not in ('1','2','3') or classification_code is null)) as totaldx,
		e.*
		from episode_history as e
		) as ranking 
		where program_ranking > 0 and totaldx > 0	
	) as e
	inner join (select PATID, MAX(total_rank) as max_rank from view_pps_mh_ranking group by PATID) as maxrank ON e.PATID = maxrank.PATID and e.total_rank = maxrank.max_rank
) as E
left outer join client_diagnosis_record as DIAGR ON E.PATID = DIAGR.PATID and E.FACILITY = DIAGR.FACILITY and DIAGR.EPISODE_NUMBER = E.EPISODE_NUMBER
left outer join client_diagnosis_entry as DIAGE ON DIAGE.DiagnosisRecord = DIAGR.ID AND DIAGE.PATID = DIAGR.PATID AND DIAGE.FACILITY = DIAGR.FACILITY
left outer join client_diagnosis_codes AS DIAGC ON DIAGE.ID = DIAGC.DiagnosisEntry AND DIAGE.PATID = DIAGC.PATID AND DIAGE.FACILITY = DIAGC.FACILITY
where DIAGC.code_set_code = 'ICD10' and DIAGE.diagnosis_status_code = '1' and (DIAGE.classification_code in ('4','7') or DIAGE.classification_code IS NULL) and DIAGE.billing_order = 1
group by E.PATID, E.EPISODE_NUMBER, DIAGR.FACILITY, DIAGE.DiagnosisRecord, DIAGR.date_of_diagnosis, DIAGE.billing_order, DIAGC.diagnosis_code, DIAGC.diagnosis_value
) as diagnosis on pps.PATID = diagnosis.PATID`

  document.getElementById("sqlOutput").value = sql;

}

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

  // reindex list based on new order of items
  reindexList();
}