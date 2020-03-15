import { consecutive as validator } from '@lib/groupers/consecutive';
import { G_CONS as VALIDATOR_NAME, V_NUM } from '@lib/names';
import { gte } from '@lib/validators/gte';
import { integer } from '@lib/validators/multiple';
import { number } from '@lib/validators/number';
import { baseCasesWithParams, emptyArray, emptyFunction, emptyMeta, emptyObject, errorMetaCase, notNullError, paramsCases, withErrorCases } from '@test/utilities';

describe(`validator › ${VALIDATOR_NAME}`, () => {
  describe('params', () => {
    paramsCases(
      validator,
      [
        [],
        [emptyFunction()],
        [emptyFunction(), emptyFunction()]
      ],
      [
        [emptyObject()],
        [emptyArray()],
        [1],
        ['1'],
        [false],
        [Infinity],
        [NaN],
        [null],
        [undefined]
      ],
      VALIDATOR_NAME
    );
  });

  describe('base', () => {
    baseCasesWithParams<any>(
      validator,
      [
        [[number()], 0],
        [[number()], '1', 1],
        [[number(), integer(), gte(0)], '1', 1]
      ],
      [
        [[number()], 'abc'],
        [[number()], 'abc'],
        [[number(), integer(), gte(0)], 1.2],
        [[number(), integer(), gte(0)], -1],
        [[number(), integer(), gte(0)], 'abc']
      ]
    );
  });

  describe('with error', () => {
    withErrorCases<any>(
      validator(number(notNullError())),
      [[0], ['abc']]
    );
  });

  describe('with meta', () => {
    withErrorCases<any>(
      validator(number(errorMetaCase([], [], V_NUM))),
      [['abc']],
      emptyMeta()
    );
  });
});