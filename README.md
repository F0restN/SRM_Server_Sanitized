# Strapi application

A quick description of your strapi application

## Setup instruction

1. Install git and clone the project to your local foler use command `git clone <url>`
2. Dive into the foler and run `npm install` or `yarn install`
   Tips: during your development, if you want to install some libraries, please remember to check whether its includes in Strapi's dependencies. If it does, than you can't change the version of it since its locked by Strapi platform.
3. Download and install PostgreSQL database. Make sure your database was configured to be exactly like:

```JavaScript
// Notice: create a "SRM" database first

module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'postgres',
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'SRM'),
        username: env('DATABASE_USERNAME', 'postgres'),
        password: env('DATABASE_PASSWORD', 'abccba'),
        schema: env('DATABASE_SCHEMA', 'public'), // Not Required
        ssl: env('DATABASE_SSL_SELF', false),
      },
      options: {},
    },
  },
});
```

or edit the file `config/database.js` to match your database configuration.

5. (Optional) Download and install DBeaver(an IDE for database) and connect it to your database.
6. Run command `strapi develop --watch-admin` under the path of your project folder
7. Congrats, all set! Enjoy

## Backend API Document

https://docs.google.com/document/d/1nWJT4cwjyqB7mvBV2qOGHo5kzQrRM6Qpbm7RBaCvCI4/edit

## DBDiagram

https://dbdiagram.io/d/617e2b04fa17df5ea6767bb3

## Naming criterion

**Use UNIX-style newlines (\n)**

Never put forward pull request with \r\n

**Use lowerCamelCase for variables, properties and function names**

Variables, properties and function names should use `lowerCamelCase`. They
should also be descriptive. Single character variables and uncommon
abbreviations should generally be avoided.

```js
let adminUser = db.query("SELECT * FROM users ...");
```

**Use UpperCamelCase for class names**

Class names should be capitalized using `UpperCamelCase`.

```js
function BankAccount() {}
```

**Use UPPERCASE for Constants**

Constants should be declared as regular variables or static class properties,
using all uppercase letters.

```js
let SECOND = 1 * 1000;

function File() {}
File.FULL_PERMISSIONS = 0777;
```

**Use slapdash for database variables**

Wrapped the properties with lowerCase naming. Except: All the variables that retrived directly from database don't have to be wrapped to avoid trivial coding,

```js
{
  "student_id" = 4499958,
  "course_id" = 2145
}

{
  "studentId" = 4499958
  "courseId" = 2145
}
```

**Formate**

You may want to use editorconfig.org to enforce the formatting settings in your editor. Use the Node.js Style Guide `.editorconfig` file to have indentation, newslines and whitespace behavior automatically set to the rules set up below.

Use single quotes
Use single quotes, unless you are writing JSON.

**Object / Array creation**

Use trailing commas and put _short_ declarations on a single line. Only quote
keys when your interpreter complains:

```js
var a = ["hello", "world"];
var b = {
	good: "code",
	"is generally": "pretty",
};
```

## Feature & Functions

Pending

## Version Control

- NodeJS : v14.18.1
- Database : v13.0.1
- Strapi : 3.6.8 Community
- Knex
- Data-fns

_For other components please follow the package-lock.json file_

### Knex

```json
{
	"status": "success",
	"mssg": "",
	"data": {
		"length": 93,
		"name": "error",
		"severity": "ERROR",
		"code": "22P02",
		"file": "int8.c",
		"line": "127",
		"routine": "scanint8"
	},
	"error": null
}
```
