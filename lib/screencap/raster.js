var page = new WebPage();
var output;
var div, hidden_elements;
var mask = {};
var callback_called = false;
var callback_called_time = 0;
var interval = null;

// Process all arguments to get an object containing the
// element before '=' as key, and element after as value.

var args = {};

for(var i = 0; i < phantom.args.length; i++) {
  var pair = phantom.args[i].split('=');
  args[pair[0]] = pair[1];
}

// Validate required arguments. Show usage if required
// arguments are not given.

if( !args.url || !args.output ) {
  var message =
    'Usage: raster.js \n\n' +
    'raster.js [OPTIONS]\n\n' +
    'OPTIONS\n' +
    '=======\n\n' +
    'url         - A url to fetch the content (required).\n' +
    'output      - File in witch the content will be stored (required).\n' +
    'verbose     - By default is true, this will ouput content to the\n' +
    '              terminal.' +
    'div         - A selector, tell the script to capture only the selector\n' +
    '              that you passed.\n' +
    'page_width  - The width of the page.\n' +
    'page_height - The height of the page.\n' +
    'top         - Where start capturing the page (if this option is given\n' +
    '              div option will be ignored, left, width and height must\n' +
    '              be provided).\n' +
    'left        - Where start capturing the page (if this option is given\n' +
    '              div option will be ignored, top, width and height must\n' +
    '              be provided).\n' +
    'width       - Where start capturing the page (if this option is given\n' +
    '              div option will be ignored, top, left and height must\n' +
    '              be provided).\n' +
    'height      - Where start capturing the page (if this option is given\n' +
    '              div option will be ignored, top, left and width must\n' +
    '              be provided).\n' +
    'hidden_elements - This is a selector, all the elements that match\n' +
    '                  with the selector will be hide.\n' +
    'render_on_callback - By default is false, this will require that the\n' +
    '                     page call "window.callPhantom()"  when wants the\n' +
    '                     page to be captured.\n';

  console.log(message);
  phantom.exit();
}

var log = function(msg) {
  if (args.verbose) {
    console.log('[raster.js] - ' + msg);
  }
};

// Set default values.

if (!args.page_width)   { args.page_width = 1024; }
if (!args.page_height)  { args.page_height = 550; }

if (typeof args.verbose === 'undefined') {
  args.verbose = true;
}

if (typeof args.render_on_callback === 'undefined') {
  args.render_on_callback = false;
}

if( args.top && args.left && args.width && args.height) { // defining a mask to take
  mask.top    = args.top;
  mask.left   = args.left;
  mask.width  = args.width;
  mask.height = args.height;
} else {
  div = args.div;
}

hidden_elements = args.hidden_elements;

log('url    = ' + args.url);
log('output = ' + args.output);
log('div    = ' + args.div);
log('page_width  = ' + args.page_width);
log('page_height = ' + args.page_height);
log('hidden_elements = ' + args.hidden_elements);

function evaluate(page, func) {
  var args = [].slice.call(arguments, 2);
  var fn = "function() { return (" + func.toString() + ").apply(this, " + JSON.stringify(args) + ");}";
  return page.evaluate(fn);
};

function returnDivDimensions(div){
  var $el = jQuery(div);

  if($el.length === 0){
    log(div + ' was not found. exiting');
    return false;
  } //if you dont find the div, abort!

  var box = $el.offset();
  box.height = $el.height();
  box.width = $el.width();
  return box;
};

function hideNoPrintableElements(hidden_elements) {
  jQuery('.no-printable').hide();

  if (hidden_elements) {
    jQuery(hidden_elements).hide();
  }
};

page.viewportSize = { width: args.page_width, height: args.page_height };

page.onCallback = function() {
  log('All page is render - callback called');
  callback_called = true;
};

page.open(args.url, function (status) {

  if(status !== 'success') {
    log('Unable to load:' + args.url);
    phantom.exit();
  }

  //once page loaded, include jQuery from cdn
  page.includeJs(
    "https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js",
    function() {
      page.evaluate(function(){jQuery.noConflict();});

      var renderPage = function() {
        var foundDiv = true;

        if (div) {
          var clip =  evaluate(page, returnDivDimensions, div);
          foundDiv = clip;
          page.clipRect = clip;
        } else if (mask){
          page.clipRect = mask;
        }

        evaluate(page, hideNoPrintableElements, hidden_elements);

        if (foundDiv) {
          page.render(args.output);
        }

        phantom.exit();
      };

      if (args.render_on_callback) {
        var callbackWaiter = function() {
          if (callback_called_time >= 10) {
            clearInterval(interval);

            log('callback not called - exit to unlock after 10s');
            phantom.exit();
          } else {
            if (callback_called) {
              clearInterval(interval);

              renderPage();
            }
          }

          callback_called_time += 1;
        };

        interval = setInterval(callbackWaiter, 1000);
      } else {
        renderPage();
      }
    }
  );
});