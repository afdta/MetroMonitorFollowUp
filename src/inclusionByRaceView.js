//view 1 - "inclusion by race" view

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
				var indicators = [{c:"Emp_", l:"Jobs", b:"gr", ls:"Jobs", i:0}, 
								  {c:"GMP_", l:"Gross product", b:"gr", ls:"GMP", i:1}, 
								  {c:"Wages_", l:"Aggregate wages", b:"gr", ls:"Agg. wages", i:2}];
			}
			else if(category==="pro"){
				var indicators = [{c:"AvgWage_", l:"Average wage", b:"pro", ls:"Avg. wage", i:0}, 
								  {c:"GMPCap_", l:"GMP per capita", b:"pro", ls:"GMP / cap.", i:1}, 
								  {c:"GMPJob_", l:"GMP per job", b:"pro", ls:"GMP / job", i:2}];
			}
			else if(category==="inc"){
				var indicators = [{c:"EmpRatio_", l:"Employment-to-population ratio", b:"inc", ls:"Emp. / pop.", i:0}, 
								  {c:"MedEarn_", l:"Median earnings", b:"inc", ls:"Med. earn.", i:1}, 
								  {c:"RelPov_", l:"Relative poverty", b:"inc", ls:"Rel. poverty", i:2}];
			}
			else{
				var indicators = [];
			}
			return indicators;
		}

		function getYears(period){
			var endYear = 2014;
			var startYear = period == "One" ? 2013 : (period == "Five" ? 2009 : 2000)
			return {s:startYear, e:endYear}
		}

		
		//hold svg groups -- will be defined in setupBase

		var columns = [{}, {}];

		//left off here -- how to do this table
		function drawCurves(metro, period, g, formats){
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
				var data = []
			}
			catch(e){

			}

			var zot = [0,1,2];

			
			return null;


			//instead ov curves, 
			var catmap = zot.map(function(n,i,a){
				var sa = [grI[n], proI[n], incI[n]];
				return sa.map(function(ind, i, a){
					var I = ind.c+period+"V";
					var R = ranges[I];
					var value = metro[(ind.b+"1")][I];
					return {cat:ind.b, metric:I, label: ind.ls, value:value, maxmin:R, absmax:d3.max(R, function(d,i){return Math.abs(d)})};
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
			threeCells.enter().append("div").classed("as-table-cell",true).style("width",function(d,i){
				return i==2 ? "32%" :"34%";
			})

			threeCells.exit().remove();

			var cell_labels = threeCells.selectAll("div.value-label").data(function(d,i){
				return [d.label];
			});
			cell_labels.enter().append("div").classed("value-label",true).append("p");
			cell_labels.exit().remove();
			cell_labels.select("p").text(function(d,i){return d}).style({"font-size":"11px","text-transform":"uppercase"});

			var cell_vals = threeCells.selectAll("div.value-actual").data(function(d,i){
				return [d.value];
			});
			cell_vals.enter().append("div").classed("value-actual",true).append("p");
			cell_vals.exit().remove();
			cell_vals.select("p").text(function(d,i){return formats.pctch1(d)}).style({"font-size":"13px","font-weight":"bold"});

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

			var table = this.storage("table");
			var tableOuter = this.storage("tableOuter");
			//var tableHeader = this.storage("tableHeader");

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
				/*var mapData = self.storage("mapData");
				if(!!mapData){
					mapData.large.highlight(d,null,2);
				}	*/			
			});
			rows.on("mouseleave",function(d,i){
				var thiz = d3.select(this);
				thiz.classed("row-is-highlighted", false);
				//remove highlight on map
				/*var mapData = self.storage("mapData");
				if(!!mapData){
					mapData.large.highlight();
				}	*/
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
				console.log(metro);
				console.log(keyR);
				return [{r:metro.rank[keyR], l:"G"}];
				return [{r:metro.gr0[keyR], l:"G: "}];
			});
			swatches.enter().append("div").classed("swatch",true).append("p").style({"margin":"0px","text-align":"center"});
			swatches.exit().remove();

			swatches.style("background-color",function(d,i){return (r2c(d.r)).fill})
					.style({"float":"left", "width":"100%", "pointer-events":"none"});
			swatches.select("p").text(function(d,i){return self.formats.rankth(d.r)}).style("color",function(d,i){return (r2c(d.r)).text});

			//draw the detail in each cell
			var detailTitle = rows.select("div.row-detail").selectAll("p.row-title").data(["Underlying detail (last <b>" + period.toLowerCase() + " years</b>)"]);
			detailTitle.enter().append("p").classed("row-title",true).style({"font-size":"13px","line-height":"1.3em","margin":"12px 0px 5px 0px","border-bottom":"1px solid #aaaaaa", "padding-bottom":"4px"});
			detailTitle.exit().remove();
			detailTitle.html(function(d,i){return d});

			var detailWrap = rows.select("div.row-detail").selectAll("div.as-table").data(function(d,i){return [d]});
			detailWrap.enter().append("div").classed("as-table",true);
			detailWrap.exit().remove();

			detailWrap.each(function(d,i){
				drawCurves(data.levels[d], period, d3.select(this), self.formats);
			});

			/*try{
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
			}*/

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
			var category = this.storage("category");

			var mapData = this.storage("mapData");

			var bigMap = mapData.large;
			var smallMap0 = mapData.small[0];
			var smallMap1 = mapData.small[1];
			var smallMap2 = mapData.small[2];

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
				smallMap0.setData(data2bind, "geo").drawMap(addNumber);
				smallMap1.setData(data2bind, "geo").drawMap(addNumber);
				smallMap2.setData(data2bind, "geo").drawMap(addNumber);

				mapData.dataBound = true;

				/*bigMap.showOverlay();
				setTimeout(function(){
					bigMap.hideOverlay();
				},2000);*/
			}

			var indicators = getInd(category);
			//function generator
			function refill(isComposite, indicatorIndex){
				var obj = !!isComposite ? category+"0" : category+"1"; //e.g. gr0 (composite indicator) vs gr1 (component indicators);
				var r = !!isComposite ? 6 : 3;
				var ind = !!isComposite ? period+"R" : (indicators[indicatorIndex].c)+period+"R";

				//fn to refill the map dots based on the selection of indicator and time period -- the thisArg will be the map object
				return function(){
					this.metros.attr("r", function(d,i){
						return r;
					});

					var self = this;

					//no transitions -- the select and highlight methods match the parameters of the underlying dots at the start of the transition causing erroneous results
					this.metros.attr("fill", function(d,i){
						var dat_obj = d.data.dat[obj];
						var col = r2c(dat_obj[ind]).fill;
						return col;
					});

					//for composite maps, set textAccessor
					if(!!isComposite){
						var ta = function(d){
							var overall = "Overall rank: " + d.data.dat[obj][ind] + " of 100";
							return [overall];
						}
					}
					this.textAccessor(ta);
				}
			}

			var metro = this.getMetro();
			//refill large map
			bigMap.drawMap(refill(true)).select(metro, null, 2);

			//refill small map
			smallMap0.drawMap(refill(false,0)).select(metro, null, 2.5);
			smallMap1.drawMap(refill(false,1)).select(metro, null, 2.5);
			smallMap2.drawMap(refill(false,2)).select(metro, null, 2.5);

			var anno = mapData.mapsAnno.selectAll("div.small-map-anno-wrap").data(indicators);
			var annoE = anno.enter().append("div").classed("c-fix small-map-anno-wrap",true).style({"float":"left"});
			annoE.append("div").style({"background-color":"#dddddd", "float":"left", "height":"16px", "width":"16px", "border-radius":"8px"})
				 .append("p").style({"font-size":"11px", "line-height":"11px", "padding":"3px 0px 2px 0px" ,"margin":"0px","text-align":"center"});
			annoE.append("p").classed("small-map-anno-text",true).style({"float":"left","font-size":"13px", "line-height":"15px","margin":"1px 0px 0px 4px"});
			anno.exit().remove();
			anno.style({"margin":"5px 10px 5px 0px"})

			anno.select("div").select("p").text(function(d,i){return d.i+1});
			anno.select("p.small-map-anno-text").text(function(d,i){return d.l})

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
					//drawMaps.call(self);
				});

			}

			drawTable.call(this);

			return 1;

			//if redraw is being called because of achange in view or metro, redraw map, otherwise the map-class handles responsiveness
			if(this.changeEvent.view || this.changeEvent.metro){
				drawMaps.call(this);
			};
		}

		var setupBase = function(){
			var self = this;
			this.header.append("p").text("Economic inclusion by race in the 100 largest U.S. metro areas");
			//var tableWrap = this.container.append("div").style({"padding":"5px 0px 5px 0px", "border":"1px solid #dddddd", "border-width":"1px 0px 1px 0px"}).classed("two-fifths",true).append("div").style("max-height","600px");
			var headerWrap = this.container.append("div").classed("c-fix",true).style({"margin-bottom":"15px", "border":"1px solid #aaaaaa", "border-width":"0px 1px 1px 1px", "background-color":"#ffffff", "padding":"15px"});
			var header0 = headerWrap.append("div").classed("three-fifths",true).append("div").style({"padding":"0px 5% 0px 0px", "margin":"0px 0px"});
			
			//left side of header --
			header0.append("p").html('<b>Inclusion is one thing</b>... inclusion by race sheds light on... Use this area to describe what we\'re showing and why it\'s valuable').style("margin-bottom","0px");	
			header0.append("p").html('<span>Explore the data below to find out which large metro areas have improved most on these metrics over time.</span>').style({"font-style":"normal","line-height":"1.4em","padding":"5px 10px 0px 0px", "margin":"5px 20px 0px 0px", "border-top":"1px dotted #aaaaaa", "clear":"both", "font-size":"13px"});
						
			var periodMenu = header0.append("div").classed("c-fix",true).style("margin-top","15px");
			periodMenu.append("p").text("Time period").style({"margin":"0px","font-size":"11px","text-transform":"uppercase"});
			var periodButtons = periodMenu.selectAll("div").data([{c:"One", l:"One-year"}, {c:"Five", l:"Five-year"}, {c:"Ten", l:"Ten-year"}]).enter().append("div")
										  .classed("generic-button",true).classed("generic-button-selected",function(d,i){return i===1});
			periodButtons.append("p").text(function(d,i){return d.l});		

						//legend area
						var legendWrap = this.container.append("div").style({"padding":"0px 15px 30px 15px", "margin":"0px auto", "border":"1px dotted #aaaaaa", "border-width":"0px 0px 0px 0px", "position":"relative", "display":"inline-block"}).classed("c-fix",true).append("div");
						legendWrap.append("p").text("Metro areas rankings range from 1 to 100, with 1 indicating the best performance").style({"margin":"0px 0px 5px 0px","font-size":"13px"});
						var legendSwatches = legendWrap.append("div").classed("c-fix",true).selectAll("div").data(colors).enter().append("div").style({"float":"left","margin":"0px 15px 5px 0px"});
						legendSwatches.append("div").style({"float":"left","width":"15px","height":"15px"}).style("background-color",function(d,i){return d})
						legendSwatches.append("p").style({"float":"left","font-size":"13px","line-height":"15px","height":"15px","margin":"0px 0px 0px 5px", "padding":"1px"})
											.text(function(d,i){
												var ii = i*20;
												return self.formats.rankth(ii+1) + "–" + self.formats.rankth(ii+20)
											});



						//MAPS SETUP
						var mapWrap = this.container.append("div").classed("three-fifths no-mobile-display",true).append("div").style({"padding":"0px 30px 0px 0px","position":"relative", "overflow":"hidden"});
						var bigMapOuter = mapWrap.append("div").style({"position":"relative","z-index":"5"});
						bigMapOuter.append("div").style({"padding":"0px 0px 10px 0px", "margin":"0px 10px 10px 0px", "border-bottom":"1px solid #aaaaaa"})
								   .append("p").classed("map-title",true).text("Metro area maps").style({"font-weight":"bold", "line-height":"1em", "margin":"0px 15px"});
						var bigMap = bigMapOuter.append("div");

						var smallMapWrap = mapWrap.append("div").classed("c-fix",true);
							var mapsAnno = smallMapWrap.append("div").classed("c-fix",true)
													   .style({"border-bottom":"1px dotted #aaaaaa","padding":"0px 0px 5px 0px","margin":"0px 10px 15px 0px"})
													   .append("div").style("float","left");
							mapsAnno.append("p").text("Detailed indicator maps 1–3").style({"margin":"0px","font-size":"13px","clear":"both"})
							
							var smallMaps = smallMapWrap.selectAll("div.small-map").data([1,2,3]).enter().append("div").classed("small-map",true).style({"width":"48%","padding-right":"2%","float":"left","position":"relative","z-index":"3"});
							smallMapWrap.append("div").style({"width":"44%","padding":"2% 3%","float":"left","position":"relative","z-index":"3","margin":"auto"}).append("p").style({"font-size":"13px","color":"#666666"})
											.text("These small maps present changes in the three indicators that together combine to make up the overall ranking for the selected category. [Describe small maps... Another opportunity to convey that each broad metric is composed of three indicators.]")

						//small maps
						var sMaps = [];
						smallMaps.each(function(d,i){
							var map = new dotMap(this);
							map.makeResponsive();
							sMaps.push(map);
						})
						//big map
						var bMap = new dotMap(bigMap.node());
						bMap.makeResponsive();
						this.storage("mapData",{large:bMap, small:sMaps, mapsAnno:mapsAnno, dataBound:false});

						this.storage("mapWrap", mapWrap);
						this.storage("period","Five");
						this.storage("category","gr")


						//TABLE SETUP
						var rightSide = this.container.append("div").classed("two-fifths",true);
						var tableHeaderWrap = rightSide.append("div");
						tableHeaderWrap.append("p").classed("table-title",true).text("Metro area rankings").style({"font-weight":"bold", "line-height":"1em", "margin":"0px 15px 10px 10px"});

						/*
						var tableHeader = tableHeaderWrap.append("div").style({"background-color":"#dddddd", "padding":"7px 10px 5px 10px", "border":"1px solid #aaaaaa", "border-width":"1px 1px 0px 1px"}).append("div").classed("c-fix",true);
						
						tableHeader.selectAll("div.th").data(["GROWTH","PROSPERITY","INCLUSION"]).enter().append("div")
							.style("margin-left",function(d,i){return i==0 ? "0%" : "2%"})
							.style("margin-right",function(d,i){return i===2 ? "-30px" : "0px"})
							.style({"float":"left", "width":"32%"})
							.append("p").style({"line-height":"1em","margin":"0px","font-size":"11px","text-align":"center"})
							.text(function(d,i){return d});*/

						var tableOuter = rightSide.append("div").style({"clear":"both","border":"1px solid #aaaaaa", "border-width":"1px 0px 1px 0px", "padding":"0px", "max-height":"750px", "overflow-y":"auto"});
						var tableWrap = tableOuter.append("div").style("padding","0px 10px 500px 0px");
						var table = tableWrap.append("div").style("width","100%"); //.append("g").attr("id","core-svg-table");

						//store in view
						this.storage("table", table); //store these in the view state
						this.storage("tableOuter", tableOuter);
						//this.storage("tableHeader", tableHeader);
						this.storage("buttons", {period:periodButtons});
		}

		MetroMonitorVersion2.addView(redrawBase, "inclusionByRace.json", setupBase).name("Inclusion by race");
	})();