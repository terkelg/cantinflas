const test = require('tape');
const s = require('../src');

test('standard', function(t) {
    t.plan(2);
    t.equal(typeof s, 'function', 'exports function');
    t.equal(typeof s('', {}), 'string', 'return string');
});

test('variables', function(t) {
    t.plan(11);
    t.equal(s(`Hello {{name}}`, {name: `Robin`}), 'Hello Robin', 'handles string data');
    t.equal(s(`{{age}} years old`, {age: 23}), '23 years old', 'handles number data');
    t.equal(s(`Is that {{bool}}?`, {bool: true}), 'Is that true?', 'handles bool data');
    t.equal(s(`Hello {{user.name}}`, {user: {name: 'Bruce', age: 35}}), 'Hello Bruce', 'handles nested data');
    t.equal(s(`{{  space }} ok!`, {space: 'All'}), 'All ok!', 'handles whitespace spacing');
    t.equal(s(`Remember {{$jquery1}}?`, {$jquery1: 'JQuery'}), 'Remember JQuery?', 'handle variables with special chars');
    t.equal(s(`Ignore {{ }}`, {}), 'Ignore ', 'ignore empty tags');
    t.equal(s(`Not a tag {{}}`, {}), 'Not a tag {{}}', 'dont be fooled by look-a-like tags');
    t.equal(s(`Who? {{ name }}`, {}), 'Who? ', 'ignore empty data');
    t.equal(s(`Number of f*cks given {{ count }}`, { count: 0 }), 'Number of f*cks given 0', 'treat 0 as a true, valid, variable value');

    let stress = `{{name}}}{{age}}{}{{yolo}}{{}}\n{{name}}`
    t.equal(s(stress, {name: 'Batman', age: 28}), 'Batman}28{}{{}}\nBatman', 'stress test');
})

test('sections', function(t) {
    t.plan(19);
    t.equal(s(`Messed{{#name}} up tags!{{/person}}`, {name: 'robin'}), 'Messed up tags!', 'ignore wrong formatting');

    t.equal(s(`{{#name}}{{name}}{{/name}}`, {name: 'robin'}), 'robin', 'true values are shown');
    t.equal(s(`Hello{{#empty}} World{{/empty}}`, { empty: {} }), 'Hello', 'treat empty objects as false values');
    t.equal(s(`Hello{{#empty}} World{{/empty}}`, { empty: [] }), 'Hello', 'treat empty array as false values');
    t.equal(s(`Hello{{#empty}} World{{/empty}}`, { empty: 0 }), 'Hello', 'treat 0 as a false value');

    t.equal(s(`Shown.{{#person}}Never shown!{{/person}}`, {person: false}), 'Shown.', 'false values not shown');
    t.equal(s(`{{person.first}}{{#person}}{{last}}{{/person}}`, {person: { first: 'Terkel', last: 'G'}}), 'TerkelG', 'non-empty lists provides new context');
    t.equal(s(`   {{#person}}Hi{{/person}}`, {person: 'Terkel'}), '   Hi', 'keep whitespace in inline blocks');

    let heros = ['Batman', 'Robin', 'Catwoman'];
    t.equal(s(`{{#heros}}{{.}}, {{/heros}}`, {heros}), `Batman, Robin, Catwoman, `, 'access to current element in array with {{.}}');

    t.equal(s(`{{#heros}}{{@index}} {{/heros}}`, {heros}), `0 1 2 `, 'access to current index in array with {{@index}}');
    t.equal(s(`{{#heros}}{{^@first}}{{@index}} {{/@first}}{{#@first}}First {{/@first}}{{/heros}}`, {heros}), `First 1 2 `, 'access to special @first boolean variable in array with {{@first}}');
    t.equal(s(`{{#heros}}{{^@last}}{{@index}} {{/@last}}{{#@last}}Last {{/@last}}{{/heros}}`, {heros}), `0 1 Last `, 'access to special @last boolean variable in array with {{@last}}');

    let names = [
        {first: 'Teis', last: 'Gjervig'},
        {first: 'Tea', last: 'Gjervig'},
        {first: 'Terkel', last: 'Gjervig'}
    ];
    let nametmp = `{{#names}}{{first}} {{/names}}`;
    let nameres = `Teis Tea Terkel `;
    t.equal(s(nametmp, {names}), nameres, 'changes context when data is arrays of objects');
    t.equal(s(`{{#names}}{{@index}} {{/names}}`, {names}), '0 1 2 ', 'provieds index when data is arrays of objects');
    t.equal(s(`{{#names}}{{#@first}}{{@index}}{{/@first}}{{/names}}`, {names}), `0`, 'access to special @first boolean variable in object iterrations {{@first}}');
    t.equal(s(`{{#names}}{{#@last}}{{@index}}{{/@last}}{{/names}}`, {names}), `2`, 'access to special @last boolean variable in object iterrations {{@last}}');

    let data = {
        A: { a1: { name: 'a1' }, name: 'a0' },
        B: { b1: { b2: { name: 'b2' }, name: 'b1' }, name: 'b0' },
        name: '0'
    };
    t.equal(s(`{{#A}}{{name}}{{/A}}`, data), 'a0', 'testing nested data');
    t.equal(s(`{{#A}}{{#a1}}{{name}}{{/a1}}{{/A}}`, data), 'a1', 'testing nested data');
    t.equal(s(`{{name}} {{#B}}{{name}} {{#b1}}{{#b2}}{{name}}{{/b2}}{{/b1}}{{/B}}`, data), '0 b0 b2', 'testing nested data');
});

test('lambdas', function(t) {
    t.plan(3);
    let data = {
        who: 'World!',
        lambda: text => `from lambda: ${text}`
    }
    t.equals(s(`{{#lambda}}Hello {{who}}{{/lambda}}`, data), `from lambda: Hello World!`, 'lambda gets inner section as param');
    t.equals(s(`{{#lambda}}Hello{{/lambda}}`, {lambda: text => `{{who}}`, who: 'World'}), 'World', `lambda render variables`);

    let arg = '';
    s(`{{#lambda}}Hello {{who}}{{/lambda}}`, { lambda: text => arg = text, who: 'World'});
    t.equals(arg, 'Hello {{who}}', 'Functions get raw template strings');
});

test('inverted', function(t) {
    t.plan(4);
    let data = { istrue: true, isfalse: false, value: 'truevalue', falsevalue: null };
    t.equals(s(`{{^isfalse}}Is shown.{{/isfalse}}`, data), `Is shown.`, 'inverted section shows when false');
    t.equals(s(`{{^istrue}}Not shown.{{/istrue}}`, data), ``, 'inverted section not shown when true');
    t.equals(s(`{{^value}}Not shown.{{/value}}`, data), ``, 'inverted section not shown with truthy value');
    t.equals(s(`{{^falsevalue}}Is shown.{{/falsevalue}}`, data), `Is shown.`, 'inverted section not shows when falsy value');
});

test('formatting', function(t) {
    t.plan(1);

    const template = `
    {
        "name": "{{ name }}",
        "hello": "{{#obj}}{{name}}{{/obj}}",
        "version": "{{version}}",
        {{^name}}
        "description": "{{description}}",
        {{/name}}
        {{#showkeywords}}
        "inline": [
            {{#array}}"{{@index}} - {{.}}",\t{{/array}}
        ],
        {{/showkeywords}}
        "block": [
        {{#arrayobj}}
            "{{@index}} - {{name}}",
        {{/arrayobj}}
        ],
        license: {{#license}}"MIT"{{/license}}
    }`

    const result = `
    {
        "name": "Cantinflas",
        "hello": "Hello",
        "version": "1.0.0",
        "inline": [
            "0 - template",\t"1 - mustache",\t"2 - chincurtain",\t
        ],
        "block": [
            "0 - template",
            "1 - mustache",
            "2 - chincurtain",
        ],
        license: "MIT"
    }`

    const data = {
        name: 'Cantinflas',
        version: '1.0.0',
        description: 'Micro mustache-like templating',
        showkeywords: true,
        obj: { name: 'Hello' },
        array: ['template', 'mustache', 'chincurtain'],
        arrayobj: [{ name: 'template'}, {name: 'mustache'}, {name: 'chincurtain'}],
        license: true
    };

    t.equal(s(template, data), result, 'match formatting');
});
