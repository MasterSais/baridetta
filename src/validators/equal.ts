import { V_EQ } from '../names';
import { Error, ErrorCallback, MetaData, Validator } from '../types';
import { applyError, bind, invertCondition, invertError, makeInvertible, setMetaValidator } from '../utilities';

/**
 * {@link docs/validators/equal}
 */
export const equal = makeInvertible<(<T>(match: T, error?: Error) => Validator<T>)>(
  (invert: boolean) => <T>(match: T, error?: Error): Validator<T> =>
    (
      (value: T, onError?: ErrorCallback, meta?: MetaData): T =>
        (
          invertCondition(value === match, invert)
        )
          ? value : applyError(error, onError, setMetaValidator(meta, invertError(V_EQ, invert), [match]))
    )
);

/**
 * {@link docs/validators/defined}
 */
export const defined: <T>(error?: Error) => Validator<T, T> = bind(equal.not, undefined);