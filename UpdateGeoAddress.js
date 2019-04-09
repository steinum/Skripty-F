// LANGUAGE="JScript"

//---------------------CONFIGURABLES--------------------------------------------------

var commitAfter = 200;
var logDirPath = "C:\\";
var doTrace = true;
var doLogFile = true;
var isNotifyDiscard = true;

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

function notifyDiscard(inObj)
{
	if (isNotifyDiscard)
	{
		//coort.Trace("notifyDiscard");
		cootx.SetVariableValue("SKCODELISTS@103.510", 7, "COOSYSTEM@1.1:BOOLEAN", 0, true);
		inObj.SKWEBSVC_103_510_ActNotifyDiscard();
	}
}

//----------------------MAIN_CODE-----------------------------------------------------
try
{
	//configure variables
	var scriptName = "UpdateGeoAddress";
	var startDate = new Date();
	var coouser = coort.GetCurrentUser();
	var itemsCnt=0;
	var updatePostAddressAct = coort.GetComponentObject("COOSYSTEM@1.1:Action", "SKCODELISTS@103.510:ActUpdatePostAddress");
	
	coort.Trace(scriptName + " " + startDate +" START -->");
	
	//create log file
	var dateFormated = GetFormatedDate(startDate);
	var logPath = logDirPath + scriptName + "_log_" + dateFormated + ".txt";
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var logFile = null;
	if (doLogFile)
	{
		logFile = fso.CreateTextFile(logPath, true);
	}
	
	//search text addresses
	var query = "SELECT objname FROM SKCODELISTS@103.510:ObjClassGeoAddress";
	var queryRes = coort.SearchObjectsAsync(cootx, query);
	var searchFound = true;
	while (searchFound)
	{
		var foundObjs = queryRes.GetObjects(2500);
		if (foundObjs == null)
		{
			searchFound=false;
			coort.Trace(scriptName + " - ziadne dalsie objekty na spracovanie");
		}
		else
		{
			try
			{//spracovanie objektov
				foundObjs = foundObjs.toArray();
				var foundObjsCnt = foundObjs.length;
				for (var iFoundObjs = 0; iFoundObjs<foundObjsCnt; iFoundObjs++)
				{
					try
					{//spracovanie adresy
						itemsCnt++;	
						var adresaObj = foundObjs[iFoundObjs];
						//TraceText("adresaObj ", adresaObj);
						notifyDiscard(adresaObj);
						
						var adresaMeth = adresaObj.GetMethod(cootx, updatePostAddressAct);
						adresaObj.CallMethod(cootx, adresaMeth);
					}
					catch(e)
					{
						coort.Trace(scriptName + " - ERROR - chyba pri spracovani adresy: " + e.message);
						if (doLogFile)
						{
							logFile.WriteLine(adresaObj + " - ERROR - chyba pri spracovani adresy: " + e.message);
						}
					}
					if (itemsCnt % commitAfter == 0)
					{
						TraceText("commit "+itemsCnt);
						//cootx.Commit();
						coouser.FSCVAPP_1_1001_CommitRoot(cootx);
					}
				}
			}
			catch(e)
			{
				coort.Trace(scriptName + " - ERROR - chyba pri spracovani objektov: " + e.message);
				if (doLogFile)
				{
					logFile.WriteLine(" - ERROR - chyba pri spracovani objektov: " + e.message);
				}
			}
		}
	}
	var endDate = new Date();
	if (doLogFile)
	{
		logFile.WriteLine("pocet spracovanych objektov: "+itemsCnt);
		logFile.WriteLine("startTime: "+startDate);
		logFile.WriteLine("endTime: "+endDate);
		logFile.Close();
	}
	coort.Trace(scriptName + " - pocet spracovanych objektov: "+itemsCnt);
	coort.Trace(scriptName + " " +endDate + " - END <--");
}
catch(e)
{
	coort.Trace(scriptName + " - ERROR : " + e.message);
	throw e;
}