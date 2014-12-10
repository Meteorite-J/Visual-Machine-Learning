$(function(){

	//if(navigator.appVersion.indexOf("Windows")!=-1) $('body').addClass('pcuser');


	//var lang = $('html').attr('lang');
	
	/*if(lang == 'fr'){
		var w = 328;
		if(navigator.language.substring(0,2) == 'en') window.location.href = 'http://vincentgarreau.com/en';
	}else{
		var w = 280;
	}*/

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

