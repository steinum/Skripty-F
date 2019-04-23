// LANGUAGE="JScript"

/*
Skript opravuje import osob z JRZ

-Vytvara, alebo upravuje adresu
-Posiela adresu ako parameter pre akciu vytvarania osoby
-Vymazava udaje ak je PO, tak zo zalozky FO a ak je FO, tak zo zalozky PO
-Vytvori, alebo upravi osobu

*/

//---------------------CONFIGURABLES---------------------------
var scriptName = "OpravaJRZ";
var inFile = "C:\\Program Files\\Import\\Import_adresy_TESTPPA.csv"; //  D:\\jrz\\import_test.csv
var logDirPath = "C:\\Program Files\\Import\\"; // D:\\jrz\\
var doLogFile = true; // vytvorenie LOGU
var doTrace = true; // trace vypis

// GLOBALNE PREMENNE
var coouser = coort.GetCurrentUser();

var adresa;
var adresaGeo;

var fso;


//----------------------FUNCTIONS-------------------------------------

// vracia boolean hodnotu podla toho s akym argumentom zavolame metodu
function IsNullOrEmpty(inStr) {
  if (inStr == null || inStr == "") {
    return true;
  } else {
    return false;
  }
}

// trace vypis
function TraceText(traceStr) {
  if (doTrace)
    coort.Trace(scriptName + " - " + traceStr);
}

// vytvaranie log file
function vytvorLog() {
  var logPath = logDirPath + scriptName + ".txt";
  var logFile = null;
  if (doLogFile) {
    TraceText(" > VYTVARAM LOGFILE  ");
    logFile = fso.CreateTextFile(logPath, true);
    if (logFile != null)
      TraceText(" > LOG FILE VYTVORENY ", logFile);
  }
}

// adresa
function adresaInit() {
  //ulica|obec|cisloPopisne|cisloOrientacne|POBOX|PSC|stat
  var adresaMeth = objclass.GetMethod(cootx, "SKCODELISTS@103.510:ActCheckAndAddAddress");

  adresaMeth.SetParameterValue(2, "COOSYSTEM@1.1:STRING", 0, ulica);
  adresaMeth.SetParameterValue(3, "COOSYSTEM@1.1:STRING", 0, obec);
  adresaMeth.SetParameterValue(4, "COOSYSTEM@1.1:STRING", 0, supisneCislo);
  adresaMeth.SetParameterValue(5, "COOSYSTEM@1.1:STRING", 0, orientacneCislo);
  adresaMeth.SetParameterValue(6, "COOSYSTEM@1.1:STRING", 0, pOBOX);
  adresaMeth.SetParameterValue(7, "COOSYSTEM@1.1:STRING", 0, psc);

  //najdi a nastav stat
  if (statSusr_CL000086 != null) {
    var query = "SELECT objname FROM SKCODELISTS@103.510:ObjClassRegItemStat WHERE .SKCODELISTS@103.510:AttrStrCode = " + statSusr_CL000086;
    var searchmeth = objclass.GetMethod(cootx, "FSCAREXT@1.1001:ExecuteQuery");
    searchmeth.SetParameterValue(1, "COOSYSTEM@1.1:STRING", 0, query);
    objclass.CallMethod(cootx, searchmeth);
    var objlist = searchmeth.GetParameter3(2);

    if (objlist != null) {
      objlist = objlist.toArray();
      if (objlist.length > 0) {
        adresaMeth.SetParameterValue(10, "COOSYSTEM@1.1:OBJECT", 0, objlist[0]);
      }
    }
  }

  //typ adresy
  var typAdresy;

  if (ulica == '' && pOBOX != '') {
    typAdresy = 20;
  } else {
    typAdresy = 10;
  }
  adresaMeth.SetParameterValue(11, "SKCODELISTS@103.510@1.1:TypeEnumTargetType", 0, typAdresy);
  //adresaMeth.SetParameterValue(12, "COOSYSTEM@1.1:BOOLEAN", 0 , true); //666

  //zavolaj metodu upravy/pridania adresy
  objclass.CallMethod(cootx, adresaMeth);

  //precitaj vystup metody (objekt)
  adresa = adresaMeth.GetParameterValue(1);
  TraceText("### ADRESA vysledok: " + jrzId + " adresa COO: " + adresa.GetAddress() + " druh adr: " + druhAdersySusr_CL010139 + " adresa: " + adresa);
}

// adresaGeo
function adresaGeoInit() {
  //ulica|obec|cisloPopisne|cisloOrientacne|POBOX|PSC|stat
  var adresaMeth = objclass.GetMethod(cootx, "SKCODELISTS@103.510:ActCheckAndAddAddressGEO");

  adresaMeth.SetParameterValue(2, "COOSYSTEM@1.1:STRING", 0, ulica);
  adresaMeth.SetParameterValue(3, "COOSYSTEM@1.1:STRING", 0, supisneCislo);
  adresaMeth.SetParameterValue(4, "COOSYSTEM@1.1:STRING", 0, orientacneCislo);
  adresaMeth.SetParameterValue(5, "COOSYSTEM@1.1:STRING", 0, psc);
  adresaMeth.SetParameterValue(6, "COOSYSTEM@1.1:STRING", 0, obec);
  if (okresSusr_0048 != null) {
    adresaMeth.SetParameterValue(7, "COOSYSTEM@1.1:STRING", 0, okresSusr_0048);
  }

  //najdi a nastav stat
  if (statSusr_CL000086 != null) {
    var query = "SELECT objname FROM SKCODELISTS@103.510:ObjClassRegItemStat WHERE .SKCODELISTS@103.510:AttrStrCode = " + statSusr_CL000086;
    var searchmeth = objclass.GetMethod(cootx, "FSCAREXT@1.1001:ExecuteQuery");
    searchmeth.SetParameterValue(1, "COOSYSTEM@1.1:STRING", 0, query);
    objclass.CallMethod(cootx, searchmeth);
    var objlist = searchmeth.GetParameter3(2);
    if (objlist != null) {
      objlist = objlist.toArray();
      if (objlist.length > 0) {
        adresaMeth.SetParameterValue(10, "COOSYSTEM@1.1:OBJECT", 0, objlist[0]);
      }
    }
  }

  //adresaMeth.SetParameterValue(12, "COOSYSTEM@1.1:BOOLEAN", 0 , true); //666

  //zavolaj metodu upravy/pridania adresy
  objclass.CallMethod(cootx, adresaMeth);

  //precitaj vystup metody (objekt)
  adresaGeo = adresaMeth.GetParameterValue(1);
  TraceText("### ADRESA-GEO vysledok: " + jrzId + " adresa COO: " + adresa.GetAddress() + " druh adr: " + druhAdersySusr_CL010139 + " adresa: " + adresa);
}

//ActCheckAndAddOsoba
function vytvorOsobu(adresaIna) {

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
  if (ICO != "") {
    Identifikator = ICO;
  }
  if (RodneCislo != "") {
    Identifikator = RodneCislo;
  }

  var TypIdentifikatoru = "";
  if (ICO != "") {
    TypIdentifikatoru = "7";
  }
  if (RodneCislo != "") {
    TypIdentifikatoru = "9";
  }

  TraceText("Identifikator: ", Identifikator);
  TraceText("TypIdentifikatoru: ", TypIdentifikatoru);

  var objclass = coort.GetObjectClass("COOSYSTEM@1.1:Object");

  //ICO alebo RC|TypIdentifikatoru|Titul|Meno|Priezvisko|Firma|Email|Adresa|DatumNarodenia|TypAdresy
  var osobaMeth = objclass.GetMethod(cootx, "SKCODELISTS@103.510:ActCheckAndAddOsoba");

  TraceText("_set parametrov_");
  osobaMeth.SetParameterValue(2, "COOSYSTEM@1.1:STRINGLIST", 0, Identifikator);
  osobaMeth.SetParameterValue(3, "COOSYSTEM@1.1:STRINGLIST", 0, TypIdentifikatoru);
  osobaMeth.SetParameterValue(4, "COOSYSTEM@1.1:STRING", 0, titulPredMenom);
  osobaMeth.SetParameterValue(5, "COOSYSTEM@1.1:STRING", 0, Meno);
  osobaMeth.SetParameterValue(6, "COOSYSTEM@1.1:STRING", 0, priezvisko);
  osobaMeth.SetParameterValue(9, "COOSYSTEM@1.1:STRING", 0, NazovPO);
  osobaMeth.SetParameterValue(11, "COOSYSTEM@1.1:STRING", 0, email);

  TraceText("adresaIna: ", adresaIna);
  if (adresaIna != null) {
    osobaMeth.SetParameterValue(12, "COOSYSTEM@1.1:OBJECT", 0, adresaIna);
  }
}

TraceText("::::::::::druhAdersySusr_CL010139: ", druhAdersySusr_CL010139);
if (druhAdersySusr_CL010139 == "200001") {
  TraceText("200001 v if ");
  if (adresa != "") {
    TraceText("adresa: ", adresa);
    osobaMeth.SetParameterValue(12, "COOSYSTEM@1.1:OBJECT", 0, adresaIna); // ADRESA 666
  } else {
    TraceText("adresa je null");
  }

} else {
  TraceText("100001 v if ");
  if (adresaGeo != "") {
    TraceText("adresaGeo: ", adresaGeo);
    osobaMeth.SetParameterValue(12, "COOSYSTEM@1.1:OBJECT", 0, adresaGeo); // ADRESA 666
  } else {
    TraceText("adresaGeo je null");
  }
}

TraceText("datum narodenia ");
osobaMeth.SetParameterValue(14, "COOSYSTEM@1.1:DATETIME", 0, DatumNarodenia);
//osobaMeth.SetParameterValue(17, "COOSYSTEM@1.1:OBJECT", 0, druhAdersySusr_CL010139); //
TraceText("boolean true ");
osobaMeth.SetParameterValue(18, "COOSYSTEM@1.1:BOOLEAN", 0, true);

TraceText("_set parametrov koniec2_ ");

// najde osobu podla identifikatora a vymaze data z nepotrebnej zalozky + vymaze aktualnu adresu
if (TypIdentifikatoru == "9") {
  // FO
  if (RodneCislo != null) {
    var query = "SELECT COOSYSTEM@1.1:objname FROM SKCODELISTS@103.510:ObjClassOsoba WHERE .SKCODELISTS@103.510:AttrAggrIdentifikatory.SKCODELISTS@103.510:AttrStrIdentifikator = \"" + RodneCislo + "\"";

    var osobaVyhladana = coort.SearchObjectsAsync(cootx, query); //SearchObjects3
    var foundObjs = null;
    foundObjs = osobaVyhladana.GetObjects(5);

    if (foundObjs == null || foundObjs.length < 1) {
      TraceText(scriptName + " - ziadne (dalsie) objekty na spracovanie");
    } else {
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
      if (osobaIDs != null) {
        var osobaIDsCnt = 0;
        osobaIDs = osobaIDs.toArray();

        osobaIDsCnt = osobaIDs.length;
        for (var iOsobaIDs = 0; iOsobaIDs < osobaIDsCnt; iOsobaIDs++) {

          var typOsoby = osobaIDs[iOsobaIDs].SKCODELISTS_103_510_AttrPtrCisSUSR4001.SKCODELISTS_103_510_AttrStrCode;
          if (typOsoby != null) {
            if (typOsoby == 9) {
              TraceText("typ osoby FO ");
              logFile.WriteLine(" FO");

              TraceText("Meno fo: ", os.SKCODELISTS_103_510_AttrStrOsobaMeno);
              TraceText("Plne meno pravnickej osoby: ", os.SKCODELISTS_103_510_AttrStrPOPlneMeno);
              if (os.SKCODELISTS_103_510_AttrStrPOPlneMeno != null) {
                os.SKCODELISTS_103_510_AttrStrPOPlneMeno = null;
              }
              if (os.SKCODELISTS_103_510_AttrPtrCisSUSR0056 != null) {
                os.SKCODELISTS_103_510_AttrPtrCisSUSR0056 = null;
              }
              if (os.SKCODELISTS_103_510_AttrDatePOZalozenie != null) {
                os.SKCODELISTS_103_510_AttrDatePOZalozenie = null;
              }
              if (os.SKCODELISTS_103_510_AttrDatePOZanik != null) {
                os.SKCODELISTS_103_510_AttrDatePOZanik = null;
              }
              if (os.SKCODELISTS_103_510_AttrPtrPOPredmetCinnostiOKEC != null) {
                os.SKCODELISTS_103_510_AttrPtrPOPredmetCinnostiOKEC = null;
              }
              if (os.SKCODELISTS_103_510_AttrPtrPOVelkostOrganizacie != null) {
                os.SKCODELISTS_103_510_AttrPtrPOVelkostOrganizacie = null;
              }
              if (os.SKCODELISTS_103_510_AttrPtrPOOrganizacnaJednotka != null) {
                os.SKCODELISTS_103_510_AttrPtrPOOrganizacnaJednotka = null;
              }
              if (os.SKCODELISTS_103_510_AttrPtrSuperiorPersons != null) {
                os.SKCODELISTS_103_510_AttrPtrSuperiorPersons = null;
              }
              if (os.SKCODELISTS_103_510_AttrAggrContactPersons != null) {
                os.SKCODELISTS_103_510_AttrAggrContactPersons = null;
              }
              TraceText(" os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka ", os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka);
              if (os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka != null) {
                TraceText(" vymazavam adresu ", os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka);
                os.SetAttributeValue(cootx, "SKCODELISTS@103.510:AttrAggrAdresaFyzicka", 0, null);
                TraceText(" agregat adresa: ", os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka);
              }


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
  if (ICO != null) {
    var query = "SELECT COOSYSTEM@1.1:objname FROM SKCODELISTS@103.510:ObjClassOsoba WHERE .SKCODELISTS@103.510:AttrAggrIdentifikatory.SKCODELISTS@103.510:AttrStrIdentifikator = \"" + ICO + "\"";

    var osobaVyhladana = coort.SearchObjectsAsync(cootx, query); //SearchObjects3
    var foundObjs = null;
    foundObjs = osobaVyhladana.GetObjects(5);

    if (foundObjs == null || foundObjs.length < 1) {
      TraceText(scriptName + " - ziadne (dalsie) objekty na spracovanie");
    } else {
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
      if (osobaIDs != null) {
        var osobaIDsCnt = 0;
        osobaIDs = osobaIDs.toArray();

        //zmazanie ID z druheho riadku
        TraceText("osobaIDs: ", osobaIDs);
        if (osobaIDs[1] != null) {
          TraceText("_____v if ", osobaIDs[1]);
          osobaIDs = null;
        }

        osobaIDsCnt = osobaIDs.length;
        for (var iOsobaIDs = 0; iOsobaIDs < osobaIDsCnt; iOsobaIDs++) {

          var typOsoby = osobaIDs[iOsobaIDs].SKCODELISTS_103_510_AttrPtrCisSUSR4001.SKCODELISTS_103_510_AttrStrCode;
          if (typOsoby != null) {
            if (typOsoby == 7) {
              TraceText("typ osoby PO ");
              logFile.WriteLine(" PO");

              os.SKCODELISTS_103_510_AttrPtrCisSUSR0062;

              TraceText("Meno fo: ", os.SKCODELISTS_103_510_AttrStrOsobaMeno);
              TraceText("Plne meno pravnickej osoby: ", os.SKCODELISTS_103_510_AttrStrPOPlneMeno);
              if (os.SKCODELISTS_103_510_AttrStrOsobaMeno != null) {
                os.SKCODELISTS_103_510_AttrStrOsobaMeno = null;
              }
              if (os.ELISTS_103_510_AttrStrOsobaPriezvisko != null) {
                os.ELISTS_103_510_AttrStrOsobaPriezvisko = null;
              }

              if (os.SKCODELISTS_103_510_AttrStrOsobaRodnePriezvisko != null) {
                os.SKCODELISTS_103_510_AttrStrOsobaRodnePriezvisko = null;
              }
              if (os.SKCODELISTS_103_510_AttrPtrCisSUSR0063 != null) {
                os.SKCODELISTS_103_510_AttrPtrCisSUSR0063 = null;
              }
              if (os.SKCODELISTS_103_510_AttrDateFONarodenieDatum != null) {
                os.SKCODELISTS_103_510_AttrDateFONarodenieDatum = null;
              }
              if (os.SKCODELISTS_103_510_AttrPtrCisSUSR3003 != null) {
                os.SKCODELISTS_103_510_AttrPtrCisSUSR3003 = null;
              }
              if (os.ODELISTS_103_510_AttrPtrCisSUSR4002 != null) {
                os.ODELISTS_103_510_AttrPtrCisSUSR4002 = null;
              }
              if (os.SKCODELISTS_103_510_AttrPtrSUSR0086 != null) {
                os.SKCODELISTS_103_510_AttrPtrSUSR0086 = null;
              }
              if (os.SKCODELISTS_103_510_AttrPtrNarodnost != null) {
                os.SKCODELISTS_103_510_AttrPtrNarodnost = null;
              }
              if (os.SKCODELISTS_103_510_AttrDateFOUmrtieDatum != null) {
                os.SKCODELISTS_103_510_AttrDateFOUmrtieDatum = null;
              }
              if (os.SKCODELISTS_103_510_AttrPtrCisSUSR4003 != null) {
                os.SKCODELISTS_103_510_AttrPtrCisSUSR4003 = null;
              }
              if (os.SKCODELISTS_103_510_AttrPtrCisSUSR5598 != null) {
                TraceText("vymaz adresu ");
                os.SKCODELISTS_103_510_AttrPtrCisSUSR5598 = null;
              }
              TraceText(" os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka ", os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka);
              if (os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka != null) {
                TraceText(" vymazavam adresu ", os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka);
                os.SetAttributeValue(cootx, "SKCODELISTS@103.510:AttrAggrAdresaFyzicka", 0, null);
                TraceText(" agregat adresa: ", os.SKCODELISTS_103_510_AttrAggrAdresaFyzicka);
              }

              TraceText(" PO ok");

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
}

//zavolaj metodu kontroly/pridania osoby
objclass.CallMethod(cootx, osobaMeth);

//precitaj vystup metody (objekt)
var osoba = osobaMeth.GetParameterValue(1);

//	osoba.SetAttributeValue(cootx, "SKPRECONFIGSK@103.510:objid", 0, jrzId);
TraceText("### OSOBA vysledok: " + jrzId + ";" + osoba.GetAddress());



//----------------------MAIN_CODE-----------------------------------------------------

try {
  TraceText(scriptName + "  START -->");

  fso = new ActiveXObject("Scripting.FileSystemObject");

  // vytvor log
  vytvorLog();

  //nacitanie csv - read file
  TraceText(" >> otvaram csv subor na import ", fso.FileExists(inFile));
  if (fso.FileExists(inFile)) {
    var inFile = fso.OpenTextFile(inFile, 1);
  }

  TraceText(" >>> nacitavam data... ");

  var lineNum = 0;

  while (!inFile.AtEndOfStream) {
    TraceText(" >>>> spracovavam riadok  ", lineNum);

    //nacita riadok okrem hlavicky
    if (lineNum != 0)
      var fileLine = inFile.ReadLine(); // nacitaj riadok

    //riadok nacitany inkrementuj hodnotu
    lineNum++;

    //po nacitani urciteho poctu riadkov sa vykonava commit
    var commitovanie = lineNum;

    TraceText(" fileLine:  " + fileLine + " line number: " + lineNum);

    try {
      TraceText(" >>>>> pozeram ci riadok nie je prazdny ");
      if (!IsNullOrEmpty(fileLine)) // ak riadok nie je prazdny
        TraceText(" >>>>>> riadok nie je prazdny "); {
        var fileLineArr = fileLine.split(";"); // pozrie po prvu bodkociarku
        TraceText(" fileLineArr ", fileLineArr);
        if (fileLineArr.length > 1) { // ak daka je
          // udaje v csv
          TraceText(" Vypis hodnot z csv ");
          if (fileLineArr[0] != "") {
            TraceText("ICO: " + fileLineArr[0]);
          }
          if (fileLineArr[1] != "") {
            TraceText("Osoba PO nazov: " + fileLineArr[1]);
          }
          if (fileLineArr[2] != "") {
            TraceText("RC: " + fileLineArr[3]);
          }
          if (fileLineArr[5] != "") {
            TraceText("meno: " + fileLineArr[5]);
          }
          if (fileLineArr[6] != "") {
            TraceText("priezvysko: " + fileLineArr[6]);
          }
          if (fileLineArr[8] != "") {
            TraceText("datum narodenia: " + fileLineArr[8]);
          }
          TraceText(":::::::::::::: ");

          var jrzId = fileLineArr[14];
          if (fileLineArr[14] != "") {
            TraceText("jrzId: " + fileLineArr[14]);
          }
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
          if (druhAdersySusr_CL010139 == "200001") {
            TraceText(" druh adresy 200001");

            // sem pridat volanie metody adresa
            adresaInit();

          } else { // ::::::::::::::::::::::::::::::::: druh adresy 100001 - geo   :::::::::::::::::::::::::::::::::::::::::::::::::::::::::
            TraceText(" druh adresy 100001");

            // sem pridat metodu adresaGeo
            adresaGeoInit();
          }

          // 444

          if (lineNum != 1) {

            if (fileLineArr[6] == "") {
              logFile.WriteLine(fileLineArr[1]);
            } else {
              logFile.WriteLine(fileLineArr[6]);
            }
            logFile.WriteLine(osoba.GetAddress()); // 666


          }


        }
      }
    } catch (e) {
      //error processing line
      TraceText(scriptName + " - ERROR - chyba pri spracovani riadka " + lineNum + ": " + e.message);
      if (doLogFile) {
        logFile.WriteLine("ERROR - chyba pri spracovani riadka " + lineNum + ": " + e.message);
      }
    }

    if (commitovanie > 50) {
      coouser.FSCVAPP_1_1001_CommitRoot(cootx);
      TraceText(" -COMMIT- ");
      commitovanie = 0;
    }


  }
  inFile.Close();
  TraceText(" END - koniec skriptu ");



} catch (e) {
  TraceText(scriptName + " - ERROR : " + e.message);
  throw e;
}