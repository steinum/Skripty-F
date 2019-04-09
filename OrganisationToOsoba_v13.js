// LANGUAGE="JScript"
//*******pred spustenim je nutne docasne vlozit vlastnost AttrAggrIdentifikatory do OT Contact********
try
{
	var scriptName = "OrganisationToOsoba";
	coort.Trace(scriptName + " START -->");
	//---------------------CONFIGURABLES-------------------------------------------------------------
//	var query = "LIMIT 10 SELECT objname FROM FSCFOLIO@1.1001:Organisation";
var query = "SELECT objname FROM COOSYSTEM@1.1:Object WHERE .COOSYSTEM@1.1:objaddress = \"COO.2195.135.2.1070582\"";
	
	var doTestTrace = false;
	var isNotifyDiscard = true;
	//-------------------------------------------------------------------------------------
	var itemsCnt=0;
	var coouser = coort.GetCurrentUser();
	var regStaty = coort.GetObject("COO.103.510.1.800472");
	var chkAddAddrAct = coort.GetObject("COO.103.510.1.800623");
	var adresaNetAct = coort.GetObject("COO.103.510.1.4630932");
	
	var orgName; //FSCFOLIO@1.1001:orgname
	var orgShortName; //CONTACTEXT@15.1001:orgshortname
	var orgDIC; //FSCFOLIO@1.1001:orgvatid
	var orgICO; //FSCFOLIO@1.1001:orgtradeid
	var orgSKICO; //SKPRECONFIGSK@103.510:AttrStrICO
	var orgLegalForm; //COOELAK@1.1001:addrlegalformdef
	
	var orgURL; //FSCFOLIO@1.1001:website
	var orgTel;	//FSCFOLIO@1.1001:telephone
	var orgEmail; //COOMAPI@1.1:emailinformation
	
	var orgpersons; //CONTACTEXT@15.1001:orgemployeelist
	
	var fscAddress;
	var addressArr;
	var address;
	var addressStreet;
	var addressObec;
	var addressPobox;
	var addressPSC;
	var addressCity;
	var addressState;
	var addressCountry;
	var addressOrgCountry;
	
	var addressTargetType;
	var buildNum;
	var streetNum;
	var countryObj;
	var addron;
	
	var searchMeth;
	var streetNumTemp;
	var iStreetLastSpace;
	var iStreetNumSlash;
	
	var chkAddAddrMeth;
	var adressObj;
	var adressLine;
	
	function TraceText(traceStr)
	{
		if (doTestTrace)
			coort.Trace(scriptName + " - " + traceStr);
	}
	
	function SearchCDLItemByCode(cdlCoo, itemID)
	{
		TraceText("SearchCDLItemByCode -->");
		var cdl = coort.GetObject(cdlCoo);
		searchMeth = cdl.GetMethod(cootx, "SKCODELISTS@103.510:ActSearchCLItemByID");
		searchMeth.SetParameterValue(2, "COOSYSTEM@1.1:STRING", 0, itemID);
		cdl.CallMethod(cootx, searchMeth);
		TraceText("SearchCDLItemByCode <--");
		return searchMeth.GetParameterValue(1);
	}

	function SearchRegItemByName(reg, itemName, isShortName)
	{
		TraceText("SearchRegItemByName -->");
		searchMeth = reg.GetMethod(cootx, "SKCODELISTS@103.510:ActSearchRegItemByName");
		searchMeth.SetParameterValue(2, "COOSYSTEM@1.1:STRING", 0, itemName);
		searchMeth.SetParameterValue(3, "COOSYSTEM@1.1:BOOLEAN", 0, isShortName);
		reg.CallMethod(cootx, searchMeth);
		TraceText("SearchRegItemByName <--");
		return searchMeth.GetParameterValue(1);
	}
	
	function ParseStreetNum()
	{
		TraceText("ParseStreetNum -->");
		if (addressStreet!=null)
		{
			var iStreetLastSlash = addressStreet.lastIndexOf("/");
			var addressStreetTmp = "";
			if (iStreetLastSlash>-1)
			{
				addressStreetTmp = addressStreet.substring(0, iStreetLastSlash);
				iStreetLastSpace = addressStreetTmp.lastIndexOf(" ");
			}
			else
			{
				iStreetLastSpace = addressStreet.lastIndexOf(" ");
			}
			if (iStreetLastSpace>-1)
			{
				streetNumTemp = addressStreet.substring(iStreetLastSpace+1);
				coort.Trace(scriptName + " - streetNumTemp", streetNumTemp);//
				//coort.Trace(scriptName + " - /\d/.test(streetNumTemp)", /\d/.test(streetNumTemp));//
				//if (streetNumTemp!=null && streetNumTemp!="")
				if (streetNumTemp!=null && streetNumTemp!="" && /\d/.test(streetNumTemp)) //if substring from street after space contains numbers
				{
					addressStreet = addressStreet.substring(0, iStreetLastSpace);
					iStreetNumSlash = streetNumTemp.indexOf("/");
					if (iStreetNumSlash > -1)
					{
						buildNum = streetNumTemp.substring(0,iStreetNumSlash);
						streetNum = streetNumTemp.substring(iStreetNumSlash+1);
					}
					else
					{
						buildNum = streetNumTemp;
					}
				}
				else if (streetNumTemp!=null && streetNumTemp!="")
				{
					iStreetNumSlash = streetNumTemp.indexOf("/");
					if (iStreetNumSlash > -1)
					{
						var buildNumTmp = streetNumTemp.substring(0,iStreetNumSlash);
						if (/\d/.test(buildNumTmp))
						{
							addressStreet = addressStreet.substring(0, iStreetLastSpace);
							buildNum = buildNumTmp;
							streetNum = streetNumTemp.substring(iStreetNumSlash+1);
						}
					}
				}
			}
		}
		else
		{
			coort.Trace("addressStreet is null");
		}
		TraceText("ParseStreetNum <--");
	}
	
	function ParseStreetNumFromAddron()
	{
		TraceText("ParseStreetNumFromAddron -->");
		iStreetNumSlash = addron.indexOf("/");
		if (iStreetNumSlash > -1)
		{
			buildNum = addron.substring(0,iStreetNumSlash);
			streetNum = addron.substring(iStreetNumSlash+1);
		}
		else
		{
			buildNum = addron;
		}
		TraceText("ParseStreetNumFromAddron <--");
	}

	function TryParseAddrCdlNums(cdlNum)
	{
		TraceText("TryParseAddrNums -->");
		if (cdlNum!=null)
		{
			iStreetNumSlash = cdlNum.indexOf("/");
			if (iStreetNumSlash > -1)
			{
				cdlBuildNum = cdlNum.substring(0,iStreetNumSlash);
				cdlStreetNum = cdlNum.substring(iStreetNumSlash+1);
			}
		}
		TraceText("TryParseAddrNums <--");
	}
	
	function myTrim(x)
	{
		return x.replace(/^\s+|\s+$/gm,'');
	}
	
	function CheckAndAddAddress()
	{
		TraceText("CheckAndAddAddress -->");
		chkAddAddrMeth = chkAddAddrAct.GetMethod(cootx, "SKCODELISTS@103.510:ActCheckAndAddAddress");
		adressObj = null;
		chkAddAddrMeth.SetParameterValue(2, "COOSYSTEM@1.1:STRING", 0, addressStreet);
		chkAddAddrMeth.SetParameterValue(3, "COOSYSTEM@1.1:STRING", 0, addressObec);
		chkAddAddrMeth.SetParameterValue(4, "COOSYSTEM@1.1:STRING", 0, buildNum);
		chkAddAddrMeth.SetParameterValue(5, "COOSYSTEM@1.1:STRING", 0, streetNum);
		chkAddAddrMeth.SetParameterValue(6, "COOSYSTEM@1.1:STRING", 0, addressPobox);
		chkAddAddrMeth.SetParameterValue(7, "COOSYSTEM@1.1:STRING", 0, addressPSC);
		chkAddAddrMeth.SetParameterValue(8, "COOSYSTEM@1.1:STRING", 0, addressCity);
		chkAddAddrMeth.SetParameterValue(9, "COOSYSTEM@1.1:STRING", 0, addressState);
		chkAddAddrMeth.SetParameterValue(10, "COOSYSTEM@1.1:OBJECT", 0, countryObj);
		chkAddAddrMeth.SetParameterValue(11, "SKCODELISTS@103.510:TypeEnumTargetType", 0, addressTargetType);
		chkAddAddrAct.CallMethod(cootx, chkAddAddrMeth);
		if (chkAddAddrMeth.HasParameterValue(1))
			adressObj = chkAddAddrMeth.GetParameterValue(1);
		TraceText("adressObj: "+adressObj);
		TraceText("CheckAndAddAddress <--");
	}
	
	function SetOsobaID(osoba, idType, idStr)
	{
		TraceText("SetOsobaID -->");
		TraceText("SetOsobaID - idStr: "+idStr);
		var osobaIDsCnt = 0;
		var osobaIDs = osoba.SKCODELISTS_103_510_AttrAggrIdentifikatory;
		if (osobaIDs!=null)
		{
			osobaIDs = osobaIDs.toArray();
			osobaIDsCnt = osobaIDs.length;
			for (var iOsobaIDs = 0; iOsobaIDs<osobaIDsCnt; iOsobaIDs++)
			{
				if (osobaIDs[iOsobaIDs].SKCODELISTS_103_510_AttrPtrCisSUSR4001.SKCODELISTS_103_510_AttrStrCode == idType)
				{
					TraceText("SetOsobaID - already set - return <--");
					return;
				}
			}
		}
		//IDs empty or ID not found, add line
		var idLine = coort.CreateAggregate("SKCODELISTS@103.510:TypeAggrIdentifikatory");
		var idTypeItem = SearchCDLItemByCode("COO.103.510.1.800032", idType)
		//idLine.SKCODELISTS_103_510_AttrPtrCisSUSR4001 = idTypeItem;
		idLine.SetAttributeValue("SKCODELISTS@103.510:AttrPtrCisSUSR4001", 0, idTypeItem);
		idLine.SetAttributeValue("SKCODELISTS@103.510:AttrStrIdentifikator", 0, idStr);
		osoba.SetAttributeValue(cootx, "SKCODELISTS@103.510:AttrAggrIdentifikatory", osobaIDsCnt, idLine);
		TraceText("SetOsobaID <--");
	}
	
	function SetOsobaNetAddr(osoba, addrType, netAddrStr)
	{
		TraceText("SetOsobaNetAddr -->");
		var osobaNetAddrsCnt = 0;
		var osobaNetAddrs = osoba.SKCODELISTS_103_510_AttrAggrAdresaInternet;
		if (osobaNetAddrs!=null)
		{
			osobaNetAddrs = osobaNetAddrs.toArray();
			osobaNetAddrsCnt = osobaNetAddrs.length;
			for (var iosobaNetAddrs = 0; iosobaNetAddrs<osobaNetAddrsCnt; iosobaNetAddrs++)
			{
				if (osobaNetAddrs[iosobaNetAddrs].SKCODELISTS_103_510_AttrPtrCisADM0001!=null)
				{
					if (osobaNetAddrs[iosobaNetAddrs].SKCODELISTS_103_510_AttrPtrCisADM0001.SKCODELISTS_103_510_AttrStrCode == addrType && osobaNetAddrs[iosobaNetAddrs].SKCODELISTS_103_510_AttrStrInternetAddress==netAddrStr)
					{
						TraceText("SetOsobaNetAddr - already set - return <--");
						return;
					}
				}
			}
		}
		//Addrs empty or addr not found, add line
		var addrLine = coort.CreateAggregate("SKCODELISTS@103.510:TypeAggrAdresaInternet");
		var addrTypeItem = SearchCDLItemByCode("COO.103.510.1.800120", addrType)
		//addrLine.SKCODELISTS_103_510_AttrPtrCisADM0001 = addrTypeItem;
		addrLine.SetAttributeValue("SKCODELISTS@103.510:AttrPtrCisADM0001", 0, addrTypeItem);
		addrLine.SKCODELISTS_103_510_AttrStrInternetAddress = netAddrStr;
		
		//addr line-set obj (20160905)
		var adresaNetMeth = adresaNetAct.GetMethod(cootx, adresaNetAct);
		adresaNetMeth.SetParameterValue(4, "COOSYSTEM@1.1:OBJECT", 0, addrTypeItem);
		adresaNetMeth.SetParameterValue(5, "COOSYSTEM@1.1:STRING", 0, netAddrStr);
		adresaNetAct.CallMethod(cootx, adresaNetMeth);
		var addrNetObjNew = null;
		if (adresaNetMeth.HasParameterValue(1))
		{
			addrNetObjNew = adresaNetMeth.GetParameterValue(1);
		}
		if (addrNetObjNew!=null)
		{
			addrLine.SetAttributeValue("SKCODELISTS@103.510:AttrPtrAddressInternet", 0, addrNetObjNew);
		}
		
		osoba.SetAttributeValue(cootx, "SKCODELISTS@103.510:AttrAggrAdresaInternet", osobaNetAddrsCnt, addrLine);
		TraceText("SetOsobaNetAddr <--");
	}
	
	function SetOsobaTel(osoba, telType, telStr)
	{
		TraceText("SetOsobaTel -->");
		var osobaTelsCnt = 0;
		var osobaTels = osoba.SKCODELISTS_103_510_AttrAggrAdresaTelefon;
		if (osobaTels!=null)
		{
			osobaTels = osobaTels.toArray();
			osobaTelsCnt = osobaTels.length;
			for (var iOsobaTels = 0; iOsobaTels<osobaTelsCnt; iOsobaTels++)
			{
				if (osobaTels[iOsobaTels].SKCODELISTS_103_510_AttrPtrCisSUSR4005.SKCODELISTS_103_510_AttrStrCode == telType && osobaTels[iOsobaTels].SKCODELISTS_103_510_AttrStrAdresaTelefon==telStr)
				{
					TraceText("SetOsobaTel - already set - return <--");
					return;
				}
			}
		}
		//tels empty or tel not found, add line
		var telLine = coort.CreateAggregate("SKCODELISTS@103.510:TypeAggrAdresaTelefon");
		var telTypeItem = SearchCDLItemByCode("COO.103.510.1.800111", telType)
		//telLine.SKCODELISTS_103_510_AttrPtrCisADM0001 = telTypeItem;
		telLine.SetAttributeValue("SKCODELISTS@103.510:AttrPtrCisSUSR4005", 0, telTypeItem);
		telLine.SetAttributeValue("SKCODELISTS@103.510:AttrStrAdresaTelefon", 0, telStr);
		osoba.SetAttributeValue(cootx, "SKCODELISTS@103.510:AttrAggrAdresaTelefon", osobaTelsCnt, telLine);
		TraceText("SetOsobaTel <--");
	}
	
	function SetOsobaTelFromFsc(osoba, telFscAggr)
	{
		TraceText("SetOsobaTelFromFsc -->");
		if (telFscAggr!=null)
		{
			telFscAggr = telFscAggr.toArray();
			osobaFscTelsCnt = telFscAggr.length;
			for (var iOsobaFscTels = 0; iOsobaFscTels<osobaFscTelsCnt; iOsobaFscTels++)
			{
				var telTypeID = "1";
				if (telFscAggr[iOsobaFscTels].FSCFOLIO_1_1001_addrtopic=="COO.1.1001.1.182479")
				{
					telTypeID = "2";
				}
				if (telFscAggr[iOsobaFscTels].FSCFOLIO_1_1001_addrtopic=="COO.1.1001.1.182537")
				{
					telTypeID = "3";
				}
				
				SetOsobaTel(osoba, telTypeID, telFscAggr[iOsobaFscTels].FSCFOLIO_1_1001_telnumber);
			}
		}
		TraceText("SetOsobaTelFromFsc <--");
	}
	
	function SetOsobaEmailAddrFromFsc(osoba, emailFscAggr)
	{
		TraceText("SetOsobaEmailAddrFromFsc -->");
		if (emailFscAggr!=null)
		{
			emailFscAggr = emailFscAggr.toArray();
			osobaFscEmailsCnt = emailFscAggr.length;
			for (var iOsobaFscEmails = 0; iOsobaFscEmails<osobaFscEmailsCnt; iOsobaFscEmails++)
			{
				SetOsobaNetAddr(osoba, "3", emailFscAggr[iOsobaFscEmails].COOMAPI_1_1_emailaddress);
			}
		}
		TraceText("SetOsobaEmailAddrFromFsc <--");
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
	
	function notifyDiscard(inObj)
	{
		if (isNotifyDiscard)
		{
			//coort.Trace("notifyDiscard");
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
	var logPath = "C:\\OrganisationToOsoba_log_"+dateFormated+".txt";
	
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var logFile = fso.CreateTextFile(logPath, true);
	
	var queryRes = coort.SearchObjectsAsync(cootx, query);
	
	var searchFound = true;
	var foundObjs = null;
	var foundObj = null;
	var typAddrKontaktna = SearchCDLItemByCode("COO.103.510.1.4611894", "200001");
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
						orgName = foundObj.FSCFOLIO_1_1001_orgname;
						if (IsNullOrEmpty(orgName))
						{
							orgName = foundObj.GetAttributeString(cootx, "CONTACTEXT@15.1001:mlname");
						}
						if (IsNullOrEmpty(orgName))
						{
							orgName = foundObj.COOSYSTEM_1_1_objname;
						}
						orgShortName = foundObj.CONTACTEXT_15_1001_orgshortname;
						if (IsNullOrEmpty(orgName) && !IsNullOrEmpty(orgShortName))
						{
							orgName = orgShortName;
							orgShortName = null;
						}
						orgDIC = foundObj.FSCFOLIO_1_1001_orgvatid;
						orgICO = foundObj.FSCFOLIO_1_1001_orgtradeid;
						orgSKICO = foundObj.SKPRECONFIGSK_103_510_AttrStrICO;
						if ((orgICO==null || orgICO=="") && (orgSKICO!=null && orgSKICO!=""))
						{
							orgICO = orgSKICO;
						}
						orgLegalForm = foundObj.COOELAK_1_1001_addrlegalformdef;
						orgURL = foundObj.FSCFOLIO_1_1001_website;
						orgTel = foundObj.FSCFOLIO_1_1001_telephone;
						orgEmail = foundObj.COOMAPI_1_1_emailinformation;
						orgpersons = foundObj.CONTACTEXT_15_1001_orgemployeelist;
						foundObj.CONTACTEXT_15_1001_orgemployeelist=null;
						if ((orgDIC!=null && orgDIC!="") || (orgICO!=null && orgICO!=""))
						{
							foundObj.ObjectChangeClass("COO.103.510.1.800093"); //SKCODELISTS@103.510:ObjClassOsoba
							foundObj.COODESK_1_1_objmicon = "COO.103.510.1.800125"; //SKCODELISTS@103.510:MiniIconOsoba
						}
						else
						{
							foundObj.ObjectChangeClass("COO.103.510.1.4558620"); //SKCODELISTS@103.510:	ObjClassOsobaAnonym
							foundObj.COODESK_1_1_objmicon = "COO.103.510.1.4558621"; //SKCODELISTS_103_510_MiniIconOsobaAnonym
						}
						//coouser.FSCVAPP_1_1001_CommitRoot(cootx); //commit kvoli IDs
						foundObj.ObjectRefresh(true);
						if (orgName!=null && orgName!="")
						{
							foundObj.SKCODELISTS_103_510_AttrStrPOPlneMeno = orgName;
						}
						
						if (orgShortName!=null && orgShortName!="")
						{
							var altNamesCnt = foundObj.GetAttributeValueCount(cootx, "SKCODELISTS@103.510:AttrStrPOAlternativneMeno");
							foundObj.SetAttributeValue(cootx, "SKCODELISTS@103.510:AttrStrPOAlternativneMeno", altNamesCnt, orgShortName);
						}
						
						if ((orgDIC!=null && orgDIC!="") || (orgICO!=null && orgICO!=""))
						{
							//clear init IDs
							foundObj.SKCODELISTS_103_510_AttrAggrIdentifikatory = null;
							if (orgDIC!=null && orgDIC!="")
							{
								SetOsobaID(foundObj, "8", orgDIC);
							}
							if (orgICO!=null && orgICO!="")
							{
								SetOsobaID(foundObj, "7", orgICO);
							}
						}
						//TODO: orgLegalForm
						
						if (orgURL!=null && orgURL!="")
						{
							SetOsobaNetAddr(foundObj, "1", orgURL);
						}
						SetOsobaTelFromFsc(foundObj, orgTel);
						SetOsobaEmailAddrFromFsc(foundObj, orgEmail);
						
						//pers orgs
						if (orgpersons!=null)
						{
							orgpersons = orgpersons.toArray();
							orgpersonsCnt = orgpersons.length;
							for (var iorgpersons = 0; iorgpersons<orgpersonsCnt; iorgpersons++)
							{
								var orgpersonObj = orgpersons[iorgpersons];
								if (orgpersonObj!=null)
								{
									var zainteresOsobyCnt = foundObj.GetAttributeValueCount(cootx, "SKCODELISTS@103.510:AttrAggrPOZainteresovanaOsoba");
									var zainteresOsobyLine = coort.CreateAggregate("SKCODELISTS@103.510:TypeAggrPOZainteresovanaOsoba");
									zainteresOsobyLine.SetAttributeValue("SKCODELISTS@103.510:AttrStrPOZainteresovanaOsobaTyp", 0, "osoba");
									zainteresOsobyLine.SetAttributeValue("SKCODELISTS@103.510:AttrPtrPOZainteresovanaOsoba", 0, orgpersonObj);
									foundObj.SetAttributeValue(cootx, "SKCODELISTS@103.510:AttrAggrPOZainteresovanaOsoba", zainteresOsobyCnt, zainteresOsobyLine);
								}
							}
						}
						
						//other
						var deactiv = foundObj.SKPRECONFIGSK_103_510_BoolDeactiv;
						var deactivInDupl = foundObj.SKPRECONFIGSK_103_510_BoolDeactivCezDuplicityVadresari;
						if (deactiv==true || deactivInDupl==true)
						{
							foundObj.SetAttributeValue(cootx, "SKCODELISTS@103.510:AttrEnumPersonStatus", 0, 50);
						}
						else
						{
							foundObj.SetAttributeValue(cootx, "SKCODELISTS@103.510:AttrEnumPersonStatus", 0, 10);
						}
						
						//adresa
						try
						{//spracovanie adresy
							//clean old values
							addressStreet = null;
							addressObec = null;
							buildNum = null;
							streetNum = null;
							addressPobox = null;
							addressPSC = null;
							addressCity = null;
							addressState = null;
							addressCountry = null;
							addressOrgCountry = null;
							countryObj = null;
							addressTargetType = null;
							addron = null;
							
							fscAddress=foundObj.FSCFOLIO_1_1001_address;
							if (fscAddress!=null && foundObj.SKCODELISTS_103_510_AttrAggrAdresaFyzicka==null)  //iba ak faba adresa nie je null a CDL adresa je null
							{
								addressArr=fscAddress.toArray();
								if (addressArr.length>0)
								{
									address = addressArr[0];
									addressStreet=address.FSCFOLIO_1_1001_addrstreet;
									
									addressPobox=address.CONTACTEXT_15_1001_addrpobox;
									addressTargetType = 10;
									if ((addressStreet == null || addressStreet == "")  && (addressPobox!=null && addressPobox!="" && addressPobox!="P.O.BOX "))
									{
										addressTargetType = 20;
									}
									else
									{
										//process street
										ParseStreetNum();
									}
									addron=address.CONTACTEXT_15_1001_addron;
									if (addron!=null && addron!="")
									{
										ParseStreetNumFromAddron();
									}
									
									//check if street is only number
									if (addressStreet!=null)
									{
										addressStreet = myTrim(addressStreet);
										//if (/\d/.test(addressStreet) && buildNum == null)
										if (!isNaN(addressStreet) && buildNum == null)
										{
											buildNum = addressStreet;
											addressStreet = null;
										}
									}
									
									addressPSC = address.FSCFOLIO_1_1001_addrzipcode;
									addressCity = address.FSCFOLIO_1_1001_addrcity;
									
									//PSC obec from CONTACTEXT@15.1001:addrcity
									var addrCityObj = address.CONTACTEXT_15_1001_addrcity;
									if (addrCityObj!=null)
									{
										addressCity = addrCityObj.GetAttributeString(cootx, "COOSYSTEM@1.1:mlname");
										addressPSC = addrCityObj.FSCFOLIO_1_1001_addrzipcode;
									}
									
									if ((addressStreet == null || addressStreet == "") && (addressCity != null || addressCity != ""))
									{
										 addressObec = addressCity;
										 addressCity = null;
									}
									
									addressState = address.FSCFOLIO_1_1001_addrstate;

									addressCountry = address.FSCFOLIO_1_1001_addrcountry;
									addressOrgCountry = address.GetAttributeString(cootx, "SKPRECONFIGSK@103.510:AttrEnumStateForOrganization");
									if ((addressCountry==null || addressCountry=="") && (addressOrgCountry!=null && addressOrgCountry!=""))
									{
										addressCountry = addressOrgCountry;
									}

									countryObj = null;
									if (addressCountry!=null)
									{
										countryObj = SearchRegItemByName(regStaty, addressCountry, false);
										if (countryObj==null)
										{
											countryObj = SearchRegItemByName(regStaty, addressCountry, true);
										}
									}
									
									/*coort.Trace(scriptName + " -addressStreet: ", addressStreet);
									coort.Trace(scriptName + " - buildNum: ", buildNum);
									coort.Trace(scriptName + " - streetNum: ", streetNum);
									coort.Trace(scriptName + " - addressPobox: ", addressPobox);
									coort.Trace(scriptName + " - addressPSC: ", addressPSC);
									coort.Trace(scriptName + " - addressCity: ", addressCity);
									coort.Trace(scriptName + " - addressState: ", addressState);
									coort.Trace(scriptName + " - countryObj: ", countryObj);*/
										
									if (buildNum!=null)
									{
										//buildNum.trim();
										buildNum = myTrim(buildNum);
									}
									if (streetNum!=null)
									{
										//streetNum.trim();
										streetNum = myTrim(streetNum);
									}
									
									//coort.Trace(scriptName + " - buildNum: ", buildNum);//
									//coort.Trace(scriptName + " - streetNum: ", streetNum);//
									
									//callact ChkAddAddress
									CheckAndAddAddress();
									if (adressObj!=null)
									{
										adressLine = coort.CreateAggregate("SKCODELISTS@103.510:TypeAggrAdresaFyzicka");
										adressLine.SKCODELISTS_103_510_AttrEnumAddressType = 20;
										adressLine.SetAttributeValue("SKCODELISTS@103.510:AttrPtrAddressType", 0, typAddrKontaktna);
										adressLine.SetAttributeValue("SKCODELISTS@103.510:AttrPtrAddressAdresa", 0, adressObj);
										foundObj.SetAttributeValue(cootx, "SKCODELISTS@103.510:AttrAggrAdresaFyzicka", 0, adressLine);
									}
								}
							}
						}
						catch(e)
						{
							coort.Trace(scriptName + " - ERROR - chyba pri spracovani adresy: " + e.message);
							logFile.WriteLine(foundObj + " - ERROR - chyba pri spracovani adresy: " + e.message);
						}
						
						//coort.Trace(scriptName + " - first commit");//
						coouser.FSCVAPP_1_1001_CommitRoot(cootx);
						
						//call id attrsets (set upvs addr)
						if ((orgDIC!=null && orgDIC!="") || (orgICO!=null && orgICO!=""))
						{
							var osobaIDAggrArr = foundObj.SKCODELISTS_103_510_AttrAggrIdentifikatory;
							foundObj.SKCODELISTS_103_510_AttrAggrIdentifikatory=osobaIDAggrArr;
						}
						notifyDiscard(foundObj);
						
						//call person status attrset (set icon)
						var osobaStatus = foundObj.SKCODELISTS_103_510_AttrEnumPersonStatus;
						foundObj.SKCODELISTS_103_510_AttrEnumPersonStatus=osobaStatus;
						
						//coort.Trace(scriptName + " - set fsc addr");//
						//foundObj.SetAttribute(cootx, "FSCFOLIO@1.1001:address", fscAddress);
						
						//coort.Trace(scriptName + " - second commit");//
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