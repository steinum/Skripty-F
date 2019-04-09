//LANGUAGE="JScript"
//20170404 LCU: doplneny cislnik meny CL010138 a update registra meny z tohto ciselnika
//skript pouzit az po nahrati noveho ciselnika
//---------Update ciselniky SUSR------------------------------
try
{
	coort.Trace("Start update ciselniky SUSR");
	
	var coouser = coort.GetCurrentUser();
	
	function UpdateCodelistSUSR(COOAddr)
	{
		var CodeList = coort.GetObject(COOAddr);
		var UpdateCodelistSUSRMeth = CodeList.GetMethod(cootx, "SKCODELISTS@103.510:ActUpdateCodelistSUSR");
		CodeList.CallMethod(cootx, UpdateCodelistSUSRMeth);
		coouser.FSCVAPP_1_1001_CommitRoot(cootx);
	}

	UpdateCodelistSUSR("COO.103.510.1.800031"); //SUSR0023
	UpdateCodelistSUSR("COO.103.510.1.800033"); //SUSR0024
	UpdateCodelistSUSR("COO.103.510.1.800034"); //SUSR0025
	UpdateCodelistSUSR("COO.103.510.1.800117"); //SUSR0036
	UpdateCodelistSUSR("COO.103.510.1.800053"); //SUSR0045
	UpdateCodelistSUSR("COO.103.510.1.800045"); //SUSR0048
	UpdateCodelistSUSR("COO.103.510.1.800046"); //SUSR0049
	UpdateCodelistSUSR("COO.103.510.1.800047"); //SUSR0051
	UpdateCodelistSUSR("COO.103.510.1.800048"); //SUSR0052
	UpdateCodelistSUSR("COO.103.510.1.800049"); //SUSR0053
	UpdateCodelistSUSR("COO.103.510.1.800050"); //SUSR0054
	UpdateCodelistSUSR("COO.103.510.1.800104"); //SUSR0056
	UpdateCodelistSUSR("COO.103.510.1.800105"); //SUSR0062
	UpdateCodelistSUSR("COO.103.510.1.800106"); //SUSR0063
	UpdateCodelistSUSR("COO.103.510.1.800118"); //SUSR0073
	UpdateCodelistSUSR("COO.103.510.1.800116"); //SUSR0076
	UpdateCodelistSUSR("COO.103.510.1.800036"); //SUSR0086
	UpdateCodelistSUSR("COO.103.510.1.800054"); //SUSR0089
	UpdateCodelistSUSR("COO.103.510.1.800052"); //SUSR0090
	UpdateCodelistSUSR("COO.103.510.1.800027"); //SUSR0102
	UpdateCodelistSUSR("COO.103.510.1.800107"); //SUSR3003
	UpdateCodelistSUSR("COO.103.510.1.800032"); //SUSR4001
	UpdateCodelistSUSR("COO.103.510.1.800108"); //SUSR4002
	UpdateCodelistSUSR("COO.103.510.1.800109"); //SUSR4003
	UpdateCodelistSUSR("COO.103.510.1.800110"); //SUSR4004
	UpdateCodelistSUSR("COO.103.510.1.800111"); //SUSR4005
	UpdateCodelistSUSR("COO.103.510.1.800112"); //SUSR5202
	UpdateCodelistSUSR("COO.103.510.1.800115"); //SUSR5205
	UpdateCodelistSUSR("COO.103.510.1.800712"); //SUSR5502
	UpdateCodelistSUSR("COO.103.510.1.800178"); //SUSR5598
	
	UpdateCodelistSUSR("COO.103.510.1.4611896"); //CL010108
	UpdateCodelistSUSR("COO.103.510.1.4630916"); //CL010109
	UpdateCodelistSUSR("COO.103.510.1.4611895"); //CL010110
	UpdateCodelistSUSR("COO.103.510.1.4611897"); //CL010111
	UpdateCodelistSUSR("COO.103.510.1.4631001"); //CL010112
	UpdateCodelistSUSR("COO.103.510.1.4611898"); //CL010113
	UpdateCodelistSUSR("COO.103.510.1.4672912"); //CL010138
	UpdateCodelistSUSR("COO.103.510.1.4611894"); //CL010139

	coort.Trace("END update ciselniky SUSR");
}
catch(e)
{
	coort.Trace("Update ciselniky SUSR error: " + e.message);
	throw e;
}