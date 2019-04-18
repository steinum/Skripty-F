// LANGUAGE="JScript"

//Skript opravuje import osob z JRZ
var scriptName = "OpravaJRZ";

//---------------------CONFIGURABLES---------------------------
var inFile = "D:\\jrz\\import_test.csv"; // spajanie.csv  ...  CSV_od_Jakuba_COO_adresy_prvy_import_mapovanie_osoby_adresy.csv
var logDirPath = "D:\\jrz\\";
var doLogFile = true;
var doTrace = true;

var coouser = coort.GetCurrentUser();
//----------------------Functions-----------------------------------------------------

// vracia boolean hodnotu podla toho ci je hodnota poslana do parametru null
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

// trace vypis
function TraceText(traceStr)
{
  if (doTrace)
    coort.Trace(scriptName + " - " + traceStr);
}

//----------------------MAIN_CODE-----------------------------------------------------

try
{
TraceText(scriptName + "  START -->");

//create log file
var logPath = logDirPath + scriptName + ".txt";
var fso = new ActiveXObject("Scripting.FileSystemObject");
var logFile = null;
if (doLogFile)
{
	TraceText("  >>> VYTVARAM LOGFILE  ");
  logFile = fso.CreateTextFile(logPath, true);
}

//nacitanie csv - read file
TraceText("  ::: otvaram csv subor na import ", fso.FileExists(inFile));
  if (fso.FileExists(inFile)) {
  var inFile = fso.OpenTextFile(inFile, 1);
}

TraceText("  nacitavam data... ");

var lineNum = 0;

while (!inFile.AtEndOfStream) // prvy riadok
{
  TraceText("  AtEdnOfStream:  ", lineNum );
  lineNum++;
	var commitovanie = lineNum;

  var fileLine = inFile.ReadLine(); // nacitaj riadok
  TraceText(" fileLine:  ", fileLine );

  try
  {
    TraceText(" try2  ");
    if ( !IsNullOrEmpty(fileLine)) // ak riadok nie je prazdny
    TraceText(" !IsNullOrEmpty(fileLine)  ", !IsNullOrEmpty(fileLine));
    {
      var fileLineArr = fileLine.split(";"); // pozrie po prvu bodkociarku
      if (fileLineArr.length>1) // ak daka je
      {

      // trace toho co vypise
      TraceText("ICO: " + fileLineArr[0]);
			TraceText("Osoba PO nazov: " + fileLineArr[1]);
			TraceText("RC: " + fileLineArr[3]);
			TraceText("meno: " + fileLineArr[5]);
			TraceText("priezvysko: " + fileLineArr[6]);
			TraceText("datum narodenia: " + fileLineArr[8]);
		 var jrzId = fileLineArr[14];
			TraceText("jrzId: " + fileLineArr[14]);

				TraceText(":::::::::::::: ");
			var ulica = fileLineArr[16];
				TraceText("ulica: " + ulica);
			var obec = fileLineArr[21];
				TraceText("obec: " + obec);
			var supisneCislo = fileLineArr[17];
				TraceText("supisneCislo: " + supisneCislo);
			var orientacneCislo = fileLineArr[18];
				TraceText("orientacneCislo: " + orientacneCislo);
			var pOBOX = fileLineArr[20];
				TraceText("pOBOX: " + pOBOX);
			var psc = fileLineArr[19];
				TraceText("psc: " + psc);
			var druhAdersySusr_CL010139 = fileLineArr[15];
				TraceText("druhAdersySusr_CL010139: " + druhAdersySusr_CL010139);
			var okresSusr_0048 = fileLineArr[22];
				TraceText("okresSusr_0048: " + fileLineArr[22]);
			var statSusr_CL000086 = fileLineArr[23];
				TraceText("statSusr_CL000086: " + fileLineArr[23]);



				var objclass = coort.GetObjectClass("COOSYSTEM@1.1:Object");

				TraceText(" druh adresy ", druhAdersySusr_CL010139);
				if(druhAdersySusr_CL010139 == "200001") {
				  TraceText(" druh adresy 200001");

				//ulica|obec|cisloPopisne|cisloOrientacne|POBOX|PSC|stat
				var adresaMeth = objclass.GetMethod(cootx, "SKCODELISTS@103.510:ActCheckAndAddAddress");

				adresaMeth.SetParameterValue(2, "COOSYSTEM@1.1:STRING", 0, ulica);
				adresaMeth.SetParameterValue(3, "COOSYSTEM@1.1:STRING", 0, obec);
				adresaMeth.SetParameterValue(4, "COOSYSTEM@1.1:STRING", 0, supisneCislo);
				adresaMeth.SetParameterValue(5, "COOSYSTEM@1.1:STRING", 0, orientacneCislo);
				adresaMeth.SetParameterValue(6, "COOSYSTEM@1.1:STRING", 0, pOBOX);
				adresaMeth.SetParameterValue(7, "COOSYSTEM@1.1:STRING", 0, psc);

				//najdi a nastav stat
				if(statSusr_CL000086 != null)
				{
				  var query = "SELECT objname FROM SKCODELISTS@103.510:ObjClassRegItemStat WHERE .SKCODELISTS@103.510:AttrStrCode = " + statSusr_CL000086;
				  var searchmeth = objclass.GetMethod(cootx, "FSCAREXT@1.1001:ExecuteQuery");
				  searchmeth.SetParameterValue(1, "COOSYSTEM@1.1:STRING", 0, query);
				  objclass.CallMethod(cootx, searchmeth);
				  var objlist = searchmeth.GetParameter3(2);
				  if(objlist != null)
				  {
				    objlist = objlist.toArray();
				    if(objlist.length > 0)
				    {
				      adresaMeth.SetParameterValue(10, "COOSYSTEM@1.1:OBJECT", 0, objlist[0]);
				    }
				  }
				}

				//typ adresy
				var typAdresy;
				if (ulica == '' && pOBOX != '')
				{
				  typAdresy = 20;
				} else {
				  typAdresy = 10;
				}
				adresaMeth.SetParameterValue(11, "SKCODELISTS@103.510@1.1:TypeEnumTargetType", 0, typAdresy);
				//adresaMeth.SetParameterValue(12, "COOSYSTEM@1.1:BOOLEAN", 0 , true); //666



				//zavolaj metodu kontroly/pridania adresy
				objclass.CallMethod(cootx, adresaMeth);

				//precitaj vystup metody (objekt)
				var adresa = adresaMeth.GetParameterValue(1);
				TraceText("### ADRESA vysledok: " + jrzId + ";" + adresa.GetAddress() + ";" + druhAdersySusr_CL010139 + " adresa: " + adresa);

			} else { // ::::::::::::::::::::::::::::::::: druh adresy 100001 - geo   :::::::::::::::::::::::::::::::::::::::::::::::::::::::::
				TraceText(" druh adresy 100001");

				//ulica|obec|cisloPopisne|cisloOrientacne|POBOX|PSC|stat
				var adresaMeth = objclass.GetMethod(cootx, "SKCODELISTS@103.510:ActCheckAndAddAddressGEO");

				adresaMeth.SetParameterValue(2, "COOSYSTEM@1.1:STRING", 0, ulica);
				adresaMeth.SetParameterValue(3, "COOSYSTEM@1.1:STRING", 0, supisneCislo);
				adresaMeth.SetParameterValue(4, "COOSYSTEM@1.1:STRING", 0, orientacneCislo);
				adresaMeth.SetParameterValue(5, "COOSYSTEM@1.1:STRING", 0, psc);
				adresaMeth.SetParameterValue(6, "COOSYSTEM@1.1:STRING", 0, obec);
				if(okresSusr_0048 != null) {
				adresaMeth.SetParameterValue(7, "COOSYSTEM@1.1:STRING", 0, okresSusr_0048);
			 	}

				//najdi a nastav stat
				if(statSusr_CL000086 != null)
				{
				  var query = "SELECT objname FROM SKCODELISTS@103.510:ObjClassRegItemStat WHERE .SKCODELISTS@103.510:AttrStrCode = " + statSusr_CL000086;
				  var searchmeth = objclass.GetMethod(cootx, "FSCAREXT@1.1001:ExecuteQuery");
				  searchmeth.SetParameterValue(1, "COOSYSTEM@1.1:STRING", 0, query);
				  objclass.CallMethod(cootx, searchmeth);
				  var objlist = searchmeth.GetParameter3(2);
				  if(objlist != null)
				  {
				    objlist = objlist.toArray();
				    if(objlist.length > 0)
				    {
				      adresaMeth.SetParameterValue(10, "COOSYSTEM@1.1:OBJECT", 0, objlist[0]);
				    }
				  }
				}

				//typ adresy
				var typAdresy;
				if (ulica == '' && pOBOX != '')
				{
				  typAdresy = 20;
				} else {
				  typAdresy = 10;
				}
				//adresaMeth.SetParameterValue(11, "SKCODELISTS@103.510@1.1:TypeEnumTargetType", 0, typAdresy);
				//adresaMeth.SetParameterValue(12, "COOSYSTEM@1.1:BOOLEAN", 0 , true); //666



				//zavolaj metodu kontroly/pridania adresy
				objclass.CallMethod(cootx, adresaMeth);

				//precitaj vystup metody (objekt)
				var adresaGeo = adresaMeth.GetParameterValue(1);
				TraceText("### ADRESA vysledok: " + jrzId + ";" + adresa.GetAddress() + ";" + druhAdersySusr_CL010139 + " adresa: " + adresa);


			}

				//ActCheckAndAddOsoba
				var ICO = fileLineArr[0];
					TraceText("ICO: " + ICO);
				var NazovPO = fileLineArr[1];
					TraceText("NazovPO: " + NazovPO);
				var DatumVznikuPO = "";
				var RodneCislo = fileLineArr[3];
					TraceText("RodneCislo: " + RodneCislo);
				var titulPredMenom = fileLineArr[4];
					TraceText("titulPredMenom: " + titulPredMenom);
				var Meno = fileLineArr[5];
					TraceText("Meno: " + Meno);
				var priezvisko = fileLineArr[6];
					TraceText("priezvisko: " + priezvisko);
				var titulZa = fileLineArr[7];
					TraceText("titulZa: " + titulZa);
				var DatumNarodenia = fileLineArr[8];
					TraceText("DatumNarodenia: " + DatumNarodenia);
				var email = fileLineArr[9];
					TraceText("email: " + email);

				var Identifikator = "";
				if (ICO != "") { Identifikator = ICO; }
				if (RodneCislo != "") { Identifikator = RodneCislo; }

				var TypIdentifikatoru = "";
				if (ICO != "") { TypIdentifikatoru = "7"; }
				if (RodneCislo != "") { TypIdentifikatoru = "9"; }

				var objclass = coort.GetObjectClass("COOSYSTEM@1.1:Object");

				//ICO alebo RC|TypIdentifikatoru|Titul|Meno|Priezvisko|Firma|Email|Adresa|DatumNarodenia|TypAdresy
				var osobaMeth = objclass.GetMethod(cootx, "SKCODELISTS@103.510:ActCheckAndAddOsoba");

				osobaMeth.SetParameterValue(2, "COOSYSTEM@1.1:STRINGLIST", 0, Identifikator);
				osobaMeth.SetParameterValue(3, "COOSYSTEM@1.1:STRINGLIST", 0, TypIdentifikatoru);
				osobaMeth.SetParameterValue(4, "COOSYSTEM@1.1:STRING", 0, titulPredMenom);
				osobaMeth.SetParameterValue(5, "COOSYSTEM@1.1:STRING", 0, Meno);
				osobaMeth.SetParameterValue(6, "COOSYSTEM@1.1:STRING", 0, priezvisko);
				osobaMeth.SetParameterValue(9, "COOSYSTEM@1.1:STRING", 0, NazovPO);
				osobaMeth.SetParameterValue(11, "COOSYSTEM@1.1:STRING", 0, email);

				if(druhAdersySusr_CL010139 == "200001") {
				osobaMeth.SetParameterValue(12, "COOSYSTEM@1.1:OBJECT", 0, adresa); // ADRESA 666
			} else {
				osobaMeth.SetParameterValue(12, "COOSYSTEM@1.1:OBJECT", 0, adresaGeo); // ADRESA 666
			}


				osobaMeth.SetParameterValue(14, "COOSYSTEM@1.1:DATETIME", 0, DatumNarodenia);
				//osobaMeth.SetParameterValue(17, "COOSYSTEM@1.1:OBJECT", 0, druhAdersySusr_CL010139); //
				osobaMeth.SetParameterValue(18, "COOSYSTEM@1.1:BOOLEAN", 0, true);



				// najdenie osoby podla identifikatora a vymaze data + adresu

				if(TypIdentifikatoru == "9") {
					//fo
					if(RodneCislo != null) {
						var query = "SELECT COOSYSTEM@1.1:objname FROM SKCODELISTS@103.510:ObjClassOsoba WHERE .SKCODELISTS@103.510:AttrAggrIdentifikatory.SKCODELISTS@103.510:AttrStrIdentifikator = \"" + RodneCislo + "\"";

						    var osobaVyhladana = coort.SearchObjectsAsync(cootx, query); //SearchObjects3
						    var foundObjs = null;
						    foundObjs = osobaVyhladana.GetObjects(5);

								    if (foundObjs == null || foundObjs.length<1) {
											TraceText(scriptName + " - ziadne (dalsie) objekty na spracovanie");
										}
										else
										{
								      foundObjs = foundObjs.toArray();
								      var os = foundObjs[0];

								       TraceText("osobaVyhladana: ", osobaVyhladana);
								       //var meno = GetAttributeString(cootx, "CONTACTEXT@15.1001:mlname");
								       var meno = os.COOSYSTEM_1_1_objname;

								       TraceText("vlastnost: ", meno);


								       var g = os.SKCODELISTS_103_510_AttrStrPOPlneMeno;
								       var m = os.SKCODELISTS_103_510_AttrStrOsobaMeno;

								       TraceText("nazovPO xxx: ", g);
								       TraceText("nazovFO xxx: ", m);

								       var osobaIDs = os.SKCODELISTS_103_510_AttrAggrIdentifikatory;
								       if (osobaIDs!=null) {
								        var osobaIDsCnt = 0;
								   			osobaIDs = osobaIDs.toArray();

												//zmazanie ID z druheho riadku
												TraceText("osobaIDs: ", osobaIDs);
												if(osobaIDs[1] != null) {
													TraceText("_____v if ", osobaIDs[1]);
													osobaIDs = null;
												}

								   			osobaIDsCnt = osobaIDs.length;
								   			for (var iOsobaIDs = 0; iOsobaIDs<osobaIDsCnt; iOsobaIDs++)
								   			{

								          var typOsoby = osobaIDs[iOsobaIDs].SKCODELISTS_103_510_AttrPtrCisSUSR4001.SKCODELISTS_103_510_AttrStrCode;
								          if(typOsoby != null) {
								            if (typOsoby == 9) {
								              TraceText("typ osoby FO ");
								              logFile.WriteLine(" FO");

								              TraceText("Meno fo: ", os.SKCODELISTS_103_510_AttrStrOsobaMeno);
								              TraceText("Plne meno pravnickej osoby: ", os.SKCODELISTS_103_510_AttrStrPOPlneMeno);
								              if(os.SKCODELISTS_103_510_AttrStrPOPlneMeno != null) {
								                os.SKCODELISTS_103_510_AttrStrPOPlneMeno = null;
								              }
								              if(os.SKCODELISTS_103_510_AttrPtrCisSUSR0056 != null) {
								                os.SKCODELISTS_103_510_AttrPtrCisSUSR0056 = null;
								              }
								              if(os.SKCODELISTS_103_510_AttrDatePOZalozenie != null) {
								                os.SKCODELISTS_103_510_AttrDatePOZalozenie = null;
								              }
								              if(os.SKCODELISTS_103_510_AttrDatePOZanik != null) {
								                os.SKCODELISTS_103_510_AttrDatePOZanik = null;
								              }
								              if(os.SKCODELISTS_103_510_AttrPtrPOPredmetCinnostiOKEC != null) {
								                os.SKCODELISTS_103_510_AttrPtrPOPredmetCinnostiOKEC = null;
								              }
								              if(os.SKCODELISTS_103_510_AttrPtrPOVelkostOrganizacie != null) {
								                os.SKCODELISTS_103_510_AttrPtrPOVelkostOrganizacie = null;
								              }
								              if(os.SKCODELISTS_103_510_AttrPtrPOOrganizacnaJednotka != null) {
								                os.SKCODELISTS_103_510_AttrPtrPOOrganizacnaJednotka = null;
								              }
								              if(os.SKCODELISTS_103_510_AttrPtrSuperiorPersons != null) {
								                os.SKCODELISTS_103_510_AttrPtrSuperiorPersons = null;
								              }
								              if(os.SKCODELISTS_103_510_AttrAggrContactPersons != null) {
								                os.SKCODELISTS_103_510_AttrAggrContactPersons = null;
								              }
															// TraceText(" os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka ", os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka);
															// if(os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka != null) {
															// 	TraceText(" vymazavam adresu ", os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka);
															// 	os.SetAttributeValue(cootx, "SKCODELISTS@103.510:AttrAggrAdresaFyzicka", 0, null);
															// 	TraceText(" agregat adresa: ", os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka);
								              // }


								              TraceText("FO ok");

								            } else {
								              TraceText("typ osoby naznamy ");
								            }

								          } else {
								            TraceText(" typ osoby je null ");
								          }

								   			}
								   		 }


								    }

				  }
				} else {
					//po
					if(ICO != null) {
						var query = "SELECT COOSYSTEM@1.1:objname FROM SKCODELISTS@103.510:ObjClassOsoba WHERE .SKCODELISTS@103.510:AttrAggrIdentifikatory.SKCODELISTS@103.510:AttrStrIdentifikator = \"" + ICO + "\"";

						    var osobaVyhladana = coort.SearchObjectsAsync(cootx, query); //SearchObjects3
						    var foundObjs = null;
						    foundObjs = osobaVyhladana.GetObjects(5);

						    if (foundObjs == null || foundObjs.length<1) {
									TraceText(scriptName + " - ziadne (dalsie) objekty na spracovanie");
								}
								else
								{
						      foundObjs = foundObjs.toArray();
						      var os = foundObjs[0];

						       TraceText("osobaVyhladana: ", osobaVyhladana);

						       var priezviskoVyp = os.GetAttributeString(cootx, "SKCODELISTS@103.510:AttrStrOsobaPriezvisko");
									 TraceText("priezvisko1: ", priezviskoVyp);
									 TraceText("priezvisko2: ", os.SKCODELISTS_103_510_AttrStrOsobaRodnePriezvisko);


						       var meno = os.COOSYSTEM_1_1_objname;

						       TraceText("vlastnost: ", meno);


						       var g = os.SKCODELISTS_103_510_AttrStrPOPlneMeno;
						       var m = os.SKCODELISTS_103_510_AttrStrOsobaMeno;

						       TraceText("nazovPO xxx: ", g);
						       TraceText("nazovFO xxx: ", m);

						       var osobaIDs = os.SKCODELISTS_103_510_AttrAggrIdentifikatory;
						       if (osobaIDs!=null) {
						        var osobaIDsCnt = 0;
						   			osobaIDs = osobaIDs.toArray();

										//zmazanie ID z druheho riadku
										TraceText("osobaIDs: ", osobaIDs);
										if(osobaIDs[1] != null) {
											TraceText("_____v if ", osobaIDs[1]);
											osobaIDs = null;
										}

						   			osobaIDsCnt = osobaIDs.length;
						   			for (var iOsobaIDs = 0; iOsobaIDs<osobaIDsCnt; iOsobaIDs++)
						   			{

						          var typOsoby = osobaIDs[iOsobaIDs].SKCODELISTS_103_510_AttrPtrCisSUSR4001.SKCODELISTS_103_510_AttrStrCode;
						          if(typOsoby != null) {
						            if(typOsoby == 7) {
						              TraceText("typ osoby PO ");
						              logFile.WriteLine(" PO");

						              os.SKCODELISTS_103_510_AttrPtrCisSUSR0062;

						              TraceText("Meno fo: ", os.SKCODELISTS_103_510_AttrStrOsobaMeno);
						              TraceText("Plne meno pravnickej osoby: ", os.SKCODELISTS_103_510_AttrStrPOPlneMeno);
						              if(os.SKCODELISTS_103_510_AttrStrOsobaMeno != null) {
						                os.SKCODELISTS_103_510_AttrStrOsobaMeno = null;
						              }
						              if(os.ELISTS_103_510_AttrStrOsobaPriezvisko != null) {
						                os.ELISTS_103_510_AttrStrOsobaPriezvisko = null;
						              }

						              if(os.SKCODELISTS_103_510_AttrStrOsobaRodnePriezvisko != null) {
						                os.SKCODELISTS_103_510_AttrStrOsobaRodnePriezvisko = null;
						              }
						              if(os.SKCODELISTS_103_510_AttrPtrCisSUSR0063 != null) {
						                os.SKCODELISTS_103_510_AttrPtrCisSUSR0063 = null;
						              }
						              if(os.SKCODELISTS_103_510_AttrDateFONarodenieDatum != null) {
						                os.SKCODELISTS_103_510_AttrDateFONarodenieDatum = null;
						              }
						              if(os.SKCODELISTS_103_510_AttrPtrCisSUSR3003 != null) {
						                os.SKCODELISTS_103_510_AttrPtrCisSUSR3003 = null;
						              }
						              if(os.ODELISTS_103_510_AttrPtrCisSUSR4002 != null) {
						                os.ODELISTS_103_510_AttrPtrCisSUSR4002 = null;
						              }
						              if(os.SKCODELISTS_103_510_AttrPtrSUSR0086 != null) {
						                os.SKCODELISTS_103_510_AttrPtrSUSR0086 = null;
						              }
						              if(os.SKCODELISTS_103_510_AttrPtrNarodnost != null) {
						                os.SKCODELISTS_103_510_AttrPtrNarodnost = null;
						              }
						              if(os.SKCODELISTS_103_510_AttrDateFOUmrtieDatum != null) {
						                os.SKCODELISTS_103_510_AttrDateFOUmrtieDatum = null;
						              }
						              if(os.SKCODELISTS_103_510_AttrPtrCisSUSR4003 != null) {
						                os.SKCODELISTS_103_510_AttrPtrCisSUSR4003 = null;
						              }
						              if(os.SKCODELISTS_103_510_AttrPtrCisSUSR5598 != null) {
														TraceText("vymaz adresu ");
						                os.SKCODELISTS_103_510_AttrPtrCisSUSR5598 = null;
						              }
													// TraceText(" os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka ", os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka);
													// if(os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka != null) {
													// 	TraceText(" vymazavam adresu ", os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka);
													// 	os.SetAttributeValue(cootx, "SKCODELISTS@103.510:AttrAggrAdresaFyzicka", 0, null);
													// 	TraceText(" agregat adresa: ", os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka);
													// }

						              TraceText(" PO ok");

						            }  else {
						              TraceText("typ osoby naznamy ");
						            }

						          } else {
						            TraceText(" typ osoby je null ");
						          }

						   			}
						   		 }


						    }

					}
				}

				//zavolaj metodu kontroly/pridania osoby
				objclass.CallMethod(cootx, osobaMeth);

				//precitaj vystup metody (objekt)
				var osoba = osobaMeth.GetParameterValue(1);

			//	osoba.SetAttributeValue(cootx, "SKPRECONFIGSK@103.510:objid", 0, jrzId);
				TraceText("### OSOBA vysledok: " + jrzId + ";" + osoba.GetAddress());


            if(lineNum != 1) {

							if(fileLineArr[6] == "") {
								logFile.WriteLine(fileLineArr[1]);
							} else {
								logFile.WriteLine(fileLineArr[6]);
							}
              logFile.WriteLine(osoba.GetAddress()); // 666


            }


      }
    }
  }



  catch (e)
  {
    //error processing line
    TraceText(scriptName + " - ERROR - chyba pri spracovani riadka "+lineNum+": " + e.message);
    if (doLogFile)
    {
      logFile.WriteLine("ERROR - chyba pri spracovani riadka "+lineNum+": " + e.message);
    }
  }

 if(commitovanie > 50) {
	 coouser.FSCVAPP_1_1001_CommitRoot(cootx);
	 TraceText(" -COMMIT- ");
	 commitovanie = 0;
 }


}
inFile.Close();
 TraceText(" END - koniec skriptu ");



}
catch(e)
{
	TraceText(scriptName + " - ERROR : " + e.message);
	throw e;
}
