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

export interface DerivedFee {
  structureKey: string;
  category: string;
  amount: number;
  isUniversal: boolean;
  className?: string;
  paid: number;
  remaining: number;
  status: 'Paid' | 'Pending' | 'Partial';
  requiredPercentage?: number;
  gatedAction?: GatedAction;
  isGated: boolean;
  isOptional: boolean;
  minPayable: number;
}

export const DEFAULT_REQUIRED_PERCENTAGE = 100;

/**
 * The minimum amount required to satisfy a fee's gating percentage, if any.
 * For gated fees this is `amount * requiredPercentage / 100` (e.g. Tuition's
 * 50% => half the amount). For ungated fees it equals the full amount.
 */
export function minimumPayableFor(fee: Pick<DerivedFee, 'amount' | 'requiredPercentage'>): number {
  const pct = fee.requiredPercentage ?? DEFAULT_REQUIRED_PERCENTAGE;
  return Math.round((fee.amount * pct) / 100);
}

/**
 * Derives the complete list of fees a student is expected to pay from the
 * active fee structures that apply to them. Universal fees apply to every
 * student; peculiar (class-specific) fees apply to the student's class.
 * Each item is reconciled against the student's actual fee records so paid /
 * partial / pending status and remaining balance are accurate.
 */
export function deriveStudentFees(
  feeStructures: FeeStructure[],
  feeRecords: FeeRecord[],
  studentClass: string | undefined,
): DerivedFee[] {
  const applicable = feeStructures.filter(
    (s) => s.status === 'Active' && (s.isUniversal || s.className === studentClass),
  );
  return applicable.map((s) => {
    const paidAmount = getPaidForCategory(feeRecords, s.category);
    const remaining = Math.max(0, s.amount - paidAmount);
    const requiredPercentage = s.requiredPercentage ?? (s.isGated ? DEFAULT_REQUIRED_PERCENTAGE : undefined);
    const status: DerivedFee['status'] =
      paidAmount >= s.amount ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending';
    return {
      structureKey: s.id,
      category: s.category,
      amount: s.amount,
      isUniversal: !!s.isUniversal,
      className: s.className,
      paid: paidAmount,
      remaining,
      status,
      requiredPercentage,
      gatedAction: (s.gatedAction as GatedAction) || undefined,
      isGated: !!s.isGated,
      isOptional: !!s.isOptional,
      minPayable: minimumPayableFor({ amount: s.amount, requiredPercentage }),
    };
  });
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
