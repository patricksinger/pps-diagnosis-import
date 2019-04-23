const csvParser = require("csvtojson");
const jsonxml = require("jsontoxml");
const fs = require("fs");
const execSync = require("child_process").execSync;

const stringutils = require("./stringutils");

const Store = require('electron-store');
const settings = new Store({cwd:"./"});

const CSV_BUILDER_ERRORS = {
	0: "Success",
	1: "csvBuilder Error Invalid Arguments Provided",
	2: "csvBuilder Error with SQL File Load",
	3: "csvBuilder Error With ODBC DSN Connection - Check User Name and Password"
};

const SQL_STATEMENT = 'sqlStatement.sql';

function parseCSV(sqlStatement, csvFile, xmlFile, odbcDSN, odbcUser, odbcPassword, odbcArch) {
	try {
		saveSQLFile(sqlStatement);
		generateCSV(csvFile, odbcDSN, odbcUser, odbcPassword, odbcArch);
		csvParser()
			.fromFile(csvFile)
			.then((jsonOutput) => {
				removeCSVFile(csvFile);
				createExportXML(jsonOutput, xmlFile, settings);
			});
	} catch (error) {
		throw error;
	}
}

function saveSQLFile(sqlStatement) {
	fs.writeFileSync("sqlStatement.sql", sqlStatement, function(err) {
		throw "Unable to Write SQL Statement File - " + err;
	});
}

function generateCSV(csvFile, odbcDSN, odbcUser, odbcPassword, odbcArch) {
	console.log(odbcArch);
	try {
		switch (odbcArch) {
			case "32": execSync(`${process.cwd()}\\csvBuilder32.exe ${odbcDSN} ${odbcUser} ${odbcPassword} ${SQL_STATEMENT} ${csvFile}`);
					break;
			case "64": execSync(`${process.cwd()}\\csvBuilder64.exe ${odbcDSN} ${odbcUser} ${odbcPassword} ${SQL_STATEMENT} ${csvFile}`);
					break;
			default: throw "Unable to Identify ODBC Architecture to Utilize"
		}
	}
	catch (error) {
			throw CSV_BUILDER_ERRORS[error.status] + " - " + error.message;
	}
}

function removeCSVFile(csvFile) {
	try {
		fs.unlinkSync(csvFile);
	} catch (error) {
		throw "Unable to Delete CSV File - " + error;
	}
}

function createExportXML(json, xmlFile, settings) {

	let xmlExport = {
		option: {
			optionidentifier: settings.get("OPTION_ID"),
			optiondataplaceholder: []
		}
	}

	let currentClient = '';
	let currentMainModule = '';
	let optionItem = {};

	json.forEach((element) => {

		if (element.primary_diagnosis) {

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

		} 
		if (currentMainModule !== element.module_id) {
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
		} // block to check if diagnosis available
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
	output = stringutils.replaceAll(output, "maintable", settings.get("MAIN_TABLE"));

	try {
		fs.writeFileSync(xmlFile, output);
	} catch (error) {
		throw "Unable to Write XML Export File - " + error;
	}

}

module.exports.parseCSV = parseCSV;