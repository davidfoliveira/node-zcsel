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
	parse('<body><ul><li>1</li><li>2<ol><li>2.1</li><li>2.2</li></ol></li><li>3<ul><li>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('!ol li');
		if ( res.length != 1 ) {
			console.log("Problem searching for tag subject on tag selection. Expected 1 nodes and got "+res.length);
			return handler(true,false);
		}
		if ( res.tag() != 'ol' ) {
			console.log("Problem searching for tag subject on tag selection. Expected to find 'ol' but found an '"+res.tag()+"' tag");
			return handler(true,false);
		}
		console.log("Single tag: OK");
		return handler(false,true);
	});
}
function test2(handler){
	parse('<body><ul><li>1</li><li>2<ol><li>2.1</li><li>2.2</li></ol></li><li>3<ul><li>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('!ol li:contains("2")');
		if ( res.length != 1 ) {
			console.log("Problem searching for tag subject on tag:contains() selection. Expected 1 nodes and got "+res.length);
			return handler(true,false);
		}
		if ( res.tag() != 'ol' ) {
			console.log("Problem searching for tag subject on tag:contains() selection. Expected to find 'ol' but found an '"+res.tag()+"' tag");
			return handler(true,false);
		}
		console.log("Single tag: OK");
		return handler(false,true);
	});
}

// Run the tests

series([test1,test2],function(err,ran){
	if ( err ) {
		console.log("Some tests failed");
		return process.exit(-1);
	}
	console.log("Passed the "+ran+" tests");
	return process.exit(0);
});
