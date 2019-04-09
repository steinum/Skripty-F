// LANGUAGE="JScript"
//import OVM s aktivovanou schrankou na dorucovanie
var scriptName = "importOVM";
try
{
	//---------------------CONFIGURABLES---------------------------
	var importCsvPath = "C:\\zoznamovmsaktivovanouschrankounadorucovanie_part.csv";
	var logDirPath = "C:\\";
	var doLogFile = true;
	
	//----------------------Functions-----------------------------------------------------
	function GetFormatedDate(dateIn)
	{
		var dd = dateIn.getDate();
		var mm = (dateIn.getMonth()+1);
		var hrs = dateIn.getHours();
		var min = dateIn.getMinutes();
		var sec = dateIn.getSeconds();
		if(dd<10) {dd='0'+dd}
		if(mm<10) {mm='0'+mm}
		if(hrs<10) {hrs='0'+hrs}
		if(min<10) {min='0'+min}
		if(sec<10) {sec='0'+sec}
		
		return (dateIn.getYear() +'_'+ mm +'_'+ dd +'-'+hrs+'_'+min+'_'+sec);
	}

	//----------------------MAIN CODE---------------------------------------
	var startDate = new Date();
	var coouser = coort.GetCurrentUser();
	
	coort.Trace(scriptName + " " + startDate +" START -->");
	
	//create log file
	if (doLogFile)
	{
		var dateFormated = GetFormatedDate(startDate);
		var logPath = logDirPath + scriptName + "_log_" + dateFormated + ".txt";
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var logFile = fso.CreateTextFile(logPath, true);
		logFile.WriteLine("import: "+importCsvPath);
	}

	var importOVMAct = coort.GetComponentObject("COOSYSTEM@1.1:Action", "SKCODELISTS@103.510:ActImportOVMUPVS");
	var importOVMMeth = importOVMAct.GetMethod(cootx, "SKCODELISTS@103.510:ActImportOVMUPVS");
	importOVMMeth.SetParameterValue(1, "COOSYSTEM@1.1:STRING", 0, importCsvPath);
	importOVMAct.CallMethod(cootx, importOVMMeth);
	
	var endDate = new Date();
	if (doLogFile)
	{
		logFile.WriteLine("startTime: "+startDate);
		logFile.WriteLine("endTime: "+endDate);
		logFile.Close();
	}

	coort.Trace(scriptName + " " +endDate + " - END <--");
}
catch(e)
{
	coort.Trace(scriptName + " - ERROR : " + e.message);
	throw e;
}