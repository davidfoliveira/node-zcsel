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
	parse('<body><ul class="list unordered"><li>1</li><li>2<ol class="list ordered"><li>2.1</li><li>2.2</li></ol></li><li>3<ul class="list unordered"><li id=item>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('.list');

		if ( res.length != 3 ) {
			console.log("Problem searching for single class. Expected 3 node and got "+res.length);
			return handler(true,false);
		}
		console.log("Single class: OK");
		return handler(false,true);
	});
}
function test2(handler){
	parse('<body><ul class="list unordered"><li>1</li><li>2<ol class="list ordered"><li>2.1</li><li>2.2</li></ol></li><li>3<ul class="list unordered"><li id=item>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('.list .ordered');

		if ( res.length != 1 ) {
			console.log("Problem searching for multiple classes. Expected 1 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Multiple classes: OK");
		return handler(false,true);
	});
}
function test3(handler){
	parse('<body><ul class="list unordered"><li>1</li><li>2<ol class="list ordered"><li>2.1</li><li>2.2</li></ol></li><li>3<ul class="list unordered"><li id=item>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('.list.unordered');

		if ( res.length != 2 ) {
			console.log("Problem searching for multiple classes together. Expected 2 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Class.Class: OK");
		return handler(false,true);
	});
}


// Run the tests

series([test1,test2,test3],function(err,ran){
	if ( err ) {
		console.log("Some tests failed");
		return process.exit(-1);
	}
	console.log("Passed the "+ran+" tests");
	return process.exit(0);
});