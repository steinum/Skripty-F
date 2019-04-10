// LANGUAGE="JScript"

//Skript opravuje import osob z JRZ
var scriptName = "OpravaJRZ";

try
{

coort.Trace(scriptName + "  START -->");

//---------------------CONFIGURABLES---------------------------
var inFile = "D:\\jrz\\CSV_od_Jakuba_COO_adresy_prvy_import_mapovanie_osoby_adresy.csv";
var logDirPath = "D:\\jrz\\";
var doLogFile = true;

//create log file
var dateFormated = GetFormatedDate(startDate);
var logPath = logDirPath + scriptName + ".txt";
var fso = new ActiveXObject("Scripting.FileSystemObject");
var logFile = null;
if (doLogFile)
{
  logFile = fso.CreateTextFile(logPath, true);
}

//nacitanie csv - read file
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

        // trace toho co vypise
        
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









}
catch(e)
{
	coort.Trace(scriptName + " - ERROR : " + e.message);
	throw e;
}
