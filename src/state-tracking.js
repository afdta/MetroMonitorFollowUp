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
	S.metroLookup = {"placeholder":1, "metro1":2, "metro2":2};
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

	return S;
};