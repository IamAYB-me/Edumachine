import type { FeeRecord, FeeStructure } from '@/store/useDataStore';

export type GatedAction =
  | 'course_registration'
  | 'admission_letter'
  | 'exam_access'
  | 'result_access'
  | 'clearance';

/**
 * Minimal subset of the Student record needed to decide whether a student is a
 * new entrant (and therefore whether "new entrants only" fees apply).
 */
export interface StudentEntrantInfo {
  dateOfAdmission?: string | null;
}

/** Month (1-12) in which the Nigerian academic session typically begins. */
const ACADEMIC_SESSION_START_MONTH = 9;

/**
 * Returns the [startYear, endYear] pair of the academic session that contains
 * `now`, with sessions assumed to begin in September.
 */
export function getCurrentAcademicSession(now: Date = new Date()): [number, number] {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const startYear = month >= ACADEMIC_SESSION_START_MONTH ? year : year - 1;
  return [startYear, startYear + 1];
}

/**
 * True when a student was admitted within the current academic session, i.e.
 * on or after the session start date. Used to decide whether "new entrants
 * only" fees (acceptance, registration, etc.) apply to the student.
 *
 * If the admission date is missing we fall back to treating the student as a
 * new entrant so the fee is never silently hidden for unknown records.
 */
export function isNewEntrantStudent(
  student?: StudentEntrantInfo | null,
  now: Date = new Date(),
): boolean {
  if (!student?.dateOfAdmission) return true;
  const admissionDate = new Date(student.dateOfAdmission);
  if (Number.isNaN(admissionDate.getTime())) return true;
  const [startYear] = getCurrentAcademicSession(now);
  const sessionStart = new Date(startYear, ACADEMIC_SESSION_START_MONTH - 1, 1);
  return admissionDate.getTime() >= sessionStart.getTime();
}

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
 * Narrows a fee-record collection down to a single payer. A record's
 * `studentId` may be a user/student id, a registration number, or an email
 * depending on how the payment was captured, so any of those identities can
 * match. This MUST be applied before passing records to the gating/derivation
 * helpers: the `feeRecords` collection is readable by every authenticated user,
 * so aggregating it unscoped would mix all payers' amounts together.
 */
export function filterFeeRecordsForStudent(
  feeRecords: FeeRecord[],
  identities: Array<string | undefined | null>,
): FeeRecord[] {
  const keys = new Set(identities.filter((key): key is string => !!key));
  if (keys.size === 0) return [];
  return feeRecords.filter((record) => keys.has(record.studentId));
}

/**
 * Returns true when a student has satisfied all gating requirements for the
 * given action. Optional fees never block. Gated fees block until the student
 * has paid at least `requiredPercentage` of the category amount. Fees flagged
 * `newEntrantsOnly` only apply to newly admitted students.
 */
export function checkFeeGate(
  feeStructures: FeeStructure[],
  feeRecords: FeeRecord[],
  studentClass: string | undefined,
  action: GatedAction,
  student?: StudentEntrantInfo | null,
): GatingStatus {
  const relevant = feeStructures.filter(
    (s) =>
      s.status === 'Active' &&
      s.isGated &&
      (s.gatedAction ?? 'course_registration') === action &&
      !s.isOptional &&
      (s.isUniversal || s.className === studentClass) &&
      (!s.newEntrantsOnly || isNewEntrantStudent(student)),
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
  newEntrantsOnly: boolean;
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
 * student; peculiar (class-specific) fees apply to the student's class. Fees
 * flagged `newEntrantsOnly` only apply to newly admitted students. Each item
 * is reconciled against the student's actual fee records so paid / partial /
 * pending status and remaining balance are accurate.
 */
export function deriveStudentFees(
  feeStructures: FeeStructure[],
  feeRecords: FeeRecord[],
  studentClass: string | undefined,
  student?: StudentEntrantInfo | null,
): DerivedFee[] {
  const applicable = feeStructures.filter(
    (s) =>
      s.status === 'Active' &&
      (s.isUniversal || s.className === studentClass) &&
      (!s.newEntrantsOnly || isNewEntrantStudent(student)),
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
      newEntrantsOnly: !!s.newEntrantsOnly,
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
