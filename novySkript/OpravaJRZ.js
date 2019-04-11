// LANGUAGE="JScript"

//Skript opravuje import osob z JRZ
var scriptName = "OpravaJRZ";

//---------------------CONFIGURABLES---------------------------
var inFile = "D:\\jrz\\spajanie.csv"; // CSV_od_Jakuba_COO_adresy_prvy_import_mapovanie_osoby_adresy.csv
var logDirPath = "D:\\jrz\\";
var doLogFile = true;
var doTrace = true;



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
      if (doTrace) coort.Trace("osobaCoo: " + fileLineArr[1]);


        if (doLogFile)
  			{
          coort.Trace("1 ");
          var poleDuplicit = [];
          coort.Trace("2 ");
          poleDuplicit.push(fileLineArr[1]);
          coort.Trace("3 ");
          poleDuplicit[lineNum] += (fileLineArr[1]) ;
          coort.Trace("4 ");
          coort.Trace("poleDuplicit: ", poleDuplicit[lineNum]);
          coort.Trace("5 ");

          var nic = fileLineArr[1];
          coort.Trace("nic ", nic);
          var hodnotaStavu = poleDuplicit.indexOf(nic);

          coort.Trace("hodnotaStavu - ");
          if(hodnotaStavu >= 0) {
            coort.Trace("hodnotaStavu + ");
            logFile.WriteLine("osobaCoo: " + fileLineArr[1]);
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
