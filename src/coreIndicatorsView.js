//view 1 - "core indicators" view

	(function(){
		var colors = ['#d7191c','#fdae61','#ffffbf','#abd9e9','#2c7bb6'];
		var colors = ['#e66101','#fdb863','#f7f7f7','#b2abd2','#5e3c99'];
		var colors = ['#d01c8b','#f1b6da','#f7f7f7','#b8e186','#4dac26'];
		var colors = ['#053769', '#a4c7f2', '#cccccc', '#ffa626', '#ff5e1a'];

		var periods = {"Five":"2009 to 2014", "One":"2013 to 2014", "Ten":"2004 to 2014"};

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

		function getInd(category){
			if(category==="gr"){
				var indicators = [{c:"Emp", l:"Jobs", b:"gr", ls:"Jobs", i:0}, 
								  {c:"GMP", l:"Gross product", b:"gr", ls:"GMP", i:1}, 
								  {c:"Wages", l:"Aggregate wages", b:"gr", ls:"Agg. wages", i:2}];
			}
			else if(category==="pro"){
				var indicators = [{c:"AvgWage", l:"Average wage", b:"pro", ls:"Avg. wage", i:0}, 
								  {c:"GMPCap", l:"GMP per capita", b:"pro", ls:"GMP / cap.", i:1}, 
								  {c:"GMPJob", l:"GMP per job", b:"pro", ls:"GMP / job", i:2}];
			}
			else if(category==="inc"){
				var indicators = [{c:"EmpRatio", l:"Employment-to-population ratio", b:"inc", ls:"Emp. / pop.", i:0}, 
								  {c:"MedEarn", l:"Median earnings", b:"inc", ls:"Med. earn.", i:1}, 
								  {c:"RelPov", l:"Relative poverty", b:"inc", ls:"Rel. poverty", i:2}];
			}
			else{
				var indicators = [];
			}
			return indicators;
		}

		function getTime(period, category){
			var dates = {One:"2013–2014", Five:"2009–2014", Ten:"2004–2014"};
			var altDate = "1999–2014";
			var d;
			if(category=="inc" && period=="Ten"){d = altDate}
			else{d = dates[period]}
			return d;
		}

		
		//hold svg groups -- will be defined in setupBase

		var columns = [{}, {}];

		function drawDetailedTable(metro, ranges, period, g, formats){
			var grI = getInd("gr");
			var proI = getInd("pro");
			var incI = getInd("inc");

			var zot = [0,1,2];

			var catmap = zot.map(function(n,i,a){
				var sa = [grI[n], proI[n], incI[n]];
				return sa.map(function(ind, i, a){
					var I = ind.c+"_"+period+"V";
					var D = ind.c+"_"+period+"R";
					var R = ranges[I];
					var value = metro[(ind.b+"1")][I];
					var rank = metro[(ind.b)+"1"][D];
					return {cat:ind.b, metric:I, label: ind.ls, value:value, maxmin:R, rank:rank, absmax:d3.max(R, function(d,i){return Math.abs(d)})};
				});
			});


			/*var headerRow = g.selectAll("div.as-table-header-row").data([["Growth", "Prosperity", "Inclusion"]]);
			headerRow.enter().append("div").classed("as-table-header-row as-table-row",true);
			headerRow.exit().remove();
			
			headerRow.selectAll("div.as-table-cell").data(function(d,i){return d}).enter().append("div").classed("as-table-cell",true)
			.style("width",function(d,i){
				return i==2 ? "32%" :"34%";
			}).append("p").text(function(d,i){return d}).style({"font-size":"11px", "color":"#666666", "padding-bottom":"5px"});*/

			var threeRows = g.selectAll("div.as-table-row").data(catmap);
			threeRows.enter().append("div").classed("as-table-row",true);
			threeRows.exit().remove();

			var threeCells = threeRows.selectAll("div.as-table-cell").data(function(d,i){return d});
			threeCells.enter().append("div").classed("as-table-cell c-fix",true).style("width",function(d,i){
				return i==2 ? "32%" :"34%";
			}).style("text-align","center");

			threeCells.exit().remove();

			var cell_labels = threeCells.selectAll("div.value-label").data(function(d,i){
				return [d.label];
			});
			cell_labels.enter().append("div").classed("value-label",true).append("p");
			cell_labels.exit().remove();
			cell_labels.select("p").text(function(d,i){return d}).style({"font-size":"11px","text-transform":"uppercase","text-align":"center"});

			var cell_vals = threeCells.selectAll("div.value-actual").data(function(d,i){
				return [{v:d.value, r:d.rank}];
			});
			var cell_vals_enter = cell_vals.enter().append("div").classed("value-actual c-fix",true);
				//cell_vals_enter.append("div").style({"display":"inline-block","height":"6px","width":"6px","border-radius":"3px","margin":"4px 5px 3px 0px"});
				cell_vals_enter.append("p");
			cell_vals.exit().remove();
			cell_vals.select("p").html(function(d,i){
				var val = formats.pctch1(d.v);
				var rnk = formats.rankth(d.r);
				return '<b>'+val+'</b>' + ' <span style="color:#666666">(' + rnk + ')</span>';
			}).style({"font-size":"13px","text-align":"center","display":"inline-block"});
			//cell_vals.select("div").style("background-color",function(d,i){console.log(d); return "red"});

			/*var threeCol = g.selectAll("g.table-curve-columns").data(catmap);
			threeG.enter().append("g").attr("transform","translate(0,0)").classed("table-curve-columns",true);
			threeG.exit().remove();

			var threeRow = threeCol.selectAll("g.table-curve-rows").data(function(d,i){return d});
			var threeRowEnter = threeRow.enter().append("g").classed("table-curve-rows",true);
			threeRowEnter.append("text").classed("table-curve-label",true);
			threeRowEnter.append("text").classed("table-curve-value",true);
			threeRowEnter.append("line")*/

		}

		function drawTable(){
			var self = this;

			var table = this.store("table");
			var tableOuter = this.store("tableOuter");
			var tableHeader = this.store("tableHeader");

			var data = this.viewData("processed");
			var raw = this.viewData();
			var period = this.store("period");

			var headerPinned = this.store("headerPinned");
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
				var mapData = self.store("mapData");
				if(!!mapData){
					mapData.large.highlight(d,null,2);
				}				
			});
			rows.on("mouseleave",function(d,i){
				var thiz = d3.select(this);
				thiz.classed("row-is-highlighted", false);
				//remove highlight on map
				var mapData = self.store("mapData");
				if(!!mapData){
					mapData.large.highlight();
				}	
			});
			rows.on("mousedown",function(d,i){
				rows.classed("row-is-pinned",false);
				var thiz = d3.select(this).classed("row-is-pinned",true);
				self.setMetro(d);
				//no need to pin dot on map -- map will be redrawn -- see setMetro() -- and dot pinned
			});

			rows.select("p.row-label").text(function(d,i){return self.lookup[d][0].CBSA_Title});

			var swatchContainers = rows.select("div.row-swatches");
			var swatches = swatchContainers.selectAll("div.swatch").data(function(d,i){
				var metro = data.table[d];
				var keyR = period+"R";
				var keyV = period+"V";
				return [{r:metro.gr0[keyR], l:"G: "}, {r:metro.pro0[keyR], l:"P: "}, {r:metro.inc0[keyR], l:"I: "}];
			});
			swatches.enter().append("div").classed("swatch",true).append("p").style({"margin":"0px","text-align":"center"});
			swatches.exit().remove();

			swatches.style("background-color",function(d,i){return (r2c(d.r)).fill})
					.style("margin-left",function(d,i){return i==0 ? "0%" : "2%"}).style("margin-right",function(d,i){return i===2 ? "-30px" : "0px"})
					.style({"float":"left", "width":"32%", "pointer-events":"none"});
			swatches.select("p").text(function(d,i){return self.formats.rankth(d.r)}).style("color",function(d,i){return (r2c(d.r)).text});

			//draw the detail in each cell
			var detailTitle = rows.select("div.row-detail").selectAll("p.row-title").data(["Percent change over the last <b>" + (period=="One" ? "year" : (period.toLowerCase() + " years")) + "</b> on the indicators that determine overall rankings"]);
			detailTitle.enter().append("p").classed("row-title",true).style({"font-size":"13px","line-height":"1.3em","margin":"12px 0px 5px 0px","border-bottom":"1px solid #aaaaaa", "padding-bottom":"4px"});
			detailTitle.exit().remove();
			detailTitle.html(function(d,i){return d});

			var detailWrap = rows.select("div.row-detail").selectAll("div.as-table").data(function(d,i){return [d]});
			detailWrap.enter().append("div").classed("as-table",true);
			detailWrap.exit().remove();

			detailWrap.each(function(d,i){
				drawDetailedTable(data.table[d], data.ranges, period, d3.select(this), self.formats);
			})

			try{
				var swatchBox = swatchContainers.node().getBoundingClientRect();
				var swatchWidth = Math.round(swatchBox.right - swatchBox.left);
				if(swatchWidth < 50 || swatchWidth > 800){
					throw "bad width";
				}
				var SW = swatchWidth+"px";
			}
			catch(e){
				var SW = "100%";
			}
			finally{
				tableHeader.style("width",SW);
			}

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

				//scrollToTop
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
			var period = this.store("period");
			var category = this.store("category");

			var mapData = this.store("mapData");

			var bigMap = mapData.large;

			var titles = {"gr":"Growth in the 100 largest metro areas, "+ getTime(period, category),
						  "pro":"Prosperity change in the 100 largest metro areas, "+ getTime(period, category),
						  "inc":"Inclusion change in the 100 largest metro areas, "+ getTime(period, category)}

			bigMap.title(titles[category], {"margin":"20px 0px -5px 10px","font-size":"15px","line-height":"1em", "font-weight":"bold"});

			var self = this;

			//bind map data -- only once
			if(!mapData.dataBound){
				var data = this.viewData("processed"); //drawMaps is only called after processed data has been created
				var data2bind = data.universe.map(function(d,i){return {geo:d, dat:data.table[d]}});

				var addNumber = function(){
					this.svg.append("circle").attr({"cx":"73%","cy":"20px","r":"8","fill":"#dddddd"});
					this.svg.append("text").attr({"x":"73%","y":"24px"}).text(function(d,i){return d}).style({"fill":"#333333","font-size":"11px"}).attr("text-anchor","middle");
					this.metros.attr("r",3);
				}

				bigMap.setData(data2bind, "geo").drawMap(function(){
					this.metros.on("mousedown",function(d,i){
						self.setMetro(d.geo);
					})
				}).showTooltips();

				mapData.dataBound = true;

				/*bigMap.showOverlay();
				setTimeout(function(){
					bigMap.hideOverlay();
				},2000);*/
			}

			var formats = this.formats;
			//function generator
			function refill(){
				var obj = category+"0"; //e.g. gr0 (composite indicator) vs gr1 (component indicators);
				var r = 6;
				var ind = period+"R";

				//fn to refill the map dots based on the selection of indicator and time period -- the thisArg will be the map object
				return function(){
					this.metros.attr("r", function(d,i){
						return r;
					});

					//no transitions -- the select and highlight methods match the parameters of the underlying dots at the start of the transition causing erroneous results
					this.metros.attr("fill", function(d,i){
						var dat_obj = d.data.dat[obj];
						var col = r2c(dat_obj[ind]).fill;
						return col;
					});

					//for composite maps, set textAccessor
					//if(!!isComposite){
						var ta = function(d){
							var overall = (category=="gr" ? "Growth" : (category=="pro" ? "Prosperity" : "Inclusion")) + " rank: " + formats.rankth(d.data.dat[obj][ind]) + " of 100";
							return [overall];
						}
					//}
					this.textAccessor(ta);
				}
			}

			var metro = this.getMetro();
			//refill large map
			bigMap.drawMap(refill(true)).select(metro, null, 2);
		}

		//draw line charts
		function drawCurves(){
			var period = this.store("period");
			var category = this.store("category");
			var catlong = category==="gr" ? "Growth" : (category==="inc" ? "Inclusion" : "Prosperity");
			var charts = this.store("charts");
			var ticks = category==="inc" ? [1999, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014] : [2000,2001,2002,2003,2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014];
			var metro = this.getMetro();
			var metroName = this.lookup[metro][0].CBSA_Title;
			var self = this;

			charts.title.html("Trends in the components of " + catlong.toLowerCase());
			charts.legend.select("p").text(function(d,i){return i===0 ? metroName : "United States"})

			var getFormat = function(ind){
				if(ind in {"EmpRatio":0, "RelPov":0}){
					var fmt = self.formats.pct1;
				}
				else if(ind in {"MedEarn":0}){
					var fmt = self.formats.doll0;
				}
				else{
					var fmt = self.formats.num1;
				}
				return fmt;
			}

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
				var chartWidth = width-100;
				charts.group.attr("transform","translate(60,"+(0.75*charts.pad)+")");
				charts.groups.select("rect.chart-back").attr("width",chartWidth);
			}

			//data to plot
			var data = this.viewData().values[catlong.toLowerCase()][metro];
			var usdata = this.viewData().values[catlong.toLowerCase()]["99999"];
			var indicators = getInd(category);
			var scaleX = d3.scale.linear().domain([ticks[0], ticks[ticks.length-1]]).range([0,chartWidth]);
			var axisX = d3.svg.axis().scale(scaleX).orient("bottom")
									 .tickValues(ticks).tickFormat(function(v){return v})
									 .outerTickSize(0);
			
			//an array of accessors (of the data array)
			var accessors = indicators.map(function(d,i){
				var val = function(obs){return obs[d.c+"V"]}
				var year = function(obs){return obs.year}
				var extent = d3.extent(data.concat(usdata), val);
				//pad extent for scale
				var extent2 = [extent[0]-(Math.abs(extent[0])*0.025), extent[1]+(Math.abs(extent[1])*0.025)]; 
				//var extent2 = extent;
				var scaleY = d3.scale.linear().domain(extent2).range([charts.height, 0]);
				var fmt = getFormat(d.c);
				var axis = d3.svg.axis().scale(scaleY).orient("left").ticks(3).tickFormat(fmt).outerTickSize(0);
				var y = function(obs){return scaleY(val(obs))}
				var x = function(obs){return scaleX(year(obs))}
				var line = d3.svg.line().x(x).y(y);
				var metpath = line(data);
				var uspath = line(usdata);
				return {x:x, y:y, val:val, year:year, fmt:fmt, l:d.l, metpath:metpath, uspath:uspath, yaxis:axis}
			})

			try{
				charts.xaxis.transition().call(axisX)
					  .selectAll("text")
					  .attr({"transform": "rotate(-45)", "dy":"8px", "dx":"-0.2em"})
					  .style("text-anchor","end");

			}
			catch(e)
			{
			
			}
			
			//add in y-axes
			charts.groups = charts.groups.data(accessors); //bind accessors

			//set newly bound data to trend line - no need to enter/exit above always 3
			charts.groups.select("path.metro-trend-line").attr("d",function(d,i){
				return d.metpath;
			}).style({"fill":"none","stroke-width":"2px"});
			charts.groups.select("path.us-trend-line").attr("d",function(d,i){
				return d.uspath;
			}).style({"fill":"none","stroke-width":"2px"});


			charts.groups.select("text.chart-title")
						.text(function(d,i){return d.l.toUpperCase()})
						//.attr({x:chartWidth, "text-anchor":"end"});
			
			try{
				var yaxes = charts.groups.select("g.d3-axis-group").each(function(d,i){
					d3.select(this).transition().call(d.yaxis);
				});
			}catch(e){
				console.log(e);
			}

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
						if(!data.table.hasOwnProperty(prop)){data.table[prop] = {}}
						data.table[prop][propName] = A[i];
					}
				}
				var measures = this.viewData("raw").measures;
				putInTable(measures.growth.overall, "gr0");
				putInTable(measures.growth.detailed, "gr1");
				putInTable(measures.prosperity.overall, "pro0");
				putInTable(measures.prosperity.detailed, "pro1");
				putInTable(measures.inclusion.overall, "inc0");
				putInTable(measures.inclusion.detailed, "inc1");

				data.universe = this.viewData("raw").measures.growth.overall.map(function(d,i){return d.CBSA+""});

				data.ranges = {};
				function getRanges(A,propName){
					var ind = getInd(propName);
					var years = ["One", "Five", "Ten"];
					for(var y=0; y<3; y++){
						for(var i=0; i<ind.length; i++){
							var prop = ind[i].c + "_" + years[y] + "V";
							data.ranges[prop] = d3.extent(A, function(d,i,a){return d[prop]});
						}
					}
				}
				getRanges(measures.growth.detailed,"gr");
				getRanges(measures.prosperity.detailed,"pro");
				getRanges(measures.inclusion.detailed,"inc");

				this.viewData("processed",data);

				var buttons = this.store("buttons");
				buttons.period.on("mousedown",function(d,i){
					self.store("period",d.c);
					buttons.period.classed("generic-button-selected", function(d,j){return i===j});
					drawTable.call(self);
					drawMaps.call(self);
					drawCurves.call(self);
				});
				buttons.category.on("mousedown",function(d,i){
					self.store("category",d.c);
					buttons.category.classed("generic-button-selected", function(d,j){return i===j});
					drawTable.call(self);
					drawMaps.call(self);
					drawCurves.call(self);
				})

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
			this.header.append("p").text("Growth, prosperity, and inclusion in the 100 largest U.S. metro areas");
			
			//var tableWrap = this.container.append("div").style({"padding":"5px 0px 5px 0px", "border":"1px solid #dddddd", "border-width":"1px 0px 1px 0px"}).classed("two-fifths",true).append("div").style("max-height","600px");
			var headerWrap = this.container.append("div").classed("c-fix",true).style({"padding":"15px"});
			var header0 = headerWrap.append("div");;
			header0.append("p").html('Successful economic development should support <b>growth</b>, <b>prosperity</b>, and <b>inclusion</b> in the form of economic expansion, a rising standard of living, and broadly shared economic gains. <span style="font-style:italic"> Explore the data below to find out which large metro areas have performed best on these metrics over time.</span>')
							   .style({"margin":"0px"});
			/*header0.selectAll("div").data([{cat:"Growth", def:"Economic expansion"}, 
										   {cat:"Prosperity", def:"A rising standard of living"}, 
										   {cat:"Inclusion", def:"Broadly shared prosperity"}]).enter().append("div")
									.style({"float":"left", "padding":"5px 1.5%"})
									.append("p").html(function(d,i){return "<b>"+d.cat+": "+"</b>"+d.def}).style({"margin":"0px", "text-align":"center"});*/

			//header0.append("p").html('<span></span>').style({"font-style":"normal","line-height":"1.4em","padding":"5px 10px 0px 0px", "margin":"5px 20px 0px 0px", "border-top":"1px dotted #aaaaaa", "clear":"both", "font-size":"13px"});
			
			//legend area
			var legendAndTime = this.container.append("div").style({"padding-bottom":"15px", "border-bottom":"1px solid #dddddd", "margin-bottom":"15px"}).classed("c-fix",true);
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
			tableHeaderWrap.append("p").classed("table-title",true).text("Sort through the rankings")
						   .style({"font-style":"italic","line-height":"1em", "margin":"0px 15px 10px 10px"});

			var tableHeader = tableHeaderWrap.append("div").style({"background-color":"#dddddd", "padding":"0px 10px", "height":"25px"})
											 .append("div").classed("c-fix",true);
			
			tableHeader.selectAll("div.th").data(["Growth","Prosperity","Inclusion"]).enter().append("div")
				.style("margin-left",function(d,i){return i==0 ? "0%" : "2%"})
				.style("margin-right",function(d,i){return i===2 ? "-30px" : "0px"})
				.style({"float":"left", "width":"32%"})
				.append("p").style({"line-height":"1em","margin":"0px","font-size":"13px","text-align":"center","padding":"6px 0px"})
				.text(function(d,i){return d});

			var tableOuter = rightSide.append("div").style({"clear":"both","border":"1px solid #aaaaaa", "border-width":"1px 0px 1px 0px", "padding":"0px", "max-height":"800px", "overflow-y":"auto"});
			var tableWrap = tableOuter.append("div").style("padding","0px 0px 500px 0px");
			var table = tableWrap.append("div").style("width","100%"); //.append("g").attr("id","core-svg-table")

			//MAPS SETUP
			var mapAndCharts = this.container.append("div").style("overflow","visible").classed("three-fifths no-mobile-display",true)
											.append("div").style({"padding":"0px 30px 0px 0px","position":"relative"});;
			var mapAndChartsTitle = mapAndCharts.append("div").style({"position":"relative","z-index":"5"})
									.append("p").classed("map-title",true)
				                    .text("Map and chart the data")
				                    .style({"font-style":"italic","line-height":"1em", "margin":"0px 15px 10px 0px"});


			var catMenu = mapAndCharts.append("div").classed("c-fix",true).style({"background-color":"#dddddd", "padding":"0px 15px", "height":"25px","border-bottom":"1px solid #aaaaaa"});
			catMenu.append("p").style({"float":"left","right":"0px 15px 0px 0px","font-size":"13px","padding":"6px 8px 6px 0px", "line-height":"1em"}).text("Select: ")
			var categoryButtons = catMenu.selectAll("div").data([{c:"gr", l:"Growth"}, {c:"pro", l:"Prosperity"}, {c:"inc", l:"Inclusion"}])
										 .enter().append("div").classed("generic-button",true).classed("generic-button-selected",function(d,i){return i===0})
										 .style({"float":"left","margin":"0px 4px 0px 0px","border":"none","height":"100%"});
				categoryButtons.append("p").text(function(d,i){return d.l}).style("padding","6px 8px");


			var mapWrap = mapAndCharts.append("div").style("overflow","visible").style({"padding":"0px 0px 0px 0px","position":"relative"});
			//add another div and create the map within it
			var map = new dotMap(mapWrap.append("div").node());
			map.makeResponsive();


			//CHARTSS SETUP
			var chartWrap = mapAndCharts.append("div").style("overflow","visible");
			var chartHeight = 70;
			var chartPad = 35;
			var threeChartPad = 0;
							
			var chartTitleWrap = chartWrap.append("div").style({"position":"relative","z-index":"5"});
			var chartTitle = chartTitleWrap.append("p").classed("charts-title",true)
				                    .html('Change in the selected metro area over time')
				                    .style({"margin":"0px 15px 5px 10px","font-weight":"bold"});
			var chartLegend = chartTitleWrap.append("div").classed("c-fix",true).style({"padding":"0px 0px 10px 0px", "margin":"0px 15px 15px 0px", "border-bottom":"1px dotted #aaaaaa"})
						  .selectAll("div").data(["Metro","U.S."]).enter()
						  .append("div").style({float:"left", "margin":"0px 10px 0px 10px"}).classed("c-fix",true);
			chartLegend.append("div").style({"height":"2px","width":"20px","margin":"7px 5px 6px 2px", "float":"left"})
						.style("background-color", function(d,i){return i===0 ? "#00649f" : "#aaaaaa"});
			chartLegend.append("p").text(function(d,i){return d}).style({"line-height":"1em","margin":"0px","float":"left"});


			var chartSVG = chartWrap.append("svg").style({"width":"100%","height":((chartHeight*3)+(chartPad*4)+35)+"px"}).append("g").attr("transform","translate(0,0)");
			var chartG = chartSVG.selectAll("g").data([1,2,3]).enter().append("g")
												.attr("transform",function(d,i){return "translate(0," + i*(chartHeight+chartPad) + ")"});
			//add y-axes to each group
			chartG.append("g").classed("d3-axis-group",true).attr("transform","translate(0,0)");

			var xaxis = chartSVG.append("g").attr("transform","translate(0,"+((3*chartHeight)+(2*chartPad)+5)+")").classed("d3-axis-group",true);
				//xaxis.append("line").attr({"x1":"0%","x2":"100%","y1":"1","y2":"1","stroke":"#aaaaaa", "stroke-width":"1px"})
				//					.style("shape-rendering","crispEdges");

			chartG.append("rect").attr({"width":"100%","height":chartHeight+"px","fill":"#fbfbfb"}).classed("chart-back",true);
			chartG.append("path").classed("us-trend-line",true).attr({"d":"M0,0", "stroke":"#aaaaaa"});
			chartG.append("path").classed("metro-trend-line",true).attr({"d":"M0,0", "stroke":"#00649f"});
			chartG.append("text").classed("chart-title",true).attr({x:"-5",y:"-7"}).attr({"font-size":"13px"}).text("...")
			//store in view
			this.store("mapData",{large:map, dataBound:false});


			this.store("table", table); //store these in the view state
			this.store("tableOuter", tableOuter);
			this.store("tableHeader", tableHeader);

			this.store("mapWrap", mapWrap);
			this.store("charts", {wrap:chartWrap, height:chartHeight, pad:chartPad, group:chartSVG, groups: chartG, title: chartTitle, legend:chartLegend, xaxis:xaxis});

			//period and category
			this.store("period","Five");
			this.store("category","gr")

			this.store("buttons", {period:periodButtons, category:categoryButtons});
		}

		var view1 = MetroMonitorVersion2.addView(redrawBase, "coreIndicators.json", setupBase);
		view1.name("Growth / Prosperity / Inclusion");
	})();