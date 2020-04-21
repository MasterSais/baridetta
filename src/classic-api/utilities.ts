import { Checkable, Error, ErrorCallback, Invertible, Lengthy, MetaData, Validator } from '@lib/classic-api/types';

export const toArray = <T>(params?: Array<T> | T): Array<T> =>
  Array.isArray(params) ? params : [params];

export const setMetaPath = (meta: MetaData, path: string | number | Array<any>): MetaData => (meta && {
  ...meta,
  path: meta.path.concat(path)
});

export const extendMeta = (meta: MetaData, value: any, validator: string, params: Array<any> = []): MetaData => (meta && (
  meta.validator = validator,
  meta.params = params,
  meta._logs.push([validator, value, params])
), meta);

export const postToMeta = <T>(value: T, field: string | number, meta: MetaData): T => (
  meta
    ? (meta._deps[field] = value)
    : value
);

export const identity = (value: any) => value;

export const getFromMeta = <T>(field: string, meta: MetaData): T => (
  meta ? meta._deps[field] : null
);

export const applyError = (error: Error, onError: ErrorCallback, meta: MetaData): null => (
  onError && onError(error, meta), null
);

export const throwValidatorError = (validator: string) => {
  throw `Invalid params provided in '${validator}'`;
};

export const reduceValidators = (value: any, onError: ErrorCallback, meta: MetaData, validators: Array<Validator<any>>): any => (
  validators.reduce(
    (value: any, nextValidator: Validator<any>, index: number): any => (
      (value !== null || index === 0) ? nextValidator(value, onError, meta) : null
    ),
    value
  )
);

export const valueOf = (value: any) => (value !== null && value !== undefined) ? value.valueOf() : value;

export const isEmpty = (value: any) => (value === null) || (value === undefined) || (value === '');

export const isOneType = (a: any, b: any): boolean => typeof a === typeof b;

export const isDefined = (value: any): boolean => value !== undefined;

export const isPromise = (value: any): boolean => value && value.then && value.catch;

export const isFinite = (value: any): boolean => (global || window).isFinite(value);

export const isFiniteNumber = (value: any): boolean => Number.isFinite(value);

export const isNumber = (value: any): boolean => typeof value === 'number';

export const isRegEx = (value: any): boolean => value && value.constructor === RegExp;

export const isString = (value: any): boolean => typeof value === 'string';

export const isBoolean = (value: any): boolean => typeof value === 'boolean';

export const isFunction = (value: any): boolean => typeof value === 'function';

export const isObjectLike = (value: any): boolean => typeof value === 'object';

export const isObject = (value: any): boolean => value && typeof value === 'object' && value.constructor === Object;

export const hasIndex = (value: any): boolean => value && value.indexOf;

export const isArray = (value: any): boolean => Array.isArray(value);

export const isLengthy = <T extends Lengthy>(value: T) => value !== null && (isObjectLike(value) || isString(value)) && isFiniteNumber(value.length);

export const callee = (value: any): any => (isFunction(value) ? value : (() => value));

export const isValidatorsSequence = (validators: Array<Validator<any, any>>): boolean =>
  validators.reduce((result: boolean, validator) => result && isFunction(validator), true);

export const makeInvertible = <T>(factory: (invert: boolean) => T): Invertible<T> => {
  const validator = factory(false) as Invertible<T>;

  validator.not = factory(true);

  return validator;
};

export const makeCheckable = <T, R>(factory: (checkOnly: boolean) => T | R): Checkable<T, R> => {
  const validator = factory(false) as Checkable<T, R>;

  validator.check = factory(true) as R;

  return validator;
};

export const invertCondition = (condition: boolean, invert: boolean) => invert ? !condition : condition;

export const invertError = (name: string, invert: boolean) => invert ? `not:${name}` : name;

export const isFactory = (validator: string, param?: any) =>
  (
    <T>(comparator: ((value: T, ...args: any) => boolean), error?: Error): Validator<T> =>
      (
        isFunction(comparator)
          ? (
            param = callee(param),

            (value: T, onError?: ErrorCallback, meta?: MetaData): T => {
              const paramData = param();

              extendMeta(meta, value, validator, isDefined(paramData) ? [paramData] : []);

              return (
                comparator(value, paramData)
                  ? value
                  : applyError(error, onError, meta)
              );
            }
          )
          : throwValidatorError(validator)
      )
  );

export const lengthFactory = (validator: string, comparator: ((value: number, len: number) => boolean)) => (
  (
    makeInvertible<(<T extends Lengthy>(len: number | (() => number), error?: Error) => Validator<T>)>(
      (
        (invert: boolean) => <T extends Lengthy>(len: number | (() => number), error?: Error) => isFactory(invertError(validator, invert), len)(
          (value: T, param: number) => isLengthy(value) && invertCondition(comparator(value.length, param), invert),
          error
        )
      )
    )
  )
);

export const multipleFactory = (validator: string) => (
  (
    makeInvertible<((multiplier: number | (() => number), error?: Error) => Validator<number>)>(
      (
        (invert: boolean) => (multiplier: number | (() => number), error?: Error): Validator<number> => isFactory(invertError(validator, invert), multiplier)(
          (value: number, param: number) => isNumber(value) && invertCondition(value % param === 0, invert),
          error
        )
      )
    )
  )
);

export const onAsync = (value: any, callee: (value: any) => void) => (
  isPromise(value)
    ? value.then(callee)
    : callee(value)
);

export const asyncActor = (meta: MetaData): [(value: any, callee: (value: any) => void) => void, (value: any) => any] => {
  const actions: Array<any> = [];

  return (
    meta && meta._async
      ? [
        (value: any, callee: (value: any) => void) => onAsync(value, callee),
        (value: any) => (
          actions.length > 0
            ? Promise.all(actions).then(() => value)
            : value
        )
      ]
      : [
        (value: any, callee: (value: any) => void) => callee(value),
        identity
      ]
  );
};