# Route templating

The library contains functionality for route templating which allows you to provide
the arguments to your api calls at runtime while defining the routes beforehand using
variable placeholders.

**Example config:**


```js
const apiRouter = createRouter({
    cats: '/cats', // Static route
    cat: '/cats/${pk}', // Dynamic route with a placeholder
    children: {
        cats: '/cats/children/${cat.pk}/${cat.child.pk}', // Nested property placeholder
        dogs: '/dogs/children/${cat.pk}/{dog.child.pk}'  // Alternative placeholder syntax
    },
}, {
    apiRoot: '/api/v1',
}, Resource);
```

## Calling a route

To call a route, provide an object with values to replace the placeholders. The library dynamically replaces the placeholders with corresponding values from the kwargs object.

```js
// Fetches from "/api/v1/cats"
const route = apiRouter.cats.fetch();

// Fetches from "/api/v1/cats/123"
const dynamicRoute = apiRouter.cat.fetch({ pk: 123 }); 

// Fetches from "/api/v1/cats/children/1/456"
const nestedRoute = apiRouter.children.cats.fetch({ cat: { pk: 1, child: { pk: 456 } } });

// Fetches from "/api/v1/dogs/children/2/789"
const anotherNestedRoute = apiRouter.children.dogs.fetch({ dog: { pk: 2, child: { pk: 789 } } });
```

## Nested Values

The library supports nested objects. Use the . separator to reference nested properties in your placeholders.

```js
// in route path
> '/cats/children/${cat.pk}/${cat.child.pk}'
// with kwargs: `{ cat: { pk: 1, child: { pk: 456 } } }`
> '/api/v1/cats/children/1/456'
```

## Placeholder Syntax

You can use either of the following placeholder syntaxes in your route templates:

1. Template Literal Syntax (`${}`):
   - Example: `/cats/${pk}`
2. Curly Braces Syntax (`{}`):
   - Example: `/dogs/{pk}`

Both syntaxes work interchangeably.

## Missing values in kwargs

If a value provided in the template is missing, it just gets removed from the url. For example:


```js
// in route path
> '/cats/children/${cat.pk}/'
// with kwargs: `{}` or `null`
> '/api/v1/cats/children/1/'
```
