import { mergeActionNames } from 'utils/realUserMonitoringUtils';

describe('realUserMonitoringUtils', () => {
  describe('mergeActionNames', () => {
    it('merges given event parts into a single uppercase string', () => {
      expect(
        mergeActionNames(
          'TEST_EVENT',
          'WITH_OTHER_STUFF',
          'seriously',
          'OTHER_STUFF'
        )
      ).toEqual('TEST_EVENT_WITH_OTHER_STUFF_SERIOUSLY_OTHER_STUFF');
    });
  });
});
