/* LANGUAGE="JavaScript"
 * ---------------------------------------------------------------------------
 * Available global Variables:
 *   coort (Components Runtime Object)
 *   cootx (Components Transaction Object)
 *   coolog (XMLLogWriter Object, valid only if logging is not disabled)
 *
 *   cootx is not the transaction that created the objects,
 *   but the data main transaction of the data import
 *   (equal to <cootx> in the filter for raw data)!
 * -------------------------------------------------------------------------*/

/* global code and variables go here */


function MainEx(params)
{
/* ---------------------------------------------------------------------------
 * Parameters:
 *   params:        	    [INOUT] Dictionary
 *   params.values:         Dictionary: Column values
 *   params.changed:        bool: Set this flag to 'true' if
 *                                'params.values' has been changed
 *   params.skip:           bool: Set this flag to 'true' to skip
 *                                the whole record
 *
 * this procedure is called by the reader thread for each data record
 * -------------------------------------------------------------------------*/



	var entityId = params.values["entityId"]; if (entityId == null) { entityId = ""; }
	var ulica = params.values["ulica"]; if (ulica == null) { ulica = ""; }
	var obec = params.values["obec"]; if (obec == null) { obec = ""; }
	var supisneCislo = params.values["supisneCislo"]; if (supisneCislo == null) { supisneCislo = ""; }
	var orientacneCislo = params.values["orientacneCislo"]; if (orientacneCislo == null) { orientacneCislo = ""; }
	var POBOX = params.values["POBOX"]; if (POBOX == null) { POBOX = ""; }
	var psc = params.values["psc"]; if (psc == null) { psc = ""; }
	var DruhAdersySusr_CL010139 = params.values["DruhAdersySusr_CL010139"]; if (DruhAdersySusr_CL010139 == null) { DruhAdersySusr_CL010139 = ""; }


	var objclass = coort.GetObjectClass("COOSYSTEM@1.1:Object");
	
	//ulica|obec|cisloPopisne|cisloOrientacne|POBOX|PSC|stat
	var adresaMeth = objclass.GetMethod(cootx, "SKCODELISTS@103.510:ActCheckAndAddAddress");

	adresaMeth.SetParameterValue(2, "COOSYSTEM@1.1:STRING", 0, ulica);
	adresaMeth.SetParameterValue(3, "COOSYSTEM@1.1:STRING", 0, obec);
	adresaMeth.SetParameterValue(4, "COOSYSTEM@1.1:STRING", 0, supisneCislo);
	adresaMeth.SetParameterValue(5, "COOSYSTEM@1.1:STRING", 0, orientacneCislo);
	adresaMeth.SetParameterValue(6, "COOSYSTEM@1.1:STRING", 0, POBOX);
	adresaMeth.SetParameterValue(7, "COOSYSTEM@1.1:STRING", 0, psc);
	
	//najdi postu
	if(params.values["OkresSusr_0048"] != null)
	{
		var query = "SELECT objname FROM SKCODELISTS@103.510:ObjClassCodeListItem WHERE .SKCODELISTS@103.510:AttrStrCodeListNumber = '0048' AND .SKCODELISTS@103.510:AttrStrCode = " + params.values["OkresSusr_0048"];
		var searchmeth = objclass.GetMethod(cootx, "FSCAREXT@1.1001:ExecuteQuery");
		searchmeth.SetParameterValue(1, "COOSYSTEM@1.1:STRING", 0, query);
		objclass.CallMethod(cootx, searchmeth);
		var objlist = searchmeth.GetParameter3(2);
		if(objlist != null)
		{
			objlist = objlist.toArray();
			if(objlist.length > 0)
			{
				adresaMeth.SetParameterValue(8, "COOSYSTEM@1.1:STRING", 0, objlist[0].GetName());
			}
		}
	}

	//najdi a nastav stat
	if(params.values["StatSusr_CL000086"] != null)
	{
		var query = "SELECT objname FROM SKCODELISTS@103.510:ObjClassRegItemStat WHERE .SKCODELISTS@103.510:AttrStrCode = " + params.values["StatSusr_CL000086"];
		var searchmeth = objclass.GetMethod(cootx, "FSCAREXT@1.1001:ExecuteQuery");
		searchmeth.SetParameterValue(1, "COOSYSTEM@1.1:STRING", 0, query);
		objclass.CallMethod(cootx, searchmeth);
		var objlist = searchmeth.GetParameter3(2);
		if(objlist != null)
		{
			objlist = objlist.toArray();
			if(objlist.length > 0)
			{
				adresaMeth.SetParameterValue(10, "COOSYSTEM@1.1:OBJECT", 0, objlist[0]);
			}
		}
	}
	
	//typ adresy
	var typAdresy;
	if (ulica == '' && POBOX != '')
	{
		typAdresy = 20;
	} else {
		typAdresy = 10;
	}
	adresaMeth.SetParameterValue(11, "SKCODELISTS@103.510@1.1:TypeEnumTargetType", 0, typAdresy);
	
	

	//zavolaj metodu kontroly/pridania adresy
	objclass.CallMethod(cootx, adresaMeth);

	//precitaj vystup metody (objekt)
	var adresa = adresaMeth.GetParameterValue(1);
	coort.Trace("### vysledok: " + entityId + ";" + adresa.GetAddress() + ";" + DruhAdersySusr_CL010139); 


//var isLockMeth = objclass.GetMethod(cootx, "FSCFOLIO@1.1001:IsLocked");
//adresa.callMethod(cootx, isLockMeth);
//var res = isLockMeth.GetParameterValue(1);
//coort.trace("res", res);
/*
if (res) {
	//coort.Trace("### objekt nie je zamknuty");
	try {
		adresa.SetAttributeValue(cootx, "SKPRECONFIGSK@103.510:objid", 0, entityId);
	} catch(e){}
} */



	//params.skip = true;
}