$(function(){

	if (screen.width > 980 && $(window).width() > 620){

		launch_pJS();

		$(window).load(function(){
			Initialize();
		});

		function Initialize(){
			setTimeout("$('canvas').fadeIn()", 1000);
		}

	}

	$(window).resize(function() {
		
		if(window.innerWidth > 1100){
			if(!pJS){
	    		launch_pJS();
	    	}
	 	}else{
	  		if(pJS){
	    		pJS.fn.vendors.destroy();
	    		pJS = false;
	    	}
	  	}
	});

});

