//LANGUAGE="JScript"
//---------Update ciselniky SLP PSC------------------------------
coort.Trace("Start update ciselniky SLP PSC");
try
{

var UpdateCdlSLPPSCAct = coort.GetObject("COO.103.510.1.4558597");

UpdateCdlSLPPSCMeth = UpdateCdlSLPPSCAct.GetMethod(cootx, "SKCODELISTS@103.510:ActUpdateCDLSLPPSC");
UpdateCdlSLPPSCAct.CallMethod(cootx, UpdateCdlSLPPSCMeth);

coort.Trace("End update ciselniky SLP PSC");
}
catch(e)
{
	coort.Trace("Update ciselniky SLP PSC error: " + e.message);
	throw e;
}