(function(){
	//TO DO nail down the ordering of segments so
	//TO DO: need to redo the cumulative share calc
	var dataFile = "data/combinedIndicators.json";

	var colG = ['#bdd7e7','#6baed6','#3182bd'];
	var colP = ['#bae4b3','#74c476','#31a354'];
	var colI = ['#cbc9e2','#9e9ac8','#756bb1'];
	var colAll = colG.concat(colP.concat(colI));
	var order = ["Emp","GMP","Wages","AvgWage","GMPCap","GMPJob","EmpRatio","MedEarn","RelPov"]; //order of segments

	var segLegend = {};
	for(var i=0; i<order.length; i++){
		segLegend[order[i]] = colAll[i];
	}

	function redrawBase(){
		var content = this.store("content");
		var self = this;

		var svg = this.store("svg").style("height","800px");

		var bars = svg.selectAll("g.bars").data(this.data());
		bars.enter().append("g").classed("bars",true).append("title");
		bars.exit().remove();

		bars.select("title").html(function(d,i){
			try{
				var val = self.lookup[d[0].cbsa][0].CBSA_Title;
			}
			catch(e){
				var val = "";
			}
			return val;

		});

		bars.attr("transform",function(d,i){return "translate(0,"+((i*7)+7)+")"});

		var segments = bars.selectAll("g.segment").data(function(d,i){return d}, function(d,i){return d.ind});
		segments.enter().append("g").classed("segment",true).append("line");
		segments.exit().remove();

		cumulative = 0;
		segments.attr("transform",function(d,i){
			if(i===0){cumulative = 0} //reset for every new group
			var T =  "translate(" + cumulative*100 + ",0)";
			cumulative = cumulative+d.share;
			return T;

		})

		var lines = segments.select("line").attr({"x1":0,"y1":0,"y2":0,"x2":0,"stroke-width":"6"}).style("stroke",function(d,i){return segLegend[d.ind]});
		content.on("mousedown",function(){
			lines.transition().ease("linear").delay(function(d,i){return (i*1000)}).duration(1000)
							 .attr("x2",function(d,i){return d.share*100});
		})
		
	}

	function setupBase(){
		this.name("Detail","Racing to an economy for all...");
		var content = this.slide.append("div").style("padding","15px");
		content.append("p").text("[CLICK HERE TO START]").style({"text-align":"center", "cursor":"pointer"});
		content.selectAll("p.legendEntry").data(order).enter().append("p").text(function(d,i){return d})
				.style("color",function(d,i){return segLegend[d]}).style({"float":"left", "margin-right":"8px"});
		content.append("div").style({"width":0,"height":0,"clear":"both","position":"relative"});
		this.store("content", content);
		this.store("svg", content.append("svg").style({"width":"100%", "height":"100%"}))

	}

	var view = MetroMonitorVersion2.addView(setupBase, redrawBase, dataFile);
})();

