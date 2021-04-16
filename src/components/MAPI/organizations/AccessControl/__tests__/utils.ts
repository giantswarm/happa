import {
  appendSubjectSuggestionToValue,
  filterSubjectSuggestions,
  getUserNameParts,
  parseSubjects,
} from '../utils';

describe('AccessControl/utils', () => {
  describe('parseSubjects', () => {
    test.each`
      subjects                                            | expected
      ${''}                                               | ${[]}
      ${'subject1'}                                       | ${['subject1']}
      ${'subject1 subject2'}                              | ${['subject1', 'subject2']}
      ${'subject1,subject2'}                              | ${['subject1', 'subject2']}
      ${'subject1, subject2'}                             | ${['subject1', 'subject2']}
      ${'subject1 ,subject2'}                             | ${['subject1', 'subject2']}
      ${'subject1 , subject2'}                            | ${['subject1', 'subject2']}
      ${'subject1 ,subject2, subject3'}                   | ${['subject1', 'subject2', 'subject3']}
      ${'subject1;subject2'}                              | ${['subject1', 'subject2']}
      ${'subject1; subject2'}                             | ${['subject1', 'subject2']}
      ${'subject1 ;subject2'}                             | ${['subject1', 'subject2']}
      ${'subject1 ; subject2'}                            | ${['subject1', 'subject2']}
      ${'subject1 ;subject2; subject3'}                   | ${['subject1', 'subject2', 'subject3']}
      ${'subject1	subject2; subject3'}                     | ${['subject1', 'subject2', 'subject3']}
      ${'subject1			subject2 subject3'}                      | ${['subject1', 'subject2', 'subject3']}
      ${'subject1			subject2 subject3						'}                      | ${['subject1', 'subject2', 'subject3']}
      ${'some-account, test1, test, test2, default, '}    | ${['some-account', 'test1', 'test', 'test2', 'default']}
      ${'some-account, test1, test, test2, default,;,; '} | ${['some-account', 'test1', 'test', 'test2', 'default']}
    `(`gets subjects from '$subjects'`, ({ subjects, expected }) => {
      const parsed = parseSubjects(subjects);
      expect(parsed).toStrictEqual(expected);
    });
  });

  describe('getUserNameParts', () => {
    test.each`
      userName                             | expected
      ${''}                                | ${['']}
      ${'test'}                            | ${['test']}
      ${'test@test.com'}                   | ${['test', 'test.com']}
      ${'test@other-test@some-other-test'} | ${['test', 'other-test']}
    `(`gets userName parts from '$userName'`, ({ userName, expected }) => {
      const parts = getUserNameParts(userName);
      expect(parts).toStrictEqual(expected);
    });
  });

  describe('filterSubjectSuggestions', () => {
    test.each`
      input      | suggestions                                           | limit | expected
      ${''}      | ${[]}                                                 | ${3}  | ${[]}
      ${'test'}  | ${[]}                                                 | ${3}  | ${[]}
      ${''}      | ${['test1', 'test2']}                                 | ${3}  | ${['test1', 'test2']}
      ${'test'}  | ${['test1', 'test2']}                                 | ${3}  | ${['test1', 'test2']}
      ${'test1'} | ${['test1', 'test2']}                                 | ${3}  | ${[]}
      ${'test1'} | ${['test1', 'test2']}                                 | ${3}  | ${[]}
      ${'test'}  | ${['test1', 'test2', 'some-other']}                   | ${3}  | ${['test1', 'test2']}
      ${'test'}  | ${['test1', 'test2', 'some-other', 'test3', 'test4']} | ${3}  | ${['test1', 'test2', 'test3']}
    `(
      `filters suggestions with the '$input' input`,
      ({ input, suggestions, limit, expected }) => {
        const result = filterSubjectSuggestions(input, suggestions, limit);
        expect(result).toStrictEqual(expected);
      }
    );
  });

  describe('appendSubjectSuggestionToValue', () => {
    test.each`
      value                      | suggestion | expected
      ${''}                      | ${''}      | ${''}
      ${'tes'}                   | ${'test1'} | ${'test1, '}
      ${'tes '}                  | ${'test1'} | ${'tes test1, '}
      ${'tes,    '}              | ${'test1'} | ${'tes,    test1, '}
      ${'test1, test2, test3, '} | ${'test4'} | ${'test1, test2, test3, test4, '}
    `(
      `appends the '$suggestion' suggestion to '$value'`,
      ({ value, suggestion, expected }) => {
        const result = appendSubjectSuggestionToValue(value, suggestion);
        expect(result).toEqual(expected);
      }
    );
  });
});
