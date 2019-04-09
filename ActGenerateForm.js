// LANGUAGE="JScript"
//vytiahnutie formulara z balika a uprava pre pouzitie vo faba
try
{
	var scriptName = "GenerateForm";
	coort.Trace(scriptName + " START -->");
	//----------------------CONFIGURABLES--------------------------------------------------
	var query = "SELECT COOSYSTEM@1.1:objname FROM SKXML@103.510:ClassXMLKonfiguracia"
		+ " WHERE .SKXML@103.510:AttrStrXMLKonfiguraciaTargetNamespace = \"http://schemas.gov.sk/form/App.GeneralAgenda/1.9\"";
	var doTrace = true;
	var doLogFile = true;
	var logDirPath = "C:\\";
	var commitAfter = 10;
	
	//----------------------Functions-----------------------------------------------------
	function TraceText(traceStr)
	{
		if (doTrace)
		{
			coort.Trace(scriptName + " - " + traceStr);
		}
	}

	function TraceText(traceStr, traceParam1)
	{
		if (doTrace)
		{
			coort.Trace(scriptName + " - " + traceStr, traceParam1);
		}
	}

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
	
	//----------------------MAIN CODE-----------------------------------------------------
	var startDate = new Date();
	coort.Trace(scriptName + " " + startDate +" START -->");
	var itemsCnt=0;
	var coouser = coort.GetCurrentUser();
	
	//create log file
	var logFile = null;
	if (doLogFile)
	{
		var dateFormated = GetFormatedDate(startDate);
		var logPath = logDirPath + scriptName + "_log_" + dateFormated + ".txt";
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		logFile = fso.CreateTextFile(logPath, true);
		logFile.WriteLine("startTime: "+startDate);
		logFile.WriteLine("query: " + query);
	}
	
	try
	{
		var queryRes = coort.SearchObjectsAsync(cootx, query);
		
		var searchFound = true;
		while (searchFound)
		{
			var foundObjs = queryRes.GetObjects(2500);
			if (foundObjs == null || foundObjs.length<1)
			{
				searchFound=false;
				coort.Trace(scriptName + " - ziadne (dalsie) objekty");
			}
			else
			{
				foundObjs = foundObjs.toArray();
				var foundObjsCnt = foundObjs.length;
				for ( var iObj=0; iObj<foundObjsCnt; iObj++ )
				{
					itemsCnt++
					var fObj = foundObjs[iObj];
					try
					{//spracovanie objektu
						fObj.SKXML_103_510_ActGenerateForm();
					}
					catch(e)
					{
						coort.Trace(scriptName + " - ERROR - chyba pri spracovani objektu (" + fObj.objname + " - " + fObj.reference + ") : " + e.message);
						if (doLogFile)
						{
							logFile.WriteLine(fObj + " - ERROR - chyba pri spracovani objektu: " + e.message);
						}
					}
					if ( itemsCnt % commitAfter == 0)
					{
						TraceText("commit "+itemsCnt);
						coouser.FSCVAPP_1_1001_CommitRoot(cootx);
					}
				}
				coouser.FSCVAPP_1_1001_CommitRoot(cootx);
			}
		}
	}
	catch(e)
	{
		coort.Trace(scriptName + " - ERROR : " + e.message);
		logFile.WriteLine("ERROR: " + e.message);
		throw e;
	}
	
	var endDate = new Date();
	if (doLogFile)
	{
		logFile.WriteLine("pocet spracovanych objektov: "+itemsCnt);
		logFile.WriteLine("endTime: "+endDate);
		logFile.Close();
	}
	
	coort.Trace(scriptName + " " + startDate);
	coort.Trace(scriptName + " - pocet spracovanych objektov: "+itemsCnt);
	coort.Trace(scriptName + " " + endDate + " - END <--");
}
catch(e)
{
	coort.Trace(scriptName + " - ERROR : " + e.message);
	throw e;
}