var
	ent = require('ent');

function initDom(dom,par) {

	var
		nodes = (dom instanceof Array) ? dom : [dom],
		id = 0;

	nodes.forEach(function(node){
		_initDomNode(node,null,"R"+(++id));
	});
	nodes = _resBless(nodes);

	// G0d node

	var godNode = [{tag:'#G0D',name:'#G0D',type:'tag',_IAMGOD:true,children:nodes}];

	// The d0llar
	var $ = function(q){
		if ( typeof q == "string" )
			return $.find(q);
		else if ( typeof q == "function" )
			return q.find ? q : $.find(q);
		else if ( q instanceof Array || typeof q == "object" )
			return q.find ? q : $.bless(q);
	};

	// Self nodes
	$.children = godNode;

	// Methods
	$.find		= function(){return _resFind.apply(godNode,Array.prototype.slice.call(arguments,0))};
	$.html		= function(){return _resHTML.apply(godNode,Array.prototype.slice.call(arguments,0))};
	$.outerhtml	= function(){return _resOuterHTML.apply(godNode,Array.prototype.slice.call(arguments,0))};
	$.text		= function(){return _resText.apply(godNode,Array.prototype.slice.call(arguments,0))};
	$.bless		= function(){return _resBless.apply(godNode,Array.prototype.slice.call(arguments,0))};
	return $;

}

function _initDomNode(node,par,id) {

	if ( node._id != null )
		return;

	node.par = par;
	node._id = (id ? id : 0).toString();

	if ( node.attribs ) {
		if ( node.attribs['class'] )
			node.classes = (node.attribs['class'] || '').toLowerCase().split(/ +/);
	}

	// Initialize children

	if ( node.children instanceof Array ) {
		var
			nextID = 0,
			prev = null;

		node.children.forEach(function(c){
			_initDomNode(c,node,node._id+"."+(++nextID));
			if ( prev ) {
				prev.nextSibling = c;
				c.previousSibling = prev;
			}
			prev = c;
		});
	}

}

function select(dom,q) {

	var
		objs = (dom instanceof Array) ? dom : [dom],
		match = true,
		hadSpace = true,
		newObjs,
		keepSubject = false;

	if ( typeof(dom.par) == "undefined" )
		initDom(dom,null);

	// Query is a function? Cool!
	if ( typeof q == "function" )
		return _resBless(_allChilds(objs,null,function(el){
			return q(_resBless(el));
		}));

	// While have expression
	while ( match ) {
		if ( keepSubject ) {
			objs = _subj_select(objs,q);
			q = '';
			break;
		}

		match = false;
		q = q.replace(/^\s*([>+~]*)\s*(\!?)(\*|([\.\#]?)([\w\-]+)|\:([\w\-]+)(?:\((?:(\d+)|"([^"]*)")\))?|\[([\w\-]+)\s*([\|\*\~\$\!\^=]*=)\s*\"([^"]*)\"\s*\])(\s*)/,function(a,sibsel,subject,rule,sign,name,subsel,subselNum,subselStr,attr,attrOp,attrVal,space){
			match = true;
			if ( !keepSubject && subject )
				keepSubject = true;

			var
				queryFn = hadSpace ?
					(sibsel == ">") ? _childs :
					(sibsel == "+") ? _adjSib :
					(sibsel == "~") ? _genSibComb :
					(sibsel == "++") ? _adjSibRep :
					_allChilds : _grep;

			if ( rule == "*" ) {
				newObjs = _allChilds(objs);
				checkUnique = true;
			}
			else if ( name ) {
				name = name.toLowerCase();
				if ( sign == "#" ) {
					var found = false;
					newObjs = queryFn(objs,null,function(el){
						if ( !found && el.attribs && el.attribs['id'] && el.attribs['id'].toLowerCase() == name ) {
							found = true;
							return true;
						}
						return false;
					});
				}
				else if ( sign == "." ) {
					newObjs = queryFn(objs,null,function(el){
						return (el['classes'] && _found(name.toLowerCase(),el['classes']));
					});
				}
				else if ( !sign ) {
					newObjs = queryFn(objs,null,function(el){
						return (el.name.toLowerCase() == name);
					});
				}
			}
			else if ( subsel ) {
				if ( subsel == "root" ) {
					var pn = objs.length ? objs[0] : null;
					if ( pn.children && pn.children.length > 0 )
						pn = pn.children[0];
					while ( pn && pn.par && !pn.par._IAMGOD )
						pn = pn.par;
					newObjs = [pn];
				}
				else if ( subsel == "first" ) {
					newObjs = objs.length > 0 ? [objs[0]] : [];
				}
				else if ( subsel == "last" ) {
					newObjs = objs.length > 0 ? [objs[objs.length-1]] : [];
				}
				else if ( subsel == "eq" && subselNum > 0 ) {
					newObjs = objs.length > subselNum-1 ? [objs[subselNum-1]] : [];
				}
				else {
					newObjs = queryFn(objs,null,function(el){
						return _subSelMatch(el,subsel.toLowerCase(),subselNum,subselStr);
					});
				}
			}
			else if ( attr && attrOp ) {
				newObjs = queryFn(objs,null,function(el){
					var val = (el.attribs ? el.attribs[attr] : null);
					if ( val != null ) {
						if ( attrOp == "=" || attrOp == "==" )
							return (val == attrVal);
						if ( attrOp == "!=" )
							return (val != attrVal);
						else if ( attrOp == "|=" )
							return (val == attrVal || val.indexOf(attrVal+"-") == 0);
						else if ( attrOp == "*=" )
							return (val.indexOf(attrVal) > -1);
						else if ( attrOp == "~=" ) {
							attrVal = attrVal.replace(/^\s+|\s+$/g,"");
							return (val == attrVal || val.substring(0,attrVal.length+1) == attrVal+" " || val.substring(val.length-attrVal.length-1,val.length) == " "+attrVal || val.indexOf(" "+attrVal+" ") > -1 );
						}
						else if ( attrOp == "$=" )
							return (val == attrVal || val.substring(val.length-attrVal.length,val.length) == attrVal);
						else if ( attrOp == "^=" )
							return (val == attrVal || val.substring(0,attrVal.length) == attrVal);
					}
					else if ( attrOp == "!=" )
						return true;
				});
			}
			objs = newObjs;
			hadSpace = space ? true : false;
			return "";
		});
	}
	if ( !q.match(/^\s*$/) )
		throw new Error("Can't understand selector "+JSON.stringify(q));

	return _resBless(_uniqueNodes(objs));

}

function _subj_select(objs,q) {

	var
		newObjs = [];

	objs.forEach(function(o){
		var ores = select(o,q);
		if ( ores && ores.length > 0 )
			newObjs.push(o);
	});
	return newObjs;

}

function _uniqueNodes(nodes) {
	var
		retNodes = [],
		byID = {};

	nodes.forEach(function(n){
		if ( byID[n._id] )
			return;
		retNodes.push(n);
		byID[n._id] = true;
	});
	return retNodes;
}

// CSS >
function _childs(dom,nodes,filter) {

	var
		doms = (dom instanceof Array) ? dom : [dom];

	if ( nodes == null )
		nodes = [];

	doms.forEach(function(dom){
		if ( dom.children == null )
			return;

		dom.children.forEach(function(c){
			if ( c.type != 'tag' && c.type != 'script' )
				return;
			if (!filter || filter(c) )
				nodes.push(c);
		});
	});

	return nodes;

}

// CSS +
function _adjSib(dom,nodes,filter) {

	var
		doms = (dom instanceof Array) ? dom : [dom];

	if ( nodes == null )
		nodes = [];
	if ( !filter )
		return nodes;

	doms.forEach(function(dom){
		var nextTag = dom.nextSibling;
		while ( nextTag && nextTag.type != "tag" && nextTag.type != "script" )
			nextTag = nextTag.nextSibling;
		if ( nextTag == null )
			return;
		if ( filter && nextTag && filter(nextTag) )
			nodes.push(nextTag);
	});

	return nodes;

}

// Non-CSS ++
function _adjSibRep(dom,nodes,filter) {

	var
		doms = (dom instanceof Array) ? dom : [dom];

	if ( nodes == null )
		nodes = [];
	if ( !filter )
		return nodes;

	doms.forEach(function(dom){
		var node = dom.nextSibling;
		while ( node && (node.type == "text" || node.type == "comment" || filter(node)) ) {
			if ( node.type == "tag" || node.type == "script" )
				nodes.push(node);
			node = node.nextSibling;
		}
	});

	return nodes;

}

// CSS ~
function _genSibComb(dom,nodes,filter) {

	var
		doms = (dom instanceof Array) ? dom : [dom];

	if ( nodes == null )
		nodes = [];
	if ( !filter )
		return nodes;

	doms.forEach(function(dom){
		var node = dom.nextSibling;
		while ( node ) {
			if ( (node.type == "tag" || node.type == "script") && filter(node) )
				nodes.push(node);
			node = node.nextSibling;
		}
	});

	return nodes;

}

// CSS all other cases
function _allChilds(dom,nodes,filter) {

	var
		doms = (dom instanceof Array) ? dom : [dom];

	if ( nodes == null )
		nodes = [];

	doms.forEach(function(dom){
		if ( dom.children == null )
			return;

		dom.children.forEach(function(c){
			if ( c.type != 'tag' && c.type != 'script' )
				return;
			if (!filter || filter(c) )
				nodes.push(c);

			return _allChilds(c,nodes,filter);
		});
	});

	return nodes;

}

function _grep(dom,nodes,filter) {

	var
		els = (dom instanceof Array) ? dom : [dom];

	if ( nodes == null )
		nodes = [];

	els.forEach(function(el){
		if ( el.type != 'tag' )
			return;
		if ( !filter || filter(el) )
			nodes.push(el);
	});

	return nodes;

}

function _found(value,list) {

	for ( var x = 0 ; x < list.length ; x++ ) {
		if ( list[x] == value )
			return true;
	}
	return false;

}

function _subSelMatch(el,sel,num,str) {

	if ( num != null )
		num = parseInt(num);

	switch ( sel ) {
		case "first-child":
			var nsc = el.par.children[0];
			while ( nsc ) {
				if ( nsc.type == "tag" )
					return (nsc._id == el._id);
				nsc = nsc.nextSibling;
			}
			return false;

		case "first-of-type":
			var nsc = el.par.children[0];
			while ( nsc ) {
				if ( nsc.type == "tag" && nsc.name == el.name )
					return (nsc._id == el._id);
				nsc = nsc.nextSibling;
			}
			return false;

		case "last-child":
			var nsc = el.par.children[el.par.children.length-1];
			while ( nsc ) {
				if ( nsc.type == "tag" )
					return (nsc._id == el._id);
				nsc = nsc.previousSibling;
			}
			return false;

		case "last-of-type":
			var nsc = el.par.children[el.par.children.length-1];
			while ( nsc ) {
				if ( nsc.type == "tag" && nsc.name == el.name )
					return (nsc._id == el._id);
				nsc = nsc.previousSibling;
			}
			return false;

		case "only-child":
			var nsc = el.par.children[0];
			while ( nsc ) {
				if ( nsc.type == "tag" && nsc._id != el._id )
					return false;
				nsc = nsc.nextSibling;
			}
			return true;

		case "only-of-type":
			var nsc = el.par.children[0];
			while ( nsc ) {
				if ( nsc.type == "tag" && nsc.name == el.name && nsc._id != el._id )
					return false;
				nsc = nsc.nextSibling;
			}
			return true;

		case "nth-child":
			var
				nsc = el.par.children[0],
				idx = 1;
			while ( nsc ) {
				if ( nsc.type == "tag" && idx++ == num && nsc._id == el._id )
					return true;
				nsc = nsc.nextSibling;
			}
			return false;

		case "nth-last-child":
			var
				nsc = el.par.children[el.par.children.length-1],
				idx = 1;
			while ( nsc ) {
				if ( nsc.type == "tag" && idx++ == num && nsc._id == el._id )
					return true;
				nsc = nsc.previousSibling;
			}
			return false;

		case "nth-of-type":
			var
				nsc = el.par.children[0],
				idx = 1;
			while ( nsc ) {
				if ( nsc.type == "tag" && nsc.name == el.name && idx++ == num && nsc._id == el._id )
					return true;
				nsc = nsc.nextSibling;
			}
			return false;

		case "nth-last-of-type":
			var
				nsc = el.par.children[el.par.children.length-1],
				idx = 1;
			while ( nsc ) {
				if ( nsc.type == "tag" && nsc.name == el.name && idx++ == num && nsc._id == el._id )
					return true;
				nsc = nsc.previousSibling;
			}
			return false;

		case "empty":
			return (!el.children || el.children.length == 0);

		case "contains":
			return _elText(el,true).indexOf(str) > -1;

		default:
			throw new Error("Unknown subselector :"+sel);
	}

	return false;

}


// Element methods

function _resBless(objs) {

	if ( !(objs instanceof Array) )
		objs = [objs];

	objs.text = _resText;
	objs.find = _resFind;
	objs.html = _resHTML;
	objs.outerhtml = _resOuterHTML;
	objs.get = _resGet;
	objs.tag = _resTag;
	objs.attr = _resAttr;
	objs.each = _resEach;
	objs.prev = _resPrev;
	objs.next = _resNext;
	objs.map = _resMap;
	objs.val = function(){return this.attr("value")};

	return objs;

}

function _resText(noChild) {

	var
		val = "";

	// For all elements

	this.forEach(function(el){
		val += _elText(el,noChild);
	});

	return val;

}
function _elText(el,noChild) {

	var
		val = "";

	// For all childs

	if ( el.type == "tag" || el.type == "script" ) {
		if ( el.children == null )
			return "";

		el.children.forEach(function(o){
			if ( o.type == 'text' && (o.raw || o.data) )
				val += ent.decode(o.raw || o.data);
			else if ( o.type == 'tag' && !noChild )
				val += _elText(o);
		});
	}
	else if ( el.type == "text" && (el.raw || el.data) )
		val += ent.decode(el.raw || el.data);

	return val;

}

function _resOuterHTML() {

	var
		html = "";

	// For all elements

	this.forEach(function(el){
		html += _elHTML(el);
	});

	return html;

}

function _resHTML() {

	var
		html = "";

	// For all elements

	this.forEach(function(el){
		if ( el.children && el.children.length ) {
			el.children.forEach(function(c){
				html += _elHTML(c);
			});
		}
	});

	return html;

}
function _elHTML(el){

	var
		code = '';

	if ( el.type == 'text' ) {
		var str = (el.raw || '').replace(/[\r\n]+/g,"");
		if ( str )
			code += ent.decode(str)+"\n";
	}
	else if ( el.type == 'tag' ) {
		if ( !el.name.match(/^\s*(br|img|col|command|input|embed|hr|link|param|source)\s*$/i) ) {
			code += "<"+el.data+">";
			if ( el.children && el.children.length > 0 ) {
				el.children.forEach(function(c){
					code += _elHTML(c);
				});
			}
			code += "</"+el.name+">\n";
		}
		else
			code += "<"+el.data+">\n";
	}

	return code;

}

function _resFind(q) {

	var
		elHash = { },
		els = [ ];

/*	this.forEach(function(el){
		var
			subels = select(el,q);

		subels.forEach(function(sel){
			if ( elHash[sel._id] != null )
				return;

			elHash[sel._id] = true;
			els.push(sel);
		});
	});
*/	return _resBless(select(this,q));

}

function _resAttr(attr) {

	return this.length && this[0] && this[0].attribs && (this[0].attribs[attr] != null) ? ent.decode(this[0].attribs[attr]) : null;

}

function _resGet(num) {

	var objs = this[num] ? [this[num]] : [];

	return _resBless(objs);

}

function _resTag() {

	return (this[0] && this[0].name) ? this[0].name.toLowerCase() : null;

}

function _resEach(fn) {

	return this.forEach(function(i){
		var o = [i];
		fn(_resBless(o));
	});

}

function _resMap(fn) {

	var
		vals = [];

	this.each(function(i){
		vals.push(fn(i));
	});

	return vals;

}

function _resPrev() {

	var
		objs = [];

	this.forEach(function(el){
		if ( el.previousSibling )
			objs.push(el.previousSibling);
	});

	return _resBless(objs);

}

function _resNext() {

	var
		objs = [];

	this.forEach(function(el){
		if ( el.nextSibling )
			objs.push(el.nextSibling);
	});

	return _resBless(objs);

}

// Self object

exports.select = select;
exports.initDom = initDom;
exports.bless = _resBless;
exports._initDomNode = _initDomNode;
