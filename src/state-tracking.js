//depends: d3.js
//ALL DRAWING CODE MUST BE SYNCHRONOUS/SINGLE THREADED (NO WEBWORKERS) 

//produce a state/navigation object for MPP interactives
function MetroInteractive(appWrapperElement){
	var S = {};

	//basic structure: A] app wrapper > a] menu wrapper, b] slide/views wrapper
	S.wrap = d3.select(appWrapperElement).classed("metro-interactive-wrap",true);
	S.menu = S.wrap.append("div").classed("metro-interactive-menu-wrap",true);
	S.viewWrap = S.wrap.append("div").classed("metro-interactive-views-wrap",true);

	//keep track of selected metro area and view
	S.metro = null; //no defaults
	S.view = null;

	//keep track of which DOM elements to show/hide
	S.currentSlide = null; //the actual dom element being shown
	S.allSlides = null;

	//metro lookup table to validate metro areas
	S.metroLookup = {"10420":[{"CBSA_Code":"10420","CBSA_Title":"Akron, OH","lon":-81.34969,"lat":41.14818}],"10580":[{"CBSA_Code":"10580","CBSA_Title":"Albany-Schenectady-Troy, NY","lon":-73.9377,"lat":42.78914}],"10740":[{"CBSA_Code":"10740","CBSA_Title":"Albuquerque, NM","lon":-106.47079,"lat":35.12124}],"10900":[{"CBSA_Code":"10900","CBSA_Title":"Allentown-Bethlehem-Easton, PA-NJ","lon":-75.40179,"lat":40.78826}],"12060":[{"CBSA_Code":"12060","CBSA_Title":"Atlanta-Sandy Springs-Roswell, GA","lon":-84.39655,"lat":33.69587}],"12260":[{"CBSA_Code":"12260","CBSA_Title":"Augusta-Richmond County, GA-SC","lon":-81.98039,"lat":33.45706}],"12420":[{"CBSA_Code":"12420","CBSA_Title":"Austin-Round Rock, TX","lon":-97.655,"lat":30.26279}],"12540":[{"CBSA_Code":"12540","CBSA_Title":"Bakersfield, CA","lon":-118.72778,"lat":35.34329}],"12580":[{"CBSA_Code":"12580","CBSA_Title":"Baltimore-Columbia-Towson, MD","lon":-76.67215,"lat":39.38384}],"12940":[{"CBSA_Code":"12940","CBSA_Title":"Baton Rouge, LA","lon":-91.13242,"lat":30.57093}],"13820":[{"CBSA_Code":"13820","CBSA_Title":"Birmingham-Hoover, AL","lon":-86.81439,"lat":33.46395}],"14260":[{"CBSA_Code":"14260","CBSA_Title":"Boise City, ID","lon":-116.14168,"lat":43.0153}],"14460":[{"CBSA_Code":"14460","CBSA_Title":"Boston-Cambridge-Newton, MA-NH","lon":-71.10341,"lat":42.55381}],"14860":[{"CBSA_Code":"14860","CBSA_Title":"Bridgeport-Stamford-Norwalk, CT","lon":-73.38907,"lat":41.26825}],"15380":[{"CBSA_Code":"15380","CBSA_Title":"Buffalo-Cheektowaga-Niagara Falls, NY","lon":-78.73837,"lat":42.91215}],"15980":[{"CBSA_Code":"15980","CBSA_Title":"Cape Coral-Fort Myers, FL","lon":-81.82069,"lat":26.57868}],"16700":[{"CBSA_Code":"16700","CBSA_Title":"Charleston-North Charleston, SC","lon":-80.04409,"lat":33.04161}],"16740":[{"CBSA_Code":"16740","CBSA_Title":"Charlotte-Concord-Gastonia, NC-SC","lon":-80.86895,"lat":35.18707}],"16860":[{"CBSA_Code":"16860","CBSA_Title":"Chattanooga, TN-GA","lon":-85.35889,"lat":35.05048}],"16980":[{"CBSA_Code":"16980","CBSA_Title":"Chicago-Naperville-Elgin, IL-IN-WI","lon":-87.96401,"lat":41.70346}],"17140":[{"CBSA_Code":"17140","CBSA_Title":"Cincinnati, OH-KY-IN","lon":-84.42787,"lat":39.07085}],"17460":[{"CBSA_Code":"17460","CBSA_Title":"Cleveland-Elyria, OH","lon":-81.68392,"lat":41.37554}],"17820":[{"CBSA_Code":"17820","CBSA_Title":"Colorado Springs, CO","lon":-104.65854,"lat":38.84266}],"17900":[{"CBSA_Code":"17900","CBSA_Title":"Columbia, SC","lon":-81.04336,"lat":34.0902}],"18140":[{"CBSA_Code":"18140","CBSA_Title":"Columbus, OH","lon":-82.83849,"lat":39.96695}],"19100":[{"CBSA_Code":"19100","CBSA_Title":"Dallas-Fort Worth-Arlington, TX","lon":-97.02517,"lat":32.81818}],"19380":[{"CBSA_Code":"19380","CBSA_Title":"Dayton, OH","lon":-84.13996,"lat":39.82953}],"19660":[{"CBSA_Code":"19660","CBSA_Title":"Deltona-Daytona Beach-Ormond Beach, FL","lon":-81.2182,"lat":29.16992}],"19740":[{"CBSA_Code":"19740","CBSA_Title":"Denver-Aurora-Lakewood, CO","lon":-104.89423,"lat":39.43424}],"19780":[{"CBSA_Code":"19780","CBSA_Title":"Des Moines-West Des Moines, IA","lon":-93.94314,"lat":41.54787}],"19820":[{"CBSA_Code":"19820","CBSA_Title":"Detroit-Warren-Dearborn, MI","lon":-83.23326,"lat":42.72034}],"21340":[{"CBSA_Code":"21340","CBSA_Title":"El Paso, TX","lon":-105.53863,"lat":31.51179}],"23420":[{"CBSA_Code":"23420","CBSA_Title":"Fresno, CA","lon":-119.64919,"lat":36.75656}],"24340":[{"CBSA_Code":"24340","CBSA_Title":"Grand Rapids-Wyoming, MI","lon":-85.48828,"lat":42.99883}],"24660":[{"CBSA_Code":"24660","CBSA_Title":"Greensboro-High Point, NC","lon":-79.79125,"lat":36.02635}],"24860":[{"CBSA_Code":"24860","CBSA_Title":"Greenville-Anderson-Mauldin, SC","lon":-82.41681,"lat":34.68887}],"25420":[{"CBSA_Code":"25420","CBSA_Title":"Harrisburg-Carlisle, PA","lon":-77.09446,"lat":40.32777}],"25540":[{"CBSA_Code":"25540","CBSA_Title":"Hartford-West Hartford-East Hartford, CT","lon":-72.57895,"lat":41.73265}],"26420":[{"CBSA_Code":"26420","CBSA_Title":"Houston-The Woodlands-Sugar Land, TX","lon":-95.39645,"lat":29.78191}],"26900":[{"CBSA_Code":"26900","CBSA_Title":"Indianapolis-Carmel-Anderson, IN","lon":-86.2069,"lat":39.74684}],"27140":[{"CBSA_Code":"27140","CBSA_Title":"Jackson, MS","lon":-90.22161,"lat":32.31708}],"27260":[{"CBSA_Code":"27260","CBSA_Title":"Jacksonville, FL","lon":-81.79257,"lat":30.23654}],"28140":[{"CBSA_Code":"28140","CBSA_Title":"Kansas City, MO-KS","lon":-94.44642,"lat":38.93678}],"28940":[{"CBSA_Code":"28940","CBSA_Title":"Knoxville, TN","lon":-84.13579,"lat":36.04342}],"29460":[{"CBSA_Code":"29460","CBSA_Title":"Lakeland-Winter Haven, FL","lon":-81.69913,"lat":27.95028}],"29820":[{"CBSA_Code":"29820","CBSA_Title":"Las Vegas-Henderson-Paradise, NV","lon":-115.0156,"lat":36.21495}],"30780":[{"CBSA_Code":"30780","CBSA_Title":"Little Rock-North Little Rock-Conway, AR","lon":-92.39605,"lat":34.75591}],"31080":[{"CBSA_Code":"31080","CBSA_Title":"Los Angeles-Long Beach-Anaheim, CA","lon":-118.13882,"lat":34.24737}],"31140":[{"CBSA_Code":"31140","CBSA_Title":"Louisville/Jefferson County, KY-IN","lon":-85.66996,"lat":38.33707}],"31540":[{"CBSA_Code":"31540","CBSA_Title":"Madison, WI","lon":-89.59095,"lat":43.07942}],"32580":[{"CBSA_Code":"32580","CBSA_Title":"McAllen-Edinburg-Mission, TX","lon":-98.18056,"lat":26.39641}],"32820":[{"CBSA_Code":"32820","CBSA_Title":"Memphis, TN-MS-AR","lon":-89.81524,"lat":35.00759}],"33100":[{"CBSA_Code":"33100","CBSA_Title":"Miami-Fort Lauderdale-West Palm Beach, FL","lon":-80.50589,"lat":26.16073}],"33340":[{"CBSA_Code":"33340","CBSA_Title":"Milwaukee-Waukesha-West Allis, WI","lon":-88.17343,"lat":43.17734}],"33460":[{"CBSA_Code":"33460","CBSA_Title":"Minneapolis-St. Paul-Bloomington, MN-WI","lon":-93.34635,"lat":45.06567}],"34980":[{"CBSA_Code":"34980","CBSA_Title":"Nashville-Davidson--Murfreesboro--Franklin, TN","lon":-86.72491,"lat":36.08809}],"35300":[{"CBSA_Code":"35300","CBSA_Title":"New Haven-Milford, CT","lon":-72.93774,"lat":41.41204}],"35380":[{"CBSA_Code":"35380","CBSA_Title":"New Orleans-Metairie, LA","lon":-89.9602,"lat":29.91839}],"35620":[{"CBSA_Code":"35620","CBSA_Title":"New York-Newark-Jersey City, NY-NJ-PA","lon":-74.08915,"lat":40.9223}],"35840":[{"CBSA_Code":"35840","CBSA_Title":"North Port-Sarasota-Bradenton, FL","lon":-82.32237,"lat":27.34782}],"36260":[{"CBSA_Code":"36260","CBSA_Title":"Ogden-Clearfield, UT","lon":-112.81807,"lat":41.4327}],"36420":[{"CBSA_Code":"36420","CBSA_Title":"Oklahoma City, OK","lon":-97.50489,"lat":35.42866}],"36540":[{"CBSA_Code":"36540","CBSA_Title":"Omaha-Council Bluffs, NE-IA","lon":-95.99977,"lat":41.29036}],"36740":[{"CBSA_Code":"36740","CBSA_Title":"Orlando-Kissimmee-Sanford, FL","lon":-81.36358,"lat":28.43351}],"37100":[{"CBSA_Code":"37100","CBSA_Title":"Oxnard-Thousand Oaks-Ventura, CA","lon":-119.0789,"lat":34.47314}],"37340":[{"CBSA_Code":"37340","CBSA_Title":"Palm Bay-Melbourne-Titusville, FL","lon":-80.73251,"lat":28.29376}],"37980":[{"CBSA_Code":"37980","CBSA_Title":"Philadelphia-Camden-Wilmington, PA-NJ-DE-MD","lon":-75.30322,"lat":39.9046}],"38060":[{"CBSA_Code":"38060","CBSA_Title":"Phoenix-Mesa-Scottsdale, AZ","lon":-112.07073,"lat":33.18583}],"38300":[{"CBSA_Code":"38300","CBSA_Title":"Pittsburgh, PA","lon":-79.83087,"lat":40.43941}],"38900":[{"CBSA_Code":"38900","CBSA_Title":"Portland-Vancouver-Hillsboro, OR-WA","lon":-122.47825,"lat":45.59765}],"39300":[{"CBSA_Code":"39300","CBSA_Title":"Providence-Warwick, RI-MA","lon":-71.3998,"lat":41.72421}],"39340":[{"CBSA_Code":"39340","CBSA_Title":"Provo-Orem, UT","lon":-112.35358,"lat":39.86421}],"39580":[{"CBSA_Code":"39580","CBSA_Title":"Raleigh, NC","lon":-78.4617,"lat":35.75394}],"40060":[{"CBSA_Code":"40060","CBSA_Title":"Richmond, VA","lon":-77.47248,"lat":37.46045}],"40140":[{"CBSA_Code":"40140","CBSA_Title":"Riverside-San Bernardino-Ontario, CA","lon":-116.12824,"lat":34.55222}],"40380":[{"CBSA_Code":"40380","CBSA_Title":"Rochester, NY","lon":-77.50946,"lat":42.96878}],"40900":[{"CBSA_Code":"40900","CBSA_Title":"Sacramento--Roseville--Arden-Arcade, CA","lon":-120.99846,"lat":38.78115}],"41180":[{"CBSA_Code":"41180","CBSA_Title":"St. Louis, MO-IL","lon":-90.34993,"lat":38.73358}],"41620":[{"CBSA_Code":"41620","CBSA_Title":"Salt Lake City, UT","lon":-113.0109,"lat":40.4709}],"41700":[{"CBSA_Code":"41700","CBSA_Title":"San Antonio-New Braunfels, TX","lon":-98.60154,"lat":29.42828}],"41740":[{"CBSA_Code":"41740","CBSA_Title":"San Diego-Carlsbad, CA","lon":-116.73186,"lat":33.03348}],"41860":[{"CBSA_Code":"41860","CBSA_Title":"San Francisco-Oakland-Hayward, CA","lon":-122.01491,"lat":37.70206}],"41940":[{"CBSA_Code":"41940","CBSA_Title":"San Jose-Sunnyvale-Santa Clara, CA","lon":-121.37455,"lat":36.90902}],"42540":[{"CBSA_Code":"42540","CBSA_Title":"Scranton--Wilkes-Barre--Hazleton, PA","lon":-75.89452,"lat":41.32314}],"42660":[{"CBSA_Code":"42660","CBSA_Title":"Seattle-Tacoma-Bellevue, WA","lon":-121.86564,"lat":47.55345}],"44060":[{"CBSA_Code":"44060","CBSA_Title":"Spokane-Spokane Valley, WA","lon":-117.57219,"lat":48.19339}],"44140":[{"CBSA_Code":"44140","CBSA_Title":"Springfield, MA","lon":-72.64483,"lat":42.22917}],"44700":[{"CBSA_Code":"44700","CBSA_Title":"Stockton-Lodi, CA","lon":-121.27231,"lat":37.93234}],"45060":[{"CBSA_Code":"45060","CBSA_Title":"Syracuse, NY","lon":-76.03377,"lat":43.15681}],"45300":[{"CBSA_Code":"45300","CBSA_Title":"Tampa-St. Petersburg-Clearwater, FL","lon":-82.4056,"lat":28.15434}],"45780":[{"CBSA_Code":"45780","CBSA_Title":"Toledo, OH","lon":-83.78038,"lat":41.49856}],"46060":[{"CBSA_Code":"46060","CBSA_Title":"Tucson, AZ","lon":-111.78996,"lat":32.09743}],"46140":[{"CBSA_Code":"46140","CBSA_Title":"Tulsa, OK","lon":-96.16542,"lat":36.24962}],"46520":[{"CBSA_Code":"46520","CBSA_Title":"Urban Honolulu, HI","lon":-157.97572,"lat":21.4604}],"47260":[{"CBSA_Code":"47260","CBSA_Title":"Virginia Beach-Norfolk-Newport News, VA-NC","lon":-76.4147,"lat":36.65574}],"47900":[{"CBSA_Code":"47900","CBSA_Title":"Washington-Arlington-Alexandria, DC-VA-MD-WV","lon":-77.47239,"lat":38.83189}],"48620":[{"CBSA_Code":"48620","CBSA_Title":"Wichita, KS","lon":-97.39811,"lat":37.62504}],"49180":[{"CBSA_Code":"49180","CBSA_Title":"Winston-Salem, NC","lon":-80.3451,"lat":36.07244}],"49340":[{"CBSA_Code":"49340","CBSA_Title":"Worcester, MA-CT","lon":-71.92866,"lat":42.2188}],"49660":[{"CBSA_Code":"49660","CBSA_Title":"Youngstown-Warren-Boardman, OH-PA","lon":-80.56419,"lat":41.24169}]};
	S.metroLookupVS = {}; //VS, or "view specific" metro lookup

	//function to determine default metro area
	function metroDefault(obj){
		var firstKey = null;
		try{
			if(Object.keys){
				firstKey = Object.keys(obj)[0];
			}
			else{
				for(p in obj){
					if(obj.hasOwnProperty(p)){
						firstKey = p;
						break;
					}
				}
			}
		}
		catch(e){
			firstKey = null;
		}
		finally{
			return firstKey;
		}
		
	}
	
	//view listeners need to:
	// draw a view for a selected metro
	// each listener should take 
	// view listeners will 1) change views and draw selected metro version. if the view is already shown, it just draws the selected metro version of the view.
	S.viewRegister = {};
	S.viewList = [];

	//view listener that will be called when the view is changed

	//setupView will be run one time -- its code must be synchronous -- it is passed a reference to the slide node element.
	//redrawView will be run each time changeView is called
	//metroLookup can be used later to restrict the geography for a given view--use case not needed now and will be handled in the view callback
	//the first registered view becomes the default
	var numViews = 0;
	S.addView = function(redrawView, setupView, metroLookup){
		var viewIndex = "v"+numViews;

		//run setup
		if(!!setupView){setupView(slide.node());} //must be synchronous!!}

		//create a "view slide" in the DOM
		var slide = S.viewWrap.append("div");
			slide.classed("metro-interactive-view",true).datum(viewIndex);

		S.allSlides = S.viewWrap.selectAll(".metro-interactive-view"); //update selection of slides

		//hold parameters for the current view redrawView will be drawn with this object as the this
		var viewOps = {};
		viewOps.getMetro = function(){return S.metro;}
		viewOps.dataURI = null;
		viewOps.dataState = 0; // 0: empty, 1: loading, 2: ready, -1: error
		viewOps.data = null; //placeholder for the view data

		function viewLoading(){slide.classed("view-is-loading",true)}
		function viewLoaded(){slide.classed("view-is-loading",false)}

		//handle the swapping of slides -- bring this slide into view
		function show_this_slide(){
			//knock out current view
			if(S.currentSlide){
				var index = parseInt(S.currentSlide.datum()); 
				S.currentSlide.classed("out-right", true)
			}

			//show this view
			S.currentSlide = slide.classed("out-right",false).classed("out-left",false); //S.view is already set in changeView;
		}

		//TWO FUNCTIONS FOR SHOWING DATA: 1) IF DATA ALREADY LOADED: JUST DRAW IT, 2) DATA NOT LOADED: LOAD DATA AND JUST DRAW IT
		//switch to the selected view and redraw
		function draw_view(){
			viewLoading();

			//redraw this view -- viewOps available as this (e.g. this.data, this.getMetro, etc...)
			redrawView.call(viewOps); //must be a synchronous fn

			viewLoaded();
		}

		//get data and show view
		function get_data(){
			viewOps.dataState = 1; //now loading
			viewLoading();
			//get the data
			d3.json(viewOps.dataURI, function(err, dat){
				if(err){
					viewLoaded();
					slide.classed("bad-view", true);
					viewOps.dataState = -1;
				}
				else{
					viewOps.data = dat;
					viewOps.dataState = 2; //data loaded!
					draw_view(); //draw the view
				}
			});
		}

		//the function exposed that will show this view
		viewOps.show = function(){
			if(viewOps.dataState===2){
				//data is loaded...
				draw_view();  //draw
				show_this_slide();  //and show the view
			}
			else if(viewOps.dataState===0){
				//data is not loaded...
				get_data();  //get and draw the view
				show_this_slide();  //and show the view 
			}
			else if(viewOps.dataState===1){
				//data is loading... the view will be drawn in the callback... the latest metro will be retrieved in redrawView
				show_this_slide()  //make sure this is the view that is being shown
			}
		}

		//register the methods -- view0 is considered the default
		S.viewRegister[viewIndex] = viewOps;
		S.viewList.push(viewIndex);

		numViews++;

		append_loading_icon(slide);

		return(viewOps);
	}

	//validate view and metro selections
	function validate(viewCode, metroCode){
		var mh = (metroCode!==null && metroCode!==false && typeof metroCode !== "undefined") ? metroCode : false;
		var vh = (viewCode!==null && viewCode!==false && typeof viewCode !== "undefined") ? viewCode : false;
		
		var result = {view:false, metro:false}

		//validate -- metro codes are validated on a per-app basis not per-view basis
		if(vh && vh in S.viewRegister){
			result.view = true;
		}
		if(mh && mh in S.metroLookup){
			result.metro = true;
		}

		return result; //results of validation test
	}

	//args
	//{1 & 2} metroCode and viewCode: metro/view code to change to. if not a valid code, no-op. 
	//{3} setHash: optional, if truthy, this method will also set the page hash value to metroCode (assuming valid metro code)
	function changeView(viewCode, metroCode, setHash){
		var V = validate(viewCode, metroCode)

		//if valid codes...
		if(V.view && V.metro){
			//update state
			var newhash = viewCode + "-" + metroCode;
			if(!!setHash){set_hash(newhash)}
			S.view = viewCode;
			S.metro = metroCode;

			//state must be updated before show is called because it relies on the current state -- if the user changes metro while the redraw method is called asynchronously, you want that callback to use the new metro. It might redraw twice, but it will do so with the right data.
			//because the data
			S.viewRegister[viewCode].show();
		} 
		else{
			//no-op
		}
	}

	//qc, or "quick change" wrappers for changeView, when you just want to change metro or view and force a hash change
	S.qcMetro = function(metroCode){changeView(S.view, metroCode, true);}
	S.qcView = function(viewCode){changeView(viewCode, S.metro, true);}

	//"cap off" the app: load the default view/metro, otherwise no setup is performed
	S.cap = function(){
		//try and determine the proper metro/view selections from the location hash
		var hash = get_hash();
		var view = hash.view;
		var metro = hash.metro;

		var MD = !!S.metro ? S.metro : metroDefault(S.metroLookup);
		var VD = !!S.view ? S.view : "v0";

		//validate the location hash values
		var valid = validate(view, metro);

		//run through the default options -- if they don't pass the validator, nothing happens
		if(valid.metro && valid.view){
			changeView(view, metro); //don't set hash -- these parameters were drawn from the hash
		}
		else if(!valid.metro && !valid.view){
			changeView(VD, MD, true);
		}
		else if(!valid.metro){
			changeView(view, MD, true);
		}
		else if(!valid.view){
			changeView(VD, metro, true);
		}
	}

	//hash changes -- need to test the hash changes in wide variety of browsers
	function set_hash(hash){
		if(window.history.pushState) {
		    window.history.pushState(null, null, ("#"+hash));
		}
		else {
		    window.location.hash = hash;
		}
	}
	function get_hash(){
		try{
			var a = window.location.hash.replace("#","").split("-");
			var h = {view:a[0], metro:a[1]}
		}
		catch(e){
			var h = {view:"", metro:""}; //use empty string rather than null so changeView is triggered (see below)
		}
		finally{
			return h;
		}
	};
	function hash_listener(ev){
		var h = get_hash(); 

		if(h.metro !== S.metro || h.view !== S.view){
			changeView(h.view, h.metro); //validation is performed in changeView -- this is a no-op if thes are bad hashes
		}
	}

	window.addEventListener("hashchange",hash_listener,false);
	//window.addEventListener("popstate",function(e){console.log(e.state)})


	function append_loading_icon(wrapper_selection){
		var svg = wrapper_selection.append("svg").style({width:"65px", height:"65px"}).classed("metro-interactive-loading-icon",true).append("g").attr("transform","translate(5,5)");
		var widths = [14,14,14];
		var xs = [0,20,40];
		var ys = [15,5,10];
		var heights = [15,25,20]

		var bar1 = svg.selectAll("rect.base").data([0,1,2]).enter().append("rect").attr({width:14, height:15, y:15}).attr("x",function(d,i){return i*20});
		var bar2 = svg.selectAll("rect.base").data([0,1,2]).enter().append("rect").attr({width:14, height:15, y:15}).attr("x",function(d,i){return i*20});

		bar2.append("animateTransform")
			.attr({attributeType:"xml", attributeName:"transform", type:"translate", dur:"0.7s", repeatCount:"indefinite"})
			.attr("values",function(d,i){
				if(i===0){var vals = "0 0; 0 -13; 0 0"}
				else if(i===1){var vals = "0 -10; 0 -7; 0 -10"}
				else if(i===2){var vals = "0 -5; 0 -10; 0 -5"}
				return vals;
			})
			.attr("begin",function(d,i){
				var b = ["0s","0.2s","0.4s"];
				return b[i];
			});

		svg.append("text").style({"font-family":"arial","font-size":"13px"}).attr({x:"27",y:"43","text-anchor":"middle"}).text("LOADING");

	}

	return S;
};