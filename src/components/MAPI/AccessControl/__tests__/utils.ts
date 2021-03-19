import { parseSubjects } from '../utils';

describe('AccessControl/utils', () => {
  describe('parseSubjects', () => {
    test.each`
      subjects                          | expected
      ${''}                             | ${[]}
      ${'subject1'}                     | ${['subject1']}
      ${'subject1 subject2'}            | ${['subject1', 'subject2']}
      ${'subject1,subject2'}            | ${['subject1', 'subject2']}
      ${'subject1, subject2'}           | ${['subject1', 'subject2']}
      ${'subject1 ,subject2'}           | ${['subject1', 'subject2']}
      ${'subject1 , subject2'}          | ${['subject1', 'subject2']}
      ${'subject1 ,subject2, subject3'} | ${['subject1', 'subject2', 'subject3']}
      ${'subject1;subject2'}            | ${['subject1', 'subject2']}
      ${'subject1; subject2'}           | ${['subject1', 'subject2']}
      ${'subject1 ;subject2'}           | ${['subject1', 'subject2']}
      ${'subject1 ; subject2'}          | ${['subject1', 'subject2']}
      ${'subject1 ;subject2; subject3'} | ${['subject1', 'subject2', 'subject3']}
      ${'subject1	subject2; subject3'}   | ${['subject1', 'subject2', 'subject3']}
      ${'subject1			subject2 subject3'}    | ${['subject1', 'subject2', 'subject3']}
      ${'subject1			subject2 subject3						'}    | ${['subject1', 'subject2', 'subject3']}
    `(`gets subjects from '$subjects'`, ({ subjects, expected }) => {
      const parsed = parseSubjects(subjects);
      expect(parsed).toStrictEqual(expected);
    });
  });
});
