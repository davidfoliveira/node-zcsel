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
	parse('<body><div class="section"><div class="section-image"></div><div class="section-utils"></div><div class="section-text text container"><p>Text1</p><p>Text2</p></div></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div[class="section-utils"]');

		if ( res.length != 1 ) {
			console.log("Problem searching for attr=\"value\". Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.attr("class") != "section-utils" ) {
			console.log("Problem searching for attr=\"value\". Expected attribute with value 'section-utils' and got '"+res.attr("class")+"'");
			return handler(true,false);
		}
		console.log("attr=\"value\": OK");
		return handler(false,true);
	});
}
function test2(handler){
	parse('<body><div class="section"><div class="section-image"></div><div class="section-utils"></div><div class="section-text text container"><p>Text1</p><p>Text2</p></div></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div[class|="section"]');

		if ( res.length != 4 ) {
			console.log("Problem searching for attr|=\"value\". Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		console.log("attr|=\"value\": OK");
		return handler(false,true);
	});
}
function test3(handler){
	parse('<body><div class="section"><div class="section-image"></div><div class="section-utils"></div><div class="section-text text container"><p>Text1</p><p>Text2</p></div></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div[class*="-"]');

		if ( res.length != 3 ) {
			console.log("Problem searching for attr*=\"value\". Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		console.log("attr*=\"value\": OK");
		return handler(false,true);
	});
}
function test4(handler){
	parse('<body><div class="section"><div class="section-image"></div><div class="section-utils"></div><div class="section-text text container"><p>Text1</p><p>Text2</p></div></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div[class~="text"]');

		if ( res.length != 1 ) {
			console.log("Problem searching for attr~=\"value\". Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.attr("class") != "section-text text container" ) {
			console.log("Problem searching for attr~=\"value\". Expected attribute with value 'section-text text container' and got '"+res.attr("class")+"'");
			return handler(true,false);
		}
		console.log("attr~=\"value\": OK");
		return handler(false,true);
	});
}
function test5(handler){
	parse('<body><div class="section"><div class="section-image"></div><div class="section-utils"></div><div class="section-text text container"><p>Text1</p><p>Text2</p></div></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div[class^="section-"]');

		if ( res.length != 3 ) {
			console.log("Problem searching for attr^=\"value\". Expected 3 node and got "+res.length);
			return handler(true,false);
		}
		console.log("attr^=\"value\": OK");
		return handler(false,true);
	});
}
function test6(handler){
	parse('<body><div class="section"><div class="section-image"></div><div class="section-utils"></div><div class="section-text text container"><p>Text1</p><p>Text2</p></div></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div[class$="image"]');

		if ( res.length != 1 ) {
			console.log("Problem searching for attr$=\"value\". Expected 1 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.attr("class") != "section-image" ) {
			console.log("Problem searching for attr$=\"value\". Expected attribute with value 'section-image' and got '"+res.attr("class")+"'");
			return handler(true,false);
		}
		console.log("attr$=\"value\": OK");
		return handler(false,true);
	});
}
function test7(handler){
	parse('<body><div class="section"><div class="section-image"></div><div class="section-utils"></div><div class="section-text text container"><p>Text1</p><p>Text2</p></div></div></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('div[class!="section"]');

		if ( res.length != 3 ) {
			console.log("Problem searching for attr!=\"value\". Expected 3 node and got "+res.length);
			return handler(true,false);
		}
		console.log("attr!=\"value\": OK");
		return handler(false,true);
	});
}
function test8(handler){
	parse('<body><ul><li><img src="http://img-9gag-ftw.9cache.com/photo/a7ywb9b_460s.jpg" class="dog"></li><li><img src="https://igcdn-photos-f-a.akamaihd.net/hphotos-ak-xfa1/t51.2885-15/11008115_506562622818373_1918076377_n.jpg" class="cat"></li><li><img src="http://img-9gag-ftw.9cache.com/photo/aNeb3Zw_700b.jpg" class="bunny"></li></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('img[src$=".jpg" src*="akamaihd.net"]');

		if ( res.length != 1 ) {
			console.log("Problem searching for attr$=\"value\" and attr*=\"value\". Expected 3 node and got "+res.length);
			return handler(true,false);
		}
		if ( res.attr("class") != "cat" ) {
			console.log("Problem searching for attr$=\"value\" and attr*=\"value\". Expected to get the element with class=\"cat\" and got class=\""+res.attr("class")+"\"");
			return handler(true,false);
		}
		console.log("attr$=\"value\" attr*=\"value\": OK");
		return handler(false,true);
	});
}

function test9(handler){
	parse('<body><ul><li><img src="http://img-9gag-ftw.9cache.com/photo/a7ywb9b_460s.jpg" class="dog"></li><li><img src="https://igcdn-photos-f-a.akamaihd.net/hphotos-ak-xfa1/t51.2885-15/11008115_506562622818373_1918076377_n.jpg" class="cat"></li><li><img src="http://img-9gag-ftw.9cache.com/photo/aNeb3Zw_700b.jpg" class="bunny" disabled></li></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('img[disabled]');

		if ( res.attr("class") != "bunny" ) {
			console.log("Problem searching for elem[attr]. Expected to get the element with class=\"bunny\" and got class=\""+res.attr("class")+"\"");
			return handler(true,false);
		}
		console.log("elem[attr]: OK");
		return handler(false,true);
	});
}


// Run the tests

series([test1,test2,test3,test4,test5,test6,test7,test8,test9],function(err,ran){
	if ( err ) {
		console.log("Some tests failed");
		return process.exit(-1);
	}
	console.log("Passed the "+ran+" tests");
	return process.exit(0);
});
