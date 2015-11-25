//produce an object for geography state tracking
function MetroState(){
	var S = {};
	//keep track of selected metro area code
	S.metro = null;
	
	//add listeners that will be called upon changes to metro code
	S.metListeners = [];
	S.addMetroChangeListener = function(f){
		S.metListeners.push(f);
	}

	S.metroChange = function(metroCode, thiz){
		//validate
		if(metroCode in {}){

		}

		if(!thiz){
			for
		}
		else{
			//call with context
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
			S.metroChange(h); //perform metro code validation in metroChange
		}
	}

	window.addEventListener("hashchange",hash_listener,false)


	return S;
};