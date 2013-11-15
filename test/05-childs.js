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
	parse('<body><ul class="list unordered"><li id="1_1">1</li><li id="1_2">2<ol class="list ordered"><li id="2_1">2.1</li><li id="2_2">2.2</li></ol></li><li>3<ul class="list unordered"><li id=item>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('ul > li');

		if ( res.length != 4 ) {
			console.log("Problem searching for tag > tag. Expected 4 node and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag > Tag: OK");
		return handler(false,true);
	});
}
function test2(handler){
	parse('<body><ul class="list unordered"><li id="1_1">1</li><li id="1_2">2<ol class="list ordered"><li id="2_1">2.1</li><li id="2_2">2.2</li></ol></li><li>3<ul class="list unordered"><li id=item>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('ul > #2_2');

		if ( res.length != 0 ) {
			console.log("Problem searching for tag > id. Expected 0 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag > ID: OK");
		return handler(false,true);
	});
}
function test3(handler){
	parse('<body><ul class="list unordered"><li id="1_1">1</li><li id="1_2">2<ol class="list ordered"><li id="2_1">2.1</li><li id="2_2">2.2</li></ol></li><li>3<ul class="list unordered"><li id=item>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('li > .list');

		if ( res.length != 2 ) {
			console.log("Problem searching for tag > class. Expected 2 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag > Class: OK");
		return handler(false,true);
	});
}
function test4(handler){
	parse('<body><ul class="list unordered"><li id="1_1">1</li><li id="1_2">2<ol class="list ordered"><li id="2_1">2.1</li><li id="2_2">2.2</li></ol></li><li>3<ul class="list unordered"><li id=item>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('li > .list.unordered');

		if ( res.length != 1 ) {
			console.log("Problem searching for tag > class. Expected 1 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag > Class.Class: OK");
		return handler(false,true);
	});
}


// Run the tests

series([test1,test2,test3,test4],function(err,ran){
	if ( err ) {
		console.log("Some tests failed");
		return process.exit(-1);
	}
	console.log("Passed the "+ran+" tests");
	return process.exit(0);
});