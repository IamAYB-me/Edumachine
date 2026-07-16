import type { AdmissionFieldKey, PortalLevel } from '@/store/useDataStore';

export type AdmissionBuilderField = {
  key: AdmissionFieldKey;
  label: string;
  description?: string;
};

export type AdmissionBuilderSection = {
  title: string;
  description?: string;
  fields: AdmissionBuilderField[];
};

const commonBuilderSections: AdmissionBuilderSection[] = [
  {
    title: 'Student Identification',
    description: 'System and record identifiers.',
    fields: [
      { key: 'studentId', label: 'Student ID (Auto-generated)' },
      { key: 'admissionNumber', label: 'Admission Number' },
      { key: 'regNo', label: 'Registration Number' },
      { key: 'qrCode', label: 'QR Code' },
      { key: 'barcode', label: 'Barcode' },
      { key: 'rfidTag', label: 'RFID Tag (Optional)' },
    ],
  },
  {
    title: 'School Information',
    description: 'Administrative and school placement fields.',
    fields: [
      { key: 'campus', label: 'Campus' },
      { key: 'branch', label: 'Branch' },
      { key: 'academicSession', label: 'Academic Session' },
      { key: 'termSemester', label: 'Term / Semester' },
      { key: 'house', label: 'House' },
      { key: 'hostel', label: 'Hostel' },
      { key: 'classDepartment', label: 'Class / Department' },
      { key: 'status', label: 'Status' },
      { key: 'dateOfAdmission', label: 'Date of Admission' },
      { key: 'admissionStatus', label: 'Admission Status' },
    ],
  },
  {
    title: 'Financial Information',
    fields: [
      { key: 'feeCategory', label: 'Fee Category' },
      { key: 'scholarshipStatus', label: 'Scholarship Status' },
      { key: 'sponsor', label: 'Sponsor' },
      { key: 'feePaymentPlan', label: 'Fee Payment Plan' },
    ],
  },
  {
    title: 'Transportation',
    fields: [
      { key: 'busRoute', label: 'Bus Route' },
      { key: 'pickupPoint', label: 'Pickup Point' },
      { key: 'driver', label: 'Driver' },
      { key: 'busNumber', label: 'Bus Number' },
    ],
  },
  {
    title: 'Library',
    fields: [
      { key: 'libraryCardNumber', label: 'Library Card Number' },
    ],
  },
  {
    title: 'Hostel',
    fields: [
      { key: 'hostelName', label: 'Hostel Name' },
      { key: 'roomNumber', label: 'Room Number' },
      { key: 'bedSpace', label: 'Bed Space' },
    ],
  },
  {
    title: 'Biometric',
    fields: [
      { key: 'fingerprintId', label: 'Fingerprint' },
      { key: 'facialRecognitionId', label: 'Facial Recognition' },
      { key: 'digitalSignatureUrl', label: 'Digital Signature' },
    ],
  },
];

const byPortalLevel: Record<PortalLevel, AdmissionBuilderSection[]> = {
  Primary: [
    {
      title: 'Personal Information',
      fields: [
        { key: 'admissionNumber', label: 'Admission Number (Auto-generated)' },
        { key: 'surname', label: 'Surname' },
        { key: 'firstName', label: 'First Name' },
        { key: 'middleName', label: 'Middle Name' },
        { key: 'gender', label: 'Gender' },
        { key: 'dateOfBirth', label: 'Date of Birth' },
        { key: 'placeOfBirth', label: 'Place of Birth' },
        { key: 'nationality', label: 'Nationality' },
        { key: 'stateOfOrigin', label: 'State of Origin' },
        { key: 'lga', label: 'Local Government Area (LGA)' },
        { key: 'tribeEthnicity', label: 'Tribe / Ethnicity' },
        { key: 'religion', label: 'Religion' },
        { key: 'passportUrl', label: 'Passport Photograph' },
      ],
    },
    {
      title: 'Contact Information',
      fields: [
        { key: 'residentialAddress', label: 'Residential Address' },
        { key: 'townCity', label: 'Town / City' },
        { key: 'state', label: 'State' },
        { key: 'postalAddress', label: 'Postal Address' },
      ],
    },
    {
      title: 'Parent / Guardian Information',
      fields: [
        { key: 'fatherName', label: 'Father Full Name' },
        { key: 'fatherOccupation', label: 'Father Occupation' },
        { key: 'fatherEmployer', label: 'Father Employer' },
        { key: 'fatherPhone', label: 'Father Phone Number' },
        { key: 'fatherEmail', label: 'Father Email Address' },
        { key: 'fatherAddress', label: 'Father Residential Address' },
        { key: 'motherName', label: 'Mother Full Name' },
        { key: 'motherOccupation', label: 'Mother Occupation' },
        { key: 'motherEmployer', label: 'Mother Employer' },
        { key: 'motherPhone', label: 'Mother Phone Number' },
        { key: 'motherEmail', label: 'Mother Email Address' },
        { key: 'guardianName', label: 'Guardian Full Name' },
        { key: 'guardianRelationship', label: 'Guardian Relationship' },
        { key: 'guardianPhone', label: 'Guardian Phone Number' },
        { key: 'guardianAddress', label: 'Guardian Address' },
      ],
    },
    {
      title: 'Medical Information',
      fields: [
        { key: 'bloodGroup', label: 'Blood Group' },
        { key: 'genotype', label: 'Genotype' },
        { key: 'allergies', label: 'Allergies' },
        { key: 'medicalConditions', label: 'Medical Conditions' },
        { key: 'disability', label: 'Disability' },
        { key: 'hospitalDoctor', label: 'Hospital / Family Doctor' },
        { key: 'emergencyContact', label: 'Emergency Contact' },
      ],
    },
    {
      title: 'Previous School',
      fields: [
        { key: 'previousSchoolName', label: 'School Name' },
        { key: 'previousSchoolAddress', label: 'Address' },
        { key: 'lastClassAttended', label: 'Last Class Attended' },
        { key: 'reasonForLeaving', label: 'Reason for Leaving' },
      ],
    },
    {
      title: 'Admission Information',
      fields: [
        { key: 'classApplyingFor', label: 'Class Applying For' },
        { key: 'academicSession', label: 'Academic Session' },
        { key: 'dateOfAdmission', label: 'Date of Admission' },
        { key: 'admissionStatus', label: 'Admission Status' },
      ],
    },
    {
      title: 'Required Documents',
      fields: [
        { key: 'birthCertificate', label: 'Birth Certificate' },
        { key: 'passportDocument', label: 'Passport Photograph' },
        { key: 'immunizationCard', label: 'Immunization Card' },
        { key: 'previousSchoolResult', label: 'Previous School Result' },
        { key: 'parentIdDocument', label: 'Parent ID' },
      ],
    },
    ...commonBuilderSections,
  ],
  Secondary: [
    {
      title: 'Personal Information',
      fields: [
        { key: 'admissionNumber', label: 'Admission Number (Auto-generated)' },
        { key: 'surname', label: 'Surname' },
        { key: 'firstName', label: 'First Name' },
        { key: 'middleName', label: 'Middle Name' },
        { key: 'gender', label: 'Gender' },
        { key: 'dateOfBirth', label: 'Date of Birth' },
        { key: 'placeOfBirth', label: 'Place of Birth' },
        { key: 'nationality', label: 'Nationality' },
        { key: 'stateOfOrigin', label: 'State of Origin' },
        { key: 'lga', label: 'Local Government Area (LGA)' },
        { key: 'tribeEthnicity', label: 'Tribe / Ethnicity' },
        { key: 'religion', label: 'Religion' },
        { key: 'passportUrl', label: 'Passport Photograph' },
      ],
    },
    {
      title: 'Contact Information',
      fields: [
        { key: 'residentialAddress', label: 'Residential Address' },
        { key: 'townCity', label: 'Town / City' },
        { key: 'state', label: 'State' },
        { key: 'postalAddress', label: 'Postal Address' },
      ],
    },
    {
      title: 'Parent / Guardian Information',
      fields: [
        { key: 'fatherName', label: 'Father Full Name' },
        { key: 'fatherOccupation', label: 'Father Occupation' },
        { key: 'fatherEmployer', label: 'Father Employer' },
        { key: 'fatherPhone', label: 'Father Phone Number' },
        { key: 'fatherEmail', label: 'Father Email Address' },
        { key: 'fatherAddress', label: 'Father Residential Address' },
        { key: 'motherName', label: 'Mother Full Name' },
        { key: 'motherOccupation', label: 'Mother Occupation' },
        { key: 'motherEmployer', label: 'Mother Employer' },
        { key: 'motherPhone', label: 'Mother Phone Number' },
        { key: 'motherEmail', label: 'Mother Email Address' },
        { key: 'guardianName', label: 'Guardian Full Name' },
        { key: 'guardianRelationship', label: 'Guardian Relationship' },
        { key: 'guardianPhone', label: 'Guardian Phone Number' },
        { key: 'guardianAddress', label: 'Guardian Address' },
      ],
    },
    {
      title: 'Medical Information',
      fields: [
        { key: 'bloodGroup', label: 'Blood Group' },
        { key: 'genotype', label: 'Genotype' },
        { key: 'allergies', label: 'Allergies' },
        { key: 'medicalConditions', label: 'Medical Conditions' },
        { key: 'disability', label: 'Disability' },
        { key: 'hospitalDoctor', label: 'Hospital / Family Doctor' },
        { key: 'emergencyContact', label: 'Emergency Contact' },
      ],
    },
    {
      title: 'Academic Information',
      fields: [
        { key: 'entranceExamScore', label: 'Entrance Exam Score' },
        { key: 'commonEntranceResult', label: 'Common Entrance Result' },
        { key: 'previousSchoolResult', label: 'Previous School Result' },
        { key: 'lastClassAttended', label: 'Last Class Attended' },
        { key: 'subjectsOffered', label: 'Subjects Offered' },
      ],
    },
    {
      title: 'Student Information',
      fields: [
        { key: 'preferredSport', label: 'Preferred Sport' },
        { key: 'clubSociety', label: 'Club / Society' },
        { key: 'specialTalent', label: 'Special Talent' },
      ],
    },
    {
      title: 'Boarding Information',
      fields: [
        { key: 'accommodationType', label: 'Day / Boarding Student' },
        { key: 'hostelPreference', label: 'Hostel Preference' },
      ],
    },
    {
      title: 'Documents',
      fields: [
        { key: 'transferLetter', label: 'Transfer Letter' },
        { key: 'testimonial', label: 'Testimonial' },
        { key: 'birthCertificate', label: 'Birth Certificate' },
        { key: 'passportDocument', label: 'Passport' },
        { key: 'stateOfOriginCertificate', label: 'State of Origin Certificate' },
      ],
    },
    ...commonBuilderSections,
  ],
  College: [
    {
      title: 'Personal Information',
      fields: [
        { key: 'jambRegistrationNumber', label: 'JAMB Registration Number' },
        { key: 'jambScore', label: 'JAMB Score' },
        { key: 'surname', label: 'Surname' },
        { key: 'firstName', label: 'First Name' },
        { key: 'middleName', label: 'Middle Name' },
        { key: 'gender', label: 'Gender' },
        { key: 'dateOfBirth', label: 'Date of Birth' },
        { key: 'maritalStatus', label: 'Marital Status' },
        { key: 'nationality', label: 'Nationality' },
        { key: 'state', label: 'State' },
        { key: 'lga', label: 'Local Government Area (LGA)' },
        { key: 'passportUrl', label: 'Passport' },
      ],
    },
    {
      title: 'Academic Information',
      fields: [
        { key: 'oLevelResults', label: "O'Level Results" },
        { key: 'oLevelSitting', label: 'Sitting (1 or 2)' },
        { key: 'oLevelSubjectsGrades', label: 'Subjects & Grades' },
        { key: 'institutionChoice', label: 'Institution Choice' },
        { key: 'department', label: 'Department' },
        { key: 'programme', label: 'Programme' },
        { key: 'level', label: 'Level' },
        { key: 'entryMode', label: 'Entry Mode' },
        { key: 'screeningScore', label: 'Screening Score' },
      ],
    },
    {
      title: 'Contact Information',
      fields: [
        { key: 'phone', label: 'Phone Number' },
        { key: 'email', label: 'Email' },
        { key: 'residentialAddress', label: 'Home Address' },
      ],
    },
    {
      title: 'Parent Information',
      fields: [
        { key: 'parentName', label: 'Parent Name' },
        { key: 'sponsorOccupation', label: 'Occupation' },
        { key: 'guardianPhone', label: 'Phone Number' },
        { key: 'guardianAddress', label: 'Address' },
      ],
    },
    {
      title: 'Medical Information',
      fields: [
        { key: 'bloodGroup', label: 'Blood Group' },
        { key: 'genotype', label: 'Genotype' },
        { key: 'disability', label: 'Disability' },
        { key: 'medicalConditions', label: 'Medical Conditions' },
      ],
    },
    {
      title: 'Documents',
      fields: [
        { key: 'oLevelResults', label: 'WAEC / NECO Result' },
        { key: 'jambAdmissionLetter', label: 'JAMB Result' },
        { key: 'birthCertificate', label: 'Birth Certificate' },
        { key: 'localGovernmentCertificate', label: 'Local Government Certificate' },
        { key: 'passportDocument', label: 'Passport' },
        { key: 'acceptanceLetter', label: 'Acceptance Letter' },
        { key: 'admissionLetter', label: 'Admission Letter' },
      ],
    },
    ...commonBuilderSections,
  ],
  University: [
    {
      title: 'Personal Information',
      fields: [
        { key: 'matricNumber', label: 'Matric Number' },
        { key: 'jambRegistrationNumber', label: 'JAMB Registration Number' },
        { key: 'jambScore', label: 'JAMB Score' },
        { key: 'admissionNumber', label: 'Admission Number' },
        { key: 'surname', label: 'Surname' },
        { key: 'firstName', label: 'First Name' },
        { key: 'middleName', label: 'Middle Name' },
        { key: 'gender', label: 'Gender' },
        { key: 'dateOfBirth', label: 'Date of Birth' },
        { key: 'maritalStatus', label: 'Marital Status' },
        { key: 'nationality', label: 'Nationality' },
        { key: 'state', label: 'State' },
        { key: 'lga', label: 'Local Government Area (LGA)' },
        { key: 'passportUrl', label: 'Passport' },
      ],
    },
    {
      title: 'Academic Information',
      fields: [
        { key: 'faculty', label: 'Faculty' },
        { key: 'department', label: 'Department' },
        { key: 'programme', label: 'Programme' },
        { key: 'degreeType', label: 'Degree Type' },
        { key: 'entryMode', label: 'Entry Mode' },
        { key: 'admissionType', label: 'Admission Type' },
        { key: 'session', label: 'Session' },
        { key: 'semester', label: 'Semester' },
        { key: 'level', label: 'Level' },
      ],
    },
    {
      title: "O'Level",
      fields: [
        { key: 'oLevelExaminationBody', label: 'Examination Body' },
        { key: 'oLevelExamNumber', label: 'Examination Number' },
        { key: 'oLevelYear', label: 'Year' },
        { key: 'oLevelResults', label: 'Subjects' },
        { key: 'oLevelSubjectsGrades', label: 'Grades' },
      ],
    },
    {
      title: "A'Level (Direct Entry)",
      fields: [
        { key: 'aLevelQualifications', label: 'IJMB / JUPEB / ND / HND / NCE / Degree' },
        { key: 'aLevelResults', label: "A'Level Results" },
        { key: 'cgpa', label: 'CGPA' },
      ],
    },
    {
      title: 'Contact Information',
      fields: [
        { key: 'phone', label: 'Phone Number' },
        { key: 'email', label: 'Email' },
        { key: 'residentialAddress', label: 'Residential Address' },
      ],
    },
    {
      title: 'Parent / Guardian',
      fields: [
        { key: 'fatherName', label: 'Father' },
        { key: 'motherName', label: 'Mother' },
        { key: 'sponsorName', label: 'Sponsor' },
        { key: 'sponsorOccupation', label: 'Occupation' },
        { key: 'sponsorEmployer', label: 'Employer' },
        { key: 'sponsorPhone', label: 'Phone' },
        { key: 'sponsorEmail', label: 'Email' },
      ],
    },
    {
      title: 'Medical Information',
      fields: [
        { key: 'bloodGroup', label: 'Blood Group' },
        { key: 'genotype', label: 'Genotype' },
        { key: 'disability', label: 'Disability' },
        { key: 'medicalHistory', label: 'Medical History' },
      ],
    },
    {
      title: 'Bank Information',
      fields: [
        { key: 'bankName', label: 'Bank Name' },
        { key: 'accountNumber', label: 'Account Number (Optional)' },
        { key: 'sponsor', label: 'Sponsor Information' },
      ],
    },
    {
      title: 'Documents',
      fields: [
        { key: 'jambAdmissionLetter', label: 'JAMB Admission Letter' },
        { key: 'admissionLetter', label: 'Admission Letter' },
        { key: 'birthCertificate', label: 'Birth Certificate' },
        { key: 'oLevelResults', label: "O'Level Results" },
        { key: 'aLevelResults', label: "A'Level Results" },
        { key: 'localGovernmentCertificate', label: 'Local Government Certificate' },
        { key: 'passportDocument', label: 'Passport' },
        { key: 'medicalReport', label: 'Medical Report' },
        { key: 'acceptanceLetter', label: 'Acceptance Letter' },
        { key: 'guarantorForm', label: 'Guarantor Form' },
      ],
    },
    ...commonBuilderSections,
  ],
};

export function getAdmissionBuilderSections(level: PortalLevel): AdmissionBuilderSection[] {
  return byPortalLevel[level] ?? byPortalLevel.Secondary;
}
