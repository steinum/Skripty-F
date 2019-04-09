// LANGUAGE="JScript"
//Vynutena notifikacia poloziek ciselnikov
try
{
	coort.Trace("Start ActNotifyCodelistItems");

	var cdl = coort.GetObject("COO.103.510.1.4630941");
	var methNotify = cdl.GetMethod(cootx, "SKCODELISTS@103.510:ActNotifyCodelistItems");
	cdl.CallMethod(cootx, methNotify);

	coort.Trace("END ActNotifyCodelistItems");
}
catch(e)
{
	coort.Trace("Error ActNotifyCodelistItems: " + e.message);
	throw e;
}