// LANGUAGE="JScript"
try
{
	var scriptName = "ImportFromCSVByClass";
	coort.Trace(scriptName+" START");

	var ExportClass = coort.GetObject("COO.103.510.1.800058"); //Ulica

	var CSVPath = "D:\\Export\\";

	var ImportAct = coort.GetObject("COO.103.510.1.4558595");
	var ImportMeth = ImportAct.GetMethod(cootx, "SKCODELISTS@103.510:ActImportFromCSVByClass");

	ImportMeth.SetParameterValue(1, "COOSYSTEM@1.1:OBJECT", 0, ExportClass);
	ImportMeth.SetParameterValue(2, "COOSYSTEM@1.1:STRING", 0, CSVPath);
	ImportAct.CallMethod(cootx, ImportMeth);

	coort.Trace(scriptName+" END");
}
catch(e)
{
	coort.Trace(scriptName + " - ERROR : " + e.message);
	throw e;
}