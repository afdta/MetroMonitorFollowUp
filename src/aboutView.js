(function(){
	var view0 = MetroMonitorVersion2.addView(function(){},null,function(){
		var slide = this.container;
		var header = this.header;
		header.append("p").text("About the Metro Monitor");
		//header.append("p").text("Tracking progress towards an advanced economy that works for all").style({"font-style":"italic","margin-bottom":"0px"});
		//slide.append("hr").style("margin-bottom","20px");
		slide.append("p").style({"font-weight":"bold","color":"#4285f4","margin-bottom":"25px"}).text("[INSERT SOME SNAPPY GRAPHICS, VARIABLE DEFINITIONS]")
		
		slide.append("div").style({"float":"left","width":"56%","padding":"0% 2% 0px 0px"})
			.html("<p>THE METRO MONITOR SETS A NEW STANDARD FOR ASSESSING THE SUCCESS OF REGIONAL ECONOMIES</p>")

		slide.append("div").style({"float":"left","width":"56%","padding":"0% 2% 0px 0px"})
			.html("<p>SUCCESS HAS BEEN LIMITED AND VARIED - USE THIS TOOL TO SEE HOW</p>")

		slide.append("div").style({"float":"left","width":"56%","padding":"0% 2% 0px 0px"})
			.html("<p>ECONOMIC DEVELOPMENT EFFORTS SHOULD TO CHANGE TO REFLECT THIS</p>")

	});
	view0.name("About");
})();
