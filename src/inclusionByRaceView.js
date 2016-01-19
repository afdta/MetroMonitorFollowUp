//view 1 - "inclusion by race" view

	(function(){
		var colors = ['#d7191c','#fdae61','#ffffbf','#abd9e9','#2c7bb6'];
		var colors = ['#e66101','#fdb863','#f7f7f7','#b2abd2','#5e3c99'];
		var colors = ['#d01c8b','#f1b6da','#f7f7f7','#b8e186','#4dac26'];
		var colors = ['#053769', '#a4c7f2', '#cccccc', '#ffa626', '#ff5e1a'];

		var periods = {"Five":"2009–2014", "One":"2013–2014", "Ten":"1999–2014"};

		function r2c(r){
			var q = null;
			var t = "#ffffff";
			var td = "#666666";
			if(r<=20){q=0}
			else if(r<=40){q=1; t=td;}
			else if(r<=60){q=2; t=td;}
			else if(r<=80){q=3;}
			else if(r<=100){q=4}
			else{q=null}
			return {fill:colors[q], text:t};
		}

		function getYears(period){
			var endYear = 2014;
			var startYear = period == "One" ? 2013 : (period == "Five" ? 2009 : 1999);
			return {s:startYear, e:endYear}
		}

		var columns = [{}, {}];

		//left off here -- how to do this table
		function drawDetailedTable(metro, period, g, formats){
			var years = getYears(period);
			for(i=0; i<metro.length; i++){
				if(metro[i].Year==years.s){
					var start = metro[i];
				}
				else if(metro[i].Year==years.e){
					var end = metro[i];
				}
			}

		try{
			var ch_NW_ER = (end.NonWhite_EmpRatioV - start.NonWhite_EmpRatioV)*1;
			var ch_W_ER = (end.White_EmpRatioV - start.White_EmpRatioV)*1;
			
			var ch_NW_ME = (end.NonWhite_MedEarnV/start.NonWhite_MedEarnV)-1;
			var ch_W_ME = (end.White_MedEarnV/start.White_MedEarnV)-1;

			var ch_NW_RP = (end.NonWhite_RelPovV - start.NonWhite_RelPovV)*1;
			var ch_W_RP = (end.White_RelPovV - start.White_RelPovV)*1;

			var r0 = [{text:""}, {text:"Emp.-to-pop. ratio"}, {text:"Median earnings"}, {text:"Relative poverty"}]

			var r1 = [{text:(start.Year === 2000 ? 1999 : start.Year)},
					  {nw:start.NonWhite_EmpRatioV, w:start.White_EmpRatioV, fmt:formats.pct1},
					  {nw:start.NonWhite_MedEarnV, w:start.White_MedEarnV, fmt:formats.doll0},
					  {nw:start.NonWhite_RelPovV, w:start.White_RelPovV, fmt:formats.pct1}
					 ]
			
			var r2 = [{text:end.Year},
					  {nw:end.NonWhite_EmpRatioV, w:end.White_EmpRatioV, fmt:formats.pct1},
					  {nw:end.NonWhite_MedEarnV, w:end.White_MedEarnV, fmt:formats.doll0},
					  {nw:end.NonWhite_RelPovV, w:end.White_RelPovV, fmt:formats.pct1}
					 ]

			var r3 = [{text:"Change"},
					  {nw:ch_NW_ER, w:ch_W_ER, fmt:formats.ppch1},
					  {nw:ch_NW_ME, w:ch_W_ME, fmt:formats.pctch1},
					  {nw:ch_NW_RP, w:ch_W_RP, fmt:formats.ppch1}
					 ]

			var threeRows = g.selectAll("div.as-table-row").data([r0,r1,r2,r3]);
			threeRows.enter().append("div").classed("as-table-row",true);
			threeRows.exit().remove();

			var fourCells = threeRows.selectAll("div.as-table-cell").data(function(d,i){return d});
			fourCells.enter().append("div").classed("as-table-cell",true).style("width",function(d,i){
				return i==0 ? "22%" :"26%";
			}).style("vertical-align", function(d,i){return i===0 ? "top" : "middle"});
			fourCells.exit().remove();

			var cell_vals = fourCells.selectAll("div.value-actual").data(function(d,i){
				var ta = i%4 ===0 ? "right" : "center";
				var label = [{v:d.text, w:"normal", ta:ta}]; //[{v:"non-white", w:"bold", ta:ta}, {v:"white", w:"normal", ta:ta}] : 
				return d.hasOwnProperty("fmt") ? [{v: d.fmt(d.nw), w:"bold", ta:ta}, {v:d.fmt(d.w), w:"normal", ta:ta}] : label;
			});
			cell_vals.enter().append("div").classed("value-actual",true).append("p");
			cell_vals.exit().remove();
			cell_vals.select("p").text(function(d,i){return d.v})
				.style({"font-size":"13px","margin":"0px","padding":"3px","line-height":"1em", "text-align":"center"})
				.style("font-weight",function(d,i){return d.w});
				//.style("text-align",function(d,i){return d.ta});
		}
		catch(e){

		}

		}

		function drawTable(){
			var self = this;

			var table = this.storage("table");
			var tableOuter = this.storage("tableOuter");

			var data = this.viewData("processed");
			var raw = this.viewData();
			var period = this.storage("period");

			var headerPinned = this.storage("headerPinned");
			var metro = this.getMetro();
			var self = this;

			var rows = table.selectAll("div.table-row").data(data.universe);
			var rowEnter = rows.enter().append("div").classed("table-row",true);

			rowEnter.append("p").classed("row-label",true).style({"pointer-events":"none","margin":"0px 0px 5px 0px","line-height":"1em"});
			rowEnter.append("div").classed("c-fix row-swatches",true);
			rowEnter.append("div").classed("c-fix row-detail",true);
			rows.exit().remove();

			
			rows.on("mouseenter",function(d,i){
				var thiz = d3.select(this).classed("row-is-highlighted",true);
				//highlight on map
				var mapData = self.storage("mapData");
				if(!!mapData){
					mapData.large.highlight(d,null,2);
				}		
			});
			rows.on("mouseleave",function(d,i){
				var thiz = d3.select(this);
				thiz.classed("row-is-highlighted", false);
				//remove highlight on map
				var mapData = self.storage("mapData");
				if(!!mapData){
					mapData.large.highlight();
				}
			});
			rows.on("mousedown",function(d,i){
				rows.classed("row-is-pinned",false);
				var thiz = d3.select(this).classed("row-is-pinned",true);
				self.setMetro(d);
				//no need to pin dot on map -- map will be redrawn -- see setMetro() -- and dot pinned
			})

			rows.select("p.row-label").text(function(d,i){return self.lookup[d][0].CBSA_Title});

			var swatchContainers = rows.select("div.row-swatches");
			var swatches = swatchContainers.selectAll("div.swatch").data(function(d,i){
				var metro = data.table[d];
				var keyR = period+"R";
				return [{r:metro.rank[keyR], l:"G"}];
				return [{r:metro.gr0[keyR], l:"G: "}];
			});
			swatches.enter().append("div").classed("swatch",true).append("p").style({"margin":"0px","text-align":"center"});
			swatches.exit().remove();

			swatches.style("background-color",function(d,i){return (r2c(d.r)).fill})
					.style({"float":"left", "width":"100%", "pointer-events":"none"});
			swatches.select("p").text(function(d,i){return self.formats.rankth(d.r)}).style("color",function(d,i){return (r2c(d.r)).text});

			//draw the detail in each cell
			var detailTitle = rows.select("div.row-detail").selectAll("p.row-title").data(["Inclusion by race measures the extent to which gaps between whites and non-whites are narrowing. The data for <b>non-whites are bolded</b> in the table below."]);
			detailTitle.enter().append("p").classed("row-title",true).style({"font-size":"13px","line-height":"1.3em","margin":"12px 0px 5px 0px","border-bottom":"1px solid #aaaaaa", "padding-bottom":"4px"});
			detailTitle.exit().remove();
			detailTitle.html(function(d,i){return d});

			var detailWrap = rows.select("div.row-detail").selectAll("div.as-table").data(function(d,i){return [d]});
			detailWrap.enter().append("div").classed("as-table",true);
			detailWrap.exit().remove();

			detailWrap.each(function(d,i){
				drawDetailedTable(data.levels[d], period, d3.select(this), self.formats);
			});

			function scrollToTop(){
				try{
					rows.classed("row-is-pinned",false);
					var metRow = rows.filter(function(d,i){return d==metro});
					metRow.classed("row-is-pinned",true);

					var metNode = metRow.node();
					var parNode = metNode.parentNode;

					var outerT = parNode.getBoundingClientRect().top;
					var rowT = metNode.getBoundingClientRect().top;
					var T = Math.round(rowT - outerT)+1; 

					var tweenGen = function(){
						var current = this.scrollTop; //get current amount
						var interpolate = d3.interpolateNumber(current, T);
						return function(t){
							this.scrollTop = interpolate(t);
						}
					}
				}
				catch(e){
				}

				if(self.changeEvent.view){
					tableOuter.node().scrollTop = T;
				}
				else{
					tableOuter.transition().duration(1000).tween("scrollTopTween", tweenGen); 
				}
			}
			scrollToTop();
		}

		//drawMaps won't be called until processed data is loaded
		function drawMaps(){
			var period = this.storage("period");
			var mapData = this.storage("mapData");
			var bigMap = mapData.large;

			var self = this;

			mapData.title.text("Change in inclusion by race, " + periods[period]);
				   //.style({"margin":"20px 0px -5px 10px","font-size":"15px","line-height":"1em", "font-weight":"bold"});


			//bind map data -- only once
			if(!mapData.dataBound){
				var data = this.viewData("processed"); //drawMaps is only called after processed data has been created
				var data2bind = data.universe.map(function(d,i){return {geo:d, inclusion:data.table[d]}});

				bigMap.setData(data2bind, "geo").drawMap(function(){
					this.metros.on("mousedown",function(d,i){
						self.setMetro(d.geo);
					})
				}).showTooltips();
				mapData.dataBound = true;
			}

			//function generator
			function refill(){

				var key = period+"R";
				//fn to refill the map dots based on the selection of indicator and time period -- the thisArg will be the map object
				
				this.metros.attr("r", function(d,i){
					return 6;
				});

				var self = this;

				//no transitions -- the select and highlight methods match the parameters of the underlying dots at the start of the transition causing erroneous results
				this.metros.attr("fill", function(d,i){
					var rank = d.data.inclusion.rank[key];
					var col = r2c(rank).fill;
					return col;
				});

				//set text accessor for hover boxes
				var ta = function(d){
					var rank = d.data.inclusion.rank[key]
					var overall = "Overall rank: " + rank + " of 100";
					return [overall];
				}
				this.textAccessor(ta);

			}

			var metro = this.getMetro();
			//refill large map
			bigMap.drawMap(refill).select(metro, null, 2);

		}


		function drawCurves(){
			var period = this.store("period");
			var category = this.store("category");
			var charts = this.store("charts");
			var metro = this.getMetro();
			var metroName = this.lookup[metro][0].CBSA_Title;
			var self = this;
			var data = this.viewData().changeDetail[metro][0];

			charts.title.html('Change in the components of inclusion by race/ethnicity, ' + periods[period]);
			charts.metro.text(metroName);

			//set chart dimensions
			try{
				var box = charts.wrap.node().getBoundingClientRect();
				var width = Math.round(box.right-box.left);
				if(width > 700 || width < 300){throw "BadDimensions"};
			}
			catch(e){
				var width = 500;
			}
			finally{
				var chartWidth = width-90;
				charts.group.attr("transform","translate(50,"+(0.75*charts.pad)+")");
				charts.groups.select("rect.chart-back").attr("width",chartWidth);
			}

			//scales
			var groups = ["Total","White","Black","Hispanic","Asian","Other","NonWhite"];
			var scaleX = d3.scale.ordinal().domain(groups).rangeRoundPoints([0,chartWidth], 1);
			var axisX = d3.svg.axis().scale(scaleX).orient("bottom")
									 .tickValues(groups).tickFormat(function(d,i){
									 	if(d=="NonWhite"){
									 		var g = "Non-white";
									 	}
									 	else if(d=="Total"){
									 		var g = "Total pop.";
									 	}
									 	else{
									 		var g = d;
									 	}
									 	return g;
									 })
									 .outerTickSize(0);

			try{
				charts.xaxis.transition().call(axisX)
					  .selectAll("text")
					  .attr({"transform": "rotate(-45)", "dy":"8px", "dx":"-0.2em", "font-weight":"bold"})
					  .style("text-anchor","end");

			}
			catch(e)
			{
			
			}

			var formats0 = {"EmpRatio":self.formats.pctch0, "RelPov":self.formats.pctch0, "MedEarn":self.formats.pctch0};
			var formats = {"EmpRatio":self.formats.pctch1, "RelPov":self.formats.pctch1, "MedEarn":self.formats.pctch1};
			var genObs = function(ind){
				var fmt0 = formats0[ind];
				var fmt = formats[ind];
				var map = groups.map(function(d,i){
					var val = data[d+"_"+ind+"_"+period+"V"];
					var txt = fmt(val);
					return {val: val, txt:txt, group:d, ind:ind}
				})
				var extent = d3.extent(map, function(d,i){return d.val});
				var pad = d3.max([Math.abs(extent[0]), Math.abs(extent[1])])*0.5;
				var extent2 = [extent[0]-pad, extent[1]+pad]; 
				var yscale = d3.scale.linear().domain(extent2).range([charts.height,0]);
				var axis = d3.svg.axis().scale(yscale).orient("left").ticks(3).tickFormat(fmt0).outerTickSize(0);
				var label = ind=="EmpRatio" ? "Employment-to-population ratio" : (ind=="MedEarn" ? "Median earnings" : "Relative poverty");
				
				for(var i=0; i<map.length; i++){
					map[i].x = scaleX(map[i].group);
					map[i].y = yscale(map[i].val);
				}

				return {yaxis:axis, yscale:yscale, dat:map, ind:label};
			}

			var dataGroups = [genObs("EmpRatio"), genObs("MedEarn"), genObs("RelPov")];
		
			charts.groups = charts.groups.data(dataGroups); //bind data to groups
			
			var dataPointsGroups = charts.groups.selectAll("g.data-points-group").data(function(d,i){return d.dat});
			var dpgEnter = dataPointsGroups.enter().append("g").classed("data-points-group",true);
			dpgEnter.append("line").attr({"x1":0, "x2":0, "y1":0, "y2":charts.height, "stroke":"#ffffff"});
			dpgEnter.append("circle").attr({"cx":0,"r":3,"fill":"#555555"});
			dpgEnter.append("text").attr({"x":0, "dy":-6, "text-anchor":"middle", "font-size":"11px"});
			dataPointsGroups.exit().remove();
			dataPointsGroups.attr("transform",function(d,i){return "translate("+d.x+",0)"});

			dataPointsGroups.select("circle").attr("cy",function(d,i){return d.y});
			dataPointsGroups.select("text").text(function(d,i){return d.txt})
										  .attr("y",function(d,i){return d.y});
			
			try{
				var yaxes = charts.groups.select("g.d3-axis-group").each(function(d,i){
					d3.select(this).transition().call(d.yaxis);
				});
			}catch(e){
				console.log(e);
			}

			charts.groups.select("text.chart-title")
				.text(function(d,i){return d.ind})
				.attr({"x":chartWidth, "text-anchor":"end"})

		}


		//redraw -- setup is just to add html
		function redrawBase(){
			var self = this;
			
			//if processed data not there, create it and do some one-time stuff
			if(!this.viewData("processed")){
				var data = {};
				data.table = {};
				function putInTable(A,propName){
					for(var i=0; i<A.length; i++){
						var prop = A[i].CBSA+"";
						if(!data.table.hasOwnProperty(prop)){data.table[prop] = {}} //create an entry
						data.table[prop][propName] = A[i];
					}
				}
				var raw = this.viewData("raw");
				putInTable(raw.ranks, "rank");
				data.levels = raw.levelsDetail;

				data.universe = raw.ranks.map(function(d,i){return d.CBSA+""});

				this.viewData("processed",data);

				var buttons = this.storage("buttons");
				buttons.period.on("mousedown",function(d,i){
					self.storage("period",d.c);
					buttons.period.classed("generic-button-selected", function(d,j){return i===j});
					drawTable.call(self);
					drawMaps.call(self);
					drawCurves.call(self);
				});

			}

			drawTable.call(this);

			//if redraw is being called because of achange in view or metro, redraw map, otherwise the map-class handles responsiveness
			if(this.changeEvent.view || this.changeEvent.metro){
				drawMaps.call(this);
			};
			drawCurves.call(self);
		}

var setupBase = function(){
			var self = this;
			this.header.append("p").text("Inclusion by race in the 100 largest U.S. metro areas");
			
			//var tableWrap = this.container.append("div").style({"padding":"5px 0px 5px 0px", "border":"1px solid #dddddd", "border-width":"1px 0px 1px 0px"}).classed("two-fifths",true).append("div").style("max-height","600px");
			var headerWrap = this.container.append("div").classed("c-fix",true).style({"padding":"15px"});
			var header0 = headerWrap.append("div");;
			header0.append("p").html('Inclusion measures how broadly economic gains are shared among the population. <span style="font-style:italic"> Inclusion varies significantly by race and ethnicity. Explore the data below to find out... .</span>')
							   .style({"margin":"0px"});

			//legend area
			var legendAndTime = this.container.append("div").style({"padding-bottom":"15px", "border-bottom":"0px solid #dddddd", "margin-bottom":"15px"}).classed("c-fix",true);
			var legendWrap = legendAndTime.append("div").classed("c-fix three-fifths mobile-bottom-buffer",true).append("div").style({"padding":"0px 15px 0px 15px"});
			legendWrap.append("p").text("Metro areas are ranked from 1 to 100; 1 indicates the best performance").style({"font-size":"13px"});
			var legendSwatches = legendWrap.append("div").classed("c-fix",true).selectAll("div").data(colors).enter().append("div").style({"float":"left","margin":"0px 15px 5px 0px"});
			legendSwatches.append("div").style({"float":"left","width":"15px","height":"15px"}).style("background-color",function(d,i){return d})
			legendSwatches.append("p").style({"float":"left","font-size":"13px","line-height":"15px","height":"15px","margin":"0px 0px 0px 5px", "padding":"1px"})
								.text(function(d,i){
									var ii = i*20;
									return self.formats.rankth(ii+1) + "–" + self.formats.rankth(ii+20)
								});

			//time period
			var periodMenu = legendAndTime.append("div").classed("c-fix two-fifths column-right",true);
			periodMenu.append("p").text("Select a time period to focus on").style({"font-size":"13px"});
			var periodButtons = periodMenu.selectAll("div").data([{c:"One", l:"One-year"}, {c:"Five", l:"Five-year"}, {c:"Ten", l:"Ten-year"}]).enter().append("div")
										  .classed("generic-button",true).classed("generic-button-selected",function(d,i){return i===1})
										  .style({"box-sizing":"border-box", "width":"32%"}).style("margin",function(d,i){return i<2 ? "0px 2% 0px 0px" : "0px"})
										  ;
				periodButtons.append("p").text(function(d,i){return d.l});

			//TABLE SETUP
			var rightSide = this.container.append("div").classed("two-fifths column-right",true);
			var tableHeaderWrap = rightSide.append("div");

			var tableHeader = tableHeaderWrap.append("div").append("p").text("Inclusion by race rankings")
												.style({"margin":"0px 0px 5px 10px", "font-weight":"bold"});
			

			var tableOuter = rightSide.append("div").style({"clear":"both","border":"1px solid #aaaaaa", "border-width":"1px 0px 1px 0px", "padding":"0px", "max-height":"800px", "overflow-y":"auto"});
			var tableWrap = tableOuter.append("div").style("padding","0px 0px 500px 0px");
			var table = tableWrap.append("div").style("width","100%"); //.append("g").attr("id","core-svg-table")

			//MAPS SETUP
			var mapAndCharts = this.container.append("div").style("overflow","visible").classed("three-fifths no-mobile-display",true)
											.append("div").style({"padding":"0px 30px 0px 0px","position":"relative"});;

			var mapTitle = mapAndCharts.append("div").append("p")
								.text("Inclusion by race")
								.style({"margin":"0px 20px -5px 0px", "padding":"0px 0px 5px 10px", "border-bottom":"1px solid #aaaaaa", "font-weight":"bold"});


			var mapWrap = mapAndCharts.append("div").style("overflow","visible").style({"padding":"0px 0px 0px 0px","position":"relative"});
			//add another div and create the map within it
			var map = new dotMap(mapWrap.append("div").node());
			map.makeResponsive();


			//CHARTSS SETUP
			var chartWrap = mapAndCharts.append("div").style("overflow","visible");
			var chartHeight = 95;
			var chartPad = 35;
			var threeChartPad = 0;
							
			var chartTitleWrap = chartWrap.append("div").style({"position":"relative","z-index":"5"});
			var chartTitle = chartTitleWrap.append("p").classed("charts-title",true)
				                    .html('Change in the components of inclusion by race/ethnicity')
				                    .style({"margin":"0px 15px 5px 10px","font-weight":"bold"});
			var chartMetroTitle = chartTitleWrap.append("p").style({"margin":"0px 15px 5px 10px", "line-height":"1em"}).text("Selected metro area");


			var chartSVG = chartWrap.append("svg").style({"width":"100%","height":((chartHeight*3)+(chartPad*4)+35)+"px"}).append("g").attr("transform","translate(0,0)");
			var chartG = chartSVG.selectAll("g").data([1,2,3]).enter().append("g")
												.attr("transform",function(d,i){return "translate(0," + i*(chartHeight+chartPad) + ")"});
			//add y-axes to each group
			chartG.append("g").classed("d3-axis-group",true).attr("transform","translate(0,0)");

			var xaxis = chartSVG.append("g").attr("transform","translate(0,"+((3*chartHeight)+(2*chartPad)+5)+")").classed("d3-axis-group",true);
				//xaxis.append("line").attr({"x1":"0%","x2":"100%","y1":"1","y2":"1","stroke":"#aaaaaa", "stroke-width":"1px"})
				//					.style("shape-rendering","crispEdges");

			chartG.append("rect").attr({"width":"100%","height":chartHeight+"px","fill":"#eeeeee"}).classed("chart-back",true);
			chartG.append("text").classed("chart-title",true).attr({x:"0",y:"-6"}).attr({"font-size":"13px"}).text("...")
			//store in view
			this.store("mapData",{large:map, dataBound:false, title:mapTitle, wrap:mapWrap});


			this.store("table", table); //store these in the view state
			this.store("tableOuter", tableOuter);
			this.store("tableHeader", tableHeader);

			this.store("charts", {wrap:chartWrap, height:chartHeight, pad:chartPad, group:chartSVG, groups: chartG, title: chartTitle, metro:chartMetroTitle, xaxis:xaxis});

			//period and category
			this.store("period","Five");
			this.store("category","gr")

			this.store("buttons", {period:periodButtons});
		}


		MetroMonitorVersion2.addView(redrawBase, "inclusionByRace.json", setupBase).name("Inclusion by race");
	})();