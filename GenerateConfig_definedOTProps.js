// LANGUAGE="JScript"
try
{
	//prihliada max do hlbky aggr in aggr
	
	coort.Trace("GenerateCDLConfig_replace - start -->");
	//------------configurables----------------
	var searchOT = "COO.103.510.1.800093"; //SKCODELISTS@103.510:ObjClassOsoba
	var propsFilePath = "D:\\propsFile.txt";
	var replaceFilePath = "D:\\replaceFile.txt";
	var propsNotFoundInOTPath = "D:\\propsNotFoundInOTFile.txt";
	
	//------------vars-----------------------
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	
	//------------search--------------
	var propsQuery = "SELECT objname FROM COOSYSTEM@1.1:AttributeObjectDef WHERE .COOSYSTEM@1.1:attruseableclass = \""+searchOT+"\"";
	propsQuery += " OR .COOSYSTEM@1.1:attrallowed.COOSYSTEM@1.1:attrallclass = \""+searchOT+"\"";
	var propsArr = coort.SearchObjects3(cootx, propsQuery);
	
	if (propsArr!=null)
	{
		propsArr = propsArr.toArray();
	}
	
	coort.Trace("write propsFile-propsArr+propsArr1-length ", propsArr.length);

	if (propsArr==null)
	{
		coort.Trace("GenerateCDLConfig_replace - no attributes found");
	}
	else
	{
		/*//-----search forbidden----
		var propsForbidQuery = "SELECT objname FROM COOSYSTEM@1.1:AttributeObjectDef WHERE .COOSYSTEM@1.1:attrnotallowed.COOSYSTEM@1.1:attrallclass = \"" + searchOT + "\"";
		var propsForbidArr = coort.SearchObjects3(cootx, propsForbidQuery);
		var propsForbidStr = "";
		if (propsForbidArr!=null)
		{
			propsForbidArr=propsForbidArr.toArray();
			
			//-----remove forbid props------
			for (var iPropsForbidArr=0; iPropsForbidArr<propsForbidArr.length; iPropsForbidArr++)
			{
				for (var iPropsArr=0; iPropsArr<propsArr.length; iPropsArr++)
				{
					if(propsForbidArr[iPropsForbidArr].GetReference() == propsArr[iPropsArr].GetReference())
					{
						propsArr.splice(iPropsArr, 1);
					}
				}
			}
		}
		
		coort.Trace("write propsFile-propsArr-after remove forbid-length ", propsArr.length);*/
		
		//--------props to file-------
		try
		{
			var propsFile = fso.CreateTextFile(propsFilePath, true);
			coort.Trace("GenerateCDLConfig_replace - write propsFile-length: ", propsArr.length);
			for (var iProps=0; iProps<propsArr.length; iProps++)
			{
				propsFile.WriteLine(propsArr[iProps].GetReference());
			}
			propsFile.Close();
		}
		catch(e)
		{
			coort.Trace("GenerateCDLConfig_replace - write propsFile error: " + e.message);
			propsFile.Close();
		}
		
		
		//-----------------search OT where prop---------------
		var propPathsArr = [];
		var propsNotFoundInOT = [];
		for (var iProps=0; iProps<propsArr.length; iProps++)
		{
			var propFound = false;
			//search prop in OT
			var otsPropQuery = "SELECT objname FROM COOSYSTEM@1.1:ObjectClass WHERE .COOSYSTEM@1.1:classattributes = \""+ propsArr[iProps].GetAddress() +"\"";
			var otsPropArr = coort.SearchObjects3(cootx, otsPropQuery);
			if (otsPropArr!=null)
			{
				propFound = true;
				otsPropArr=otsPropArr.toArray();
				for (var iOtsPropArr=0; iOtsPropArr<otsPropArr.length; iOtsPropArr++)
				{
					propPathsArr.push(otsPropArr[iOtsPropArr].GetReference()+"-"+propsArr[iProps].GetReference());
				}
			}
			
			//search prop in struct
			var structsPropQuery = "SELECT objname FROM COOSYSTEM@1.1:TypeAggregateDef WHERE .COOSYSTEM@1.1:typecompattrs =\""+ propsArr[iProps].GetAddress() +"\"";
			var structsPropArr = coort.SearchObjects3(cootx, structsPropQuery);
			if (structsPropArr!=null)
			{
				structsPropArr=structsPropArr.toArray();
				for (var iStructsPropArr=0; iStructsPropArr<structsPropArr.length; iStructsPropArr++)
				{
					//search struct in aggr
					var aggrsStructQuery = "SELECT objname FROM COOSYSTEM@1.1:AttributeAggregateDef WHERE .COOSYSTEM@1.1:attrtype = \""+ structsPropArr[iStructsPropArr].GetAddress() +"\"";
					var aggrsStructArr = coort.SearchObjects3(cootx, aggrsStructQuery);
					if (aggrsStructArr!=null)
					{
						aggrsStructArr=aggrsStructArr.toArray();
						for (var iAggrsStructArr=0; iAggrsStructArr<aggrsStructArr.length; iAggrsStructArr++)
						{
							//search aggrs in OTs
							var otsAggrQuery = "SELECT objname FROM COOSYSTEM@1.1:ObjectClass WHERE .COOSYSTEM@1.1:classattributes = \""+ aggrsStructArr[iAggrsStructArr].GetAddress() +"\"";
							var otsAggrArr = coort.SearchObjects3(cootx, otsAggrQuery);
							if (otsAggrArr!=null)
							{
								propFound = true;
								otsAggrArr=otsAggrArr.toArray();
								for (var iOtsAggrArr=0; iOtsAggrArr<otsAggrArr.length; iOtsAggrArr++)
								{
									propPathsArr.push(otsAggrArr[iOtsAggrArr].GetReference()+"-"+aggrsStructArr[iAggrsStructArr].GetReference()+"."+ propsArr[iProps].GetReference());
								}
							}
							
							//search aggrs in struct
							var structsAggrQuery = "SELECT objname FROM COOSYSTEM@1.1:TypeAggregateDef WHERE .COOSYSTEM@1.1:typecompattrs =\""+ aggrsStructArr[iAggrsStructArr].GetAddress() +"\"";
							var structsAggrArr = coort.SearchObjects3(cootx, structsAggrQuery);
							if (structsAggrArr!=null)
							{
								structsAggrArr=structsAggrArr.toArray();
								for (var iStructsAggrArr=0; iStructsAggrArr<structsAggrArr.length; iStructsAggrArr++)
								{
									//search struct in aggr
									var aggrsStructQuery1 = "SELECT objname FROM COOSYSTEM@1.1:AttributeAggregateDef WHERE .COOSYSTEM@1.1:attrtype = \""+ structsAggrArr[iStructsAggrArr].GetAddress() +"\"";
									var aggrsStructArr1 = coort.SearchObjects3(cootx, aggrsStructQuery1);
									if (aggrsStructArr1!=null)
									{
										aggrsStructArr1=aggrsStructArr1.toArray();
										for (var iAggrsStructArr1=0; iAggrsStructArr1<aggrsStructArr1.length; iAggrsStructArr1++)
										{
											//search aggrs in OTs
											var otsAggrQuery = "SELECT objname FROM COOSYSTEM@1.1:ObjectClass WHERE .COOSYSTEM@1.1:classattributes = \""+ aggrsStructArr1[iAggrsStructArr1].GetAddress() +"\"";
											var otsAggrArr = coort.SearchObjects3(cootx, otsAggrQuery);
											if (otsAggrArr!=null)
											{
												propFound = true;
												otsAggrArr=otsAggrArr.toArray();
												for (var iOtsAggrArr=0; iOtsAggrArr<otsAggrArr.length; iOtsAggrArr++)
												{
													propPathsArr.push(otsAggrArr[iOtsAggrArr].GetReference()+"-"+aggrsStructArr1[iAggrsStructArr1].GetReference()+"."+aggrsStructArr[iAggrsStructArr].GetReference()+"."+propsArr[iProps].GetReference());
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			if (!propFound)
			{
				propsNotFoundInOT.push(propsArr[iProps]);
			}
		}
		
		//propsNotFoundInOT to file
		try
		{
			var propsNotFoundInOTFile = fso.CreateTextFile(propsNotFoundInOTPath, true);
			coort.Trace("GenerateCDLConfig_replace - write propsNotFoundInOTFile-length: ", propsNotFoundInOT.length);
			for (var iProps=0; iProps<propsNotFoundInOT.length; iProps++)
			{
				propsNotFoundInOTFile.WriteLine(propsNotFoundInOT[iProps].GetReference());
			}
			propsNotFoundInOTFile.Close();
		}
		catch(e)
		{
			coort.Trace("GenerateCDLConfig_replace - write propsNotFoundInOTFile error: " + e.message);
			propsNotFoundInOTFile.Close();
		}
		
		//propPathsArr to file
		try
		{
			var propPathsArrFile = fso.CreateTextFile(replaceFilePath, true);
			coort.Trace("GenerateCDLConfig_replace - write propPathsArrFile-length: ", propPathsArr.length);
			for (var iProps=0; iProps<propPathsArr.length; iProps++)
			{
				propPathsArrFile.WriteLine(propPathsArr[iProps]);
			}
			propPathsArrFile.Close();
		}
		catch(e)
		{
			coort.Trace("GenerateCDLConfig_replace - write propPathsArrFile error: " + e.message);
			propPathsArrFile.Close();
		}
		
	}
	
	coort.Trace("GenerateCDLConfig_replace - end <--");
}
catch(e)
{
	coort.Trace("GenerateCDLConfig_replace error: " + e.message);
	throw e;
}