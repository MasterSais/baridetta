import { COMPARATOR_STATE, INJECTION_STATE, PARAMS_STATE, semanticRules, STRING_STATE, VALIDATOR_ENTRY_STATE } from './semantic-rules';
import { Lexeme, ValidatorData } from './types';

export const VALIDATOR_ENTRY_LEXEME = '$e';

const processState = (state: Array<any>, lexemes: Array<Lexeme>, index: number, stack: Array<any>) => {
  let offset = index;

  for (let i = 0; i < state.length; i++) {
    if (Number.isFinite(state[i])) {
      let nestedStack = stack;

      if ([COMPARATOR_STATE, INJECTION_STATE, STRING_STATE, PARAMS_STATE].indexOf(state[i]) >= 0) {
        nestedStack.push([]);

        nestedStack = nestedStack[stack.length - 1];
      }

      if (state[i] === VALIDATOR_ENTRY_STATE) {
        nestedStack.push(VALIDATOR_ENTRY_LEXEME);
      }

      offset = processState(semanticRules[state[i]], lexemes, offset, nestedStack);

      if ([COMPARATOR_STATE, INJECTION_STATE, STRING_STATE].indexOf(state[i]) >= 0) {
        if (nestedStack.length > 0) {
          stack[stack.length - 1] = nestedStack.join(String());
        } else {
          stack.pop();
        }
      }

      if (state[i] === PARAMS_STATE) {
        stack[stack.length - 2] = {
          name: stack[stack.length - 2],
          params: stack.pop()
        };
      }

      if (nestedStack[nestedStack.length - 1] === VALIDATOR_ENTRY_LEXEME) {
        nestedStack.pop();
      }

      if (offset === null) {
        return null;
      }

      continue;
    }

    if (Array.isArray(state[i])) {
      let nestedOffset = null;

      for (const nestedState of state[i]) {
        nestedOffset = processState(nestedState, lexemes, offset, stack);

        if (nestedOffset !== null) {
          break;
        }
      }

      if (nestedOffset === null) {
        return null;
      }

      offset = nestedOffset;

      continue;
    }

    if (offset === lexemes.length) {
      return null;
    }

    if (state[i].code !== undefined && lexemes[offset].code === state[i].code) {
      if (lexemes[offset].composerToken) {
        stack.push(lexemes[offset].value);
      }

      offset++;

      continue;
    }

    return null;
  }

  return offset;
};

export const semanticAnalyzer = (lexemes: Array<Lexeme>): Array<ValidatorData> => {
  const stack: Array<ValidatorData> = [];

  const offset = processState(semanticRules[0], lexemes, 0, stack);

  if (offset !== lexemes.length) {
    throw 'Semantic error';
  }

  return stack;
};