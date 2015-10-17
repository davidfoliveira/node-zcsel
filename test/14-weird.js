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
	parse('<html><head></head><body><ul><li>01</li><li>02</li><li>03</li><li>04</li><li>05</li><li>06</li><li>07</li><li>08</li><li>09</li><li>10</li><li>11</li></ul></body></html>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('li,li');
		if ( res.length != 11 ) {
			console.log("Problem searching for 11 sorted elements. Expecting to have 11 elements but instead I got "+res.length);
			return handler(true,false);
		}
		if ( $(res[2]).text() != '03' ) {
			console.log("Problem searching for 11 sortes elements. The element#2 is not the 03 but is: "+$(res[2]).text()+". It means there's a problem in the result sorting");
			return handler(true,false);
		}
		console.log("11 sorted elements: OK");
		return handler(false,true);
	});	
}


// Run the tests

series([test1],function(err,ran){
	if ( err ) {
		console.log("Some tests failed");
		return process.exit(-1);
	}
	console.log("Passed the "+ran+" tests");
	return process.exit(0);
});
