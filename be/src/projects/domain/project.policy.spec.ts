import {
  canDeletePermanently,
  canEdit,
  findDimensionViolations,
  readDimensionLimits,
} from './project.policy';

describe('project policy', () => {
  const formulaSchema = {
    generator: 'generateTuckTopDieline',
    params: {
      length: { unit: 'mm', min: 40, max: 600 },
      width: { unit: 'mm', min: 30, max: 600 },
      height: { unit: 'mm', min: 20 },
      paperThickness: 'not-an-object',
    },
  };

  it('reads the dimension limits from a template formula schema', () => {
    expect(readDimensionLimits(formulaSchema)).toEqual({
      length: { min: 40, max: 600 },
      width: { min: 30, max: 600 },
      height: { min: 20, max: undefined },
    });
  });

  it('returns no limits for unknown schema shapes', () => {
    expect(readDimensionLimits(null)).toEqual({});
    expect(readDimensionLimits({ params: 42 })).toEqual({});
    expect(readDimensionLimits('tuck-top')).toEqual({});
  });

  it('lists every dimension outside the template range', () => {
    const limits = readDimensionLimits(formulaSchema);
    expect(findDimensionViolations({ length: 120, width: 80, height: 60, paperThickness: 0.4 }, limits)).toEqual([]);
    expect(findDimensionViolations({ length: 39, width: 601, height: 5000, paperThickness: 9 }, limits)).toEqual([
      'dimensions.length must not be less than 40',
      'dimensions.width must not be greater than 600',
    ]);
  });

  it('keeps trashed projects read-only and deletes them only from the trash', () => {
    expect(canEdit('ACTIVE')).toBe(true);
    expect(canEdit('ARCHIVED')).toBe(true);
    expect(canEdit('DELETED')).toBe(false);

    expect(canDeletePermanently('ACTIVE')).toBe(false);
    expect(canDeletePermanently('ARCHIVED')).toBe(false);
    expect(canDeletePermanently('DELETED')).toBe(true);
  });
});
