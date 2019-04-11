// LANGUAGE="JScript"

//Skript opravuje import osob z JRZ
var scriptName = "OpravaJRZ";

//---------------------CONFIGURABLES---------------------------
var inFile = "D:\\jrz\\CSV_od_Jakuba_COO_adresy_prvy_import_mapovanie_osoby_adresy.csv";
var logDirPath = "D:\\jrz\\";
var doLogFile = true;

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


//----------------------MAIN_CODE-----------------------------------------------------


try
{

coort.Trace(scriptName + "  START -->");

//create log file
var logPath = logDirPath + scriptName + ".txt";
var fso = new ActiveXObject("Scripting.FileSystemObject");
var logFile = null;
if (doLogFile)
{
  coort.Trace("  >>> VYTVARAM LOGFILE  ");
  logFile = fso.CreateTextFile(logPath, true);
}

//nacitanie csv - read file
coort.Trace("  ::: otvaram csv subor   ", fso.FileExists(inFile));
if (fso.FileExists(inFile)) {
var inFile = fso.OpenTextFile(inFile, 1);
}

var lineNum = 0;
while (!inFile.AtEndOfStream) // prvy riadok
{
  coort.Trace("  AtEdnOfStream:  ", lineNum );
  lineNum++;
  var fileLine = inFile.ReadLine(); // nacitaj riadok
  coort.Trace(" fileLine:  ", fileLine );

  try
  {
    coort.Trace(" try2  ");
    if ( !IsNullOrEmpty(fileLine)) // ak riadok nie je prazdny
    coort.Trace(" !IsNullOrEmpty(fileLine)  ", !IsNullOrEmpty(fileLine));
    {
      var fileLineArr = fileLine.split(";"); // pozrie po prvu bodkociarku
      coort.Trace(" fileLineArr:  ", fileLineArr);
      if (fileLineArr.length>1) // ak daka je
      {

        // trace toho co vypise
        coort.Trace("fileLine", fileLine);
        coort.Trace("fileLineArr", fileLineArr);
        coort.Trace("fileLineArr[0] entitiID", fileLineArr[0]);
        coort.Trace("fileLineArr[1] osobaCoo", fileLineArr[1]);
        coort.Trace("fileLineArr[2] DruhAdresy", fileLineArr[2]);
        coort.Trace("fileLineArr[3] adresaCOO", fileLineArr[3]);



        if (doLogFile)
  			{
  				logFile.WriteLine("fileLine: " + fileLine);
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









}
catch(e)
{
	coort.Trace(scriptName + " - ERROR : " + e.message);
	throw e;
}
