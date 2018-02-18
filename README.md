<div align="center">
  <img src="https://github.com/terkelg/cantinflas/raw/master/cantinflas.png" alt="Cantinflas" width="300" height="300" />
</div>

<h1 align="center">Cantinflas</h1>
<div align="center">Tiny mustache-like template engine in ~50 LOC</div>

<br>

Cantinflas is a tiny, logic-less, template engine and subset of [Mustache](http://mustache.github.io/).
Perfect for project scaffolding and other non-performance critical tasks.


## Install

```
$ npm install catinflas
```

## Core Features

- **lightweight:** zero dependencies and only ~50 LOC
- **powerful:** support all the features you'd expect from a template-engine
- **minimal API:** one function call, that's all it take
- **familiar:** Cantinflas is almost a full mustache implementation
- **formatting:** respects the formatting of your source files


## Usage

```js
import cantinflas from 'cantinflas';

const template = `Hello {{name}}!`
const data = { name: 'World' };

const output = cantinflas(template, data);
// => "Hello World"

```

## Tag Types

Just as Mustahce, tags are indicated by the double curly brackets. `{{person}}` is a tag, as is `{{#person}}`.

### Variables

The most basic tag type is the variable. A `{{name}}` tag in a basic template will try to find the `name` key in the current context.
If there is no `name` key found, nothing will be rendered.
Keys that are not found in the data object are ignored.

##### Template

```
* {{name}}
* {{age}}
* {{company}}
```

##### Data

```js
{
  "name": "Robin",
  "company": "Wayne Enterprises"
}
```

##### Output
```
* Robin
*
* Wayne Enterprises
```


### Sections

Sections render blocks of text one or more times, depending on the value of the key in the current context.
A section begins with a pound and ends with a slash. That is, `{{#person}}` begins a "person" section while `{{/person}}` ends it.
The behavior of the section is determined by the value of the key.

#### False Values or Empty Lists
If the `person` key exists and has a value of false or an empty list, the content between the pound and slash will not be displayed.

##### Template

```
Shown.
{{#person}}
  Never shown!
{{/person}}
```

##### Data

```js
{
  "person": false
}
```

##### Output

```
Shown.
```

#### Non-empty Lists
If the `person` key exists and has a non-false value, the content between the pound and slash will be rendered and displayed one or more times.
When the value is a non-empty array or object, the text in the block will be displayed once for each item in the list. The context of the block will be set to the current item for each iteration. In this way we can loop over collections.

When interating lists, there's four special variables availble for you.
* `.`: This is the current item in the array.
* `@index`: This is the index of the current item.
* `@first`: True if the current iteration is the first.
* `@last`: True if the current iteration is the last.

##### Template

```
{{#repo}}
 - {{@index}} {{name}}
{{/repo}}
```

##### Data

```js
{
  "repo": [
    { "name": "resque" },
    { "name": "hub" },
    { "name": "rip" }
  ]
}
```

##### Output

```
- 0 resque
- 1 hub
- 2 rip
```

### Function
When the value is a function, it will be invoked and passed the block of text. The text passed is the literal block, unrendered.
`{{tags}}` will not have been expanded.

##### Template

```
{{#wrapped}}
  {{name}} is awesome.
{{/wrapped}}
```

##### Data

```js
{
  "name": "Willy",
  "wrapped": function(inner) {
    return `${inner}`
  }
}
```

##### Output

```
Willy is awesome.
```

#### Non-False Values
When the value is non-false but not a object, it will be used as the context for a single rendering of the block.

##### Template

```
{{#person?}}
  Hi {{name}}!
{{/person?}}
```

##### Object

```js
{
  "person?": { "name": "Jon" }
}
```

##### Output

```
Hi Jon!
```

### Inverted Sections

An inverted section begins with a caret (hat) and ends with a slash. That is `{{^person}}` begins a "person" inverted section while `{{/person}}` ends it.
Inverted sections render text once based on the inverse value of the key. That is, they will be rendered if the key doesn't exist, is false, or is an empty list.

##### Template

```
{{#repo}}
  - {{name}}
{{/repo}}
{{^repo}}
  No repos :(
{{/repo}}
```

##### Object

```js
{
  "repo": []
}
```

##### Output

```
No repos :(
```


## API

### cantinflas(template, data)

Return: `String`

Compiled template.

#### template

Type: `string`

A string template. This the input you want to compile.


#### data

Type: `Object`

Data object to use for the compiling.


## License

MIT © [Terkel Gjervig](https://terkel.com)
