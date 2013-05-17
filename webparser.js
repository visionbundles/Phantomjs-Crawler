/**
 *
 *  Web crawler abstract class
 *
 *  @author eddie
 *	@version 2013/04/24
*/

var webpage = require('webpage');
WebParser = function(tabName, injectFiles) {
	var config = {
		debug: false
	};
	var urlEvent = [];
	var self = this;
	
	// Init Webkit & setup configuration
	var page = webpage.create();
	page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.65 Safari/537.31';
	page.settings.loadImages = false;

	page.onConsoleMessage = function (msg) {
		console.log('\033[01;32m\ ' + (new Date().toString()) + tabName + ' ' + ' Console>\033[39m\ ' + msg);
	};

	page.onAlert = function(msg) {
		console.log('\033[01;33m\ ' + (new Date().toString()) + tabName + ' ' + ' Alert>\033[39m\ ' + msg);
	};

	// get page instance
	this.getPage = function() {
		return page;
	};

	// OpenThen integrate completion & load finish callback (to make sure page is loaded)
	this.openThen = function(url, complete, loadFinished) {
		page.open(url, function(status){
			if (loadFinished instanceof Function) {
				self.loadFinished(loadFinished);
			}
			if (complete instanceof Function) {
				self.debugInfo(tagName + ' Page Load Complete => ' + page.url);
				complete.apply(self, [status]);
			};
		});
	};

	// Like OpenThen function (for post data action)
	this.postThen = function(url, data, loadFinished) {
		page.open(url, 'post', data, function(status){
			if (loadFinished instanceof Function) {
				self.loadFinished(loadFinished);
			}
		});
	};

    // Setup load finished callback event
	this.loadFinished = function(callback) {
		page.onLoadFinished = function(status) {
			page.onLoadFinished = undefined;
			self.debugInfo(tabName + ' Page Load Done => ' + page.url);
			if (injectFiles !== undefined && injectFiles.length > 0) {
				for (jsIndex in injectFiles) {
					self.debugInfo(tabName + ' Inject Javascript File => ' + injectFiles[jsIndex]);
					page.injectJs(injectFiles[jsIndex]);
				}
			}
			if (callback instanceof Function === false) {
				return;
			}
			callback.apply(self, [status]);	
		};
	};

	this.evaluate = function(evaluator) {
  		var evaluatorString = 'page.evaluate(evaluator';
  		for (var i = 1; i < arguments.length; i++) {
    		evaluatorString += ', arguments[' + i + ']';
  		}
  		evaluatorString += ');'
		var result = eval(evaluatorString);
		return result;
	};
	this.debugInfo = function(message) {
		if (config.debug === true) {
			console.log('\033[01;34m\ ' + (new Date().toString()) + tabName + ' ' + ' Info> \033[39m\ ' + message);	
		}
	};
	this.evaluateInfo = function(result) {
		if (config.debug === true) {
			console.log('\033[01;36m\ ' + (new Date().toString()) + tabName + ' ' + ' Eval> \033[39m\ ' + page.url);	
			if (result !== null) {
				console.log('        ' + result);
			}
		}
	};
	this.consoleInfo = function(msg) {
		console.log('\033[01;36m\ ' + (new Date().toString()) + tabName + ' ' + ' Info> \033[39m\ ' + msg);	
	};

    /**
     *  Add url change event 
     *
     *  condition - function (Check the url and return boolean)
     *  callback - function (The things to do when change to specific url and completed)
     *  loadFinished - function (when change to specific url and load finiched)
     *
     *  Example: 
     *
     *  webparser.addUrlEvent(function(url){
     *      return url.indexOf('/login.php') !== -1;
     *  }, null, function(){
     *      this.evaluate(function(username, password){
     *          $('#username').val(username);
     *          $('#password').val(password)[0].form.submit();
     *      }, 'username', 'password');
     *  });
     *
     */
	this.addUrlEvent = function(condition, callback, loadFinished) {
		urlEvent.push({condition: condition, callback: callback, loadFinished: loadFinished});
		return self;
	};
    
    /**
     * Inject local js file to web page
     * 
     * Example:
     *
     * webparser.injectJs('./jquery.js');
     */
	this.injectJs = function(jsFile) {
		self.debugInfo(tabName + ' Inject Javascript File => ' + jsFile);
		page.injectJs(jsFile);
	};

    /**
     *  Check any url condition matches that you specified via addUrlEvent(condition, callback, loadFinished
     */
	page.onUrlChanged = function(currentUrl) {
		var condition = function(){}, 
			callback = function(){}, 
			loadFinished = function(){};
		self.debugInfo('Url => ' + currentUrl);
		for (urlId in urlEvent) {
			condition = urlEvent[urlId]['condition'];
			if (urlEvent[urlId]['loadFinished'] instanceof Function) {
				loadFinished = urlEvent[urlId]['loadFinished'];
			}
			if (urlEvent[urlId]['callback'] instanceof Function) {
				callback = urlEvent[urlId]['callback'];
			}
			if (condition.apply(self, [currentUrl])) {
				self.debugInfo('Url Event Trigger');
				self.loadFinished(loadFinished);
				callback.apply(self, [currentUrl]);
				return;
			}
		}
	};
};
module.exports = WebParser
