var parserModel = require('./webparser.js');
var parser = new parserModel('Google', ['./jquery.js']);


parser.addUrlEvent(function(url){
	return url === 'http://www.google.com.tw/';
}, null, function(){
	this.evaluate(function(){
		$('#lst-ib').val('VisionBundles')[0].form.submit()
	});
});

parser.addUrlEvent(function(url){
	return url.indexOf('/search?') !== -1
}, null, function(){
	var links = this.evaluate(function(){
		var links = [];
		$('#res h3 a').each(function(){
			links.push($(this).text());
		});
		return links.join("\n");
	});
	
	console.log(links); 
	
	var currentPage = this.evaluate(function(){
		return parseInt($('.cur').text());
	});

	console.log("Current Page: " + currentPage);
	// Goto next page
	this.evaluate(function(){
		return window.location.href = $('.cur').next().find('a').attr('href');
	});
});


parser.openThen('http://www.google.com.tw/');