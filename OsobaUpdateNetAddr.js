// LANGUAGE="JScript"
//naplnenie internetovej adresy(objekt) z agregatu
try
{
	var scriptName = "OsobaUpdateNetAddr";
	var startDate = new Date();
	coort.Trace(scriptName + " " + startDate +" START -->");
	//-------------------------CONFIGURABLES----------------------------------------------------
	var query = "SELECT objname FROM FSCFOLIO@1.1001:Contact WHERE .SKCODELISTS@103.510:AttrAggrAdresaInternet IS NOT NULL";
	//var query = "SELECT objname FROM COOSYSTEM@1.1:Object WHERE .COOSYSTEM@1.1:objaddress = \"COO.200.200.2.1013\"";
	
	var commitAfter = 200;
	var logDirPath = "C:\\";
	var doTrace = true;
	var doLogFile = true;
	
	//-------------------------VARIABLES--------------------------------------------------------
	var itemsCnt=0;
	var coouser = coort.GetCurrentUser();
	var adresaNetAct = coort.GetObject("COO.103.510.1.4630932");//SKCODELISTS_103_510_ActCheckAndAddAddressNet
	
	//-------------------------FUNCTIONS--------------------------------------------------------
	function TraceText(traceStr)
	{
		if (doTrace)
			coort.Trace(scriptName + " - " + traceStr);
	}
	
	function TraceText(traceStr, traceParam1)
	{
		if (doTrace)
			coort.Trace(scriptName + " - " + traceStr, traceParam1);
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
	
	//-------------------------MAIN_CODE--------------------------------------------------------
	//create log file
	var dateFormated = GetFormatedDate(startDate);
	var logPath = logDirPath + scriptName + "_log_" + dateFormated + ".txt";
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var logFile = null;
	if (doLogFile)
	{
		logFile = fso.CreateTextFile(logPath, true);
	}
	
	//search
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
					{//spracovanie osoby
						itemsCnt++;	
						var foundObj = foundObjs[iFoundObjs];
						
						//spracovanie adresy
						var netAddressAggrArr=foundObj.SKCODELISTS_103_510_AttrAggrAdresaInternet;
						if (netAddressAggrArr!=null)
						{
							netAddressAggrArr = netAddressAggrArr.toArray();
							var netAddrAggrCnt = netAddressAggrArr.length;
							for (var iNetAddrAggr = 0; iNetAddrAggr<netAddrAggrCnt; iNetAddrAggr++)
							{
								var netAddressAggr = netAddressAggrArr[iNetAddrAggr];
								var netAddressObj = netAddressAggr.SKCODELISTS_103_510_AttrPtrAddressInternet;
								var netAddressType = netAddressAggr.SKCODELISTS_103_510_AttrPtrCisADM0001;
								var netAddressStr = netAddressAggr.SKCODELISTS_103_510_AttrStrInternetAddress;
								if (netAddressObj==null) //iba ak nie je objekt adresy
								{
									var adresaMeth = adresaNetAct.GetMethod(cootx, adresaNetAct);
									adresaMeth.SetParameterValue(4, "COOSYSTEM@1.1:OBJECT", 0, netAddressType);
									adresaMeth.SetParameterValue(5, "COOSYSTEM@1.1:STRING", 0, netAddressStr);
									adresaNetAct.CallMethod(cootx, adresaMeth);
									var addrNetObjNew = null;
									if (adresaMeth.HasParameterValue(1))
									{
										addrNetObjNew = adresaMeth.GetParameterValue(1);
									}
									if (addrNetObjNew!=null)
									{
										netAddressAggr.SetAttributeValue("SKCODELISTS@103.510:AttrPtrAddressInternet", 0, addrNetObjNew);
										foundObj.SetAttributeValue(cootx, "SKCODELISTS@103.510:AttrAggrAdresaInternet", iNetAddrAggr, netAddressAggr);
									}
								}
							}
						}
						coouser.FSCVAPP_1_1001_CommitRoot(cootx);
					}
					catch(e)
					{
						coort.Trace(scriptName + " - ERROR - chyba pri spracovani osoby: " + e.message);
						logFile.WriteLine(foundObj + " - ERROR - chyba pri spracovani osoby: " + e.message);
					}
				}
			}
			catch(e)
			{
				coort.Trace(scriptName + " - ERROR - chyba pri spracovani objektov: " + e.message);
				logFile.WriteLine(" - ERROR - chyba pri spracovani objektov: " + e.message);
			}
		}
	}
	logFile.WriteLine("pocet spracovanych objektov: "+itemsCnt);
	logFile.WriteLine("startTime: "+startDate);
	var endDate = new Date();
	logFile.WriteLine("endTime: "+endDate);
	logFile.Close();
	coort.Trace(scriptName + " - pocet spracovanych objektov: "+itemsCnt);
	coort.Trace(scriptName + " " +endDate + " - END <--");
}
catch(e)
{
	coort.Trace(scriptName + " - ERROR : " + e.message);
	throw e;
}