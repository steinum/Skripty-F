// LANGUAGE="JScript"
//nahradzovanie duplicitnych osob

//---------------------CONFIGURABLES--------------------------------------------------

var commitAfter = 200;
var logDirPath = "C:\\";
var doTrace = true;
var doLogFile = true;

var inFile = "C:\\osoby_report_2016_12_12-09_29_15.csvRC";

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

function IsNullOrEmpty(inStr)
{
	if (inStr==null || inStr=="")
	{
		return true;
	}
	else
	{
		return false;
	}
}

//----------------------MAIN_CODE-----------------------------------------------------
try
{
	//init variables
	var scriptName = "replaceDuplicity";
	var startDate = new Date();
	var coouser = coort.GetCurrentUser();
	var itemsCnt=0;
	var replaceAct = coort.GetComponentObject("COOSYSTEM@1.1:Action", "SKCODELISTS@103.510:ActReplaceDuplicityObjs");

	
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
	
	//read file
	var inFile = fso.OpenTextFile(inFile, 1);
	var lineNum = 0;
	while (!inFile.AtEndOfStream)
	{
		lineNum++;
		var fileLine = inFile.ReadLine();
		try
		{
			if ( !IsNullOrEmpty(fileLine))
			{
				var fileLineArr = fileLine.split(";");
				if (fileLineArr.length>1)
				{
					var identifier = fileLineArr[0];
					var duplicityObjsCoo = fileLineArr[1];
					var duplicityObjsCooArr = null;
					if ( !IsNullOrEmpty(duplicityObjsCoo) )
					{
						duplicityObjsCooArr = duplicityObjsCoo.split("-");
						var duplObjsCnt = duplicityObjsCooArr.length;
						if (duplObjsCnt>0)
						{
							var mainObj = duplicityObjsCooArr[0];
							var duplObjState = mainObj.SKCODELISTS_103_510_AttrEnumPersonStatus;
							if (duplObjState!=50)
							{
								itemsCnt++;
								var replaceMeth = replaceAct.GetMethod(cootx, replaceAct);
								replaceMeth.SetParameterValue(1, "COOSYSTEM@1.1:OBJECT", 0, mainObj);
								for (var iDuplObj=1; iDuplObj<duplObjsCnt; iDuplObj++)
								{
									var duplObjStr = duplicityObjsCooArr[iDuplObj];
									var duplObj = coort.GetObject( duplObjStr );
									
									replaceMeth.SetParameterValue(2, "COOSYSTEM@1.1:OBJECT", iDuplObj-1, duplObj);
								}
								//call replace act
								coort.Trace("replacemeth", replaceMeth);
								replaceAct.CallMethod(cootx, replaceMeth);
							}
						}
					}
				}
			}
		}
		catch (e)
		{
			//error processing line
			coort.Trace(scriptName + " - ERROR - chyba pri spracovani riadka "+lineNum+": " + e.message);
			if (doLogFile)
			{
				logFile.WriteLine("ERROR - chyba pri spracovani riadka "+lineNum+": " + e.message);
			}
		}
		if (itemsCnt % commitAfter == 0)
		{
			TraceText("commit "+itemsCnt);
			//cootx.Commit();
			coouser.FSCVAPP_1_1001_CommitRoot(cootx);
		}
	}
	inFile.Close();
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