var page = new WebPage(),
  address, output, div, i, pair, hidden_elements;

// use named arguments
var args = {};
for(i = 0; i < phantom.args.length; i++) {
  pair = phantom.args[i].split('=');
  args[pair[0]] = pair[1];
}

console.log(JSON.stringify(args));

if( !args.url || !args.output ) {
  var message = 'Usage: rasterize.js url=URL output=filename width=width[optional] \n';
  message += '\tdiv=selector[optional] OR top=top left=left width=width height=height\n';
  message += '\thidden_elements=selector[optional]';

  console.log(message);
  phantom.exit();
}

mask = {};

if(!args.width) { args.width = 1024; }

if( args.top && args.left && args.width && args.height) { // defining a mask to take
  mask.top    = args.top;
  mask.left   = args.left;
  mask.width  = args.width;
  mask.height = args.height;
} else {
  div = args.div;
}

hidden_elements = args.hidden_elements

console.log(args.url, args.output, args.div, hidden_elements);

function evaluate(page, func) {
  var args = [].slice.call(arguments, 2);
  var fn = "function() { return (" + func.toString() + ").apply(this, " + JSON.stringify(args) + ");}";
  return page.evaluate(fn);
}

function returnDivDimensions(div){
  var $el = jQuery(div);

  if($el.length === 0){
    console.log(div + ' was not found. exiting');
    return false;
  } //if you dont find the div, abort!

  var box = $el.offset();
  box.height = $el.height();
  box.width = $el.width();
  return box;
};

function hideNoPrintableElements(hiddenElements) {
  jQuery('.no-printable').hide();

  if (hiddenElements) {
    jQuery(hiddenElements).hide();
  }
};

page.onConsoleMessage = function (msg) {
  console.log("from page: " + msg);
};

page.viewportSize = { width: args.width, height: 550 };

page.open(args.url, function (status) {

  if(status !== 'success') {
    console.log('Unable to load:' + args.url);
    phantom.exit();
  }
  //once page loaded, include jQuery from cdn
  page.includeJs(
    "https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js",
    function() {

      var foundDiv = true;
      page.evaluate(function(){jQuery.noConflict();});

      if(div) {
        var clip =  evaluate(page, returnDivDimensions, div);
        foundDiv = clip;

        page.clipRect = clip;
      }else if (mask){
        page.clipRect = mask;
      }

      evaluate(page, hideNoPrintableElements, hidden_elements);

      console.log('foundDiv is: ', foundDiv);

      if(foundDiv){ page.render(args.output);}
      phantom.exit();
    }
  );
});
