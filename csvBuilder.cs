using System;
using System.Data.Odbc;
using System.Text;
using System.IO;
using System.Linq;

namespace CSVBuilder
{

				enum ExitCode : int {
				Success = 0,
				InvalidArguments = 1,
				ErrorSQLFileLoad = 2,
				ErrorDSNConnection = 3
			}

    class CSVBuilder
    {

        static int Main(string[] args) 
        {



			if (args.Length != 5) {
				System.Console.WriteLine("All required arguments not provided when running CSVBuilder.");
				System.Console.WriteLine("Format - csvbuilder odbcDSN odbcUser odbcPassword pathToImportSQLFile pathToExportCSVFile");
				System.Console.WriteLine("Example - csvbuilder AVPM1972LIVEDbHostname LIVE:imauser mypass123 import.sql export.csv");
				return (int)ExitCode.InvalidArguments;				
			}

			// set arguments to local variables
			string odbcDSN = args[0];
			string odbcUser = args[1];
			string odbcPassword = args[2];
			string importSQLFile = args[3];
			string exportCSVFile = args[4];
			string sqlStatement = "";


            Console.WriteLine("ODBC SQL CSV Builder");

			// load SQL file
			try {
				Console.WriteLine("Loading SQL File...");
				StreamReader sr = new StreamReader(importSQLFile);
				sqlStatement = sr.ReadToEnd();
				Console.WriteLine("Completed SQL File Load...");
			} catch (Exception e) {
				Console.WriteLine("Error Reading SQL File:");
				Console.WriteLine(e.Message);
				return (int)ExitCode.ErrorSQLFileLoad;		
			}

			OdbcConnection DbConnection = new OdbcConnection("DSN=" + odbcDSN + ";Uid=" + odbcUser + ";Pwd=" + odbcPassword);

			try {
				Console.WriteLine("Opening Database Connection...");
				DbConnection.Open();
				OdbcCommand DbCommand = DbConnection.CreateCommand();
				DbCommand.CommandText = sqlStatement;
				Console.WriteLine("Executing SQL Query Against Database...");
				OdbcDataReader reader = DbCommand.ExecuteReader();

				StringBuilder csvBuilder = new StringBuilder();
				int totalRows = 0;

				var columnNames = Enumerable.Range(0, reader.FieldCount)
											.Select(reader.GetName)
											.ToList();
				csvBuilder.Append(string.Join(",", columnNames));
				csvBuilder.AppendLine();

				Console.WriteLine("Parsing Database Result to CSV...");
				while (reader.Read()) {
					for (int i = 0; i < reader.FieldCount; i++) {
						string value = reader[i].ToString();
						if (value.Contains(","))
							value = "\"" + value + "\"";
						
						csvBuilder.Append(value.Replace(Environment.NewLine, " ") + ",");
					}
					csvBuilder.Length--;
					csvBuilder.AppendLine();
					totalRows++;
				}
				Console.WriteLine("\tParsed " + totalRows + " Records");
				reader.Close();
				DbCommand.Dispose();
				DbConnection.Close();
				Console.WriteLine("Database Connection Closed...");

				Console.WriteLine("Writing to CSV File...");
				StreamWriter sw = new StreamWriter(exportCSVFile);
				sw.Write(csvBuilder.ToString());
				sw.Close();
				Console.WriteLine("Completed Writing to CSV File...");

			} catch (OdbcException ex) {
					Console.WriteLine("Connection to the DSN failed.");
					Console.WriteLine("The ODBC Connection returned the following message");
					Console.WriteLine(ex.Message);
					return (int)ExitCode.ErrorDSNConnection;				
			}
			return (int)ExitCode.Success;
        }
    }
}