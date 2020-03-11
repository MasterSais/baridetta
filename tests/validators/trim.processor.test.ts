import { trim as processor } from '@lib/processors/trim';
import { baseCasesWithParams } from '@test/utilities';

describe('processor › trim', () => {
  describe('base', () => {
    baseCasesWithParams<any>(
      processor,
      [
        [[], ' abc ', 'abc'],
        [['left'], ' abc ', 'abc '],
        [['right'], ' abc ', ' abc']
      ],
      []
    );
  });
});