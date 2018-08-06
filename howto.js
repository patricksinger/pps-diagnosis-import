

var programArray = ["CSP", "CCS", "OP", "CRISIS"];
var loadedArray = [];
var currentIndex = "";
var currentCode = "";
var currentValue = "";

var programOutput = programArray.reverse().map(function(value, index) {
  return {program: value, weight: index * 100}
});


document.getElementById("addProgram").addEventListener("click", function() {
  currentCode = document.getElementById("programCode").value;
  currentValue = document.getElementById("programValue").value;

  if (currentCode && currentValue) {
    addProgram(currentCode, currentValue);
  } else {
    console.log("Nothing Entered....");
  }

});

document.getElementById("clearProgram").addEventListener("click", clearProgramEntry);

function addProgram(code, value) {
  // check if already exists
  loadedArray.push({code: code, value: value});
  clearProgramEntry();
  renderProgramList()
}

function clearProgramEntry() {
  document.getElementById("programCode").value = '';
  document.getElementById("programValue").value = '';
}

function renderProgramList() {
  var programListHTML = "<ul id=\"programList\">";
  
  loadedArray.forEach(function(program, index) {

    // TODO: change to create html element process instead of straight HTML
    programListHTML += "<li draggable=\"true\" class=\"sortable-bulk\" id=\"" + index + "\" pcode=\"" + program.code + "\" pvalue=\"" + program.value + "\">Priority : " + (index+1) + " - "  + program.code + " / " + program.value;     
  });
  programListHTML += "</ul>";
  document.getElementById("programList").innerHTML = programListHTML;
}


var dragging = null;

document.getElementById("programList").addEventListener('dragstart', function(event) {
		dragging = event.target;
    //event.dataTransfer.setData('text/html', dragging);
});

document.getElementById("programList").addEventListener('dragover', function(event) {
    event.preventDefault();
    //window.requestAnimationFrame(function(){
    	var bounding = event.target.getBoundingClientRect()
      var offset = bounding.y + (bounding.height/2);
      if ( event.clientY - offset > 0 ) {
      	event.target.style['border-bottom'] = 'solid 4px blue';
        event.target.style['border-top'] = '';
      } else {
        event.target.style['border-top'] = 'solid 4px blue';
        event.target.style['border-bottom'] = '';
      }
    //});
});

document.getElementById("programList").addEventListener('dragleave', function(event) {
    event.target.style['border-bottom'] = '';
    event.target.style['border-top'] = '';
});

document.getElementById("programList").addEventListener('drop', function(event) {
    event.preventDefault();
    if ( event.target.style['border-bottom'] !== '' ) {
      event.target.style['border-bottom'] = '';
      event.target.parentNode.insertBefore(dragging, event.target.nextSibling);
    } else {
      event.target.style['border-top'] = '';
      event.target.parentNode.insertBefore(dragging, event.target);
    }

    // reindex list based on new order of items
    reindexList();
});

document.getElementById("programList").addEventListener("click", function(event) {

  // TODO: load target item in to editor view
  document.getElementById("programCode").value = event.target.getAttribute("pcode");
  document.getElementById("programValue").value = event.target.getAttribute("pvalue");
});

function reindexList() {
    var list = document.getElementById("programList");
    var listItems = list.getElementsByTagName("li");

    loadedArray = [];

    for (var i=0; i < listItems.length; i++) {
      listItems[i].setAttribute("id", i);
      loadedArray.push({code: listItems[i].getAttribute("pcode"), value: listItems[i].getAttribute("pvalue")});
    };

    // reload list
    renderProgramList();
}


