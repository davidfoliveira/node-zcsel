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
		var res = $('ul, li');

		if ( res.length != 8 ) {
			console.log("Problem searching for single tags. Expected 8 nodes and got "+res.length);
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
		var res = $('ul > li, ol > li');
		if ( res.length != 6 ) {
			console.log("Problem searching for tags with next sibling. Expected 6 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Multiple tags: OK");
		return handler(false,true);
	});
}
function test3(handler){
	parse('<body><ul><li class=i>1</li><li class=i>2<ol class=o><li class=i>2.1</li><li class=i>2.2</li></ol></li><li class=i>3<ul><li class=i>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('.i,.o');
		if ( res.length != 7 ) {
			console.log("Problem searching for multiple classes. Expected 7 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Classes: OK");
		return handler(false,true);
	});
}
function test4(handler){
	parse('<body><ul><li class=i>1</li><li class=i>2<ol class=o><li class=i>2.1</li><li class=i>2.2</li></ol></li><li class=i>3<ul class=u><li class=i>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $('.o > li, .u > li');
		if ( res.length != 3 ) {
			console.log("Problem searching for tags and classes. Expected 3 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Tags and Classes: OK");
		return handler(false,true);
	});
}
function test5(handler){
	parse('<body><ul><li class=i>1</li><li class=i>2<ol class=o><li class=i>2.1</li><li class=i>2.2</li></ol></li><li class=i>3<ul class=u><li class=i>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		$('.o > li, .u > li').remove();
		var res = $("li");
		if ( res.length != 3 ) {
			console.log("Problem searching for tags and classes. Expected 3 nodes and got "+res.length);
			return handler(true,false);
		}
		console.log("Tags and Classes w/remove(): OK");
		return handler(false,true);
	});
}
function test6(handler){
	parse('<body><ul class="first"><li class=i>1</li><li class=i>2<ol class=o><li class=i>2.1</li><li class=i>2.2</li></ol></li><li class=i>3<ul class=u><li class=i>3.1</li></ul></li></ul></body>',function(err,$){
		if ( err ) {
			console.log("Error parsing HTML: ",err);
			return;
		}
		var res = $("ol > li, ul > li");
		if ( res.length != 6 ) {
			console.log("Problem checking for multiple selector results order. Expected 6 nodes and got "+res.length);
			return handler(true,false);
		}
		if ( res[0].par.name != 'ul' || res[0].par.attribs['class'] != "first" ) {
			console.log("Problem checking for multiple selector results order. Expecting to get '<ul class=first>' ang got '<"+res[0].par.data+">'");
			return handler(true,false);
		}

		console.log("Elements order: OK");
		return handler(false,true);
	});
}

// Run the tests

series([test1,test2,test3,test4,test5,test6],function(err,ran){
	if ( err ) {
		console.log("Some tests failed");
		return process.exit(-1);
	}
	console.log("Passed the "+ran+" tests");
	return process.exit(0);
});
