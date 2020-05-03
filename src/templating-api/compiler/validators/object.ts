import { check, COMMA_SEPARATED_PARAMS, SEQUENCE_PARAMS } from '@lib/templating-api/compiler/errors';
import { l_and, l_assign, l_condition, l_conditionBody, l_conditionElse, l_content, l_define, l_isObject, l_object, l_onError } from '@lib/templating-api/compiler/units';
import { chain } from '@lib/templating-api/compiler/utilities';
import { DLM } from '@lib/templating-api/lexemes';
import { CompilerProps, ValidatorData } from '@lib/templating-api/types';

const passObjectParams = (props: CompilerProps, params: Array<ValidatorData>): Array<string> => {
  const parts: Array<string> = [];

  const perNameParams: Array<Array<ValidatorData | string>> = [[params[0].value]];

  for (let i = 1; i < params.length; i++) {
    if (params[i].code === DLM.code) {
      perNameParams.push([params[++i].value]);

      continue;
    }

    perNameParams[perNameParams.length - 1].push(params[i]);
  }

  for (const [field, ...nameParams] of perNameParams) {
    parts.push(
      ...chain(
        {
          ...props,
          in: `${props.in}.${field}`,
          out: `${props.out}.${field}`,
        },
        field as string,
        nameParams as Array<ValidatorData>
      )
    );
  }

  return parts;
};

export const objectTemplate = (props: CompilerProps, data: ValidatorData): Array<string> => {
  check(props, data, SEQUENCE_PARAMS | COMMA_SEPARATED_PARAMS);

  const result = props.name();

  return ([
    l_condition(
      l_and(
        props.in,
        l_isObject(props.in)
      )
    ),
    l_conditionBody(
      l_define(result, l_object()),
      ...passObjectParams({ ...props, out: result }, data.params),
      l_assign(props.out, result),
      ...l_content({ ...props, in: props.out })
    ),
    l_conditionElse(
      l_assign(props.out, l_onError(props, data.error))
    )
  ]);
};