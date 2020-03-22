import { composer } from './composer.js';
import { lexemeBase } from './lexemes.js';
import { lexicalAnalyzer } from './lexical-analyzer.js';
import { semanticAnalyzer } from './semantic-analyzer.js';
import { semanticRules } from './semantic-rules.js';

const test = (
  `
    [object(
      [createdAt : date : compare(>{0})]
      [updatedAt : date : compare(>=createdAt)]
      [user : object( 
        [id : number : compare(>=0)]
        [name : string : length(>10)]
      )]
      [deletedAt : date : compare(>=updatedAt)]
    )]
  `
);

const lexemes = lexicalAnalyzer(test, lexemeBase);

semanticAnalyzer(semanticRules, 0, lexemes);

// composer(lexemes);

export const template = (input) => {
  const lexemes = lexicalAnalyzer(input, lexemeBase);

  semanticAnalyzer(semanticRules, 0, lexemes);

  return composer(lexemes);
};