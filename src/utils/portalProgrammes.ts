import type { PortalLevel } from '@/store/useDataStore';

export interface PortalScopedDepartment {
  id: string;
  name: string;
  code: string;
  portalLevel?: PortalLevel;
}

/**
 * Filters a list of departments/courses so only those matching the given
 * portal level are returned. Departments without a portalLevel (legacy) are
 * treated as applicable to every tertiary portal so nothing is lost.
 */
export function filterDepartmentsByPortal<T extends PortalScopedDepartment>(
  departments: T[],
  portalLevel: PortalLevel,
): T[] {
  if (portalLevel !== 'College' && portalLevel !== 'Polytechnic' && portalLevel !== 'University') {
    return departments;
  }
  return departments.filter((d) => !d.portalLevel || d.portalLevel === portalLevel);
}

export const COLLEGE_PROGRAMMES: string[] = [
  // College of Health Science & Technology
  'Health Information Management',
  'Community Health Extension Work (CHEW)',
  'Community Health (Diploma)',
  'Public Health Nursing',
  'General Nursing',
  'Basic Midwifery',
  'Post-Basic Midwifery',
  'Pharmacy Technology',
  'Medical Laboratory Science (Medical Lab Tech)',
  'Medical Imaging & Radiography Technology',
  'Dental Health Technology',
  'Environmental Health Science',
  'Nutrition & Dietetics',
  'Physiotherapy Technology',
  'Health Promotion & Education',
  'Epidemiology & Disease Control',
  'Health Services Management',
  'Health Records & Coding',
  'Biomedical Engineering Technology',
  'Occupational Therapy',
  'Ophthalmic Nursing / Eye Care',
  'Public Health Technology',
  'Laboratory Science Technology',
  'Emergency & Trauma Care',
];

export const POLYTECHNIC_PROGRAMMES: string[] = [
  // National Diploma (ND)
  'ND Computer Science',
  'ND Computer Engineering',
  'ND Electrical / Electronics Engineering',
  'ND Mechanical Engineering',
  'ND Civil Engineering',
  'ND Chemical Engineering',
  'ND Mechatronics Engineering',
  'ND Accountancy',
  'ND Business Administration & Management',
  'ND Marketing',
  'ND Banking & Finance',
  'ND Office Technology & Management',
  'ND Public Administration',
  'ND Mass Communication',
  'ND Hospitality Management',
  'ND Tourism Management',
  'ND Leisure & Tourism',
  'ND Estate Management',
  'ND Quantity Surveying',
  'ND Surveying & Geo-informatics',
  'ND Urban & Regional Planning',
  'ND Architecture',
  'ND Building Technology',
  'ND Science Laboratory Technology',
  'ND Statistics',
  'ND Mathematics & Statistics',
  'ND Computer Statistics',
  'ND Food Technology',
  'ND Agricultural Technology',
  'ND Animal Health & Production',
  'ND Crop Production',
  'ND Fisheries Technology',
  'ND Welding & Fabrication Technology',
  'ND Foundry Engineering Technology',
  'ND Printing Technology',
  'ND Fashion Design & Apparel Technology',
  'ND Textile Technology',
  // Higher National Diploma (HND)
  'HND Computer Science',
  'HND Accountancy',
  'HND Business Administration & Management',
  'HND Marketing',
  'HND Mass Communication',
  'HND Electrical / Electronics Engineering',
  'HND Mechanical Engineering',
  'HND Civil Engineering',
  'HND Science Laboratory Technology',
  'HND Public Administration',
];

export const UNIVERSITY_PROGRAMMES: string[] = [
  'B.Sc. Computer Science',
  'B.Sc. Software Engineering',
  'B.Sc. Cyber Security',
  'B.Eng. Computer Engineering',
  'B.Eng. Electrical / Electronics Engineering',
  'B.Eng. Mechanical Engineering',
  'B.Eng. Civil Engineering',
  'B.Sc. Accounting',
  'B.Sc. Business Administration',
  'B.Sc. Economics',
  'B.Sc. Mass Communication',
  'B.Sc. Political Science',
  'B.Sc. Sociology',
  'B.Sc. Law',
  'B.Sc. Medicine & Surgery',
  'B.Sc. Nursing Science',
  'B.Sc. Pharmacy',
  'B.Agric. Agricultural Science',
  'B.Sc. Architecture',
  'B.Sc. Environmental Studies',
];

export const GENERIC_TERTIARY_PROGRAMMES: string[] = [
  'Computer Science',
  'Software Engineering',
  'Cyber Security',
  'Electrical / Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Accountancy / Accounting',
  'Business Administration & Management',
  'Mass Communication',
  'Public Administration',
  'Science Laboratory Technology',
  'Statistics',
  'Hospitality Management',
  'Estate Management',
  'Marketing',
  'Banking & Finance',
];

export function getPortalProgrammes(level: PortalLevel): string[] {
  switch (level) {
    case 'College':
      return COLLEGE_PROGRAMMES;
    case 'Polytechnic':
      return POLYTECHNIC_PROGRAMMES;
    case 'University':
      return UNIVERSITY_PROGRAMMES;
    default:
      return GENERIC_TERTIARY_PROGRAMMES;
  }
}

/**
 * True only for tertiary portals that have their own department/programme lists
 * (College, Polytechnic, University).
 */
export function isProgrammePortal(level: PortalLevel): boolean {
  return level === 'College' || level === 'Polytechnic' || level === 'University';
}
