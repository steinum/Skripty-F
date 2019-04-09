// LANGUAGE="JScript"
try
{
	var scriptName = "OsobaUpdateUPVSAddress";
	coort.Trace(scriptName + " START -->");
	//---------------------CONFIGURABLES-------------------------------------------------------------
	var timeLimit = "10/12/2017 13:13:00"; //mesiac/den/rok 
	var objectLimit = "100000";
	
	//vyhladavat iba FO s RC, pretoze PO schranky mozu obsahovat ine ID ako ICO
	var query = "LIMIT " + objectLimit
		+ " SELECT objname FROM SKCODELISTS@103.510:ObjClassOsoba WHERE .SKCODELISTS@103.510:AttrPtrAddressUPVS IS NULL"
		+ " AND .SKCODELISTS@103.510:AttrAggrIdentifikatory.SKCODELISTS@103.510:AttrPtrCisSUSR4001.SKCODELISTS@103.510:AttrStrCode = \"9\"";
	
	var isNotifyDiscard = false;
	var logDirPath = "C:\\";
	//-------------------------------------------------------------------------------------
	var itemsCnt=0;
	var coouser = coort.GetCurrentUser();
	
	function notifyDiscard(inObj)
	{
		if (isNotifyDiscard)
		{
			inObj.SKWEBSVC_103_510_ActNotifyDiscard();
		}
	}
	
	//returns true if actual time is lower than time limit (time remains)
	function evalTimeLimit()
	{
		var actDate=new Date();
		var timeLimitDate=new Date(timeLimit);
		coort.Trace(scriptName + " actDate: " + actDate.toString() + " (" +actDate.getTime()+")");//
		coort.Trace(scriptName + " timeLimitDate: " + timeLimitDate.toString() + " (" + timeLimitDate.getTime()+")");//
		if (timeLimitDate.getTime()>actDate.getTime())
		{
			coort.Trace(scriptName+" timeLimit is greater than actDate");
			return true;
		}
		else
		{
			coort.Trace(scriptName+" timeLimit is lower than actDate");
		}
		return false;
	}
	
	var dateNow = new Date();
	var dd = dateNow.getDate();
	var mm = (dateNow.getMonth()+1);
	var hrs = dateNow.getHours();
	var min = dateNow.getMinutes();
	var sec = dateNow.getSeconds();
	if(dd<10) {dd='0'+dd}
	if(mm<10) {mm='0'+mm}
	if(hrs<10) {hrs='0'+hrs}
	if(min<10) {min='0'+min}
	if(sec<10) {sec='0'+sec}
	
	var dateFormated = dateNow.getYear() +'_'+ mm +'_'+ dd +'-'+hrs+'_'+min+'_'+sec;
	var logPath = logDirPath+scriptName+"_log_"+dateFormated+".txt";
	
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var logFile = fso.CreateTextFile(logPath, true);
	
	var queryRes = coort.SearchObjectsAsync(cootx, query);
	
	var searchFound = true;
	var foundObjs = null;
	var foundObj = null;
	while (searchFound)
	{
		foundObjs = queryRes.GetObjects(2500);
		if (foundObjs == null || foundObjs.length<1)
		{
			searchFound=false;
			coort.Trace(scriptName + " - ziadne (dalsie) objekty na spracovanie");
		}
		else
		{
			try
			{//spracovanie objektov
				foundObjs = foundObjs.toArray();
				for (var iFoundObjs = 0; iFoundObjs<foundObjs.length; iFoundObjs++)
				{
					try
					{//spracovanie osoby
						itemsCnt++;
						//coort.Trace(scriptName + " - itemsCnt: "+ itemsCnt);//
						foundObj = foundObjs[iFoundObjs];
						notifyDiscard(foundObj);
						
						var aggrPtr = coort.GetObject("COO.103.510.1.800094"); //#SKCODELISTS_103_510_AttrAggrIdentifikatory
						var idAggrVal = foundObj.getAttribute(cootx, aggrPtr);
						
						var idMeth = foundObj.GetMethod(cootx, "SKCODELISTS@103.510:ActFormatIdentifikatory");
						idMeth.SetParameterValue(1, "COOSYSTEM@1.1:OBJECT", 0, aggrPtr);
						idMeth.SetParameter(2, "SKCODELISTS@103.510:TypeAggrIdentifikatory", idAggrVal);
						foundObj.CallMethod(cootx, idMeth);
						
						if ( (iFoundObjs+1) % 200 == 0 )
						{
							coort.Trace(scriptName+" itemsCnt: "+itemsCnt);
							if ( evalTimeLimit()==false )
							{
								coort.Trace(scriptName+" - time limit script end.");
								//iFoundObjs=foundObjs.length; //ukoncenie cyklu
								searchFound=false; //ukoncenie while
								break;
								
							}
							//cootx.Commit();
							coouser.FSCVAPP_1_1001_CommitRoot(cootx);
						}
					}
					catch(e)
					{
						coort.Trace(scriptName + " - ERROR - chyba pri spracovani osoby: " + e.message);
						logFile.WriteLine(foundObj + " - ERROR - chyba pri spracovani osoby: " + e.message);
					}
				}
				coouser.FSCVAPP_1_1001_CommitRoot(cootx);
			}
			catch(e)
			{
				coort.Trace(scriptName + " - ERROR - chyba pri spracovani objektov: " + e.message);
				logFile.WriteLine(" - ERROR - chyba pri spracovani objektov: " + e.message);
			}
		}
	}
	logFile.WriteLine("pocet spracovanych objektov: "+itemsCnt);
	logFile.WriteLine("startTime: "+dateNow);
	var dateNowEnd = new Date();
	logFile.WriteLine("endTime: "+dateNowEnd);
	logFile.Close();
	coort.Trace(scriptName + " - pocet spracovanych objektov: "+itemsCnt);
	coort.Trace(scriptName + " - END <--");
}
catch(e)
{
	coort.Trace(scriptName + " - ERROR : " + e.message);
	throw e;
}