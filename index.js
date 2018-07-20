const csvParser = require("csvtojson");
const jsonxml = require("jsontoxml");
const fs = require("fs");
const config = require("./config");
const stringutils = require("./stringutils");

console.log("Coverting CSV to XML Import File...");

csvParser()
	.fromFile(config.CSV_PATH)
	.then((jsonOutput) => {
		createExportXML(jsonOutput);
	});

function createExportXML(json) {

	let xmlExport = {
		option: {
			optionidentifier: config.OPTION_ID,
			optiondataplaceholder: []
		}
	}

	let currentClient = '';
	let currentMainModule = '';
	let optionItem = {};

	json.forEach((element) => {

		if (currentClient !== element.PATID) {
			currentClient = element.PATID;
			currentMainModule = element.module_id;

			if (optionItem) {
				xmlExport.option.optiondataplaceholder.push(optionItem);
			}

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
			if (currentMainModule !== element.module_id) {
				currentModule = element.module_id;

				if (optionItem) {
					xmlExport.option.optiondataplaceholder.push(optionItem);
				}

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
	});

	if (optionItem) {
		xmlExport.option.optiondataplaceholder.push(optionItem);
	}

	// generate xml / strip out placeholder xml elements
	let output = jsonxml(xmlExport, {
		xmlHeader: true
	});
	output = stringutils.replaceAll(output, "<optiondataplaceholder>", "");
	output = stringutils.replaceAll(output, "</optiondataplaceholder>", "");
	output = stringutils.replaceAll(output, "<spcplaceholder>", "");
	output = stringutils.replaceAll(output, "</spcplaceholder>", "");
	output = stringutils.replaceAll(output, "maintable", config.MAIN_TABLE);

	// output to file 
	fs.writeFileSync('import.xml', output);
	console.log("Export File Completed.")
}

// ONLY SELECT ACTIVE EPISODES OR ALL?
// TAKE OUT CLASSIFICATION LIMIT ON DIAGNOSES
// MAKE P DIAGNOSIS REQUIRED / CLASSIFICATION REQUIRED ON DIAGNOSIS
// SQL DI 1-7 check other fields for duplicate values
