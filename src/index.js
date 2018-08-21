// @flow
import { Map, List } from 'immutable';
import { createSelectorCreator } from 'reselect';

// Types for queries

type Query = {
  type: ?'array',
  getIn: Array<string>,
  filter: {
    [string]: Filter
  },
  map: {
    [string]: Query | true
  },
  localField: ?string,
  foreignField: ?string
}

type Filter = ValueFilter | ParamFilter | ArrayFilter;

type ValueFilter = {
  type: 'value',
  value: string | number
}

type ParamFilter = {
  type: 'param',
  param: string
};

type ArrayFilter = {
  type: 'inArray',
  param: Array<any>
};

// Selector generator

const extractInputSelectors = (query: Query) => {
  const result = [query.getIn];
  Object.keys(query.map).forEach((key) => {
    if (typeof query.map[key] === 'object') {
      result.push(...extractInputSelectors(query.map[key]));
    }
  });
  return result;
};

function areArgumentsShallowlyEqual(equalityCheck, prev, next) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }
  // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
  const length = prev.length;
  for (let i = 0; i < length; i++) {
    if (!equalityCheck(prev[i], next[i])) {
      return false;
    }
  }
  return true;
}

function equalityCheck(a, b) {
  return a === b;
}

function withStateMemoize(func) {
  let lastArgs = null;
  let lastResult = null;
  // we reference arguments instead of spreading them for performance reasons
  return function () {
    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, Array.prototype.slice.call(arguments, 1))) {
      // apply arguments instead of spreading for performance.
      lastResult = func.apply(null, arguments);
    }
    lastArgs = Array.prototype.slice.call(arguments, 1);
    return lastResult;
  };
}

const selectorWithStateCreator = createSelectorCreator(withStateMemoize);

export const generateGraphSelectorCreator = (query: Query) => {
  // Preparing sensitive input selector
  const inputSelectors = extractInputSelectors(query)
    .map((path) => (state) => state.getIn(path));
  inputSelectors.unshift((state) => state);
  // Preparing children query selectors
  const childrenSelectors = {};
  Object.keys(query.map).forEach((key) => {
    if (typeof query.map[key] === 'object') {
      childrenSelectors[key] = generateGraphSelectorCreator(query.map[key]);
    }
  });
  // Main selector creator function
  return (params: Object) => {
    return selectorWithStateCreator(
      inputSelectors,
      function (state, entities) {
        const result = entities && entities
          .filter(item => {
            const checks = Object.keys(query.filter).map((key): boolean => {
              const filter: Filter = query.filter[key];
              if (filter.type === 'param') {
                return params[filter.param] === item.get(key);
              }
              if (filter.type === 'inArray') {
                return params[filter.param].includes(item.get(key));
              }
              if (filter.type === 'value') {
                return item.get(key) === filter.value;
              }
              return false;
            });
            if (params.links) {
              if (List.isList(params.links)) {
                checks.push(params.links.includes(item.get('_id')));
              } else {
                checks.push(params.links === item.get('_id'));
              }
            } else if (params.link && params.foreignField) {
              checks.push(item.get(params.foreignField) === params.link)
            }
            return !checks.some(check => check === false);
          })
          .map(item => {
            let result = new Map();
            const queryMap = query.map;
            // Inclusion or exclusion of parameters
            const isInclusive = Object.values(queryMap).includes(true);
            const isExclusive = Object.values(queryMap).includes(false);
            if (isInclusive) {
              Object.keys(queryMap).forEach((key) => {
                if (queryMap[key] === true) {
                  result = result.set(key, item.get(key));
                }
              });
            } else {
              item.keySeq().forEach((key) => {
                if (isExclusive && queryMap[key] === false) {
                  return;
                }
                result = result.set(key, item.get(key));
              });
            }
            // Links to other entities
            Object.keys(queryMap).forEach((key) => {
              const mapItem = queryMap[key];
              if (typeof mapItem === 'object') {
                const newParams = Object.assign({}, params);
                if (item.has(key)) {
                  Object.assign(newParams, { links: item.get(key) });
                } else if ('localField' in mapItem && 'foreignField' in mapItem) {
                  Object.assign(newParams, {
                    link: item.get(mapItem.localField),
                    foreignField: mapItem.foreignField
                  })
                }

                result = result.set(key, childrenSelectors[key](newParams)(state));
              }
            });
            return result;
          });
        if (result) {
          const convertedResult = result.toList();
          if (List.isList(params.links) || convertedResult.size > 1 || query.type === 'array') {
            return convertedResult;
          }
          return result.first();
        }
      }
    );
  };
};

export const generateGraphSelector = (query: Query, params: Object) => {
  // TODO: Here is a place for cache based on params
  return generateGraphSelectorCreator(query)(params);
};
