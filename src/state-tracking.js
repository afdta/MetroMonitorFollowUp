LaunchMetroInteractive = {}


//produce a state/navigation object for MPP interactives
function MetroInteractive(appWrapperElement){
	var S = {};

	//basic structure: A] app wrapper > a] menu wrapper, b] slide/views wrapper
	S.wrap = d3.select(appWrapperElement).classed("metro-interactive-wrap",true);
	S.menu = S.wrap.append("div").classed("metro-interactive-menu-wrap",true);
	S.views = S.wrap.append("div").classed("metro-interactive-views-wrap",true);

	//keep track of selected metro area and view
	S.metro = null; //no defaults
	S.view = null;

	//metro lookup table to validate metro areas
	S.metroLookup = null;
	S.metroLookupVS = {}; //VS, or "view specific" metro lookup
	
	//view listeners need to:
	// draw a view for a selected metro
	// each listener should take 
	// view listeners will 1) change views and draw selected metro version. if the view is already shown, it just draws the selected metro version of the view.
	S.viewRegister = {};
	S.viewList = [];

	//view listener that will be called when the view is changed
	//viewName shall include letters and numbers only--no special characters
	//metroLookup can be used later to restrict the geography for a given view--use case not needed now and handled in the view callback
	//a truthy argument for defaultView assigns the registered view as the default
	S.addView = function(fn, viewName, defaultView, metroLookup){
		S.viewRegister[viewName] = fn;
		S.viewList.push(viewName);
		//if(!!metroLookup){S.metroLookupVS[viewName]=metroLookup}

		//create a "view slide" in the DOM
		S.views.append("div").classed("metro-interactive-view",true).datum(viewName);

		return(S.viewList);
	}

	//args
	//{1 & 2} metroCode and viewCode: metro/view code to change to. if not a valid code, no-op. 
	//{3} setHash: optional, if truthy, this method will also set the page hash value to metroCode (assuming valid metro code)
	S.changeView = function(viewCode, metroCode, setHash){
		var mh = (metroCode!==null && metroCode!==false && typeof metroCode !== "undefined") ? metroCode : false;
		var vh = (viewCode!==null && viewCode!==false && typeof viewCode !== "undefined") ? viewCode : false;
		
		//validate -- metro codes are validated on a per-app basis not per-view basis
		if(vh && vh in S.viewRegister){
			S.view = vh;
		}
		if(mh && mh in S.metroLookup){
			S.metro = mh;
		}

		//S.view and S.metro will always be in universe, except when null on app start
		if(S.view && S.metro){
			var newhash = S.view + "-" + S.metro;
			if(!!setHash){set_hash(newhash)}
			S.viewRegister[S.view]();
		} 
		else{
			//no-op
		}
	}

	//wrappers for changeView, when you just want to change metro or view and force a hash change
	S.changeMetro = function(metroCode){S.changeView(null, metroCode, true);}
	S.changeView = function(viewCode){S.changeView(viewCode, null, true);}

	//hash changes -- need to test the hash changes in wide variety of browsers
	function set_hash(hash){
		if(window.history.replaceState) {
		    window.history.replaceState(null, null, hash);
		}
		else {
		    window.location.hash = hash;
		}
	}
	function get_hash(){
		try{
			var a = window.location.hash.replace("#","").split("-");
			var h = {view:h[0], metro:h[1]}
		}
		catch(e){
			var h = {view:"", metro:""};
		}
		finally{
			return h;
		}
	};
	function hash_listener(){
		var h = get_hash(); 
		if(h.metro !== S.metro || h.view !== S.view){
			S.changeView(h.view, h.metro); //all validation is performed in changeView -- this is a no-op if thes are bad hashes
		}
	}

	window.addEventListener("hashchange",hash_listener,false)

	return S;
};