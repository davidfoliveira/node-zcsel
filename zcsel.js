var
	htmlparser	= require('htmlparser'),
	he			= require('he');

function initDom(dom) {

	var
		nodes = (dom instanceof Array) ? dom : [dom],
		id = 1;

	// Initialize each element
	nodes.forEach(function(node){
		node._pos = id;
		_initDomNode(node,null,"R"+(id++));
	});

	// The d0llar
	var $ = function(q){
		if ( typeof q == "string" )
			return q.match(/^[\s\r\n]*<(\w+|!--|!DOCTYPE|\?)/i) ? $.build(q) : $.find(q);
		else if ( typeof q == "function" )
			return q.find ? q : $.find(q);
		else if ( q instanceof Array || typeof q == "object" )
			return q.find ? q : $.bless(q);
	};

	// Self nodes
	$.children = nodes;

	// Methods
	$.forEach	= function(cb){$.children.forEach(cb);};

	// Find outside
	$.type		= '#G0D';
	$.name		= "#G0D";
	$._IAMGOD	= true;

	// Bless the $
	_resBless($,true);

	return $;

}

function _initDomNode(node,par,id) {

	var
		digits;

	node._id = (id ? id : 0).toString();
	node.par = par;

	if ( node.attribs ) {
		if ( node.attribs['class'] && !node.classes )
			node.classes = (node.attribs['class'] || '').toLowerCase().split(/[\s\r\n]+/);
	}

	// Initialize children
	if ( node.children instanceof Array ) {
		node._nextid = 0;
		var
			prev = null;

		// Initialize each node
		node.children.forEach(function(c){
			c._pos = node._nextid;
			_initDomNode(c,node,node._id+"."+(node._nextid++));
			if ( prev ) {
				prev.nextSibling = c;
				c.previousSibling = prev;
			}
			prev = c;
		});
	}

}

function num(val,length) {

	var
		zeroes = "";

	if ( length != null ) {
		for ( var x = length ; x > val.toString().length ; x-- )
			zeroes += "0";
	}

	return zeroes+val;

}

function select(dom,q,inside) {

	var
		objs = (dom instanceof Array) ? dom : [dom],
		match = true,
		hadSpace = (inside == null) ? true : !!inside,
		newObjs,
		keepSubject = false,
		resultSet = [];

	// Not initialized? Initialize it!
	if ( dom && dom[0] != null && typeof dom[0]._id == "undefined" )
		initDom(dom,null);

	// Query is a function? Cool!
	if ( typeof q == "function" ) {
		return _resBless(_allChilds(objs,null,function(el){
			return q(_resBless(el));
		}));
	}

	// While it has an expression
	while ( match ) {
		if ( keepSubject ) {
			objs = _subj_select(objs,q,hadSpace);
			q = '';
			break;
		}

		match = false;
		q = q.replace(/^\s*([>+~]*)\s*(\!?)(\*|([\.\#]?)([\w\-]+)|\:([\w\-]+)(?:\((?:(\d+)|"([^"]*)"|\/([^"]*)\/)\))?|\[((?:[\w\-]+\s*(?:[\|\*\~\$\!\^=]*=\s*\"[^"]*\")?\s*)+)\])(\s*)(\,?)/,function(a,sibsel,subject,rule,sign,name,subsel,subselNum,subselStr,subselRx, attrsels,space,comma){
			match = true;
			if ( !keepSubject && subject ) {
				keepSubject = true;
				hadSpace = space != null;
			}

			var
				queryFn = (dom._findOutside ? false : hadSpace) ?
					(sibsel == ">") ? _childs :
					(sibsel == "+") ? _adjSib :
					(sibsel == "~") ? _genSibComb :
					(sibsel == "++") ? _adjSibRep :
					_allChilds : _grep;

			if ( rule == "*" ) {
				newObjs = queryFn(objs);
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
					if ( pn._IAMGOD )
						newObjs = pn.children;
					else {
						while ( pn && pn.par && !pn.par._IAMGOD ) {
							pn = pn.par;
						}
						newObjs = [pn];
					}
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
						return _subSelMatch(el,subsel.toLowerCase(),subselNum,subselStr,subselRx);
					});
				}
			}
			else if ( attrsels ) {
				var ssmatch = true;
				newObjs = objs;
				while ( ssmatch ) {
					ssmatch = false;
					attrsels = attrsels.replace(/^\s*([\w\-]+)\s*(?:([\|\*\~\$\!\^=]*=)\s*\"([^"]*)\")?\s*/g,function(all,attr,attrOp,attrVal){
						ssmatch = true;
						newObjs = queryFn(newObjs,null,function(el){
							var val = (el.attribs ? el.attribs[attr] : null);
							if ( val != null ) {
                                if (!attrOp)
                                    return val !== null;
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
						return "";
					});
				}
				if ( !attrsels.match(/^\s*$/) )
					throw new Error("Can't understand selector ["+attrsels+"]");
			}
			if ( comma ) {
				resultSet = resultSet.concat(newObjs);
				objs = (dom instanceof Array) ? dom : [dom];
				space = " ";
			}
			else
				objs = newObjs;
			hadSpace = space ? true : false;
			return "";
		});
	}
	if ( !q.match(/^\s*$/) )
		throw new Error("Can't understand selector "+JSON.stringify(q));

	resultSet = resultSet.concat(objs);
	return _resBless(_sortNodes(_uniqueNodes(resultSet)));

}

function _subj_select(objs,q,hadSpace) {

	var
		newObjs = [];

	objs.forEach(function(o){
		var ores = select(o,q,hadSpace);
		if ( ores && ores.length > 0 )
			newObjs.push(o);
	});
	return newObjs;

}

function _sortNodes(nodes) {

	var
		paths = {};

	// Build node paths
	nodes.forEach(function(node){
		var
			n = node,
			p = "/";
		while ( n ) {
			if ( typeof n._pos == "undefined" ) {
				console.log("Node has undefined _pos:");
				_dump(n);
			}
			p = "/"+num(n._pos,n.par ? n.par.children.length.toString().length : null)+p;
			n = n.par;
		}
		paths[node._id] = p;
	});

	// Sort returns by path
	return nodes.sort(function(a,b){
		return (paths[a._id] > paths[b._id]) ? 1 : (paths[a._id] == paths[b._id]) ? 0 : -1;
	});

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
			if ( !filter || filter(c) )
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
		if ( el.type != 'tag' && el.type != 'script' )
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

function _subSelMatch(el,sel,num,str,rxStr) {

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
			var text = _elText(el,true);
			return rxStr ? text.match(new RegExp(rxStr)) : (text.indexOf(str) > -1);

		default:
			throw new Error("Unknown subselector :"+sel);
	}

	return false;

}


// Element methods
function _resBless(objs) {

	if ( !(objs instanceof Array) && typeof objs != "function" )
		objs = [objs];

	// Magic
	objs.bless			= _resBless;

	// Attributes
	objs.text			= _resText;
	objs.code			= _resCode;
	objs.html			= _resHTML;
	objs.outerhtml		= _resOuterHTML;
	objs.attr			= _resAttr;
	objs.removeAttr		= _resRemoveAttr;
	objs.tag			= _resTag;

	// Node information methods
	objs.hasClass		= _resHasClass;

	// Querying and walking
	objs.find			= _resFind;
	objs.get			= _resGet;
	objs.each			= _resEach;
	objs.prev			= _resPrev;
	objs.next			= _resNext;
	objs.parent			= _resParent;
	objs.map			= _resMap;

	// Manipulation
//	objs.after			= _resAfter;
//	objs.before			= _resBefore;
	objs.append			= _resAppend;
//	objs.appendTo		= _resAppendTo;		(os targets são passados como argumento e os sources sao o set)
//	objs.prepend		= _resPrepend;
//	objs.prependTo		= _resPrependTo;	(os targets são passados como argumento e os sources sao o set)
//	objs.insertAfter	= _resInsertAfter;
//	objs.insertBefore	= _resInsertBefore;
//	objs.clone			= _resClone;
	objs.remove			= _resRemove;
	objs.detach			= _resRemove;
	objs.empty			= _resEmpty;
	objs.replaceWith	= _resReplaceWith;
//	objs.replaceAll		= _resReplaceAll;	(os targets são passados como argumento e os sources sao o set)
	objs.build			= _resBuild;
	objs.val			= function(){ return this.attr("value") };
	objs._zcrset		= true;

	return objs;

}

function _resBuild(htmlCode) {

	var
		error,
		els,
		pHandler = new htmlparser.DefaultHandler(function(err,doc){
			if ( err )
				error = err;
		});

	parser = new htmlparser.Parser(pHandler);
	parser.parseComplete(htmlCode);
	els = error ? [] : pHandler.dom;

	// Initialize and bless them
	var id = 0;
	els.forEach(function(node){
		node._pos = id;
		_initDomNode(node,null,"R"+(++id));
	});
	_resBless(els);

	// If there will be a find() on the returned object, it will also include searching on the main nodes
	els._findOutside = true;

	return els;
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
				val += he.decode(o.raw || o.data);
			else if ( o.type == 'tag' && !noChild )
				val += _elText(o);
		});
	}
	else if ( el.type == "text" && (el.raw || el.data) )
		val += he.decode(el.raw || el.data);

	return val;

}

function _resCode(noChild) {

	var
		val = "";

	// For all elements

	this.forEach(function(el){
		val += _elCode(el,noChild);
	});

	return val;

}
function _elCode(el,noChild) {

	var
		val = "";

	// For all childs
	if ( el.type == "tag" || el.type == "script" ) {
		if ( el.children == null )
			return "";

		el.children.forEach(function(o){
			if ( o.type == 'text' && (o.raw || o.data) )
				val += (o.raw || o.data);
			else if ( o.type == 'tag' && !noChild )
				val += _elCode(o);
		});
	}
	else if ( el.type == "text" && (el.raw || el.data) )
		val += (el.raw || el.data);

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

function _resHTML(opts) {

	var
		html	= "",
		_opts	= opts || {};

	// God? Return outerhtml instead #HACK
	if ( this._IAMGOD )
		return _resOuterHTML.apply(this,opts);

	// For all elements
	this.forEach(function(el){
		if ( el.children && el.children.length ) {
			el.children.forEach(function(c){
				html += _elHTML(c,_opts)+(_opts.pretty ? "\n" : "");
			});
		}
	});

	// Remove the last return
	if ( _opts.pretty && html.length > 1 )
		html = html.substr(0,html.length-1);

	return html;

}
function _elHTML(el,opts){

	var
		code = '';

	if ( el.type == 'text' ) {
		var str = (el.raw || ''); //.replace(/[\r\n]+/g,"");
		if ( str )
			code += he.decode(str);
	}
	else if ( el.type == 'tag' ) {
		if ( !el.name.match(/^\s*(br|img|col|command|input|embed|hr|link|param|source)\s*$/i) ) {
			code += "<"+el.data+">";
			if ( el.children && el.children.length > 0 ) {
				el.children.forEach(function(c){
					code += _elHTML(c,opts);
				});
			}
			code += "</"+el.name+">";
		}
		else
			code += "<"+el.data+">";
	}
	else if ( el.type == 'comment' )
		code += '<!--'+el.data+'-->';

	return code;

}

function _resFind(q) {

//	return _resBless(select(this,q,!this._findOutside));
	return select(this,q,!this._findOutside);

}

function _resAttr(attr,val) {

	var
		args = Array.prototype.slice.call(arguments);

	if ( this.length == 0 || args.length == 0 )
		return;

	// Just getting
	if ( args.length == 1 )
		return this[0] && this[0].attribs && (typeof this[0].attribs[attr] != "undefined") ? he.decode(this[0].attribs[attr]) : undefined;

	// Set
	var res = this;
	for ( var x = 0 ; x < res.length ; x++ ) {
		if ( res[x].type != "tag" && res[x].type != "script" )
			continue;
		if ( !res[x].attribs )
			res[x].attribs = {};
		if ( val == null )
			delete res[x].attribs[attr];
		else
			res[x].attribs[attr] = val;
		_elementUpdateInternals(res[x]);
	}

}

function _resRemoveAttr(attr) {

	if ( this.length == 0 )
		return;

	var
		val = this.attr(attr);

	if ( attr != null )
		this.attr(attr,null);
	else {
		var res = this;
		for ( var x = 0 ; x < res.length ; x++ ) {
			res[x].attribs = {};
			_elementUpdateInternals(res[x]);
		}
	}

	return val;

}

function _resGet(num) {

	var objs = this[num] ? [this[num]] : [];

	return _resBless(objs);

}

function _resTag(newTagName) {

	if ( newTagName != null && this.length > 0 ) {
		this[0].name = newTagName;
		_elementUpdateInternals(this[0]);
	}

	return (this[0] && this[0].name) ? this[0].name.toLowerCase() : null;

}

function _resHasClass(className) {

	// Normalise class name
	className = className.toLowerCase();

	// For all elements
	for (var x = 0; x < this.length; x++) {
		var el = this[x];
		if (el.classes instanceof Array) {
			for (var y = 0; y < el.classes.length; y++)
				if (el.classes[y] == className) return true;
		}
	}

	return false;
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

function _resParent() {

	var
		objs = [];

	this.forEach(function(el){
		if ( el.par )
			objs.push(el.par);
	});

	return _resBless(objs);

}


// Remove the matching set elements from their parents
function _resRemove() {

	this.forEach(function(el){
		if ( el.par ) {
			var bros = el.par.children;
			for ( var x = 0 ; x < bros.length ; x++ ) {
				if ( bros[x]._id == el._id ) {
					if ( bros[x].previousSibling )
						bros[x].previousSibling.nextSibling = bros[x].nextSibling;
					if ( bros[x].nextSibling )
						bros[x].nextSibling.previousSibling = bros[x].previousSibling;
					bros.splice(x,1);
					break;
				}
			}
		}
	});

	return this;

}

// Remove all the childs elements from the matching set elements
function _resEmpty() {

	this.forEach(function(el){
		el.children = [];
	});

}

function _clone(o) {

	if ( typeof o != "object" )
		return o;

    // Normal object
    var
        newObj = o.constructor();

    for(var key in o) {
    	if ( typeof o[key] == "object" && key != "par" && key != "prev" && key != "previousSibling" && key != "nextSibling" )
	        newObj[key] = _clone(o[key]);
	    else
	    	newObj[key] = o[key];
    }

 	return newObj;

}

// Add elements to the matching set (this)
function _resAppend() {

	var
		addElems = _argElements(Array.prototype.slice.call(arguments));

	this.forEach(function(el){
		addElems.forEach(function(addElem){
			_elementAdd(el,addElem,null);
		});
	});

}

function _argElements(args) {

	var
		retElems = [];

	args.forEach(function(el){

		if ( typeof el == "string" )
			el = _resBuild(el);
		else if ( typeof el == "function" ) {
			el = el();
			if ( el == null )
				return;
		}

		// A DOM result set
		if ( typeof el == "object" && el instanceof Array && el._zcrset ) {
			el.forEach(function(subEl){
				if ( subEl )
					retElems.push(subEl);
			});
		}

		// A DOM element
		else if ( typeof el == "object" && el.type )
			retElems.push(el);

	});

	return retElems;

}

function _elementUpdateInternals(el) {

	var
		attrStr = "";

	// Serialize attributes
	if ( el.attribs && Object.keys(el.attribs).length > 0 ) {
		Object.keys(el.attribs).forEach(function(attr){
			attrStr += " "+attr+"=\""+he.encode(el.attribs[attr])+"\"";
		});
	}

	// Write the data attribute
	el.data = el.name + attrStr;
	el.raw = el.name + attrStr;

}

function _elementAdd(target,source,idx) {

	if ( !target || target.type != "tag" )
		return;

	if ( !target.children )
		target.children = [];

	// Add the new node depending of idx
	if ( typeof idx != "number" )
		idx = null;
	if ( idx != null )
		idx = parseInt(idx);
	if ( idx == null || idx > target.children.length ) {
		idx = target.children.length;
		target.children.push(source);
	}
	else if ( idx < 0 ) {
		idx = 0;
		target.children.unshift(source);
	}
	else {
		target.children.splice(idx,0,source);
	}

	// Source (and source children) should now have new id's, based on their parent id
	if ( !target._nextid )
		target._nextid = 0;

	// Set and propagate the ID
	source._pos = target.children.length;
	source._id = target._id+"."+(target._nextid++);
	_initDomNode(source,target,source._id);

}

function _resReplaceWith(content) {

	var
		args	= Array.prototype.slice.call(arguments),
		set		= this;

	// Remove the new sets from their parents
	args.forEach(function(contentEl){
		// Already a set? Remove it from where it is
		if ( typeof contentEl == "object" && contentEl instanceof Array && contentEl._zcrset )
			contentEl.remove();
	});

	// Make sure the input is a list of nodes
	var
		newElems = _argElements(args);

	// For each element in the set
	set.forEach(function(el){

		// Go on the parent of the element and replace it
		var addedEls = _elementsReplace(el,newElems);

		// Initialize as child of el.par
		if ( !el._nextid )
			el._nextid = 0;
		addedEls.forEach(function(addedEl){
			var newID = el._id+"."+(el._nextid++);
			addedEl._id = newID;
			_initDomNode(addedEl,el.par,addedEl._id);
		});
	});

	return this;

}

function _elementsReplace(el,addElements) {

	var
		_addElements = [],
		bros;

	if ( !el.par )
		return [];

	// Clone elements to add (because we can replace multiple elements in multiple tree positions)
	addElements.forEach(function(addEl){
		_addElements.push(_clone(addEl));
	});
	if ( _addElements.length == 0 )
		return [];

	// Find him (el) between his brothers
	bros = el.par.children;
	for ( var x = 0 ; x < bros.length ; x++ ) {
		if ( bros[x]._id == el._id ) {
			var prevPos = (x > 0) ? bros[x-1]._pos : -1;

			// Link elements between each other and set their new position
			for ( var le = 0 ; le < _addElements.length ; le++ ) {
				_addElements[le]._pos = ++prevPos;
				if ( le > 0 ) {
					_addElements[le].previousSibling = _addElements[le-1];
					_addElements[le-1].nextSibling = _addElements[le];
				}
				if ( _addElements.length > le+1 ) {
					_addElements[le].nextSibling = _addElements[le+1];
					_addElements[le+1].previousSibling = _addElements[le];
				}
			}

			// Link elements with their new brothers
			if ( x > 0 ) {
				_addElements[0].previousSibling = bros[x-1];
				bros[x-1].nextSibling = _addElements[0];
			}
			if ( bros.length > x+1 ) {
				_addElements[_addElements.length-1].nextSibling = bros[x+1];
				bros[x+1].previousSibling = _addElements[_addElements.length-1];
			}

			// Set next elements position
			for ( var nEl = x + 1 ; nEl < bros.length ; nEl++ ) {
				bros[nEl]._pos = ++prevPos;
			}

			// Add
			_addElements.splice(0,0,x,1);
			bros.splice.apply(bros,_addElements);

			return _addElements.splice(2,_addElements.length-2);
		}
	}

	return _addElements;

}

// Dump a node
function _dump(n) {

	if ( typeof n == "function" ) {
		var ar = [];
		n.forEach(function(i){
			ar.push(i);
		});
		return _dumpNode(ar);
	}
	else if ( n instanceof Array ) {
		var ar = Array.prototype.slice.call(n);
		return _dumpNode(ar);
	}
	return _dumpNode(n);

}

function _dumpNode(n) {

	if ( n instanceof Array ) {
		var subnodes = [];
		n.forEach(function(sn){
			subnodes.push(_dumpNode(sn));
		});
		return subnodes;
	}
	else if ( n._id ) {
		var newNode = _clone(n);
		if ( newNode.par )
			newNode.par = newNode.par._id;
		if ( newNode.nextSibling )
			newNode.nextSibling = newNode.nextSibling._id;
		if ( newNode.previousSibling )
			newNode.previousSibling = newNode.previousSibling._id;
		if ( newNode.children )
			newNode.children = _dumpNode(newNode.children);
		return newNode;
	}
	return n;

}


// Self object
exports.select			= select;
exports.initDom			= initDom;
exports.bless			= _resBless;
exports._initDomNode	= _initDomNode;
