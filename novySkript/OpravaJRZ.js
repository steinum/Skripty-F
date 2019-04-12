// LANGUAGE="JScript"

//Skript opravuje import osob z JRZ
var scriptName = "OpravaJRZ";

//---------------------CONFIGURABLES---------------------------
var inFile = "D:\\jrz\\spajanie.csv"; // CSV_od_Jakuba_COO_adresy_prvy_import_mapovanie_osoby_adresy.csv
var logDirPath = "D:\\jrz\\";
var doLogFile = true;
var doTrace = true;

var stlpecImportu = 0;
// pole pre duplicitu
var ulozenaCooOsoby;
var poleOsob = [];
var bool;
var vyhladajOsobu;
var duplikatOsoba;
var hodnota; // ddddd


var povodnaOsoba;
var selectOsoby;

//----------------------Functions-----------------------------------------------------

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

function SpracujOsobu(povodnaOsoba) {
  if (povodnaOsoba != null) {
     if (doTrace) coort.Trace(" povodnaOsoba: ", povodnaOsoba);

     //selectOsoby =
  }
}


// function DuplikatHodnoty(hodnota) {
//   coort.Trace(" DuplikatHodnoty - funkcia ", hodnota);
//
//   coort.Trace("poleOsob length ", poleOsob.length);
//   var bla = 'a nice string'.indexOf('nice') !== -1
//   coort.Trace(" bla: ", bla);
//   //bool = poleOsob.includes(hodnota);
//   //bool = poleOsob.indexOf(hodnota);
//   if(bool == -1) {
//     vyhladajOsobu = true;
//   } else {
//     vyhladajOsobu = false;
//   }
//   coort.Trace(" duplikat hodnoty funkcia - vysledok: ", vyhladajOsobu);
// }


//----------------------MAIN_CODE-----------------------------------------------------


try
{

if (doTrace) coort.Trace(scriptName + "  START -->");

//create log file
var logPath = logDirPath + scriptName + ".txt";
var fso = new ActiveXObject("Scripting.FileSystemObject");
var logFile = null;
if (doLogFile)
{
 if (doTrace) coort.Trace("  >>> VYTVARAM LOGFILE  ");
  logFile = fso.CreateTextFile(logPath, true);
}

//nacitanie csv - read file
if (doTrace) coort.Trace("  ::: otvaram csv subor   ", fso.FileExists(inFile));
if (fso.FileExists(inFile)) {
var inFile = fso.OpenTextFile(inFile, 1);
}

var lineNum = 0;
while (!inFile.AtEndOfStream) // prvy riadok
{
  if (doTrace) coort.Trace("  AtEdnOfStream:  ", lineNum );
  lineNum++;
  var fileLine = inFile.ReadLine(); // nacitaj riadok
  if (doTrace) coort.Trace(" fileLine:  ", fileLine );

  try
  {
    if (doTrace) coort.Trace(" try2  ");
    if ( !IsNullOrEmpty(fileLine)) // ak riadok nie je prazdny
    if (doTrace) coort.Trace(" !IsNullOrEmpty(fileLine)  ", !IsNullOrEmpty(fileLine));
    {
      var fileLineArr = fileLine.split(";"); // pozrie po prvu bodkociarku
      if (fileLineArr.length>1) // ak daka je
      {

        // trace toho co vypise
      if (doTrace) coort.Trace("osobaCoo: " + fileLineArr[stlpecImportu]);
      ulozenaCooOsoby = fileLineArr[stlpecImportu];
      if (doTrace) coort.Trace("ulozenaCooOsoby: ", ulozenaCooOsoby);

        if (doLogFile)
  			{

            // kontrola duplicity
            // poleOsob.push(ulozenaCooOsoby);
            //coort.Trace("poleOsob: ", poleOsob[lineNum-1]);
            // duplikatOsoba = poleOsob[lineNum-1];
            // coort.Trace("duplikatOsoba: ", duplikatOsoba);
            // var stringPole += ulozenaCooOsoby;
            // coort.Trace("stringPole: ", stringPole);



            // SELECT
            objAdressa = fileLineArr[stlpecImportu];
            var query = "SELECT COOSYSTEM@1.1:objname FROM COOSYSTEM@1.1:Object WHERE .COOSYSTEM@1.1:objaddress = \"" + objAdressa + "\"";
            var osobaVyhladana = coort.SearchObjectsAsync(cootx, query); //SearchObjects3
            var foundObjs = null;
            foundObjs = osobaVyhladana.GetObjects(5);

            if (foundObjs == null || foundObjs.length<1) {
        			coort.Trace(scriptName + " - ziadne (dalsie) objekty na spracovanie");
        		}
        		else
        		{
              foundObjs = foundObjs.toArray();
              var os = foundObjs[0];

               coort.Trace("osobaVyhladana: ", osobaVyhladana);
               //var meno = GetAttributeString(cootx, "CONTACTEXT@15.1001:mlname");
               var meno = os.COOSYSTEM_1_1_objname;

               coort.Trace("vlastnost: ", meno);


               var g = os.SKCODELISTS_103_510_AttrStrPOPlneMeno;
               var m = os.SKCODELISTS_103_510_AttrStrOsobaMeno;

               coort.Trace("nazovPO xxx: ", g);
               coort.Trace("nazovFO xxx: ", m);

               var osobaIDs = os.SKCODELISTS_103_510_AttrAggrIdentifikatory;
               if (osobaIDs!=null) {
                var osobaIDsCnt = 0;
           			osobaIDs = osobaIDs.toArray();
           			osobaIDsCnt = osobaIDs.length;
           			for (var iOsobaIDs = 0; iOsobaIDs<osobaIDsCnt; iOsobaIDs++)
           			{

                  var typOsoby = osobaIDs[iOsobaIDs].SKCODELISTS_103_510_AttrPtrCisSUSR4001.SKCODELISTS_103_510_AttrStrCode;
                  if(typOsoby != null) {
                    if(typOsoby == 7) {
                      coort.Trace("typ osoby PO ");
                      logFile.WriteLine(" PO");

                      os.SKCODELISTS_103_510_AttrPtrCisSUSR0062;

                      coort.Trace("Meno fo: ", os.SKCODELISTS_103_510_AttrStrOsobaMeno);
                      coort.Trace("Plné meno právnickej osoby: ", os.SKCODELISTS_103_510_AttrStrPOPlneMeno);
                      if(os.SKCODELISTS_103_510_AttrStrOsobaMeno != null) {
                        os.SKCODELISTS_103_510_AttrStrOsobaMeno = null;
                      }
                      // os.ELISTS_103_510_AttrStrOsobaPriezvisko = null;
                      // os.SKCODELISTS_103_510_AttrStrOsobaRodnePriezvisko = null;
                      // os.SKCODELISTS_103_510_AttrPtrCisSUSR0063 = null;
                      // os.SKCODELISTS_103_510_AttrDateFONarodenieDatum = null;
                      // os.SKCODELISTS_103_510_AttrPtrCisSUSR3003 = null;
                      // os.ODELISTS_103_510_AttrPtrCisSUSR4002 = null;
                      // os.SKCODELISTS_103_510_AttrPtrSUSR0086 = null;
                      // os.SKCODELISTS_103_510_AttrPtrNarodnost = null;
                      // os.SKCODELISTS_103_510_AttrDateFOUmrtieDatum = null;
                      // os.SKCODELISTS_103_510_AttrPtrCisSUSR4003 = null;
                      // os.SKCODELISTS_103_510_AttrPtrCisSUSR5598 = null;
                      coort.Trace(" PO ok");

                    } else if (typOsoby == 9) {
                      coort.Trace("typ osoby FO ");
                      logFile.WriteLine(" FO");

                      coort.Trace("Meno fo: ", os.SKCODELISTS_103_510_AttrStrOsobaMeno);
                      coort.Trace("Plné meno právnickej osoby: ", os.SKCODELISTS_103_510_AttrStrPOPlneMeno);
                      if(os.SKCODELISTS_103_510_AttrStrPOPlneMeno != null) {
                        os.SKCODELISTS_103_510_AttrStrPOPlneMeno = null;
                      }
                      // os.SKCODELISTS_103_510_AttrPtrCisSUSR0056 = null;
                      // os.SKCODELISTS_103_510_AttrDatePOZalozenie = null;
                      // os.SKCODELISTS_103_510_AttrDatePOZanik = null;
                      // os.SKCODELISTS_103_510_AttrPtrPOPredmetCinnostiOKEC = null;
                      // os.SKCODELISTS_103_510_AttrPtrPOVelkostOrganizacie = null;
                      // os.SKCODELISTS_103_510_AttrPtrPOOrganizacnaJednotka = null;
                      // os.SKCODELISTS_103_510_AttrPtrSuperiorPersons = null;
                      // os.SKCODELISTS_103_510_AttrAggrContactPersons = null;
                      coort.Trace("FO ok");

                    } else {
                      coort.Trace("typ osoby naznamy ");
                    }

                  } else {
                    coort.Trace(" typ osoby je null ");
                  }

           			}
           		 }






               //coort.Trace("osobaVyhladana: ", osobaVyhladana.SKCODELISTS_103_510_AttrAggrIdentifikatory.SKCODELISTS_103_510_AttrPtrCisSUSR4001);
               //praca s osobou - pozretie identifikatora a vymazanie vlastnosti

            }

            if(lineNum != 1) {

                logFile.WriteLine(fileLineArr[stlpecImportu]);

            }



  			}

/*
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

*/

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
  // if (itemsCnt % commitAfter == 0) // ctrl+/
  // {
  //   TraceText("commit "+itemsCnt);
  //   //cootx.Commit();
  //   coouser.FSCVAPP_1_1001_CommitRoot(cootx);
  // }
}
inFile.Close();
 coort.Trace(" END ");



}
catch(e)
{
	coort.Trace(scriptName + " - ERROR : " + e.message);
	throw e;
}
