//produce an object for metro index state tracking
function MetroIndexState(){
	var S = {};

	//keep track of selected metro area code
	S.metro = null; //no defaults
	S.view = null; 

	//metro lookup table to validate metro areas
	S.metroLookup = null;
	
	//each view listener entry needs to be structured accordingly:
	//
	S.viewListeners = {};

	//metro listeners that will be called upon changes to metro code
	S.metListeners = [];
	S.addMetroChangeListener = function(f){
		S.metListeners.push(f);
	}

	//args
	//{1} metroCode: metro code to change to. if not a valid code, nothing happens. 
	//{2} setHash: optional, if truthy, this method will also set the page hash value to metroCode (assuming valid metro code)
	S.metroChange = function(metroCode, setHash){
		//validate
		if(metroCode in {}){
			S.metro = metroCode;
			if(!!setHash){set_hash(metroCode);}

			//execute listeners
			for(var i=0; i<S.metListeners.length; i++){
				S.metListeners[i]();
			}

		}
	}

	//hash changes
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
			var h = window.location.hash.replace("#","");
		}
		catch(e){
			var h = "";
		}
		finally{
			return h;
		}
	};
	function hash_listener(){
		var h = get_hash(); 
		if(h != S.metro){
			S.metroChange(h); //metro code validation performed in metroChange
		}
	}

	window.addEventListener("hashchange",hash_listener,false)

	return S;
};