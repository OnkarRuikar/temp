/**
 Utility to show console logs on document at the end of the <body> tag.
 Can be used to debug html pages on tablets and smart phones.
 
 Author: Onkar Ruikar
*/

(function () {
      let log = console.log;
      let warn = console.warn;
      let error = console.error;
      let debug = console.debug;
      let logger = document.getElementById('pageLog');
      if (!logger) {
        let logDiv = `
              <style>
                #pageLog *{
                  margin:0;
                  padding:0;
                }
              </style>
              <div id="pageLog" style="height: 50vh; 
							overflow:auto;
							width: 100%;
              font-size:0.7rem;
							background-color:#bbb"></div>`;
        document.body.insertAdjacentHTML('beforeend', logDiv);
        logger = document.getElementById('pageLog');
      }
  
      let count = 0;
      function myLog() {
        let text = `<span style='color:${this.color}'>${count++}: `;
        for (var i = 0; i < arguments.length; i++) {
          if (typeof arguments[i] == 'object') {
            text += (JSON && JSON.stringify ? JSON.stringify(...arguments[i], undefined, 2) : arguments[i]) + '<br />';
          } else {
            text += arguments[i] + '<br />';
          }
        }
        text += `</span>`;
        logger.insertAdjacentHTML('beforeend', `${text}`);
      }

      console.log = (...args) => {
        let obj = { color: 'black', myLog: myLog };
        obj.myLog(args);
        log(...args);
      }
      console.warn = (...args) => {
        let obj = { color: 'brown', myLog: myLog };
        obj.myLog(args);
        warn(...args);
      }
      console.error = (...args) => {
        let obj = { color: 'red', myLog: myLog };
        obj.myLog(args);
        error(...args);
      }
      console.debug = (...args) => {
        let obj = { color: '#555', myLog: myLog };
        obj.myLog(args);
        debug(...args);
      }

      console.log('logging on page');
    })();
