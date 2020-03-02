/** @type {string} */
export const V_INT = 'integer';
/** @type {string} */
export const V_EQ = 'equal';
/** @type {string} */
export const V_REG = 'regex';
/** @type {string} */
export const V_NEQ = 'notEqual';
/** @type {string} */
export const V_GTE = 'gte';
/** @type {string} */
export const V_LTE = 'lte';
/** @type {string} */
export const V_OOF = 'oneOf';
/** @type {string} */
export const V_LEN = 'len';
/** @type {string} */
export const V_MXLEN = 'maxLen';
/** @type {string} */
export const V_MNLEN = 'minLen';
/** @type {string} */
export const V_FIELDS = 'fields';
/** @type {string} */
export const V_NUM = 'number';
/** @type {string} */
export const V_STR = 'string';
/** @type {string} */
export const V_BLN = 'bool';
/** @type {string} */
export const V_ARR = 'array';
/** @type {string} */
export const V_OBJ = 'object';
/** @type {string} */
export const G_CONS = 'consecutive';
/** @type {string} */
export const G_PRLL = 'parallel';
/** @type {string} */
export const G_OR = 'or';
/** @type {string} */
export const G_TRM = 'transform';
/** @type {string} */
export const S_GDP = 'getDep';
const toArray = (params) => Array.isArray(params) ? params : [params];
const setMetaPath = (meta, path) => (meta && {
    ...meta,
    path: meta.path.concat(path ? [path] : [])
});
const setMetaValidator = (meta, validator, params = []) => (meta && {
    ...meta, params, validator
});
const postToMeta = (value, field, meta) => (meta
    ? (meta._deps[field] = value)
    : value);
const getFromMeta = (field, meta) => (meta && meta._deps[field] || null);
const applyError = (error, onError, meta) => (onError && onError(error, meta), null);
const throwValidatorError = (validator) => {
    throw validator;
};
const isEmpty = (value) => (value === null) || (value === undefined) || (value === '');
const isOneType = (a, b) => typeof a === typeof b;
const isDefined = (value) => value !== undefined;
const isFinite = (value) => (global || window).isFinite(value);
const isFiniteNumber = (value) => Number.isFinite(value);
const isNumber = (value) => typeof value === 'number';
const isString = (value) => typeof value === 'string';
const isBoolean = (value) => typeof value === 'boolean';
const isFunction = (value) => typeof value === 'function';
const isObjectLike = (value) => typeof value === 'object';
const isObject = (value) => value && typeof value === 'object' && value.constructor === Object;
const isArray = (value) => Array.isArray(value);
const isValidatorsSequence = (validators) => validators.reduce((result, validator) => result && isFunction(validator), true);
/**
 * Groups validators sequentially.
 * Passes value through a sequence of validators until an error occurs.
 * Uses by default in 'object' validator's scheme for fields.
 *
 * Type: grouper. Groups validators into one.
 *
 * @param {...Processor} validators Validators list.
 * @return {Processor} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'validators' is invalid.
 */
export const consecutive = (...validators) => (isValidatorsSequence(validators)
    ? ((value, onError, meta) => validators.reduce((value, nextValidator) => (value !== null ? nextValidator(value, onError, meta) : null), value))
    : throwValidatorError(G_CONS));
/**
 * Groups validators sequentially.
 * Searches for first successful validator's result.
 *
 * Type: grouper. Groups validators into one.
 *
 * @param {...Processor} validators Validators list.
 * @return {Processor} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'validators' is invalid.
 */
export const or = (...validators) => (isValidatorsSequence(validators)
    ? ((value, onError, meta) => {
        let processed = null;
        const relevance = { value: false };
        validators.find((nextValidator) => (processed = nextValidator(value, onError ? (error, meta) => onError(error, meta, relevance) : null, meta),
            processed !== null));
        if (processed === null) {
            relevance.value = true;
        }
        return processed;
    })
    : throwValidatorError(G_OR));
/**
 * Groups validators in parallel.
 * The main goal is to catch all errors (pass value through a sequence of validators, even if an error occurred somewhere).
 * Beware of using processors inside.
 *
 * Type: grouper. Groups validators into one.
 *
 * @param {...Validator} validators Validators list.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'validators' is invalid.
 */
export const parallel = (...validators) => (isValidatorsSequence(validators)
    ? ((value, onError, meta) => validators.reduce((validated, nextValidator) => (validated !== null
        ? nextValidator(value, onError, meta)
        : (nextValidator(value, onError, meta), null)), value))
    : throwValidatorError(G_PRLL));
/**
 * Groups processors sequentially.
 * Passes value through a sequence of processors.
 * Takes only processors (doesn't check errors).
 *
 * Type: grouper. Groups processors into one.
 *
 * @param {...Processor} processors Processors list.
 * @return {Processor} Function that takes value.
 * @throws {string} Will throw an error if 'processors' is invalid.
 */
export const transform = (...processors) => (isValidatorsSequence(processors)
    ? ((value) => processors.reduce((value, processor) => processor(value), value))
    : throwValidatorError(G_TRM));
/**
 * Takes value from spreaded structure.
 * Might be used for dynamic validators creation.
 *
 * Type: spreader. Spreads data through a validators scheme.
 *
 * @param {string} field Validators list.
 * @param {Function} preValidator Function that takes spreaded value and insert new validators into scheme.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'field' or 'preValidator' is invalid.
 */
export const getDep = (field, preValidator) => ((isString(field) && field.length > 0 && isFunction(preValidator))
    ? ((value, onError, meta) => {
        const validators = preValidator(getFromMeta(field, meta));
        if (!validators)
            return value;
        const validatorsList = toArray(validators);
        return isValidatorsSequence(validatorsList)
            ? (validatorsList.reduce((value, nextValidator) => (value !== null ? nextValidator(value, onError, meta) : null), value))
            : throwValidatorError(S_GDP);
    })
    : throwValidatorError(S_GDP));
export const mergeDep = (field) => (_value, _onError, meta) => getFromMeta(field, meta);
export const setDep = (field, extValue) => (value, _onError, meta) => postToMeta(isDefined(extValue) ? extValue : value, field, meta);
export const setVDep = (field, ...validators) => (value, onError, meta) => (postToMeta(validators, field, meta), validators.reduce((value, nextValidator) => (value !== null ? nextValidator(value, onError, meta) : null), value));
export const useDefault = (defaultValue, ...validators) => (value, onError, meta) => !isEmpty(value)
    ? validators.reduce((value, nextValidator) => (value !== null ? nextValidator(value, onError, meta) : null), value)
    : (isFunction(defaultValue)
        ? defaultValue(meta)
        : defaultValue);
/**
 * Checks value to be an array.
 *
 * Type: semi validator, semi processor. If validation is successful, then converts value to proper type.
 *
 * @param {Array=} itemSpec Validator(s) of array elements.
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Processor} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'itemSpec' is invalid.
 */
export const array = (itemSpec, error) => {
    const validators = toArray(itemSpec);
    const isValidSequence = isValidatorsSequence(validators);
    if (!itemSpec || isValidSequence) {
        const validator = isValidSequence && consecutive(...validators);
        return ((data, onError, meta) => isArray(data)
            ? (validator
                ? data.map((value, index) => validator(value, onError, setMetaPath(meta, index)))
                : data)
            : applyError(error, onError, setMetaValidator(meta, V_ARR, [data])));
    }
    else {
        return throwValidatorError(V_ARR);
    }
};
const possibleValues = [false, true, 0, 1, '0', '1', 'false', 'true'];
/**
 * Checks value to be a boolean compatible.
 *
 * Type: semi validator, semi processor. If validation is successful, then converts value to proper type.
 *
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Processor} Function that takes: value, error callback and custom metadata.
 */
export const bool = (error) => (value, onError, meta) => {
    const index = (possibleValues.indexOf(value));
    return (index >= 0
        ? Boolean(index % 2)
        : applyError(error, onError, setMetaValidator(meta, V_BLN)));
};
/**
 * Checks value to be equal to 'match' param. Requires the same type. Shallow comparison.
 *
 * Type: validator. If validation is successful, then returns input value.
 *
 * @param {any} match Match.
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 */
export const equal = (match, error) => (value, onError, meta) => (value === match)
    ? value : applyError(error, onError, setMetaValidator(meta, V_EQ, [match]));
const fieldsMap = {
    op: (value, names) => names.reduce((result, field) => result + Number(isString(field) ? !isEmpty(value[field]) : fieldsMap[field[0]](value, field.slice(1))), 0),
    '&': (value, names) => fieldsMap.op(value, names) === names.length,
    '|': (value, names) => fieldsMap.op(value, names) > 0,
    '^': (value, names) => fieldsMap.op(value, names) === 1
};
const isLogicalLexeme = (lexeme) => ['&', '|', '^'].indexOf(lexeme) >= 0;
const validateFieldsSpec = (spec) => (isString(spec) && spec.length > 0 && !isLogicalLexeme(spec))
    || (isArray(spec)
        && spec.length > 2
        && isLogicalLexeme(spec[0])
        && spec
            .reduce((result, field, index) => index === 0 || result && validateFieldsSpec(field), true));
/**
 * Checks for fields in the input object.
 *
 * Type: validator. If validation is successful, then returns input value.
 *
 * @param {Array|string} spec Fields specification.
 * If array, the first element represents a logical operation, otherwise a name of single field.
 * Operations: OR - '|', AND - '&', XOR - '^'.
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'spec' is invalid.
 */
export const fields = (spec, error) => (validateFieldsSpec(spec)
    ? ((value, onError, meta) => (isObject(value)
        && (fieldsMap.op(value, [spec]) > 0))
        ? value : applyError(error, onError, setMetaValidator(meta, V_FIELDS, [spec])))
    : throwValidatorError(V_FIELDS));
/**
 * Checks value to be greater or equal to 'match' param. Requires the same type.
 *
 * Type: validator. If validation is successful, then returns input value.
 *
 * @param {number | string | boolean} bound Boundary value. One of three types: number, string, boolean.
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'bound' is invalid.
 */
export const gte = (bound, error) => ((isFiniteNumber(bound) || isString(bound) || isBoolean(bound))
    ? ((value, onError, meta) => (isOneType(value, bound)
        && value >= bound)
        ? value : applyError(error, onError, setMetaValidator(meta, V_GTE, [bound])))
    : throwValidatorError(V_GTE));
/**
 * Checks number to be an integer.
 *
 * Type: validator. If validation is successful, then returns input value.
 *
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 */
export const integer = (error) => (value, onError, meta) => (isNumber(value)
    && value % 1 === 0)
    ? value : applyError(error, onError, setMetaValidator(meta, V_INT));
/**
 * Checks length to be equal to 'len' param. Requires to be object like.
 *
 * Type: validator. If validation is successful, then returns input value.
 *
 * @param {number} len Reference length. Positive finite number.
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'len' is invalid.
 */
export const len = (len, error) => ((isFiniteNumber(len) && len >= 0)
    ? ((value, onError, meta) => (value !== null
        && (isObjectLike(value) || isString(value))
        && isFiniteNumber(value.length)
        && value.length === len)
        ? value : applyError(error, onError, setMetaValidator(meta, V_LEN, [len])))
    : throwValidatorError(V_LEN));
/**
 * Checks value to be lower or equal to 'match' param. Requires the same type.
 *
 * Type: validator. If validation is successful, then returns input value.
 *
 * @param {number | string | boolean} bound Boundary value. One of three types: number, string, boolean.
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'bound' is invalid.
 */
export const lte = (bound, error) => ((isFiniteNumber(bound) || isString(bound) || isBoolean(bound))
    ? ((value, onError, meta) => (isOneType(value, bound)
        && value <= bound)
        ? value : applyError(error, onError, setMetaValidator(meta, V_LTE, [bound])))
    : throwValidatorError(V_LTE));
/**
 * Checks length to be equal to 'len' param. Requires to be object like.
 *
 * Type: validator. If validation is successful, then returns input value.
 *
 * @param {number} len Reference length. Positive finite number.
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'len' is invalid.
 */
export const maxLen = (len, error) => ((isFiniteNumber(len) && len >= 0)
    ? ((value, onError, meta) => (value !== null
        && (isObjectLike(value) || isString(value))
        && isFiniteNumber(value.length)
        && value.length <= len)
        ? value : applyError(error, onError, setMetaValidator(meta, V_MXLEN, [len])))
    : throwValidatorError(V_MXLEN));
/**
 * Checks length to be equal to 'len' param. Requires to be object like.
 *
 * Type: validator. If validation is successful, then returns input value.
 *
 * @param {number} len Reference length. Positive finite number.
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'len' is invalid.
 */
export const minLen = (len, error) => ((isFiniteNumber(len) && len >= 0)
    ? ((value, onError, meta) => (value !== null
        && (isObjectLike(value) || isString(value))
        && isFiniteNumber(value.length)
        && value.length >= len)
        ? value : applyError(error, onError, setMetaValidator(meta, V_MNLEN, [len])))
    : throwValidatorError(V_MNLEN));
/**
 * Checks value to be not equal to 'match' param. Requires the same type. Shallow comparison.
 *
 * Type: validator. If validation is successful, then returns input value.
 *
 * @param {any} match Match.
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 */
export const notEqual = (match, error) => (value, onError, meta) => (value !== match)
    ? value : applyError(error, onError, setMetaValidator(meta, V_NEQ, [match]));
/**
 * Checks value to be a number compatible.
 *
 * Type: semi validator, semi processor. If validation is successful, then converts value to proper type.
 *
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Processor} Function that takes: value, error callback and custom metadata.
 */
export const number = (error) => (value, onError, meta) => (value !== null
    && value !== String()
    && !isArray(value)
    && isFinite(value))
    ? Number(value) : applyError(error, onError, setMetaValidator(meta, V_NUM));
/**
 * Checks value to be an object.
 *
 * Type: semi validator, semi processor. If validation is successful, then converts value to proper type.
 *
 * @param {ObjectRecords=} spec Validators scheme for object.
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Processor} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'spec' is invalid.
 */
export const object = (spec, error) => {
    const specList = [];
    const isSpecObject = isObject(spec);
    isSpecObject && (Object
        .keys(spec)
        .forEach((key) => specList.push([key, toArray(spec[key])])));
    if (isSpecObject || !spec) {
        const validators = spec && specList.map(([key, processors]) => [key, consecutive(...processors)]);
        return (data, onError, meta) => (data !== null
            && isObject(data))
            ? (validators
                ? validators.reduce((result, [key, validator]) => (result[key] = validator(data[key], onError, setMetaPath(meta, key)), result), {})
                : data)
            : applyError(error, onError, setMetaValidator(meta, V_OBJ, [spec]));
    }
    else {
        return throwValidatorError(V_OBJ);
    }
};
const isNestedArrays = (value) => isArray(value) && (value.reduce((result, item) => result && isArray(item), true));
/**
 * Checks value to be an object.
 *
 * Type: semi validator, semi processor. If validation is successful, then converts value to proper type.
 *
 * @param {Array=} spec Validators scheme for object in form of array. Provides strict ordering.
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Processor} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'spec' is invalid.
 */
export const object2 = (spec, error) => {
    const specList = [];
    const isSpecArray = isNestedArrays(spec);
    isSpecArray && (spec.forEach(([key, ...validators]) => specList.push([key, toArray(validators)])));
    const isSpecValid = isSpecArray && specList.reduce((result, [key]) => result && key.length > 0, true);
    if (isSpecValid || !spec) {
        const validators = spec && specList.map(([key, processors]) => [key, consecutive(...processors)]);
        return (data, onError, meta) => (data !== null
            && isObject(data))
            ? (validators
                ? validators.reduce((result, [key, processor]) => (result[key] = processor(data[key], onError, setMetaPath(meta, key)), result), {})
                : data)
            : applyError(error, onError, setMetaValidator(meta, V_OBJ, [spec]));
    }
    else {
        return throwValidatorError(V_OBJ);
    }
};
/**
 * Checks value to be one of expected. Shallow comparison.
 *
 * Type: validator. If validation is successful, then returns input value.
 *
 * @param {Array} candidates List of possible expected values.
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'candidates' is invalid.
 */
export const oneOf = (candidates, error) => (isArray(candidates)
    ? ((value, onError, meta) => (value !== null
        && candidates.indexOf(value) >= 0)
        ? value : applyError(error, onError, setMetaValidator(meta, V_OOF, [candidates])))
    : throwValidatorError(V_OOF));
/**
 * Checks value to match a pattern.
 *
 * Type: validator. If validation is successful, then returns input value.
 *
 * @param {RegExp} match Pattern.
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 * @throws {string} Will throw an error if 'match' is invalid.
 */
export const regex = (match, error) => ((match && match.constructor === RegExp)
    ? ((value, onError, meta) => (match.test(value))
        ? value : applyError(error, onError, setMetaValidator(meta, V_REG, [match])))
    : throwValidatorError(V_REG));
/**
 * Checks value to be a string compatible.
 *
 * Type: semi validator, semi processor. If validation is successful, then converts value to proper type.
 *
 * @param {Error=} error (Optional) Any type's error.
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Processor} Function that takes: value, error callback and custom metadata.
 */
export const string = (error) => (value, onError, meta) => (isDefined(value)
    && !isObjectLike(value)
    && !isFunction(value))
    ? String(value) : applyError(error, onError, setMetaValidator(meta, V_STR));
/**
 * Clamps value to required boundaries.
 *
 * Type: processor. Processors do not check params' and values' types. Escape usage without validators.
 *
 * @param {number|string|boolean} min Left bound to clamp to.
 * @param {number|string|boolean} max Right bound to clamp to.
 * @return {Processor} Function that takes value.
 */
export const clamp = (min, max) => (value) => value < min ? min : (value > max ? max : value);
export const withErrors = (validator, commonErrorProcessor) => (value, _onError, meta) => {
    const errors = [];
    const addError = (error, relevance) => errors.push({ error, relevance: relevance || { value: true } });
    const errorProcessor = (error, meta, relevance) => error && (isFunction(error)
        ? addError(error(meta), relevance)
        : addError(error, relevance)) || commonErrorProcessor && addError(commonErrorProcessor(meta), relevance);
    const result = validator(value, errorProcessor, meta);
    return {
        result,
        errors: errors.length > 0
            ? errors.filter(({ relevance }) => relevance.value).map(({ error }) => error)
            : null
    };
};
export const withMeta = (validator) => (value, onError) => validator(value, onError, { path: [], _deps: {}, params: [] });
export const withPromise = (validator) => (value, onError, meta) => new Promise((resolve, reject) => {
    const data = validator(value, onError, meta);
    data.errors ? reject(data.errors) : resolve(data.result || data);
});
