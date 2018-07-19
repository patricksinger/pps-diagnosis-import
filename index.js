const csv = require("csvtojson");
const jsonxml = require("jsontoxml");
const fs = require("fs");

const csvPath = "./export2.csv";

// utility functions
function escapeRegExp(str) {
	return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

// SET FORM/OPTION ID
const OPTION_ID = "USER52"; // need as env or arg passed in
const MAIN_TABLE = "SYSTEM.user_pps_mh_NonEpisodic";
const SPC_TABLE = "SYSTEM.user_pps_mh_spc";

// ONLY SELECT ACTIVE EPISODES OR ALL?
// TAKE OUT CLASSIFICATION LIMIT ON DIAGNOSES
// MAKRE P DIAGNOSIS REQUIRED / CLASSIFICATION REQUIRED ON DIAGNOSIS

csv()
	.fromFile(csvPath)
	.then((json) => {
		createExportXML(json);
	});

function createExportXML(json) {

	var xmlExport = {
		option: {
			optionidentifier: OPTION_ID,
			optiondataplaceholder: []
		}
	}

	var currentClient = '';
	var currentMainModule = '';
	var optionItem = {};

	json.forEach((element) => {

		if (currentClient != element.PATID) {
			currentClient = element.PATID;
			currentMainModule = element.module_id;

			if (optionItem) {
				xmlExport.option.optiondataplaceholder.push(optionItem);
			}

			console.log("Processing New Client Entry...");

			// build top of optionItem elements
			optionItem = {
				optiondata: {
					PATID: element.PATID,
					maintable: {
						"rows.reference": {
							unique_identifier: element.module_id,
							add_edit_delete: "E"
						},
						principal_diagnosis_code: element.primary_diagnosis
					}
				}
			}

		} else {
			if (currentMainModule != element.module_id) {
				currentModule = element.module_id;

				if (optionItem) {
					xmlExport.option.optiondataplaceholder.push(optionItem);
				}

				console.log('Adding New Module for Current Client...');

				optionItem = {
					optiondata: {
						PATID: element.PATID,
						maintable: {
							"rows.reference": {
								unique_identifier: element.module_id,
								add_edit_delete: "E"
							},
							principal_diagnosis_code: element.primary_diagnosis
						}
					}
				}
			}
		}

		// add MI SPC values
		if (element.spc_id) {
			if (!("spcplaceholder" in optionItem.optiondata.maintable)) {
				optionItem.optiondata.maintable.spcplaceholder = [];
			}

			optionItem.optiondata.maintable.spcplaceholder.push({
				"SYSTEM.user_pps_mh_spc": {
					"rows.reference": {
						unique_identifier: element.spc_id,
						add_edit_delete: "E"
					}
				}
			});
		}
		else {
			console.log('no spc');
		}
	});


	if (optionItem) {
		xmlExport.option.optiondataplaceholder.push(optionItem);
	}


	// generate xml
	let output = jsonxml(xmlExport, { xmlHeader: true });
	output = replaceAll(output, "<optiondataplaceholder>", "");
	output = replaceAll(output, "</optiondataplaceholder>", "");

	output = replaceAll(output, "maintable", MAIN_TABLE);

	output = replaceAll(output, "<spcplaceholder>", "");
	output = replaceAll(output, "</spcplaceholder>", "");

	// output to file 
	fs.writeFileSync('import.xml', output);
}