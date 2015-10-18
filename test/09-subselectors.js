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
	parse('<body><div><p>Text</p><img src="about:blank" title="Image 1"></div><div><img src="about:blank" title="Image 2"><p>Texto</p></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div p:first-child');

		if ( res.length != 1 ) {
			console.log("Problem searching for tag:first-child. Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.text() != "Text" ) {
			console.log("Problem searching for tag:first-child. Found the wrong element. Expected to find 'Text' and found '"+res.text()+"'");
			return handler(true,false);
		}
		console.log("Tag:first-child: OK");
		return handler(false,true);
	});
}
function test2(handler){
	parse('<body><div><p>Text</p><img src="about:blank" title="Image 1"></div><div><img src="about:blank" title="Image 2"><p>Texto</p></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div p:first-of-type');

		if ( res.length != 2 ) {
			console.log("Problem searching for tag:first-of-type. Expected 2 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag:first-of-type: OK");
		return handler(false,true);
	});
}
function test3(handler){
	parse('<body><div><p>Text</p><img src="about:blank" title="Image 1"></div><div><img src="about:blank" title="Image 2"><p>Texto</p></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div p:last-child');

		if ( res.length != 1 ) {
			console.log("Problem searching for tag:last-child. Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.text() != "Texto" ) {
			console.log("Problem searching for tag:last-child. Found the wrong element. Expected to find 'Text' and found '"+res.text()+"'");
			return handler(true,false);
		}
		console.log("Tag:last-child: OK");
		return handler(false,true);
	});
}
function test4(handler){
	parse('<body><div><p>Text</p><img src="about:blank" title="Image 1"></div><div><img src="about:blank" title="Image 2"><p>Texto</p></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div p:last-of-type');

		if ( res.length != 2 ) {
			console.log("Problem searching for tag:last-of-type. Expected 2 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag:last-of-type: OK");
		return handler(false,true);
	});
}
function test5(handler){
	parse('<body><div><p>Text</p><img src="about:blank" title="Image 1"></div><div><img src="about:blank" title="Image 2"><p>Texto</p></div><div><p>Alone</p></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div p:only-child');

		if ( res.length != 1 ) {
			console.log("Problem searching for tag:only-child. Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.text() != "Alone" ) {
			console.log("Problem searching for tag:only-child. Found the wrong element. Expected to find 'Text' and found '"+res.text()+"'");
			return handler(true,false);
		}
		console.log("Tag:only-child: OK");
		return handler(false,true);
	});
}
function test6(handler){
	parse('<body><div><p>Text</p><img src="about:blank" title="Image 1"></div><div><img src="about:blank" title="Image 2"><p>Texto</p></div><div><p>Alone</p></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div p:only-of-type');

		if ( res.length != 3 ) {
			console.log("Problem searching for tag:only-of-type. Expected 3 node and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag:only-child: OK");
		return handler(false,true);
	});
}
function test7(handler){
	parse('<body><div><p>Text</p><img src="about:blank" title="Image 1"></div><div><img src="about:blank" title="Image 2"><p>Texto</p></div><div><p>Alone</p></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div p:nth-child(1)');

		if ( res.length != 2 ) {
			console.log("Problem searching for tag:nth-child(1). Expected 2 node and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag:nth-child(1): OK");
		return handler(false,true);
	});
}
function test8(handler){
	parse('<body><div><p>Text</p><img src="about:blank" title="Image 1"></div><div><img src="about:blank" title="Image 2"><p>Texto</p></div><div><p>Alone</p></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div p:nth-last-child(1)');

		if ( res.length != 2 ) {
			console.log("Problem searching for tag:nth-last-child(1). Expected 2 node and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag:nth-last-child(1): OK");
		return handler(false,true);
	});
}
function test9(handler){
	parse('<body><div><p>Text</p><img src="about:blank" title="Image 1"></div><div><img src="about:blank" title="Image 2"><p>Texto</p></div><div><p>Alone</p></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div p:nth-of-type(1)');

		if ( res.length != 3 ) {
			console.log("Problem searching for tag:nth-of-type(1). Expected 3 node and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag:nth-of-type(1): OK");
		return handler(false,true);
	});
}
function test10(handler){
	parse('<body><div><p>Text</p><img src="about:blank" title="Image 1"></div><div><img src="about:blank" title="Image 2"><p>Texto</p></div><div><p>Alone</p></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div p:nth-last-of-type(1)');

		if ( res.length != 3 ) {
			console.log("Problem searching for tag:nth-last-of-type(1). Expected 3 node and got "+res.length);
			return handler(true,false);
		}
		console.log("Tag:nth-last-of-type(1): OK");
		return handler(false,true);
	});
}
function test11(handler){
	parse('<body><div><p>Text</p><img src="about:blank" title="Image 1"></div><div><img src="about:blank" title="Image 2"><p>Texto</p></div><div><p>Alone</p></div><div id="sad"></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div:empty');

		if ( res.length != 1 ) {
			console.log("Problem searching for tag:empty. Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.attr("id") != "sad" ) {
			console.log("Problem searching for tag:empty. Found the wrong element. Expected to find 'sad' and found '"+res.attr("id")+"'");
			return handler(true,false);
		}
		console.log("Tag:empty: OK");
		return handler(false,true);
	});
}
function test12(handler){
	parse('<html><body><div><p>Text</p><img src="about:blank" title="Image 1"></div><div><img src="about:blank" title="Image 2"><p>Texto</p></div><div><p>Alone</p></div><div id="sad"></div></body></html>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $(':root');

		if ( res.length != 1 ) {
			console.log("Problem searching for :root. Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.tag() != "html" ) {
			console.log("Problem searching for :root. Found the wrong element. Expected to find 'body' and found '"+res.tag()+"'");
			return handler(true,false);
		}
		console.log(":root: OK");
		return handler(false,true);
	});
}
function test13(handler){
	parse('<body><div><p>Text</p><p>I have some text</p><p>I don\'t have :"(</p></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('p:contains("text")');

		if ( res.length != 1 ) {
			console.log("Problem searching for Tag:contains(\"Text\"). Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.text() != "I have some text" ) {
			console.log("Problem searching for Tag:contains(\"Text\"). Found the wrong element. Expected to find 'I have some text' and found '"+res.text()+"'");
			return handler(true,false);
		}
		console.log("Tag:contains(\"text\"): OK");
		return handler(false,true);
	});
}
function test14(handler){
	parse('<body><div><p>Text</p><p>I have some text</p><p>I don\'t have :"(</p></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('p:first');

		if ( res.length != 1 ) {
			console.log("Problem searching for Tag:first. Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.text() != "Text" ) {
			console.log("Problem searching for Tag:first. Found the wrong element. Expected to find 'Text' and found '"+res.text()+"'");
			return handler(true,false);
		}
		console.log("Tag:first: OK");
		return handler(false,true);
	});
}
function test15(handler){
	parse('<body><div><p>Text</p><p>I have some text</p><p>I don\'t have :"(</p></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('p:last');

		if ( res.length != 1 ) {
			console.log("Problem searching for Tag:last. Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.text() != "I don't have :\"(" ) {
			console.log("Problem searching for Tag:last. Found the wrong element. Expected to find 'I don't have :\"(' and found '"+res.text()+"'");
			return handler(true,false);
		}
		console.log("Tag:last: OK");
		return handler(false,true);
	});
}
function test16(handler){
	parse('<body><div><p>Text</p><p>I have some text</p><p>I don\'t have :"(</p></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('p:eq(3)');

		if ( res.length != 1 ) {
			console.log("Problem searching for Tag:eq(3). Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.text() != "I don't have :\"(" ) {
			console.log("Problem searching for Tag:eq(3). Found the wrong element. Expected to find 'I don't have :\"(' and found '"+res.text()+"'");
			return handler(true,false);
		}
		console.log("Tag:eq(3): OK");
		return handler(false,true);
	});
}
function test17(handler){
	parse('<body><div><p>Text</p><p>I have some text</p><p>I don\'t have :"(</p></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('p:contains("text"):nth-of-type(2)');

		if ( res.length != 1 ) {
			console.log("Problem searching for Tag:contains(\"Text\"):last-of-type. Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.text() != "I have some text" ) {
			console.log("Problem searching for Tag:contains(\"Text\"):last-of-type. Found the wrong element. Expected to find 'I have some text' and found '"+res.text()+"'");
			return handler(true,false);
		}
		console.log("Tag:contains(\"text\"):last-of-type: OK");
		return handler(false,true);
	});
}


// Run the tests

series([/*test1,test2,test3,test4,test5,test6,test7,test8,test9,test10,test11,test12,test13,test14,test15,test16,*/test17],function(err,ran){
	if ( err ) {
		console.log("Some tests failed");
		return process.exit(-1);
	}
	console.log("Passed the "+ran+" tests");
	return process.exit(0);
});
