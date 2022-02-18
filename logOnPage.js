'use strict';
/**
 Utility to show console logs on document at the end of the <body> tag.
 Can be used to debug html pages on tablets and smart phones.
 
 Author: Onkar Ruikar
*/

//stringify handle circular refs
JSON.stringifyWithCircularRefs = (function () {
 const refs = new Map();
 const parents = [];
 const path = ['this'];

 function clear() {
  refs.clear();
  parents.length = 0;
  path.length = 1;
 }

 function updateParents(key, value) {
  let idx = parents.length - 1;
  let prev = parents[idx];
  if (prev[key] === value || idx === 0) {
   path.push(key);
   parents.push(value);
  } else {
   while (idx-- >= 0) {
    prev = parents[idx];
    if (prev && prev[key] === value) {
     idx += 2;
     parents.length = idx;
     path.length = idx;
     --idx;
     parents[idx] = value;
     path[idx] = key;
     break;
    }
   }
  }
 }

 function checkCircular(key, value) {
  if (value != null) {
   if (typeof value === 'object') {
    if (key) {
     updateParents(key, value);
    }

    let other = refs.get(value);
    if (other) {
     return '[Circular Reference]' + other;
    } else {
     refs.set(value, path.join('.'));
    }
   }
  }
  return value;
 }

 return function stringifyWithCircularRefs(obj, space) {
  try {
   parents.push(obj);
   return JSON.stringify(obj, checkCircular, space);
  } finally {
   clear();
  }
 };
})();

// patch logs
(function () {
 const log = console.log;
 const warn = console.warn;
 const error = console.error;
 const debug = console.debug;
 let logger = document.getElementById('pageLog');
 if (!logger) {
  const logDiv = `
              <style>
                #pageLog *{
                  margin:0;
                  padding:0;
                }
              </style>
              <div id='pageLog' style='height: 50vh; 
							overflow:auto;
							width: 100%;
              font-size:0.7rem;
              position:relative;
							background-color:#ddd'>
                <div id='clearPageLog'
                   onclick='clearPageLogs()'
                   style='
                   border: 1px dotted darkred;
                   position:absolute;
                   bottom: .5rem;
                   right: 1rem;
                   cursor:pointer;
                   '>Clear</div>
              </div>`;
  document.body.insertAdjacentHTML('beforeend', logDiv);
  logger = document.getElementById('pageLog');
 }

 window.clearPageLogs = function () {
  let clear = clearPageLog;
  pageLog.innerHTML = '';
  pageLog.appendChild(clear);
  console.log('logging on page');
 };

 let count = 0;
 function myLog() {
  let text = `<span style='color:${this.color}'>${count++}: `;
  for (var i = 0; i < arguments.length; i++) {
   if (typeof arguments[i] == 'object') {
    text +=
     (JSON && JSON.stringify
      ? JSON.stringifyWithCircularRefs(arguments[i], undefined, 2)
      : arguments[i]) + ' ';
   } else {
    text += arguments[i] + ' ';
   }
  }
  text += `</span><br/>`;
  logger.insertAdjacentHTML('beforeend', `${text}`);
 }

 console.log = (...args) => {
  let obj = { color: 'black', myLog: myLog };
  obj.myLog(...args);
  log(...args);
 };
 console.warn = (...args) => {
  let obj = { color: '#6d5001', myLog: myLog };
  obj.myLog('&#9888;', ...args);
  warn(...args);
 };
 console.error0 = (...args) => {
  let obj = { color: 'darkred', myLog: myLog };
  obj.myLog('&#10060;', ...args);
 };
 console.error = (...args) => {
  console.error0(...args);
  error(...args);
 };
 console.debug = (...args) => {
  let obj = { color: '#666', myLog: myLog };
  obj.myLog(...args);
  debug(...args);
 };

 //handle global errors
 window.onerror = function (msg, url, lineNo, columnNo, error) {
  var string = msg.toLowerCase();
  var message = [
   'Message: ' + msg,
   'URL: ' + url,
   'Line: ' + lineNo,
   'Column: ' + columnNo,
   'Error object: ' + JSON.stringifyWithCircularRefs(error),
  ].join(' - ');
  console.error0(message);
  return false;
 };

 window.onunhandledrejection = function (event) {
  console.error0(
   `Unhandled Promise Rejection. Reason: 
          ${JSON.stringifyWithCircularRefs(event.reason)}`,
   ` Returne value: ${event.returnValue}`
  );
 };

 console.log('logging on page');
})();
