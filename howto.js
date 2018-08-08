// set variables for scope
var loadedArray = [];
var currentIndex = "";
var currentCode = "";
var currentValue = "";

document.getElementById("addProgram").addEventListener("click", function () {
  // TODO: refactor to separate function handler
  currentCode = document.getElementById("programCode").value;
  currentValue = document.getElementById("programValue").value;

  if (currentCode) {
    updateProgramList(currentCode, currentValue ? currentValue : currentCode);
  } else {
    // TODO: output to alert style component on page
    console.log("No Program Information Entered");
  }
});

document.getElementById("clearProgram").addEventListener("click", clearProgramEntry);
document.getElementById("generateSQL").addEventListener("click", generateSQL);

function updateProgramList(code, value) {
  // TODO: check if already exists
  if (currentIndex) {
    // update to existing entry
    loadedArray[currentIndex].code = document.getElementById("programCode").value;
    loadedArray[currentIndex].value = document.getElementById("programValue").value;
    currentIndex = '';
  } else if (loadedArray.filter(program => program.code === code || program.value === value).length > 0) {
    // code or value already present in list
    // TODO: output to alert style component on page
    console.log("Program Code or Value Already Entered in List");
  } else {
    // add to list
    loadedArray.push({
      code: code,
      value: value
    });
  }

  // clean up and re-render list
  clearProgramEntry();
  renderProgramList()
}

function clearProgramEntry() {
  // reset entry fields and buttons to original state
  document.getElementById("programCode").value = '';
  document.getElementById("programValue").value = '';
  document.getElementById("addProgram").innerHTML = "Add Program"
}

function renderProgramList() {
  var listElement;
  var listElementContent;

  document.getElementById("programList").innerHTML = '';

  loadedArray.forEach(function (program, index) {

    listElement = document.createElement("li");
    listElement.setAttribute("draggable", "true");
    listElement.setAttribute("class", "sortable-bulk");
    listElement.setAttribute("id", index);
    listElement.setAttribute("pcode", program.code);
    listElement.setAttribute("pvalue", program.value);

    listElementContent = document.createTextNode("Priority : " + (index + 1) + " - " + program.code + " / " + program.value);
    listElement.appendChild(listElementContent);
    document.getElementById("programList").appendChild(listElement);

  });
}

var dragging = null;

document.getElementById("programList").addEventListener('dragstart', function (event) {
  dragging = event.target;
  //event.dataTransfer.setData('text/html', dragging);
});

document.getElementById("programList").addEventListener('dragover', function (event) {
  event.preventDefault();
  //window.requestAnimationFrame(function(){
  var bounding = event.target.getBoundingClientRect()
  var offset = bounding.y + (bounding.height / 2);
  if (event.clientY - offset > 0) {
    event.target.style['border-bottom'] = 'solid 4px blue';
    event.target.style['border-top'] = '';
  } else {
    event.target.style['border-top'] = 'solid 4px blue';
    event.target.style['border-bottom'] = '';
  }
  //});
});

document.getElementById("programList").addEventListener('dragleave', function (event) {
  event.target.style['border-bottom'] = '';
  event.target.style['border-top'] = '';
});

document.getElementById("programList").addEventListener('drop', function (event) {
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
});

document.getElementById("programList").addEventListener("dblclick", function (event) {

  // TODO: load target item in to editor view
  currentIndex = event.target.getAttribute("id");
  document.getElementById("programCode").value = event.target.getAttribute("pcode");
  document.getElementById("programValue").value = event.target.getAttribute("pvalue");

  document.getElementById("addProgram").innerHTML = "Update Value"

});


function reindexList() {
  var list = document.getElementById("programList");
  var listItems = list.getElementsByTagName("li");

  loadedArray = [];

  for (var i = 0; i < listItems.length; i++) {
    listItems[i].setAttribute("id", i);
    loadedArray.push({
      code: listItems[i].getAttribute("pcode"),
      value: listItems[i].getAttribute("pvalue")
    });
  };

  // reload list
  renderProgramList();
}


function generateSQL() {

  var programOutput = loadedArray.reverse().map(function (program, index) {
    return {
      code: program.code,
      value: program.value,
      weight: (index * 100) + 100
    }
  });

  var caseStatementPrograms = "";
  programOutput.reverse().forEach(function (value) {
    caseStatementPrograms += `when e.program_code = '${value.code}' then ${value.weight}\n`
  });
  console.log(caseStatementPrograms);

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