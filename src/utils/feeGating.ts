import type { FeeRecord, FeeStructure } from '@/store/useDataStore';

export type GatedAction =
  | 'course_registration'
  | 'admission_letter'
  | 'exam_access'
  | 'result_access'
  | 'clearance';

export interface GatingStatus {
  isAllowed: boolean;
  blockers: {
    structure: FeeStructure;
    studentsPaid: number;
    required: number;
    percentagePaid: number;
  }[];
}

/**
 * Computes the total amount a student has paid toward one fee category.
 * A FeeRecord has a type (the category name) and a status. Any 'Paid'
 * record counts fully; a 'Partial' record counts its amount toward the total.
 */
export function getPaidForCategory(feeRecords: FeeRecord[], category: string): number {
  return feeRecords
    .filter((r) => r.type === category)
    .reduce((sum, r) => {
      if (r.status === 'Paid') return sum + r.amount;
      if (r.status === 'Partial') return sum + r.amount;
      return sum;
    }, 0);
}

/**
 * Returns true when a student has satisfied all gating requirements for the
 * given action. Optional fees never block. Gated fees block until the student
 * has paid at least `requiredPercentage` of the category amount.
 */
export function checkFeeGate(
  feeStructures: FeeStructure[],
  feeRecords: FeeRecord[],
  studentClass: string | undefined,
  action: GatedAction,
): GatingStatus {
  const relevant = feeStructures.filter(
    (s) =>
      s.status === 'Active' &&
      s.isGated &&
      (s.gatedAction ?? 'course_registration') === action &&
      !s.isOptional &&
      (s.isUniversal || s.className === studentClass),
  );

  const blockers: GatingStatus['blockers'] = [];

  for (const structure of relevant) {
    const requiredPercent = structure.requiredPercentage ?? 100;
    const paid = getPaidForCategory(feeRecords, structure.category);
    const requiredAmount = (structure.amount * requiredPercent) / 100;
    const percentagePaid = structure.amount > 0 ? Math.min(100, (paid / structure.amount) * 100) : 100;

    if (paid < requiredAmount) {
      blockers.push({
        structure,
        studentsPaid: paid,
        required: requiredAmount,
        percentagePaid,
      });
    }
  }

  return {
    isAllowed: blockers.length === 0,
    blockers,
  };
}

/**
 * Human readable description of a blocked action.
 */
export function gatingBlockerMessage(
  action: GatedAction,
  studentClass: string | undefined,
): string {
  const actionNames: Record<GatedAction, string> = {
    course_registration: 'course registration',
    admission_letter: 'admission letter',
    exam_access: 'examinations',
    result_access: 'results',
    clearance: 'financial clearance',
  };
  return `You must complete the required fee payments before you can access ${actionNames[action]}.`;
}
