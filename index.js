const csv = require("csvtojson");
const jsonxml = require("jsontoxml");

const csvPath = "./export.csv";

// SET FORM/OPTION ID
const OPTION_ID = 'USER52';

csv()
	.fromFile(csvPath)
	.then((json) => {
		createExportXML(json);
	});

function createExportXML(json) {

	var xmlExport = {
		option : {
			optionidentifier: OPTION_ID,
			optiondata : []
		}
	}

	var currentClient = {};
	json.forEach((element) => {
		//console.log(element.PATID);
		xmlExport.option.optiondata.push({optiondata : {
			PATID : element.PATID,
			"SYSTEM.user_pps_mh_NonEpisodic" : {
				"rows.reference" : {
					unique_identifier : element.module_id,
					add_edit_delete : "E"
				}
			}
		}});
	});
	
	
	console.log(jsonxml(xmlExport));

	//console.log(json);

}