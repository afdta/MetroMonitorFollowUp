//view 1 - "core indicators" view

	(function(){
		var colors = ['#053769', '#a4c7f2', '#cccccc', '#ffa626', '#ff5e1a'];
		
		var dataFile = "data/coreIndicators.json";
		//var dataFile = "/~/media/multimedia/interactives/2016/MetroMonitor/data/coreIndicators.json";

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
								  {c:"MedEarn", l:"Median wage", b:"inc", ls:"Med. wage", i:1}, 
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


		function drawDetailedTable(metro, period, g, formats){
			//console.log(metro);

			var grI = getInd("gr");
			var proI = getInd("pro");
			var incI = getInd("inc");

			var zot = [0,1,2];

			var catmap = zot.map(function(n,i,a){
				var sa = [grI[n], proI[n], incI[n]];
				return sa.map(function(ind, i, a){
					var I = ind.c+"_"+period+"V";
					var D = ind.c+"_"+period+"R";
					var value = metro[(ind.b+"1")][I];
					var rank = metro[(ind.b)+"1"][D];
					return {cat:ind.b, metric:I, label: ind.ls, value:value, rank:rank};
				});
			});

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
				cell_vals_enter.append("p");
			cell_vals.exit().remove();
			cell_vals.select("p").html(function(d,i){
				var val = formats.pctch1(d.v);
				var rnk = formats.rankth(d.r);
				return '<b>'+val+'</b>' + ' <span style="color:#666666">(' + rnk + ')</span>';
			}).style({"font-size":"13px","text-align":"center","display":"inline-block"});

		}


		var sortProp = {prop:null, asc:true, justsorted:false};
		function drawTable(){

			var table = this.store("table");
			var tableOuter = this.store("tableOuter");
			var tableHeader = this.store("tableHeader");

			var data = this.viewData("processed");
			var raw = this.viewData();
			var period = this.store("period");

			var headerPinned = this.store("headerPinned");
			var metro = this.getMetro();
			var self = this;

			//sort data
			data.universe_sort.sort(function(a,b){
				try{
					if(!sortProp.prop){
						var order = a > b ? 1 : -1;
					}
					else{
						if(sortProp.prop in {"gr":1, "inc":1, "pro":1}){
							var ra = data.table[a][sortProp.prop+"0"][period+"R"];
							var rb = data.table[b][sortProp.prop+"0"][period+"R"];
							var order = (ra < rb && sortProp.asc) || (ra > rb && !sortProp.asc) ? -1 : (ra==rb ? 0 : 1);
							
						}
						else{
							var order = 0;
						}
					}
				}
				catch(e){
					var order = 0;
				}
				finally{
					return order;
				}
			});

			var rows = table.selectAll("div.table-row").data(data.universe_sort, function(d,i){return d});
			var rowEnter = rows.enter().append("div").classed("table-row",true);

			rowEnter.append("p").classed("row-label",true).style({"pointer-events":"none","margin":"0px 0px 5px 0px","line-height":"1em"});
			rowEnter.append("div").classed("c-fix row-swatches",true);
			rowEnter.append("div").classed("c-fix row-detail",true);
			rows.exit().remove();	
			
			//determine if the selected metro is pinned at the top -- if so, it should remain at the top of the table after sorting
			//need to do this before reordering the dom below
			try{
				var metBallpark = rows.filter(function(d,i){return d==metro}).node();
				var ballPark = metBallpark.parentNode.parentNode.parentNode;
				var ballParkDist = metBallpark.getBoundingClientRect().top-ballPark.getBoundingClientRect().top;
				var inTheBallPark = ballParkDist > -80 && ballParkDist < 200; //snap to current
			}
			catch(e){
				var inTheBallPark = false;
			}
			rows.order();

			//after sorting, is the pinned metro above/below where it was?
			try{
				var newMetBallPark = rows.filter(function(d,i){return d==metro}).node();
				var newBallParkDist = newMetBallPark.getBoundingClientRect().top-ballPark.getBoundingClientRect().top;
				var detailNode = newMetBallPark.lastChild.getBoundingClientRect();

				//if it was above and now below, you need to remove offset (and vice versa)
				if(ballParkDist < 0 && newBallParkDist > 0){
					var offsetDistance = detailNode.top-detailNode.bottom; //subtract this offset
				}
				else if(ballParkDist > 0 && newBallParkDist < 0){
					var offsetDistance = detailNode.bottom - detailNode.top; //add
				}
				else{
					var offsetDistance = 0;
				};
			}
			catch(e){
				var offsetDistance = 0;
			}

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
			detailTitle.enter().append("p").classed("row-title",true).style({"font-size":"13px","line-height":"1.3em","margin":"0px","border-bottom":"1px solid #aaaaaa", "padding-bottom":"4px"});
			detailTitle.exit().remove();
			detailTitle.html(function(d,i){return d});

			var detailWrap = rows.select("div.row-detail").selectAll("div.as-table").data(function(d,i){return [d]});
			detailWrap.enter().append("div").classed("as-table",true);
			detailWrap.exit().remove();

			detailWrap.each(function(d,i){
				drawDetailedTable(data.table[d], period, d3.select(this), self.formats);
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
					var containerT = parNode.parentNode.parentNode.getBoundingClientRect().top;

					if(containerT < 0){return null};

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
					var T = 0;
				}

				//scrollToTop
				if(self.changeEvent.view){
					tableOuter.node().scrollTop = T;
				}
				else if(self.changeEvent.metro){
					tableOuter.transition().duration(1000).tween("scrollTopTween", tweenGen); 
				}
				else if(inTheBallPark){
					tableOuter.node().scrollTop = T; //show the metro if it's near top
				}
				else if(sortProp.justsorted){
					tableOuter.node().scrollTop = 0; //if there's a sort prop--the user is interested in sort order
				}
				else{
					var currentScroll = tableOuter.node().scrollTop;
					var newScroll = currentScroll + offsetDistance;
					if(newScroll < 0){newScroll=0}
					tableOuter.node().scrollTop = newScroll; //so nothing changes
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

			bigMap.title(titles[category], {"margin":"15px 0px -5px 10px","font-size":"15px","line-height":"1em", "font-weight":"bold"});

			var self = this;

			//bind map data -- only once
			if(!mapData.dataBound){
				var data = this.viewData("processed"); //drawMaps is only called after processed data has been created
				var data2bind = data.universe.map(function(d,i){return {geo:d, dat:data.table[d]}});

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

					//set textAccessor
					var ta = function(d){
						var overall = (category=="gr" ? "Growth" : (category=="pro" ? "Prosperity" : "Inclusion")) + " rank: " + formats.rankth(d.data.dat[obj][ind]) + " of 100";
						return [overall];
					}
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
			charts.legend.select("p").text(function(d,i){return i===0 ? metroName : "United States"});
			charts.note.style("display",category==="inc" ? "block" : "none");

			var getFormat = function(ind, decimals){
				var dec = !!decimals && decimals < 2 && decimals >= 0 ? decimals : 0;
				var pct = "pct"+dec;
				var doll = "doll"+dec;
				var num = "num"+dec;

				if(ind in {"EmpRatio":0, "RelPov":0}){
					var fmt = self.formats[num];
				}
				else if(ind in {"MedEarn":0}){
					var fmt = self.formats[num];
				}
				else{
					var fmt = self.formats[num];
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
				var chartWidth = width-95;
				charts.groups.select("rect.chart-back").attr("width",chartWidth);
			}

			//data to plot
			var data = this.viewData().values[catlong.toLowerCase()][metro];
			var usdata = this.viewData().values[catlong.toLowerCase()]["99999"];
			var indicators = getInd(category);
			var scaleX = d3.scale.linear().domain([ticks[0], ticks[ticks.length-1]]).range([0,chartWidth]);
			var axisX = d3.svg.axis().scale(scaleX).orient("bottom")
									 .tickValues(ticks).tickFormat(function(v){return v})
									 .tickSize(6,6);
			
			//an array of accessors (of the data array)
			var accessors = indicators.map(function(d,i){
				var val = function(obs){return obs[d.c+"V"]}
				var year = function(obs){return obs.year}
				var extent = d3.extent(data.concat(usdata), val);
				//pad extent for scale
				var extent2 = [extent[0]-(Math.abs(extent[0])*0.05), extent[1]+(Math.abs(extent[1])*0.05)]; 
				//var extent2 = extent;
				var scaleY = d3.scale.linear().domain(extent2).range([charts.height, 0]);
				var tickVals = scaleY.ticks(3);
				var fmt = getFormat(d.c, 1);
				var fmt0 = getFormat(d.c, 0);
				var axis = d3.svg.axis().scale(scaleY).orient("left").tickValues(tickVals).tickFormat(fmt0).tickSize(0,0);
				var y = function(obs){return scaleY(val(obs))}
				var x = function(obs){return scaleX(year(obs))}
				var line = d3.svg.line().x(x).y(y);
				var metpath = line(data);
				var uspath = line(usdata);
				var baseyear = d.c in {"MedEarn":1, "RelPov":1, "EmpRatio":1} ? 1999 : 2000;

				return {x:x, y:y, val:val, year:year, fmt:fmt, l:(d.l + " (indexed, " +baseyear+ "=100)"), metpath:metpath, uspath:uspath, yaxis:axis, ticks:tickVals, yscale:scaleY}
			});

			try{
				charts.xaxis.transition().call(axisX)
					  .selectAll("text")
					  .attr({"transform": "rotate(-45)", "dy":"8px", "dx":"-0.2em", "font-weight":"bold"})
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
			}).attr({"fill":"none","stroke-width":"2px"});
			charts.groups.select("path.us-trend-line").attr("d",function(d,i){
				return d.uspath;
			}).attr({"fill":"none","stroke-width":"2px"});



			charts.groups.select("text.chart-title")
						.text(function(d,i){return d.l})
						.attr({x:0, "text-anchor":"start", "font-weight":"bold"});

			var gridLines = charts.groups.select("g.grid-line-group").selectAll("line").data(function(d,i){
				return d.ticks.map(function(v,i){return d.yscale(v) });
			});
			gridLines.enter().append("line");
			gridLines.exit().remove();
			gridLines.attr({"x1":0, "x2":chartWidth, "stroke":"#dddddd", "stroke-width":"1", "stroke-dasharray":"2,2"})
					 .attr("y1",function(d,i){return d})
					 .attr("y2",function(d,i){return d})
					 .style("shape-rendering","crispEdges");

			
			try{
				var yaxes = charts.groups.select("g.d3-axis-group").each(function(d,i){
					d3.select(this).transition().call(d.yaxis);
				});
			}catch(e){
				//console.log(e);
			}

			//add hover panels
			var verticalBlinds = charts.hover.selectAll("rect").data(ticks);
			var vertBlindWidth = chartWidth/(ticks[ticks.length-1]-ticks[0]);
			verticalBlinds.enter().append("rect");
			verticalBlinds.exit().remove();
			verticalBlinds.attr({"height":"800px", "fill":"#ffffff", "opacity":"0", "stroke":"#ffffff", "y":-40, width:vertBlindWidth}).style("pointer-events","all")
				.attr("x",function(d,i){
					return scaleX(d)-(0.5*vertBlindWidth);
				})

			var dotGroup;
			verticalBlinds.on("mouseenter",function(d,i){
				try{
					var x = scaleX(d);
					var obs = data.filter(function(o,i,a){
						return o.year==d; 
					});
					var usobs = usdata.filter(function(o,i,a){
						return o.year==d;
					});

					//each chart group (3 total) has 1 hover dot group -- we need to bind the accessors with the dot data.
					dotGroup = charts.groups.selectAll("g.chart-hover-dot-group").data(function(d,i){
						return [{acc:d, dat:[usobs[0],obs[0]], col:["#aaaaaa","#00649f"] }];
					});
					dotGroup.enter().append("g").classed("chart-hover-dot-group",true);
					dotGroup.exit().remove();

					dotGroup.attr("transform","translate("+x+",0)").style("visibility","visible");

					var backs = dotGroup.selectAll("rect").data(function(d,i){return [d,d]});
						backs.enter().append("rect");
						backs.exit().remove();
						backs.attr({"x":0,"fill":"#ffffff","opacity":0.75});

					var dots = dotGroup.selectAll("circle").data(function(d,i){return [d,d]});
						dots.enter().append("circle");
						dots.exit().remove();
						dots.attr({"cx":"0","r":"3"})
							.attr("cy",function(d, i){
								return d.acc.y(d.dat[i]);
							})
							.attr("fill",function(d,i){
								return d.col[i];
							})

					var labels = dotGroup.selectAll("text").data(function(d,i){return [d,d]});
						labels.enter().append("text");
						labels.exit().remove();
						labels.attr({"x":0})
							  .text(function(d,i){
							  	var other = i==0 ? 1 : 0; //index of the other label
							  	var val = d.acc.val(d.dat[i]);
							  	var otherval = d.acc.val(d.dat[other]);
							  	return i==0 && val==otherval ? "" : d.acc.fmt(val);
							  })
							  .attr({"font-size":"11px", "dy":0, "dx":2, "text-anchor":"start"})
							  .attr("y",function(d,i){
							  	var other = i==0 ? 1 : 0; //index of the other label
							  	var val = d.acc.val(d.dat[i]);
							  	var otherval = d.acc.val(d.dat[other]);
							  	var y = d.acc.yscale(val);
							  	if(val >= otherval){var yp = y-7}
							  	else{var yp = y+14}
							  	return yp;
							  })
							  .attr("fill",function(d,i){
							  	return i==0 ? "#666666" : d.col[i];
							  })
							  .style("fill",function(d,i){
							  	return i==0 ? "#666666" : d.col[i];
							  });

					backs.each(function(d,i){
						try{
							var text = d3.select(this.parentNode).selectAll("text").filter(function(d,j){return i==j});
							var box = text.node().getBoundingClientRect();
							var w = box.right - box.left;;
							var y = text.attr("y");
							d3.select(this).attr({"width":box.right-box.left+6, "height":box.bottom-box.top+4, "x":-1, "y":y-13, "rx":5, "ry":5});
						}
						catch(e){
							console.log(e);
							d3.select(this).style("width","0");
						}

					});
								 
				}
				catch(e){
					charts.groups.select("g.chart-hover-dot-group").style("visibility","hidden").selectAll("text").remove();
				}
			})
			verticalBlinds.on("mouseleave",function(d,i){
				dotGroup.attr("transform","translate(0,0)").style("visibility","hidden");
			})

		}

		//redraw -- setup is just to add html
		function redrawBase(){
			var self = this;
			var buttons = this.store("buttons");
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
				data.universe_sort = data.universe.slice(0); 

				this.viewData("processed",data);

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
					sortAndDrawTable(d.c, false);
					drawMaps.call(self);
					drawCurves.call(self);
				})

			}

			var tableSortButtons = this.store("tableSortButtons");
			function sortAndDrawTable(code, callOriginatedFromTableSort){
				var thiz = tableSortButtons.filter(function(d,i){return d.c==code;});
				tableSortButtons.classed("sort-asc sort-desc",false); //reset buttons

				if(sortProp.prop==code && !sortProp.asc){
					//reset
					sortProp.prop = null;
					sortProp.asc = true;
					var addClass = false;
				}
				else if(sortProp.prop==code){
					sortProp.asc = !sortProp.asc;
					var addClass = true;
				}
				else{
					sortProp.prop = code;
					sortProp.asc = true;
					var addClass = true;
				}

				if(addClass){
					thiz.classed("sort-asc", sortProp.asc);
					thiz.classed("sort-desc", !sortProp.asc);
				}
				
				sortProp.justsorted = true;
				drawTable.call(self);
				sortProp.justsorted = false;

				//if call doesn't originate from table sort buttons, don't do any redrawing
				if(callOriginatedFromTableSort){
					self.store("category",code); //change the selected category
					drawMaps.call(self);
					drawCurves.call(self);
					buttons.category.classed("generic-button-selected",function(d,i){
						return code==d.c;
					});					
				}
			}
			tableSortButtons.on("mousedown",function(d,i){sortAndDrawTable(d.c, true)});


			//redraw
			drawTable.call(this);
			if(this.changeEvent.view || this.changeEvent.metro){drawMaps.call(this);} //map class handles changes due to resizing
			drawCurves.call(this);
		}

		var setupBase = function(){
			var self = this;
			this.header.append("p").text("Growth, prosperity, and inclusion in the 100 largest U.S. metro areas");
			
			var headerWrap = this.container.append("div").classed("c-fix",true).style({"padding":"15px"});
			var header0 = headerWrap.append("div");;
			var openFlexBox = header0.append("p").html('The Metro Monitor measures the performance of the nation\'s major metropolitan economies in three critical areas for economic development: growth, prosperity, and inclusion. Successful economic development should put a metropolitan economy on a higher trajectory of long-run growth (<span style="font-style:italic">growth</span>) by improving the productivity of individuals and firms in order to raise local standards of living (<span style="font-style:italic">prosperity</span>) for all people (<span style="font-style:italic">inclusion</span>). The Metro Monitor examines indicators within each of these categories that help assess metropolitan areas\' progress toward shaping an advanced economy that works for all.')
							   .style({"margin":"0px", "margin-right":"0"}).append("span").text(" Define the indicators»")
							   .style({"font-weight":"bold","cursor":"pointer", "font-style":"italic"});


			//add a definitions box
			var flexBoxOuter = this.container.append("div").style({"height":"0px","overflow":"hidden","position":"relative"});
			//var flexBoxClose = flexBoxOuter.append("p").style({"position":"absolute","top":"5px","right":"5px","padding":"5px","cursor":"pointer"}).text("X")
			var flexBox = flexBoxOuter.append("div").style({"padding":"15px 15px", "margin":"0px 15px", "border":"1px solid #dddddd", "background-color":"#fbfbfb"});
			var flexBoxOpen = false;
			flexBox.append("p").style({"padding":"0px 15px 5px 5px"}).html('<b>Growth</b> indicators capture change in the total size of a metropolitan area’s economy. As a metropolitan economy grows, it creates new opportunities for individuals and can become more efficient as it grows larger. Growth indicators capture change in:');
			flexBox.append("p").classed("bulleted-item",true).html('<span>Jobs</span>: Total full- and part-time jobs. Source: Moody\'s Analytics');
			flexBox.append("p").classed("bulleted-item",true).html('<span>Gross metropolitan product (GMP)</span>: Total value of goods and services produced in a metropolitan economy.  Source: Moody\'s Analytics');
			flexBox.append("p").classed("bulleted-item",true).style({"padding-bottom":"25px"}).html('<span>Aggregate wages</span>: Total value of wages, salaries, and benefits paid to all workers.  Source: Moody\'s Analytics');

			flexBox.append("p").style({"padding":"0px 15px 5px 5px"}).html('<b>Prosperity</b> refers to the wealth and income produced by an economy on a per-capita or per-worker basis. When a metropolitan area grows by increasing the productivity of its workers, the value of those workers’ labor rises. As the value of labor rises, so can workers’ wages. In this way, prosperity indicators capture the quality of a metropolitan area’s economic growth from the standpoint of its workers and residents. Prosperity indicators capture change in:');
			flexBox.append("p").classed("bulleted-item",true).html('<span>GMP per job</span>: A measure of productivity equal to GMP divided by total jobs. Source: Moody\'s Analytics');
			flexBox.append("p").classed("bulleted-item",true).html('<span>Average annual wage</span>: Aggregate wages divided by total jobs. Source: Moody\'s Analytics');
			flexBox.append("p").classed("bulleted-item",true).style({"padding-bottom":"25px"}).html('<span>GMP per capita</span>: A measure of living standards equal to GMP divided by total population. Source: Moody\'s Analytics and the U.S. Census Bureau');			

			flexBox.append("p").style({"padding":"0px 15px 5px 5px"}).html('<b>Inclusion</b> indicators measure how the benefits of growth and prosperity in a metropolitan economy are distributed among people. Inclusive growth enables more people to invest in their skills and to purchase more goods and services. Inclusion indicators capture change in:');
			flexBox.append("p").classed("bulleted-item",true).html('<span>Median wage</span>: The annual wage earned by the person in the very middle of a metropolitan area\'s income distribution. Source: U.S. Census Bureau');
			flexBox.append("p").classed("bulleted-item",true).html('<span>Relative income poverty rate</span>: The share of people in a metropolitan economy who earn less than half of the local median wage. Source: U.S. Census Bureau');
			flexBox.append("p").classed("bulleted-item",true).style({"padding-bottom":"25px"}).html('<span>Employment-to-population ratio</span>: The share of all individuals aged 18 to 65 who are employed. Source: U.S. Census Bureau' );

			flexBox.append("p").style({"padding":"0px 15px 5px 5px", "margin":"0px"}).html('All changes are calculated as the percent change from start year to end year. Calculations involving dollar amounts are inflation-adusted. Rankings for each category are based on a composite score of the changes in the three indicators within each category.')

			openFlexBox.on("mousedown",function(d,i){
				flexBoxOpen = !flexBoxOpen;
				d3.select(this).text(flexBoxOpen ? " Hide the indicator definitions." : " Define the indicators»");
				if(!flexBoxOpen){
					flexBoxOuter.interrupt().transition().duration(600).style({"height":"0px","margin-bottom":"0px"})
						.each("end",function(d,i){
							self.refreshHeight();
						});
				}else{
					try{
						var box = flexBox.node().getBoundingClientRect();
						var height = (box.bottom-box.top)+"px";
					}
					catch(e){
						var height = "auto";
					}
					flexBoxOuter.transition().duration(600).style({"height":height,"margin-bottom":"15px"})
						.each("end",function(d,i){
							flexBoxOuter.style("height","auto");
							self.refreshHeight();
						});
				}
			});

			//legend area
			var legendAndTime = this.container.append("div").style({"padding":"10px 0px 15px 0px", "border-bottom":"1px solid #dddddd", "margin-bottom":"15px"}).classed("c-fix",true);
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
			
			var tableSortButtons = tableHeader.selectAll("div.th").data([{l:"Growth",c:"gr"},{l:"Prosperity",c:"pro"},{l:"Inclusion",c:"inc"}]).enter().append("div")
				.style("margin-left",function(d,i){return i==0 ? "0%" : "2%"})
				.style("margin-right",function(d,i){return i===2 ? "-30px" : "0px"})
				.style({"float":"left", "width":"32%"}).style("cursor","pointer");
			tableSortButtons.append("p").style({"line-height":"1em","margin":"0px","font-size":"13px","text-align":"center","padding":"6px 0px"})
				.text(function(d,i){return d.l});

			var tableOuter = rightSide.append("div").style({"clear":"both","border":"1px solid #aaaaaa", "border-width":"1px 0px 1px 0px", "padding":"0px", "max-height":"850px", "overflow-y":"auto"});
			var tableWrap = tableOuter.append("div").style({"padding":"0px 0px 600px 0px","background-color":"#dddddd"});
			var table = tableWrap.append("div").style("width","100%"); //.append("g").attr("id","core-svg-table")

			//MAPS SETUP
			var mapAndCharts = this.container.append("div").style("overflow","visible").classed("three-fifths no-mobile-display",true)
											.append("div").style({"padding":"0px 30px 0px 0px","position":"relative"});;
			var mapAndChartsTitle = mapAndCharts.append("div").style({"position":"relative","z-index":"5"})
									.append("p").classed("map-title",true)
				                    .text("Map and chart the data")
				                    .style({"font-style":"italic","line-height":"1em", "margin":"0px 15px 10px 0px"});


			var catMenu = mapAndCharts.append("div").classed("c-fix",true).style({"background-color":"#dddddd", "padding":"0px 15px", "height":"25px","border-bottom":"1px solid #aaaaaa"});
			catMenu.append("p").style({"float":"left","font-size":"13px","padding":"6px 8px 6px 0px", "line-height":"1em","font-weight":"bold"}).text("Select: ")
			var categoryButtons = catMenu.selectAll("div").data([{c:"gr", l:"Growth"}, {c:"pro", l:"Prosperity"}, {c:"inc", l:"Inclusion"}])
										 .enter().append("div").classed("generic-button",true).classed("generic-button-selected",function(d,i){return i===0})
										 .style({"float":"left","margin":"0px 4px 0px 0px","border":"none","height":"100%"});
				categoryButtons.append("p").text(function(d,i){return d.l}).style("padding","6px 8px");


			var mapWrap = mapAndCharts.append("div").style("overflow","visible").style({"padding":"0px 0px 0px 0px","position":"relative","z-index":"5"});
			//add another div and create the map within it
			var map = new dotMap(mapWrap.append("div").node());
			map.makeResponsive();


			//CHARTS SETUP
			var chartWrap = mapAndCharts.append("div").style({"overflow":"visible","position":"relative","z-index":"3"});
			var chartHeight = 85;
			var chartPad = 45;
			var threeChartPad = 0;
							
			var chartTitleWrap = chartWrap.append("div");
			var chartTitle = chartTitleWrap.append("p").classed("charts-title",true)
				                    .html('Change in the selected metro area over time')
				                    .style({"margin":"0px 15px 5px 10px","font-weight":"bold"});
			var chartLegend = chartTitleWrap.append("div").classed("c-fix",true).style({"padding":"0px 0px 10px 0px", "margin":"0px 15px 0px 0px", "border-bottom":"1px dotted #aaaaaa"})
						  .selectAll("div").data(["Metro","U.S."]).enter()
						  .append("div").style({float:"left", "margin":"0px 10px 0px 10px"}).classed("c-fix",true);
			chartLegend.append("div").style({"height":"2px","width":"20px","margin":"7px 5px 6px 2px", "float":"left"})
						.style("background-color", function(d,i){return i===0 ? "#00649f" : "#aaaaaa"});
			chartLegend.append("p").text(function(d,i){return d}).style({"line-height":"1em","margin":"0px","float":"left"});


			var chartSVG = chartWrap.append("svg").style({"width":"100%","height":((chartHeight*3)+(chartPad*2)+35+65)+"px"})
									.append("g").attr("transform","translate(50,35)");
			var chartG = chartSVG.selectAll("g").data([1,2,3]).enter().append("g")
												.attr("transform",function(d,i){return "translate(0," + i*(chartHeight+chartPad) + ")"});
			//add y-axes to each group
			chartG.append("g").classed("d3-axis-group",true).attr("transform","translate(0,0)");

			var xaxis = chartSVG.append("g").attr("transform","translate(0,"+((3*chartHeight)+(2*chartPad)+10)+")").classed("d3-axis-group",true);

			chartG.append("rect").attr({"width":"100%","height":chartHeight+"px","fill":"#fbfbfb", "stroke":"#dddddd"})
				  .classed("chart-back",true).style("shape-rendering","crispEdges");
			chartG.append("g").classed("grid-line-group",true);
			chartG.append("path").classed("us-trend-line",true).attr({"d":"M0,0", "stroke":"#aaaaaa"});
			chartG.append("path").classed("metro-trend-line",true).attr({"d":"M0,0", "stroke":"rgb(9, 95, 181)"});
			chartG.append("text").classed("chart-title",true).attr({x:"0",y:"-6"}).attr({"font-size":"13px"}).text("...")
			var chartHoverDot = chartG.append("g").style("visibility","hidden").classed("chart-hover-dot-group",true);
			var hoverPanels = chartSVG.append("g"); //hold verticalBlinds

			var chartNote = chartWrap.append("p").text("Data unavailable for 2000–05; values are interpolated for these years.")
								 				.style({"font-size":"13px","margin":"-10px 10px 0px 45px"})



			//store in view
			this.store("mapData",{large:map, dataBound:false});


			this.store("table", table); //store these in the view state
			this.store("tableOuter", tableOuter);
			this.store("tableHeader", tableHeader);
			this.store("tableSortButtons", tableSortButtons);

			this.store("mapWrap", mapWrap);
			this.store("charts", {wrap:chartWrap, height:chartHeight, pad:chartPad, group:chartSVG, groups: chartG, title: chartTitle, legend:chartLegend, xaxis:xaxis, hover:hoverPanels, note:chartNote});

			//period and category
			this.store("period","Five");
			this.store("category","gr")

			this.store("buttons", {period:periodButtons, category:categoryButtons});
		}

		var view1 = MetroMonitorVersion2.addView(setupBase, redrawBase, dataFile);
		view1.name("Growth / Prosperity / Inclusion");
	})();