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
	parse('<body><ul id=first_list><li>1</li><li>2<ol id=second_list><li>2.1</li><li>2.2</li></ol></li><li>3<ul id=third_list><li id=item>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('#FIRST_LIST');

		if ( res.length != 1 ) {
			console.log("Problem searching for single id. Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		console.log("Single id: OK");
		return handler(false,true);
	});
}
function test2(handler){
	parse('<body><ul id=first_list><li>1</li><li>2<ol id=second_list><li>2.1</li><li>2.2</li></ol></li><li>3<ul id=third_list><li id=item>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('#first_list #third_LIST');

		if ( res.length != 1 ) {
			console.log("Problem searching for multiple ids. Expected 1 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Multiple ids: OK");
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