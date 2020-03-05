import { V_EM } from '../names';
import { Error, ErrorCallback, MetaData, Validator } from '../types';
import { applyError, isEmpty, setMetaValidator } from '../utilities';

/**
 * Checks value to be empty.
 * 
 * Type: validator. If validation is successful, then returns input value.
 * 
 * @param {Error=} error (Optional) Any type's error. 
 * Can be a function that accepts error metadata (available if 'meta' is provided in the validator) and returns an error.
 * @return {Validator} Function that takes: value, error callback and custom metadata.
 */
export const empty = <T extends unknown>(error?: Error): Validator<T> =>
  (
    (value: T, onError?: ErrorCallback, meta?: MetaData): T =>
      isEmpty(value)
        ? value
        : applyError(error, onError, setMetaValidator(meta, V_EM, []))
  );

/**
 * @borrows em as empty
 */
export const em = empty;