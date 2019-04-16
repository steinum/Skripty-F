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
	var ICO = params.values["ICO"]; if (ICO == null) { ICO = ""; }
	var NazovPO = params.values["NazovPO"]; if (NazovPO == null) { NazovPO = ""; }
	var DatumVznikuPO = params.values["DatumVznikuPO"]; if (DatumVznikuPO == null) { DatumVznikuPO = ""; }
	var RodneCislo = params.values["RodneCislo"]; if (RodneCislo == null) { RodneCislo = ""; }
	var titulPredMenom = params.values["titulPredMenom"]; if (titulPredMenom == null) { titulPredMenom = ""; }
	var Meno = params.values["Meno"]; if (Meno == null) { Meno = ""; }
	var priezvisko = params.values["priezvisko"]; if (priezvisko == null) { priezvisko = ""; }
	var titulZa = params.values["titulZa"]; if (titulZa == null) { titulZa = ""; }
	var DatumNarodenia = params.values["DatumNarodenia"]; if (DatumNarodenia == null) { DatumNarodenia = ""; }
	var email = params.values["email"]; if (email == null) { email = ""; }
	
	var Identifikator = "";
	if (ICO != "") { Identifikator = ICO; }
	if (RodneCislo != "") { Identifikator = RodneCislo; }
	
	var TypIdentifikatoru = "";
	if (ICO != "") { TypIdentifikatoru = "7"; }
	if (RodneCislo != "") { TypIdentifikatoru = "9"; }

	var objclass = coort.GetObjectClass("COOSYSTEM@1.1:Object");
	
	//ICO alebo RC|TypIdentifikatoru|Titul|Meno|Priezvisko|Firma|Email|Adresa|DatumNarodenia|TypAdresy
	var osobaMeth = objclass.GetMethod(cootx, "SKCODELISTS@103.510:ActCheckAndAddOsoba");

	osobaMeth.SetParameterValue(2, "COOSYSTEM@1.1:STRINGLIST", 0, Identifikator);
	osobaMeth.SetParameterValue(3, "COOSYSTEM@1.1:STRINGLIST", 0, TypIdentifikatoru);
	osobaMeth.SetParameterValue(4, "COOSYSTEM@1.1:STRING", 0, titulPredMenom);
	osobaMeth.SetParameterValue(5, "COOSYSTEM@1.1:STRING", 0, Meno);
	osobaMeth.SetParameterValue(6, "COOSYSTEM@1.1:STRING", 0, priezvisko);
	osobaMeth.SetParameterValue(9, "COOSYSTEM@1.1:STRING", 0, NazovPO);
	osobaMeth.SetParameterValue(11, "COOSYSTEM@1.1:STRING", 0, email);
	
	//najdi adresu
	/*
	if(params.values["entityId"] != null)
	{
		try
		{
			var query = "SELECT objname FROM SKCODELISTS@103.510:ObjClassPostAddress WHERE .SKPRECONFIGSK@103.510:objid = " + params.values["entityId"];
			var searchmeth = objclass.GetMethod(cootx, "FSCAREXT@1.1001:ExecuteQuery");
			searchmeth.SetParameterValue(1, "COOSYSTEM@1.1:STRING", 0, query);
			objclass.CallMethod(cootx, searchmeth);
			var objlist = searchmeth.GetParameter3(2);
			if(objlist != null)
			{
				objlist = objlist.toArray();
				if(objlist.length > 0)
				{
					osobaMeth.SetParameterValue(12, "COOSYSTEM@1.1:OBJECT", 0, objlist[0]);
				}
			}
		}
		catch(e){}
	}
	*/
	
	osobaMeth.SetParameterValue(14, "COOSYSTEM@1.1:DATETIME", 0, DatumNarodenia);
	osobaMeth.SetParameterValue(17, "COOSYSTEM@1.1:OBJECT", 0, coort.GetObject("COO.2295.100.2.88546"));
	
	//zavolaj metodu kontroly/pridania osoby
	objclass.CallMethod(cootx, osobaMeth);

	//precitaj vystup metody (objekt)
	var osoba = osobaMeth.GetParameterValue(1);
	
//	osoba.SetAttributeValue(cootx, "SKPRECONFIGSK@103.510:objid", 0, entityId);
	coort.Trace("### vysledok: " + entityId + ";" + osoba.GetAddress());

	
	//params.skip = true;
}