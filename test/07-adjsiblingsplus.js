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
	parse('<body><h1>Big title</h1><p>Some introduction text</p><p>More introduction text</p><h2>Chapter title</h2><p>Chapter introduction</p><p>Chapter text</p><p>More text</p><p>Texto</p></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('h2 ++ p');

		if ( res.length != 4 ) {
			console.log("Problem searching for tag ++ tag. Expected 4 node and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag ++ Tag: OK");
		return handler(false,true);
	});
}
function test2(handler){
	parse('<body><h1>Big title</h1><p id="thafirstintro">Some introduction text</p><p>More introduction text</p><h2>Chapter title</h2><p>Chapter introduction</p><p>Chapter text</p><p>More text</p><p>Texto</p></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('h1 ++ #thafirstintro');

		if ( res.length != 1 ) {
			console.log("Problem searching for tag ++ id. Expected 1 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag + ID: OK");
		return handler(false,true);
	});
}
function test3(handler){
	parse('<body><h1>Big title</h1><p id="thafirstintro">Some introduction text</p><p id="thasecondintro">More introduction text</p><h2>Chapter title</h2><p>Chapter introduction</p><p>Chapter text</p><p>More text</p><p>Texto</p></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('h1 ++ #thasecondintro');

		if ( res.length != 0 ) {
			console.log("Problem searching for tag ++ id (2nd). Expected 0 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag + ID (2nd): OK");
		return handler(false,true);
	});
}
function test4(handler){
	parse('<body><h1>Big title</h1><p class="intro first">Some introduction text</p><p id="intro second">More introduction text</p><h2>Chapter title</h2><p class="intro">Chapter introduction</p><p class="text">Chapter text</p><p class="text">More text</p><p>Texto</p></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('h2 ++ .intro');

		if ( res.length != 1 ) {
			console.log("Problem searching for tag ++ class. Expected 1 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag ++ Class: OK");
		return handler(false,true);
	});
}
function test5(handler){
	parse('<body><h1>Big title</h1><p class="intro first">Some introduction text</p><p class="intro second">More introduction text</p><h2>Chapter title</h2><p class="intro">Chapter introduction</p><p class="text">Chapter text</p><p class="text">More text</p><p>Texto</p></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('h1 ++ .intro');

		if ( res.length != 2 ) {
			console.log("Problem searching for tag ++ class (2nd). Expected 2 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag ++ Class (2nd): OK");
		return handler(false,true);
	});
}
function test5(handler){
	parse('<body><h1>Big title</h1><p class="intro first">Some introduction text</p><p class="intro second">More introduction text</p><h2>Chapter title</h2><p class="intro">Chapter introduction</p><p class="text">Chapter text</p><p class="text">More text</p><p>Texto</p></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('h1 ++ .intro.first');

		if ( res.length != 1 ) {
			console.log("Problem searching for tag ++ class.class. Expected 1 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag ++ Class.Class: OK");
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
