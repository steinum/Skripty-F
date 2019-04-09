// LANGUAGE="JScript" 
// ------------------------------------------------------------------------------------------------------
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

	UpdateSourceCont("COO.103.510.1.800031", "SUSR\\0023_RSUJ3.xml"); //SUSR0023
	UpdateSourceCont("COO.103.510.1.800033", "SUSR\\0024_LSUJ1.xml"); //SUSR0024
	UpdateSourceCont("COO.103.510.1.800034", "SUSR\\0025_LSUJ2.xml"); //SUSR0025
	UpdateSourceCont("COO.103.510.1.800117", "SUSR\\0036_DRVLST.xml"); //SUSR0036
	UpdateSourceCont("COO.103.510.1.800053", "SUSR\\0045_OBVOD.xml"); //SUSR0045
	UpdateSourceCont("COO.103.510.1.800045", "SUSR\\0048_OKRES96.xml"); //SUSR0048
	UpdateSourceCont("COO.103.510.1.800046", "SUSR\\0049_KRAJ96.xml"); //SUSR0049
	UpdateSourceCont("COO.103.510.1.800047", "SUSR\\0051_ICZUJ.xml"); //SUSR0051
	UpdateSourceCont("COO.103.510.1.800048", "SUSR\\0052_ICUTJ.xml"); //SUSR0052
	UpdateSourceCont("COO.103.510.1.800049", "SUSR\\0053_ICZSJ.xml"); //SUSR0053
	UpdateSourceCont("COO.103.510.1.800050", "SUSR\\0054_SUJ.xml"); //SUSR0054
	UpdateSourceCont("COO.103.510.1.800104", "SUSR\\0056_FORMA.xml"); //SUSR0056
	UpdateSourceCont("COO.103.510.1.800105", "SUSR\\0062_TITPRED.xml"); //SUSR0062
	UpdateSourceCont("COO.103.510.1.800106", "SUSR\\0063_TITZA.xml"); //SUSR0063
	UpdateSourceCont("COO.103.510.1.800118", "SUSR\\0073_KATP97.xml"); //SUSR0073
	UpdateSourceCont("COO.103.510.1.800116", "SUSR\\0076_ESU95.xml"); //SUSR0076
	UpdateSourceCont("COO.103.510.1.800036", "SUSR\\0086_KRAJOSN.xml"); //SUSR0086
	UpdateSourceCont("COO.103.510.1.800054", "SUSR\\0089_MATRIKY.xml"); //SUSR0089
	UpdateSourceCont("COO.103.510.1.800052", "SUSR\\0090_MESTA.xml"); //SUSR0090
	UpdateSourceCont("COO.103.510.1.800027", "SUSR\\0102_POHLAVIE.xml"); //SUSR0102
	UpdateSourceCont("COO.103.510.1.800107", "SUSR\\3003_POHLAV.xml"); //SUSR3003
	UpdateSourceCont("COO.103.510.1.800032", "SUSR\\4001_ID.xml"); //SUSR4001
	UpdateSourceCont("COO.103.510.1.800108", "SUSR\\4002_RODSTAV7.xml"); //SUSR4002
	UpdateSourceCont("COO.103.510.1.800109", "SUSR\\4003_EXSTAV.xml"); //SUSR4003
	UpdateSourceCont("COO.103.510.1.800110", "SUSR\\4004_VZTPRIB8.xml"); //SUSR4004
	UpdateSourceCont("COO.103.510.1.800111", "SUSR\\4005_TYPTLFC.xml"); //SUSR4005
	UpdateSourceCont("COO.103.510.1.800112", "SUSR\\5202_SKNACE2.xml"); //SUSR5202
	UpdateSourceCont("COO.103.510.1.800115", "SUSR\\5205_SKNACE5.xml"); //SUSR5205
	UpdateSourceCont("COO.103.510.1.800712", "SUSR\\5502_OKEC5.xml"); //SUSR5502
	UpdateSourceCont("COO.103.510.1.800178", "SUSR\\5598_KZAMR3.xml"); //SUSR5598
	
	UpdateSourceCont("COO.103.510.1.4611896", "SUSR\\CL010108_LEGAL_STATUS.xml"); //CL010108
	UpdateSourceCont("COO.103.510.1.4630916", "SUSR\\CL010109_STAKEHOLDER.xml"); //CL010109
	UpdateSourceCont("COO.103.510.1.4611895", "SUSR\\CL010110_ORGANIZATION_UNIT.xml"); //CL010110
	UpdateSourceCont("COO.103.510.1.4611897", "SUSR\\CL010111_SHARE_TYPE.xml"); //CL010111
	UpdateSourceCont("COO.103.510.1.4631001", "SUSR\\CL010112_SOURCE_REGISTER.xml"); //CL010112
	UpdateSourceCont("COO.103.510.1.4611898", "SUSR\\CL010113_STATUTORY_BODY.xml"); //CL010113
	UpdateSourceCont("COO.103.510.1.4611894", "SUSR\\CL010139_ADDRESS_CLASS.xml"); //CL010139

	UpdateRegister("COO.103.510.1.800472"); //REGSTATY
	UpdateRegister("COO.103.510.1.800091"); //REGKRAJE
	UpdateRegister("COO.103.510.1.800092"); //REGOKRESY
	UpdateRegister("COO.103.510.1.800066"); //REGOBCE

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