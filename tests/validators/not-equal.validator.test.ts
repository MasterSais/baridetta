import { V_EQ as VALIDATOR_NAME } from '@lib/names';
import { equal as validator } from '@lib/validators/equal';
import { baseCasesWithParams, emptyMeta, emptyObject, errorMetaCase, notNullError, withErrorCases } from '@test/utilities';

describe(`validator › not ${VALIDATOR_NAME}`, () => {
  describe('base', () => {
    baseCasesWithParams<any>(
      validator.not,
      [
        [[1], 0],
        [[1], 'abc'],
        [[1], true, true],
        [[1], emptyObject()],
        [[1], NaN],
        [[1], Infinity],
        [[1], null],
        [[1], undefined],
        [['abc'], 1],
        [['abc'], ''],
        [['abc'], true],
        [['abc'], emptyObject()],
        [['abc'], NaN],
        [['abc'], Infinity],
        [['abc'], undefined],
        [[true], false],
        [[true], 1],
        [[{}], emptyObject()]
      ],
      [
        [[1], 1],
        [['abc'], 'abc'],
        [['abc'], null],
        [[true], true],
        [[emptyObject()], emptyObject()]
      ]
    );
  });

  describe('with error', () => {
    withErrorCases<any>(
      validator.not(1, notNullError()),
      [[0], [1]]
    );
  });

  describe('with meta', () => {
    withErrorCases(
      validator.not(1, errorMetaCase([], [1], VALIDATOR_NAME)),
      [[1]],
      emptyMeta()
    );
  });
});