import { getUserNameParts, parseSubjects } from '../utils';

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
});
