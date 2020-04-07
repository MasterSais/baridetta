import { or as validator } from '@lib/classic-api/groupers/or';
import { G_OR as VALIDATOR_NAME, V_NUM } from '@lib/classic-api/names';
import { number } from '@lib/classic-api/validators/number';
import { baseCasesWithParams, emptyMeta, errorMetaCase, notNullError, paramsCases, withErrorCases } from '@test/utilities';
import { right, rightParams, wrong, wrongParams } from './cases';

describe(`validator › ${VALIDATOR_NAME}`, () => {
  describe('params', () =>
    paramsCases(validator, rightParams, wrongParams, VALIDATOR_NAME)
  );

  describe('base', () =>
    baseCasesWithParams(validator, right, wrong)
  );

  describe('with error', () =>
    withErrorCases(validator(number(notNullError())), [[right[0][1]], [wrong[0][1]]])
  );

  describe('with meta', () =>
    withErrorCases(validator(number(errorMetaCase([], [], V_NUM))), [[wrong[0][1]]], emptyMeta())
  );
});