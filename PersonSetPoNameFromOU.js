// LANGUAGE="JScript"
//nutne spustit po nahrati CHP 13050 - nastavenie plneho meno pravnickej osoby z vlastnosti organizacna jednotka
try
{
	var scriptName = "PersonSetPoNameFromOU";
	coort.Trace(scriptName + " START -->");
	//---------------------CONFIGURABLES-------------------------------------------------------------
	var query = "SELECT COOSYSTEM@1.1:objname FROM SKCODELISTS@103.510:ClassOsobaOrgUnit WHERE .SKCODELISTS@103.510:AttrStrPOPlneMeno <> .SKCODELISTS@103.510:AttrStrPOOrganizacnaJednotka";
	
	var isNotifyDiscard = true;
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
						coort.Trace(scriptName + " - itemsCnt: "+ itemsCnt);//
						foundObj = foundObjs[iFoundObjs];
						notifyDiscard(foundObj);
						
						foundObj.SKCODELISTS_103_510_AttrStrPOPlneMeno = foundObj.SKCODELISTS_103_510_AttrStrPOOrganizacnaJednotka;
						
						if (iFoundObjs % 200 == 0)
						{
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