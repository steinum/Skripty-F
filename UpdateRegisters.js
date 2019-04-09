// LANGUAGE="JScript" 
// ------------------------------------------------------------------------------------------------------
try
{
	coort.Trace("UpdateRegisters START");
	
	var coouser = coort.GetCurrentUser();

	function UpdateRegister(COOAddr)
	{
		var Register = coort.GetObject(COOAddr);
		var UpdateContMeth = Register.GetMethod(cootx, "SKCODELISTS@103.510:ActUpdateRegister");
		Register.CallMethod(cootx, UpdateContMeth);
		coouser.FSCVAPP_1_1001_CommitRoot(cootx);
	}

	UpdateRegister("COO.103.510.1.800472"); //REGSTATY
	UpdateRegister("COO.103.510.1.800091"); //REGKRAJE
	UpdateRegister("COO.103.510.1.800092"); //REGOKRESY
	UpdateRegister("COO.103.510.1.800066"); //REGOBCE
	
	coort.Trace("UpdateRegisters END");
}
catch(e)
{
	coort.Trace("UpdateRegisters - ERROR : " + e.message);
	throw e;
}