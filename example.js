const cantinflas = require('./src');

const template = `{
    "name": "{{ name }}",
    "hello": "{{#obj}}{{name}}{{/obj}}",
    "version": "{{version}}",
    {{^name}}
    "description": "{{description}}",
    {{/name}}
    "keywordsmulti": [
    {{#keywords}}
        "{{name}}"
    {{/keywords}}
    ],
    license: {{#license}}"MIT"{{/license}},
    author: {{#func}}{{name}}{{/func}}
}`

const data = {
    name: 'Cantinflas',
    version: '1.0.0',
    description: 'Tiny mustache-like template engine',
    obj: { name: 'Hello' },
    keywords: [{ name: 'template'}, {name: 'mustache'}, {name: 'handlebars'}],
    license: true,
    func: string => `Good Boy ${string}!`
};

console.log(cantinflas(template, data));
