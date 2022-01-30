  // The object properties are insertion ordered
  // solution for https://stackoverflow.com/q/69946683/15273968

(function () {
      // original functions
      let _keys = Object.keys;
      let _getOwnPropertyNames = Object.getOwnPropertyNames;
      let _defineProperty = Object.defineProperty;
      let _stringify = JSON.stringify;
      let _log = console.log;

      // main feature definition
      let CoolObject = function () {
        let self = this;
        let handler = {
          _coolKeys: [],

          set(target, key, val) {
            let keys = this._coolKeys;
            if (!keys.some(k => k === key))
              keys.push(key);

            target[key] = val;
          },

          get(target, key) {
            return target[key];
          },

          keys() {
            return this._coolKeys.slice(0);
          },

          deleteProperty(target, key) {
            let keys = this._coolKeys;
            const index = keys.indexOf(key);
            if (index > -1) {
              keys.splice(index, 1);
            }

            delete target[key];
          },

          defineProperty(obj, prop, val) {
            let keys = this._coolKeys;
            if (!keys.some(k => k === prop))
              keys.push(prop);
            _defineProperty(self, prop, val);
          },

          getOwnPropertyNames(obj) {
            let props = _getOwnPropertyNames(obj);
            return [...new Set([...this._coolKeys, ...props])];
          },

          // many improvements can be done here
          // you can use your own modified pollyfill
          stringifyHelper(obj, replacer, space) {
            let out = '{';
            for (let key of this._coolKeys) {
              out += `"${key}":${_stringify(obj[key], replacer, space)}, `;
            }
            out += '}';
            return out;
          },

        };

        _defineProperty(self, 'keys', { value: () => handler.keys() });
        _defineProperty(self, 'getOwnPropertyNames', { value: (o) => handler.getOwnPropertyNames(o) });
        _defineProperty(self, 'stringify', { value: (...args) => handler.stringifyHelper(...args) });

        return new Proxy(self, handler);
      } // CoolObject end


      // ----- wrap inbuilt objects -----
      Object.keys = function (obj) {
        if (!(obj instanceof CoolObject))
          return _keys(obj);
        return obj.keys();
      }

      Object.defineProperty = function (obj, prop, val) {
        if (!(obj instanceof CoolObject))
          _defineProperty(...arguments);
        obj.defineProperty(...arguments);
      }

      Object.getOwnPropertyNames = function (obj) {
        if (!(obj instanceof CoolObject))
          return _getOwnPropertyNames(obj);
        return obj.getOwnPropertyNames(obj);
      }

      JSON.stringify = function (obj, replacer, indent) {
        if (!(obj instanceof CoolObject))
          return _stringify(...arguments);
        return obj.stringify(...arguments);
      }

      console.log = function () {
        let myArgs = [];
        for (let arg of arguments) {

          if (arg instanceof CoolObject) {
            let keys = arg.keys();
            arg = Object.assign({}, arg);
            for (let key of keys) {
              arg[`.${key}`] = arg[key]
              delete arg[key];
            }
          }

          myArgs.push(arg);
        }
        _log(...myArgs);
      }

      window.CoolObject = CoolObject;
    })();
