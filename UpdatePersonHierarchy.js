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

//----------------------MAIN_CODE-----------------------------------------------------
try
{
	//configure variables
	var scriptName = "UpdatePersonHierarchy";
	var startDate = new Date();
	var coouser = coort.GetCurrentUser();
	var subordinateProp=coort.GetObject("COO.103.510.1.801035"); //SKCODELISTS@103.510:AttrPtrPOOrganizacnaJednotka
	var superiorProp=coort.GetObject("COO.103.510.1.4650855"); //SKCODELISTS@103.510:AttrPtrSuperiorPersons
	
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
	
	function updatePersonHierarchy(query, isSubordinated)
	{
		var itemsCnt=0;
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
							//TraceText("osobaObj ", osobaObj);
							
							if (isSubordinated==true)
							{//naplnit podradene osoby
								var zainteresovaneOsobyAggrArr = osobaObj.SKCODELISTS_103_510_AttrAggrPOZainteresovanaOsoba;
								if (zainteresovaneOsobyAggrArr!=null)
								{
									zainteresovaneOsobyAggrArr=zainteresovaneOsobyAggrArr.toArray();
									var zainteresovaneOsobyCnt = zainteresovaneOsobyAggrArr.length;
									for (var iZainteresOsoba = 0; iZainteresOsoba<zainteresovaneOsobyCnt; iZainteresOsoba++)
									{
										var zainteresovanaOsobaAggr = zainteresovaneOsobyAggrArr[iZainteresOsoba];
										var zainteresOsoba = zainteresovanaOsobaAggr.SKCODELISTS_103_510_AttrPtrPOZainteresovanaOsoba;
										//share osoba to AttrPtrPOOrganizacnaJednotka
										osobaObj.SKADMIN_103_510_ShareObjectsUnique(subordinateProp, zainteresOsoba);
									}
								}
							}
							else
							{//naplnit nadradene osoby
								var rootOrg = osobaObj.SKCODELISTS_103_510_AttrPtrRootOrganisation;
								if (rootOrg!=null)
								{
									osobaObj.SKADMIN_103_510_ShareObjectsUnique(superiorProp, rootOrg);
								}
							}
						}
						catch(e)
						{
							coort.Trace(scriptName + " - ERROR - chyba pri spracovani osoby: " + e.message);
							if (doLogFile)
							{
								logFile.WriteLine(""+new Date()+"ERROR - chyba pri spracovani osoby: " + e.message);
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
						logFile.WriteLine(""+new Date()+"ERROR - chyba pri spracovani objektov: " + e.message);
					}
				}
			}
		}
		return itemsCnt;
	}
	
	//call update func
	//search text addresses
	var query = "SELECT COOSYSTEM@1.1:objname FROM SKCODELISTS@103.510:ObjClassOsobaAbstract WHERE .SKCODELISTS@103.510:AttrAggrPOZainteresovanaOsoba IS NOT NULL";
	var processedSubordinated = updatePersonHierarchy(query, true);
	var query = "SELECT objname FROM SKCODELISTS@103.510:ClassOsobaOrgUnit WHERE .SKCODELISTS@103.510:AttrPtrRootOrganisation IS NOT NULL";
	var processedSuperior = updatePersonHierarchy(query, false);
	
	var endDate = new Date();
	if (doLogFile)
	{
		logFile.WriteLine("pocet spracovanych objektov(podradené osoby): "+processedSubordinated);
		logFile.WriteLine("pocet spracovanych objektov(nadradené osoby): "+processedSuperior);
		logFile.WriteLine("startTime: "+startDate);
		logFile.WriteLine("endTime: "+endDate);
		logFile.Close();
	}
	coort.Trace(scriptName + " - pocet spracovanych objektov(podradené osoby): "+processedSubordinated);
	coort.Trace(scriptName + " - pocet spracovanych objektov(nadradené osoby): "+processedSuperior);
	coort.Trace(scriptName + " " +endDate + " - END <--");
}
catch(e)
{
	coort.Trace(scriptName + " - ERROR : " + e.message);
	throw e;
}