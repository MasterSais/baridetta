import { erase as processor } from '@lib/processors/erase';
import { baseCasesWithParams } from '@test/utilities';

describe('processor › erase', () => {
  describe('base', () => {
    baseCasesWithParams<any>(
      processor,
      [
        [[], 'Abc', null],
        [[], 12, null],
        [[], false, null]
      ],
      []
    );
  });
});