import type { AdmissionApplication, PortalLevel, Student } from '@/store/useDataStore';
import { getDefaultEntryLevel } from '@/utils/schoolProfile';

export interface BuildStudentPayloadOptions {
  regNo: string;
  portalLevel: PortalLevel;
  dateOfAdmission?: string;
}

export function buildStudentPayloadFromApplication(
  app: AdmissionApplication,
  options: BuildStudentPayloadOptions,
): Omit<Student, 'id'> {
  const className = (app.courseOfStudy || app.firstChoiceCourse || '').trim();
  const firstSitting = app.firstSittingSubjects || [];
  const secondSitting = app.secondSittingSubjects || [];
  const allSubjects = [...firstSitting, ...secondSitting];
  const hasAcademicHistory =
    allSubjects.length > 0 ||
    Boolean(app.firstSittingExamBody || app.firstSittingRegNumber || app.firstSittingExamYear);
  const hasSecondSitting =
    secondSitting.length > 0 ||
    Boolean(app.secondSittingExamBody || app.secondSittingRegNumber || app.secondSittingExamYear);

  return {
    name: `${app.surname} ${app.firstName}`,
    email: app.email,
    regNo: options.regNo,
    admissionNumber: '',
    class: className,
    level: getDefaultEntryLevel(options.portalLevel),
    parentName: app.sponsorFullName || app.parentName || '',
    status: 'Active',
    phone: app.phone,
    surname: app.surname,
    firstName: app.firstName,
    middleName: app.middleName,
    gender: app.gender,
    dateOfBirth: app.dateOfBirth,
    placeOfBirth: app.placeOfBirth,
    nationality: app.nationality,
    stateOfOrigin: app.stateOfOrigin,
    lga: app.lga,
    state: app.stateOfOrigin,
    townCity: app.placeOfBirth,
    maritalStatus: app.maritalStatus,
    passportUrl: app.passportUrl,
    residentialAddress: app.residentialAddress,
    sponsorName: app.sponsorFullName,
    sponsorPhone: app.sponsorPhone,
    sponsorEmail: app.parentEmail,
    sponsorOccupation: app.parentOccupation,
    guardianName: app.nextOfKinName,
    guardianPhone: app.nextOfKinPhone || app.parentPhone,
    guardianRelationship: app.nextOfKinRelationship,
    guardianAddress: app.nextOfKinAddress,
    previousSchoolName: app.previousSchool,
    classDepartment: className,
    department: app.firstChoiceCourse || app.secondChoiceCourse || className,
    programme: className,
    portalLevel: options.portalLevel,
    feeCategory: '',
    feePaymentPlan: 'Full Payment',
    dateOfAdmission: options.dateOfAdmission || new Date().toISOString().split('T')[0],
    admissionStatus: 'Admitted',
    digitalSignatureUrl: app.sponsorSignatureUrl,
    ...(hasAcademicHistory
      ? {
          oLevelExaminationBody: app.firstSittingExamBody || app.secondSittingExamBody,
          oLevelExamNumber: app.firstSittingRegNumber || app.secondSittingRegNumber,
          oLevelYear: app.firstSittingExamYear || app.secondSittingExamYear,
          oLevelSitting: hasSecondSitting ? '2' : '1',
          oLevelSubjectsGrades: allSubjects.length
            ? allSubjects.map((s) => `${s.subject}: ${s.grade}`).join(', ')
            : undefined,
        }
      : {}),
  };
}