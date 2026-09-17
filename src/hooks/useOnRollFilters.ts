import { useMemo, useState } from 'react';
import type { Student } from '@/store/useDataStore';
import {
  filterStudentsOnRoll,
  studentSessionKey,
  studentStructureKey,
  studentTermKey,
} from '@/utils/studentFilters';

export const ON_ROLL_ALL = 'all';

/**
 * Shared session / term / structure selection state for the finance screens.
 * Options are derived from the students themselves so no extra collections are
 * required by the ACCOUNTANT role.
 */
export function useOnRollFilters(students: Student[], termBase: string[] = []) {
  const [session, setSession] = useState(ON_ROLL_ALL);
  const [term, setTerm] = useState(ON_ROLL_ALL);
  const [structure, setStructure] = useState(ON_ROLL_ALL);

  const sessionOptions = useMemo(
    () => Array.from(new Set(students.map(studentSessionKey).filter(Boolean))).sort(),
    [students],
  );
  const structureOptions = useMemo(
    () => Array.from(new Set(students.map(studentStructureKey).filter(Boolean))).sort(),
    [students],
  );
  const termOptions = useMemo(
    () => Array.from(new Set([...termBase, ...students.map(studentTermKey).filter(Boolean)])),
    [students, termBase],
  );

  const onRollStudents = useMemo(
    () => filterStudentsOnRoll(students, { session, term, structure }),
    [students, session, term, structure],
  );

  const hasActiveFilters = session !== ON_ROLL_ALL || term !== ON_ROLL_ALL || structure !== ON_ROLL_ALL;

  const reset = () => {
    setSession(ON_ROLL_ALL);
    setTerm(ON_ROLL_ALL);
    setStructure(ON_ROLL_ALL);
  };

  return {
    session,
    setSession,
    term,
    setTerm,
    structure,
    setStructure,
    sessionOptions,
    termOptions,
    structureOptions,
    onRollStudents,
    hasActiveFilters,
    reset,
  };
}