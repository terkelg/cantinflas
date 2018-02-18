const CHUNK = /[\t ]*({{([#^])+([\w\d.$@]+)}})[\s\S]*?({{\/\3}})[\t ]*\n?/g;
const VARIABLE = /{{\s*(.+?)\s*}}/g

const isObj = any => any === Object(any);
const isArr = any => Array.isArray(any);
const isFunc = any => typeof any === 'function';
const isEmpObj = obj => Object.keys(obj).length === 0;
const escRGX = str => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

/**
 * Compile templates with Mustache-like syntax
 * @param {String} template Input string
 * @param (Object} data Data object
 * @returns {String} Compiled output string
 */
function cantinflas(template, data) {
    return render(template, data);

    function render(fragment, context) {
        return fragment.replace(CHUNK, (...args) => {
            const [chunk, tagstart, meta, name, tagend] = args;
            const INLINE = new RegExp(`^.*${escRGX(tagstart)}.*${escRGX(tagend)}.*$`, 'm');
            const RGX = INLINE.test(chunk)
                ? new RegExp(`{{[#^]${escRGX(name)}}}([\\s\\S]*?)${escRGX(tagend)}`, 'g')
                : new RegExp(`\\s*{{[#^]${escRGX(name)}}}\\n?([\\s\\S]*?)[\\t ]*\\n?${escRGX(tagend)}\\s*`, 'g');

            return chunk.replace(RGX, function(_, inner) {
                const val = value(name, context);
                if (meta === '#') {
                    if (isArr(val)) {
                        return val.reduce((str, crr, i) => {
                            let ctx = {...context, '.': crr, '@index': i, '@last': i === val.length-1, '@first': i === 0};
                            if (isArr(crr) || isObj(crr)) ctx = {...ctx, ...crr} // don't spread strings (all those chars might overvride user vars
                            return str += render(inner, ctx);
                        }, '');
                    }
                    if (isFunc(val)) return render(val(inner, context), context);
                    if (isObj(val)) return isEmpObj(val) ? '' : render(inner, {...context, ...val});
                    return !!val ? render(inner, context) : '';
                }
                if (meta === '^') return !val ? render(inner, context) : '';
            })
        })
        .replace(VARIABLE, (_, key) => {
            const val = value(key, context);
            return val || val === 0 ? val : '';
        });
    }
}

/**
 * Extract values from objects using
 * strings with notation e.g `myobject.property`.
 * @param {String} key String to parse
 * @param {Object|Array} data Object to extract information from
 * @returns {Any} Value
 */
function value(key, data) {
    if (key === '.') return data['.'];
    const parts = key.split('.');
    while (parts.length) {
        if (!(parts[0] in data)) return false;
        data = data[parts.shift()];
    }
    return data;
}

module.exports = cantinflas;
