import { withErrors } from '@lib/classic-api/containers/with-errors';
import { withMeta } from '@lib/classic-api/containers/with-meta';
import { getDep } from '@lib/classic-api/spreaders/get-dep';
import { setVDep } from '@lib/classic-api/spreaders/set-v-dep';
import { Error, MetaData } from '@lib/classic-api/types';
import { array } from '@lib/classic-api/validators/array';
import { gte } from '@lib/classic-api/validators/is';
import { minLen } from '@lib/classic-api/validators/length';
import { number } from '@lib/classic-api/validators/number';
import { object2 } from '@lib/classic-api/validators/object2';
import { string } from '@lib/classic-api/validators/string';
import { template } from '@lib/templating-api/template';
import { baseCasesWithParams } from '@test/utilities';
import { cases } from './cases';

describe('common error processing', () => {
  baseCasesWithParams(() => (
    withMeta(
      withErrors(
        setVDep(
          'user',
          object2([
            ['id', number('numberErr'), gte(0, 'gteErr')],
            ['name', string('stringErr'), minLen(3, 'minLenErr')],
            ['roles', array(number('numberErr'), 'arrayErr')],
            ['subs', array(getDep('user', v => v), 'arrayErr')]
          ], 'objectErr')
        ), (error, { validator, path }) => `${validator}:${path.join('.')}:${error}`
      )
    )
  ), cases, []);
});

describe('common error processing › template', () => {
  baseCasesWithParams(() => (
    template(`
      #user(
        @object(
          id : @number!0 : @compare(>=0)!1,
          name : @string!2 : @length(>=3)!3,
          roles : @array( @number!0 )!4,
          subs : @array(##user)!4
        )!5
      ) ~error($0) ~meta
    `)(
      [
        (error: Error, { validator, path }: MetaData) => `${validator}:${path.join('.')}:${error}`
      ],
      [
        'numberErr', 'gteErr', 'stringErr', 'minLenErr', 'arrayErr', 'objectErr'
      ]
    )
  ), cases, []);
});

describe('common error processing › template › short', () => {
  baseCasesWithParams(() => (
    template(`
      #0(
        @o(
          id @n!0 @c(>=0)!1,
          name @s!2 @l(>=3)!3,
          roles @a( @n!0 )!4,
          subs @a( ##0 )!4
        )!5
      ) ~e($0) ~m
    `)(
      [
        (error: Error, { validator, path }: MetaData) => `${validator}:${path.join('.')}:${error}`
      ],
      [
        'numberErr', 'gteErr', 'stringErr', 'minLenErr', 'arrayErr', 'objectErr'
      ]
    )
  ), cases, []);
});