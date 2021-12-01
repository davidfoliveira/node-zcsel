# zcsel: Zé CSS Selectors - A JQuery "kind of" CSS Selector engine

`zcsel` is a CSS Selector engine and a DOM manipulation tool belt for Node.JS. It is based on [htmlparser](https://npmjs.org/package/htmlparser "htmlparser") and supports the most useful [JQuery/CSS3 selectors](http://api.jquery.com/category/selectors/ "selector list page"). This is not committed to any of the CSS[23] and JQuery specifications but.. it pretends to be as near as possible to the available specifications.

The supported selectors are:

- `*` - All Selector: Selects all elements;
- `tagName` - Tag Selector: Selects all elements with the given tag name;
- `#id` - ID Selector: Selects a single element with the given id attribute;
- `.class` - Class Selector: Selects all elements with the given class;
- `ancestor descendant` - Descendant Selector: Selects all elements that are descendants of a given ancestor;
- `selector1, selector2, selector3` - Multiple Selector: Selects the combined results of all the specified selectors;
- `parent > child` - Child Selector: Selects all direct child elements specified by “child” of elements specified by “parent”;
- `prev + next` - Next Adjacent Selector: Selects all next elements matching “next” that are immediately preceded by a sibling “prev”;
- `prev ++ next` - Next Adjacent Selector Plus (invented by Zé): Selects all the next elements matching “next” that are immediately preceded by a sibling “prev” or by other matching element;
- `prev ~ siblings`: Next Siblings Selector - Selects all sibling elements that follow after the “prev” element, have the same parent, and match the filtering “siblings” selector;
- `:first-child`: First Child Selector - Selects all elements that are the first child of their parent;
- `:first-of-type`: First Child of Type Selector - Selects all elements that are the first among siblings of the same element name;
- `:last-child`: Last Child Selector - Selects all elements that are the last child of their parent;
- `:last-of-type`: Last Child of Type Selector - Selects all elements that are the last among siblings of the same element name;
- `:nth-child(N)`: Child N Selector - Selects all elements that are the nth-child `N` of their parent;
- `:nth-of-type(N)`: Child N of Type Selector - Selects all elements that are the nth-child `N` of their parent;
- `:nth-last-child(N)`: Last Child N Selector - Selects all elements that are the nth-child of their parent, counting from the last element to the first;
- `:nth-last-of-type(N)`: Last Child N of Type Selector - Selects all elements that are the nth-child of their parent, counting from the last element to the first;
- `:only-child`: Only Child Selector - Selects all elements that are the only child of their parent;
- `:only-of-type`: Only Child of Type Selector - Selects all elements that have no siblings with the same element name;
- `:eq(N)`: Index N Selector - Select the element at index n within the matched set;
- `:contains("text")` or `:contains(/basic-regex/)`: - Selects the elements containing the specified text or on their inner text or matching the provided regular expression;
- `:first`: Last Element Selector - Selects the first matched element;
- `:last`: Last Element Selector - Selects the last matched element;
- `[attr]`: Attribute Selector - Selects elements that have the specified attribute, regardless of its value;
- `[attr="value"]`: Attribute Equals Selector - Selects elements that have the specified attribute with a value exactly equal to a certain value;
- `[attr!="value"]`: Attribute Not Equal Selector - Select elements that either don’t have the specified attribute, or do have the specified attribute but not with a certain value;
- `[attr|="value"]`: Attribute Contains Prefix Selector - Selects elements that have the specified attribute with a value either equal to a given string or starting with that string followed by a hyphen (-);
- `[attr*="value"]`: Attribute Contains Selector - Selects elements that have the specified attribute with a value containing the a given substring;
- `[attr~="value"]`: Attribute Contains Word Selector - Selects elements that have the specified attribute with a value containing a given word, delimited by spaces;
- `[attr^="value"]`: Attribute Starts With Selector - Selects elements that have the specified attribute with a value beginning exactly with a given string;
- `[attr$="value"]`: Attribute Ends With Selector - Selects elements that have the specified attribute with a value ending exactly with a given string. The comparison is case sensitive;
- `:empty`: Empty Selector - Select all elements that have no children (including text nodes);
- `:root`: Root Selector - Selects the element that is the root of the document;
- `!`: Subject determiner - Determines what elements of the selection will be returned.

The next selectors to be implemented are:

- `:odd`: Odd Elements Selector - Selects odd elements, zero-indexed. See also even;
- `:even`: Even Elements Selector - Selects even elements, zero-indexed. See also odd;
- `:lt`: Less Than Selector - Select all elements at an index less than index within the matched set;
- `:gt`: Greater Than Selector - Select all elements at an index greater than index within the matched set;
- `:parent`: Parent Selector - Select all elements that have at least one child node (either an element or text);
- `:text`: Text Selector - Selects all elements of type text;
- `:submit`: Submit Input Selector - Selects all elements of type submit;
- `:reset`: Reset Input Selector - Selects all elements of type reset;
- `:radio`: Radio Input Selector - Selects all elements of type radio;
- `:password`: Password Input Selector - Selects all elements of type password;
- `:file`: File Input Selector - Selects all elements of type file;
- `:button`: Button Input Selector - Selects all elements of type button;
- `:checkbox`: Checkbox Input Selector - Selects all elements of type checkbox;
- `:input`: Input Selector - Selects all input, textarea, select and button elements;
- `:header`: Headings Selector - Selects all elements that are headers, like h1, h2, h3 and so on;
- `:image`: Image Selector - Selects all elements of type image;

The supported methods are:

- tag([tagName]): Return the element's tag name or change it;
- attr(attrName[,newValue]): Return the attribute `attrName` value or change it;
- removeAttr(attrName): Remove the attribute named `attrName`; If attrName is omited, all the attributes are removed;
- each(): Iterates on the matched elements;
- find(): Find descendent nodes;
- prev(): Return the previous node;
- next(): Return the next node;
- parent(): Return the parent node;
- text([noChilds]): Return the node's text. When noChilds optional argument is true, it's only returned the text of the current node, not child's text;
- code(): Same as text() but doesn't decode entities;
- html(): Return the merged HTML of the elements;
- outerhtml(): Return the merged outer HTML of the elements;
- val(): The same as attr("value");
- append(node1,node2,...): Add the specified nodes to the end of the matching elements;
- remove(): Removes the matching elements from their parent elements;
- empty(): Removes all the child nodes from the matching elements;
- replaceWith(node1,node2,...): Replace each one of the matching elements with the specified nodes;
- hasClass(class): Determine whether any of the matched elements are assigned the given class;


Parsing HTML:

The $ variable [result of zcsel.initDom()] can be also used to parse HTML, converting it on DOM element instances. Example:

	var titles = $("<h1>Something</h1><h2>Here</h2>");

And then, can be used with DOM manipulation functions. Example:

	$("div.title").replaceWith(titles);


# Installing

	npm install zcsel

# Using it

Make some code like this:

	var
	    htmlparser = require('htmlparser'),
	    zcsel      = require('zcsel'),
	    pHandler,
	    parser;

	pHandler = new htmlparser.DefaultHandler(function(err,dom){
	    if ( err ) {
	    	console.log("Error parsing HTML: ",err);
	    	process.exit(-1);
	    }

	    // Zé stuff
	    var $ = zcsel.initDom(dom);
	    console.log($("div").html());
	});
	parser = new htmlparser.Parser(pHandler);
	return parser.parseComplete('<html><head></head><body><div>...</div></body></html>');


# Dependences

`zcsel` depends of [htmlparser](https://npmjs.org/package/htmlparser "htmlparser") or [htmlparser2](https://npmjs.org/package/htmlparser2 "htmlparser2") and [he](https://www.npmjs.com/package/he "he").
