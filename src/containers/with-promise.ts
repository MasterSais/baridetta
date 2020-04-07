import { C_PRM } from '../names';
import { Error, ErrorCallback, MetaData, Validator, Result } from '../types';
import { isFunction, throwValidatorError } from '../utilities';

/**
 * {@link docs/classic-api/containers/with-promise}
 */
export const withPromise = <T, R>(validator: Validator<T, R | Result<R>>): Validator<T, Promise<R | Array<Error>>> =>
  (
    isFunction(validator)
      ? (
        (value: T, onError?: ErrorCallback, meta?: MetaData): Promise<R | Array<Error>> =>
          new Promise(
            (resolve, reject) => {
              const data = validator(value, onError, meta) as Result<R>;

              data.errors
                ? reject(data.errors)
                : resolve((data.result || data) as R);
            }
          )
      )
      : throwValidatorError(C_PRM)
  );