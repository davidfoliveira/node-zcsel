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
	var html = '<html><head></head><body><ul><li>1</li><li>2<ol><li>2.1</li><li>2.2</li></ol></li><li>3<ul><li>3.1</li></ul></li></ul></body></html>';
	parse(html,function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		if ( $.html().replace(/\s*\n\s*/g,"") != html ) {
			console.log("Problem with html(). The final result is different from the source");
			return handler(true,false);
		}
		console.log("html(): OK");
		return handler(false,true);
	});	
}
function test2(handler) {
	parse('<html><head></head><body><ul><li>1</li><li>2<ol><li>2.1</li><li>2.2</li></ol></li><li>3<ul><li>3.1</li></ul></li></ul></body></html>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}

		var dollarDollar = $($);
		if ( typeof dollarDollar != "function" || !dollarDollar._IAMGOD ) {
			console.log("Problem getting dollar of dollar. Expected #G0D and got a mortal: ",dollarDollar);
			return handler(true,false);
		}
		console.log("$($): OK");
		return handler(false,true);
	});
}
function test3(handler) {
	parse('<html><head></head><body><ul><li>1</li><li>2<ol><li>2.1</li><li>2.2</li><li>2<br>3</li></ol></li><li>3<ul><li>3.1</li></ul></li></ul></body></html>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}

		if ( $("<h1>Bla</h1><h2>Bli</h2>").text() != "BlaBli" ) {
			console.log("Error getting text from built node. Expected 'Bla' and got '"+$("<h1>Bla</h1>").text()+"'");
			return handler(true,false);
		}
		console.log("$('<h1></h1><h2></h2>'): OK");
		return handler(false,true);
	});
}
function test4(handler) {
	parse('<html><head></head><body><ul><li>1</li><li>2<ol><li>2.1</li><li>2.2</li><li>2<br>3</li></ol></li><li>3<ul><li>3.1</li></ul></li></ul></body></html>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}

		var res = $("<h1>Bla</h1><h2>Bli</h2>").find("h1,h2");
		if ( res.length != 2 ) {
			console.log("Error finding two built main nodes. Expected 2 nodes and got '"+res.length+"'");
			return handler(true,false);
		}
		if ( res[0].name != 'h1' ) {
			console.log("Error finding two built main nodes. Expecting to have first <h1> and got <"+res[0].name+">");
			return handler(true,false);
		}
		console.log("$('<h1></h1><h2></h2>').find(): OK");
		return handler(false,true);
	});
}
function test5(handler) {
	parse('<html><head></head><body><ul><li>1</li><li>2<ol><li>2.1</li><li>2.2</li><li>2<br>3</li></ol></li><li>3<ul><li>3.1</li></ul></li></ul></body></html>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}

		var res = $("<!-- stuff -->>");
		if ( res.length > 0 && res[0].type != 'comment' ) {
			console.log("Error getting built comment node. Expected a node with type='comment' and got "+res.length+" node(s), first with type '"+(res[0] ? res[0].type : 'N/A')+"'");
			return handler(true,false);
		}
		console.log("$('<!-- x -->'): OK");
		return handler(false,true);
	});
}
function test6(handler) {
	parse('<html><head></head><body><ul><li>1</li><li>2<ol><li>2.1</li><li>2.2</li><li>2<br>3</li></ol></li><li>3<ul><li>3.1</li></ul></li></ul></body></html>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}

		if ( $.text() != "122.12.22333.1" ) {
			console.log("Problem getting text of all the document. Expected '122.12.22333.1' and got '"+$.text()+"'");
			return handler(true,false);
		}
		console.log("text(): OK");
		return handler(false,true);
	});
}
function test7(handler) {
	parse('<html><head></head><body><ul><li>1</li><li>2<ol><li>2.1</li><li>2.2</li></ol></li><li>3<ul><li>3.1</li></ul></li></ul></body></html>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}

		if ( $($("ol li:first-child")[0])[0]._id != $("ol li:first-child")[0]._id ) {
			console.log("Problem getting blessing of an element.");
			return handler(true,false);
		}
		console.log("bless(): OK");
		return handler(false,true);
	});
}
function test8(handler){
	var html = "<html><head></head><body><h1>JS</h1><script>var k = 'David&#039;s bike';</script></body></html>";
	parse(html,function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		if ( $("script").text() != "var k = 'David\'s bike';" ) {
			console.log("Problem with text(). The final result is different from the source");
			return handler(true,false);
		}
		console.log("text(): OK");
		return handler(false,true);
	});	
}
function test9(handler){
	var html = "<html><head></head><body><h1>JS</h1><script>var k = 'David&#039;s bike';</script></body></html>";
	parse(html,function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		if ( $("script").code() != "var k = 'David&#039;s bike';" ) {
			console.log("Problem with code(). The final result is different from the source");
			return handler(true,false);
		}
		console.log("code(): OK");
		return handler(false,true);
	});	
}
function test10(handler){
	var html = "<html><head></head><body><h1><a href=\"#\">JS</a></h1></body></html>";
	parse(html,function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		if ( $("h1 a").parent().tag() != "h1" ) {
			console.log("Problem with parent(). The parent element is not h1, it is: ",$("h1 a").parent());
			return handler(true,false);
		}
		console.log("parent(): OK");
		return handler(false,true);
	});	
}
function test11(handler){
	var html = "<html><head></head><body><h1>Some title</h1><a href=\"#\">JS</a></body></html>";
	parse(html,function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		if ( $("a").length != 1 ) {
			console.log("Problem with element positions. Expecting to get 1 element and got "+$("a").length);
			return handler(true,false);
		}
		if ( $("a")[0]._pos == null ) {
			console.log("Problem with element position. The returned element has no position");
			return handler(true,false);
		}
		if ( $("a")[0]._pos != 1 ) {
			console.log("Problem with element position. The returned element has a wrong position. Expecting position 1 and it has "+$("a")[0]._pos);
			return handler(true,false);
		}
		console.log("_pos: OK");
		return handler(false,true);
	});	
}
function test12(handler) {
	var html = "<html><head></head><body><h1>Some title</h1><a class=\"x yd z\">JS</a><a class=\"meh moh\">PL</a></body></html>";
	parse(html,function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		if ( !$("a").hasClass("yd") ) {
			console.log("Problem with hasClass(). Can't find elements with the 'xd' class");
			return handler(true,false);
		}
		if ( $("a").hasClass("not-here") ) {
			console.log("Problem with hasClass(). Found elements with the 'not-here' class");
			return handler(true,false);
		}
		if ( !$("a").hasClass("x") ) {
			console.log("Problem with hasClass(). Can't find elements with the 'x' class");
			return handler(true,false);
		}
		if ( !$("a").hasClass("x") ) {
			console.log("Problem with hasClass(). Can't find elements with the 'z' class");
			return handler(true,false);
		}

		console.log("hasClass(): OK");
	});
}

// Run the tests
series([test1,test2,test3,test4,test5,test6,test7,test8,test9,test10,test11,test12],function(err,ran){
	if ( err ) {
		console.log("Some tests failed");
		return process.exit(-1);
	}
	console.log("Passed the "+ran+" tests");
	return process.exit(0);
});
