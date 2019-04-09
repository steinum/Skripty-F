// LANGUAGE="JScript"
//naplnenie druhu adresy(ciselnik) podla typu adresy(enumeracia)
//pred spustenim skriptu musi byt naplneny ciselnik "CL010139 - Druh Adresy"

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
		inObj.SKWEBSVC_103_510_ActNotifyDiscard();
	}
}

//----------------------MAIN_CODE-----------------------------------------------------
try
{
	//configure variables
	var scriptName = "OsobaUpdatePhysAddr";
	var startDate = new Date();
	var coouser = coort.GetCurrentUser();
	var itemsCnt=0;
	
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
	var query = "SELECT objname FROM FSCFOLIO@1.1001:Contact WHERE .SKCODELISTS@103.510:AttrAggrAdresaFyzicka IS NOT NULL AND .SKCODELISTS@103.510:AttrAggrAdresaFyzicka.SKCODELISTS@103.510:AttrPtrAddressType IS NULL";
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
					{//spracovanie osob
						itemsCnt++;	
						var osobaObj = foundObjs[iFoundObjs];
						notifyDiscard(osobaObj);
						//TraceText("osobaObj ", osobaObj);
						//var ptrAddrAggr = coort.GetObject("COO.103.510.1.800095"); //#SKCODELISTS@103.510:AttrAggrAdresaFyzicka
						var osobaAddrAggrArr = osobaObj.SKCODELISTS_103_510_AttrAggrAdresaFyzicka;
						//osobaObj.SKCODELISTS_103_510_ActSetOsobaAdresa(ptrAddrAggr, osobaAddrAggrArr);
						osobaObj.SKCODELISTS_103_510_AttrAggrAdresaFyzicka=osobaAddrAggrArr;
					}
					catch(e)
					{
						coort.Trace(scriptName + " - ERROR - chyba pri spracovani osoby: " + e.message);
						if (doLogFile)
						{
							logFile.WriteLine(adresaObj + " - ERROR - chyba pri spracovani osoby: " + e.message);
						}
					}
					if (itemsCnt % commitAfter == 0)
					{
						TraceText("commit "+itemsCnt);
						//cootx.Commit();
						coouser.FSCVAPP_1_1001_CommitRoot(cootx);
					}
				}
				coouser.FSCVAPP_1_1001_CommitRoot(cootx);
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