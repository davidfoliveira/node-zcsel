var
	htmlparser	= require('htmlparser'),
	zcsel		= require('../zcsel');

function parse(html,handler){
	var
		pHandler, parser;
	pHandler = new htmlparser.DefaultHandler(function(err,doc){
		if ( err )
			return handler(err,null);
		return handler(null,zcsel.initDom(doc));
	});
	parser = new htmlparser.Parser(pHandler);
	return parser.parseComplete(html);
}
function series(fns,handler){
	var
		passed = 0,
		cb = function(err,rv){
			if ( err )
				return handler(err,passed);
			return fns[++passed] ? fns[passed](cb) : handler(null,passed);
		};
	if ( fns.length > 0 )
		fns[0](cb);
	else if ( handler )
		return handler(false,false);
};

function test1(handler){
	var html = '<html><head></head><body><ul><li>1</li><li>2<ol><li class="2_1">2.1</li><li class="takemefromhere">2.2</li><li class="2_3">2.3</li></ol></li><li>3<ul><li>3.1</li></ul></li></ul></body></html>';
	parse(html,function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}

		$(".takemefromhere").remove();
		if ( $("body").text() != "122.12.333.1" ) {
			console.log("Problem with remove(). The final result is different from what was expected. Expecting a body.text()='122.133.1' and got '"+$("body").text()+"'");
			return handler(true,false);
		}
		if ( $(".2_1").next().attr("class") != "2_3" ) {
			console.log("Problem with remove(). The previous link of the removed object doesn't link with the next one");
			return handler(true,false);
		}
		console.log("remove(): OK");
		return handler(false,true);
	});	
}

function test2(handler){
	var html = '<html><head></head><body><ul><li>1</li><li>2<ol><li>2.1</li><li>2.2</li></ol></li><li>3<ul><li>3.1</li></ul></li></ul></body></html>';
	parse(html,function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}

		$("ol li").remove();
		$("ol").append($("<li>Bata</li>"),$("<li>tas</li>"));
		if ( $("ol").text() != "Batatas" ) {
			console.log("Problem with append(). The final result is different from what was expected. Expecting a ol.text()='Batatas' and got '"+$("ol").text()+"'");
			return handler(true,false);
		}
		console.log("append(): OK");
		return handler(false,true);
	});	
}

function test3(handler){
	var html = '<html><head></head><body><ul><li>1</li><li>2<ol><li>Ba</li><li class="r">2.1</li><li class="r">2.2</li><li>s</li></ol><span>after</span></li><li>3<ul><li>3.1</li></ul></li></ul></body></html>';
	parse(html,function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}

		$("ol li.r").replaceWith($("<li id='ta1'>ta</li>"),$("<li id='ta2'>ta</li>"));
		if ( $("ol").text() != "Batatatatas" ) {
			console.log("Problem with replaceWith(). The final result is different from what was expected. Expecting a ol.text()='Batatatatas' and got '"+$("ol").text()+"'");
			return handler(true,false);
		}

		if ( $("#ta1").prev().text() != "Ba" ) {
			console.log("Problem with replaceWith(). The previous element was supposed to have 'Ba' as text as has '"+$("#ta1").prev().text()+"'");
			return handler(true,false);
		}
		if ( $("#ta1").next().next().next().text() != "s" ) {
			console.log("Problem with replaceWith(). The previous element was supposed to have 's' as text as has '"+$("#ta1").next().next().next().text()+"'");
			return handler(true,false);
		}
		console.log("replaceWith(): OK");
		return handler(false,true);
	});	
}

function test4(handler){
	var html = '<html><head></head><body><ul><li>1</li><li>2<ol><li>2.1</li><li>2.2</li></ol></li><li>3<ul><li>3.1</li></ul></li></ul></body></html>';
	parse(html,function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}

		$("body > ul").replaceWith($("<!-- TEST -->"));
		if ( $("body").html() != "<!-- TEST -->" ) {
			console.log("Problem with replaceWith(). The final result is different from what was expected. Expecting a ol.text()='<!-- TEST -->' and got '"+$("body").html()+"'");
			return handler(true,false);
		}
		console.log("replaceWith(): OK");
		return handler(false,true);
	});	
}

function test5(handler){
	var html = '<html><head></head><body><ul><li>1</li><li>2<ol><li>2.1</li><li>2.2</li></ol></li><li>3<ul><li>3.1</li></ul></li></ul></body></html>';
	parse(html,function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}

		$("ol").empty();
		if ( $("ul").text() != "1233.13.1" ) {
			console.log("Problem with empty(). The final result is different from what was expected. Expecting a ul.text()='1233.13.1' and got '"+$("ul").text()+"'");
			return handler(true,false);
		}
		console.log("empty(): OK");
		return handler(false,true);
	});	
}

// Run the tests
series([test1,test2,test3,test4,test5],function(err,ran){
	if ( err ) {
		console.log("Some tests failed");
		return process.exit(-1);
	}
	console.log("Passed the "+ran+" tests");
	return process.exit(0);
});
