import { security } from '../security/index.js';

describe('Security', () => {
  describe('escapeHtml', () => {
    it('should escape HTML characters', () => {
      expect(security.escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should handle empty string', () => {
      expect(security.escapeHtml('')).toBe('');
    });
  });

  describe('escapeJs', () => {
    it('should escape JavaScript characters', () => {
      const result = security.escapeJs("alert('test')");
      expect(result).toContain("\\'");
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(security.sanitizeInput('<script>test</script>')).toBe('scripttestscript');
    });
  });

  describe('sanitizeSqlIdentifier', () => {
    it('should allow only alphanumeric and underscore', () => {
      expect(security.sanitizeSqlIdentifier('users_table')).toBe('users_table');
      expect(security.sanitizeSqlIdentifier('users-table')).toBe('userstable');
      expect(security.sanitizeSqlIdentifier('users; DROP TABLE')).toBe('usersDROPTABLE');
    });
  });

  describe('isValidSqlIdentifier', () => {
    it('should validate SQL identifiers', () => {
      expect(security.isValidSqlIdentifier('users')).toBe(true);
      expect(security.isValidSqlIdentifier('users_table')).toBe(true);
      expect(security.isValidSqlIdentifier('users-table')).toBe(false);
      expect(security.isValidSqlIdentifier('123users')).toBe(false);
      expect(security.isValidSqlIdentifier('_users')).toBe(true);
    });
  });
});

