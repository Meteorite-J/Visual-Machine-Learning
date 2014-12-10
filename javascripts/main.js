$(function(){

	if(navigator.appVersion.indexOf("Windows")!=-1) $('body').addClass('pcuser');


	var lang = $('html').attr('lang');
	
	if(lang == 'fr'){
		var w = 328;
		if(navigator.language.substring(0,2) == 'en') window.location.href = 'http://vincentgarreau.com/en';
	}else{
		var w = 280;
	} 

	if (screen.width > 980 && $(window).width() > 620){

		launch_pJS();
		$("#page").hide();
		$("body").append('<div id="loader"><img src="http://'+window.location.hostname+'/assets/img/loader.gif" alt="" /></div>');

		$(window).load(function(){
			$("#loader").hide();
			$("#page").fadeIn();
			Initialize();
		});

		function Initialize(){
			$('h2, p, ul').hide();
			$('h1').append('<span>');
			$('h1 span').css({ 'display': 'block', 'width': '0px', 'height': '26px', 'background': '#fff', 'margin-top': '21px' }).animate({ 'width': ''+w+'px' }, 800);
			setTimeout("$('h2, p, ul, canvas').fadeIn()", 1000);
		}

	}

	$(window).resize(function() {
		if( $(window).width() <= 620){ $('h2').hide(); $('h1 span').hide(); $('.works li:first-child, .companies, #anim').hide(); }
		else{$('h2').show(); $('h1 span').show(); $('.works li:first-child, .companies, #anim').show(); }
		
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

