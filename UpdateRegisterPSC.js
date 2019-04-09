// LANGUAGE="JScript" 
// ------------------------------------------------------------------------------------------------------
// update registra PSC
// ------------------------------------------------------------------------------------------------------

try
{

function UpdateRegister(COOAddr)
{
       var CodeList = coort.GetObject(COOAddr);
       var UpdateContent = CodeList.GetMethod(cootx, "SKCODELISTS@103.510:ActUpdateRegister");
       CodeList.CallMethod(cootx, UpdateContent);
}

UpdateRegister("COO.103.510.1.800535");  //register PSC

}
catch(e)
{
	coort.Trace("UpdateRegister - ERROR : " + e.message);
	throw e;
}


