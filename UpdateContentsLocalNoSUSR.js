// LANGUAGE="JScript" 
// ------------------------------------------------------------------------------------------------------
//tento skript je mozne pouzit na serveroch, kde je nakonfigurovana integracia na SUSR
try
{
	coort.Trace("UpdateSourceCont START");
	
	var ImportPath = "D:\\Import\\CDL_import_data\\Demo\\";  //custom import path
	
	var coouser = coort.GetCurrentUser();

	function UpdateSourceCont(COOAddr, FilePath)
	{
		var CodeList = coort.GetObject(COOAddr);
		var UpdateContMeth = CodeList.GetMethod(cootx, "SKCODELISTS@103.510:ActUpdateSourceContentLocal");
		UpdateContMeth.SetParameterValue(1, "COOSYSTEM@1.1:STRING", 0, ImportPath+FilePath);
		CodeList.CallMethod(cootx, UpdateContMeth);
		coouser.FSCVAPP_1_1001_CommitRoot(cootx);
	}

	function UpdateRegister(COOAddr)
	{
		var Register = coort.GetObject(COOAddr);
		var UpdateContMeth = Register.GetMethod(cootx, "SKCODELISTS@103.510:ActUpdateRegister");
		Register.CallMethod(cootx, UpdateContMeth);
		coouser.FSCVAPP_1_1001_CommitRoot(cootx);
	}
	
	UpdateSourceCont("COO.103.510.1.4650815", "METAIS\\CL010139_External.xml"); //CL010139

	UpdateSourceCont("COO.103.510.1.801059", "Posta\\POBoxy.csv"); //SLP_PSCPOBoxy
	UpdateSourceCont("COO.103.510.1.800524", "Posta\\obce.csv"); //SLP_PSCObce
	UpdateSourceCont("COO.103.510.1.800526", "Posta\\ulice.csv"); //SLP_PSCUlice
	UpdateRegister("COO.103.510.1.800535"); //register PSC

	UpdateSourceCont("COO.103.510.1.800120", "ADM\\ADM0001.csv"); //ADM0001
	UpdateSourceCont("COO.103.510.1.800133", "ADM\\ADM0002.csv"); //ADM0002
	
	UpdateSourceCont("COO.103.510.1.800572", "Registre\\REGMENY.csv"); //REGMENY
	UpdateSourceCont("COO.103.510.1.800571", "Registre\\REGBANKY.csv"); //REGBANKY
	UpdateSourceCont("COO.103.510.1.801081", "Registre\\REGKU.csv"); //REGKU
	
	coort.Trace("UpdateSourceCont END");
}
catch(e)
{
	coort.Trace("UpdateSourceCont error: " + e.message);
	throw e;
}