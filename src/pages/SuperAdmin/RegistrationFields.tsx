import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Trash2, FileText,
  ChevronDown, ChevronRight, Save, Eye, ToggleLeft, ToggleRight,
  Building2, Filter, CheckCircle2, Paperclip,
} from 'lucide-react';
import { cn } from '@/utils';
import {
  useDataStore, RegistrationFieldConfig,
  RegistrationFieldSection, RegistrationFieldType, PortalLevel,
} from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';

const SECTIONS: RegistrationFieldSection[] = [
  'Personal', 'Contact', 'Parent/Guardian', 'Medical',
  'Academic', 'Admission', 'Financial', 'Identity', 'Documents',
];

const SECTION_COLORS: Record<RegistrationFieldSection, string> = {
  Personal: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
  Contact: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400',
  'Parent/Guardian': 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400',
  Medical: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400',
  Academic: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400',
  Admission: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400',
  Financial: 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-400',
  Identity: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400',
  Documents: 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300',
};

const FIELD_TYPES: { value: RegistrationFieldType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date Picker' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'file', label: 'File Upload' },
];

function getDefaultFieldsForLevel(level: PortalLevel): RegistrationFieldConfig[] {
  const personal: RegistrationFieldConfig[] = [
    { id: 'f1', key: 'surname', label: 'Surname', section: 'Personal', type: 'text', required: true, enabled: true, order: 1 },
    { id: 'f2', key: 'firstName', label: 'First Name', section: 'Personal', type: 'text', required: true, enabled: true, order: 2 },
    { id: 'f3', key: 'middleName', label: 'Middle Name', section: 'Personal', type: 'text', required: false, enabled: true, order: 3 },
    { id: 'f4', key: 'gender', label: 'Gender', section: 'Personal', type: 'select', required: true, enabled: true, options: ['Male', 'Female'], order: 4 },
    { id: 'f5', key: 'dateOfBirth', label: 'Date of Birth', section: 'Personal', type: 'date', required: true, enabled: true, order: 5 },
    { id: 'f6', key: 'placeOfBirth', label: 'Place of Birth', section: 'Personal', type: 'text', required: false, enabled: true, order: 6 },
    { id: 'f7', key: 'nationality', label: 'Nationality', section: 'Personal', type: 'text', required: true, enabled: true, order: 7 },
    { id: 'f8', key: 'stateOfOrigin', label: 'State of Origin', section: 'Personal', type: 'text', required: true, enabled: true, order: 8 },
    { id: 'f9', key: 'lga', label: 'LGA', section: 'Personal', type: 'text', required: false, enabled: true, order: 9 },
    { id: 'f10', key: 'religion', label: 'Religion', section: 'Personal', type: 'select', required: false, enabled: true, options: ['Christianity', 'Islam', 'Other'], order: 10 },
    { id: 'f11', key: 'maritalStatus', label: 'Marital Status', section: 'Personal', type: 'select', required: false, enabled: true, options: ['Single', 'Married', 'Divorced'], order: 11 },
    { id: 'f12', key: 'passportUrl', label: 'Passport Photograph', section: 'Personal', type: 'file', required: true, enabled: true, acceptTypes: '.jpg,.jpeg,.png', order: 12 },
  ];

  const contact: RegistrationFieldConfig[] = [
    { id: 'c1', key: 'phone', label: 'Phone Number', section: 'Contact', type: 'text', required: true, enabled: true, order: 1 },
    { id: 'c2', key: 'residentialAddress', label: 'Residential Address', section: 'Contact', type: 'textarea', required: true, enabled: true, order: 2 },
    { id: 'c3', key: 'townCity', label: 'Town / City', section: 'Contact', type: 'text', required: false, enabled: true, order: 3 },
    { id: 'c4', key: 'state', label: 'State of Residence', section: 'Contact', type: 'text', required: false, enabled: true, order: 4 },
    { id: 'c5', key: 'email', label: 'Email Address', section: 'Contact', type: 'text', required: false, enabled: true, order: 5 },
  ];

  const parentGuardian: RegistrationFieldConfig[] = [
    { id: 'pg1', key: 'fatherName', label: 'Father Name', section: 'Parent/Guardian', type: 'text', required: true, enabled: true, order: 1 },
    { id: 'pg2', key: 'fatherOccupation', label: 'Father Occupation', section: 'Parent/Guardian', type: 'text', required: false, enabled: true, order: 2 },
    { id: 'pg3', key: 'fatherPhone', label: 'Father Phone', section: 'Parent/Guardian', type: 'text', required: true, enabled: true, order: 3 },
    { id: 'pg4', key: 'fatherEmail', label: 'Father Email', section: 'Parent/Guardian', type: 'text', required: false, enabled: true, order: 4 },
    { id: 'pg5', key: 'motherName', label: 'Mother Name', section: 'Parent/Guardian', type: 'text', required: true, enabled: true, order: 5 },
    { id: 'pg6', key: 'motherOccupation', label: 'Mother Occupation', section: 'Parent/Guardian', type: 'text', required: false, enabled: true, order: 6 },
    { id: 'pg7', key: 'motherPhone', label: 'Mother Phone', section: 'Parent/Guardian', type: 'text', required: true, enabled: true, order: 7 },
    { id: 'pg8', key: 'motherEmail', label: 'Mother Email', section: 'Parent/Guardian', type: 'text', required: false, enabled: true, order: 8 },
    { id: 'pg9', key: 'guardianName', label: 'Guardian Name', section: 'Parent/Guardian', type: 'text', required: false, enabled: true, order: 9 },
    { id: 'pg10', key: 'guardianRelationship', label: 'Guardian Relationship', section: 'Parent/Guardian', type: 'text', required: false, enabled: true, order: 10 },
    { id: 'pg11', key: 'guardianPhone', label: 'Guardian Phone', section: 'Parent/Guardian', type: 'text', required: false, enabled: true, order: 11 },
    { id: 'pg12', key: 'sponsorName', label: 'Sponsor Name', section: 'Parent/Guardian', type: 'text', required: false, enabled: true, order: 12 },
    { id: 'pg13', key: 'sponsorOccupation', label: 'Sponsor Occupation', section: 'Parent/Guardian', type: 'text', required: false, enabled: true, order: 13 },
    { id: 'pg14', key: 'sponsorPhone', label: 'Sponsor Phone', section: 'Parent/Guardian', type: 'text', required: false, enabled: true, order: 14 },
  ];

  const medical: RegistrationFieldConfig[] = [
    { id: 'm1', key: 'bloodGroup', label: 'Blood Group', section: 'Medical', type: 'select', required: true, enabled: true, options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], order: 1 },
    { id: 'm2', key: 'genotype', label: 'Genotype', section: 'Medical', type: 'select', required: true, enabled: true, options: ['AA', 'AS', 'SS', 'AC', 'SC'], order: 2 },
    { id: 'm3', key: 'allergies', label: 'Known Allergies', section: 'Medical', type: 'textarea', required: false, enabled: true, order: 3 },
    { id: 'm4', key: 'medicalConditions', label: 'Medical Conditions', section: 'Medical', type: 'textarea', required: false, enabled: true, order: 4 },
    { id: 'm5', key: 'disability', label: 'Disability', section: 'Medical', type: 'text', required: false, enabled: true, order: 5 },
    { id: 'm6', key: 'hospitalDoctor', label: 'Hospital / Doctor', section: 'Medical', type: 'text', required: false, enabled: true, order: 6 },
    { id: 'm7', key: 'emergencyContact', label: 'Emergency Contact', section: 'Medical', type: 'text', required: true, enabled: true, order: 7 },
    { id: 'm8', key: 'medicalReport', label: 'Medical Report (Document)', section: 'Medical', type: 'file', required: false, enabled: true, acceptTypes: '.pdf,.jpg,.jpeg,.png', order: 8 },
  ];

  const academic: RegistrationFieldConfig[] = [
    { id: 'a1', key: 'previousSchoolName', label: 'Previous School Name', section: 'Academic', type: 'text', required: true, enabled: true, order: 1 },
    { id: 'a2', key: 'previousSchoolAddress', label: 'Previous School Address', section: 'Academic', type: 'textarea', required: false, enabled: true, order: 2 },
    { id: 'a3', key: 'lastClassAttended', label: 'Last Class Attended', section: 'Academic', type: 'text', required: true, enabled: true, order: 3 },
    { id: 'a4', key: 'entranceExamScore', label: 'Entrance Exam Score', section: 'Academic', type: 'number', required: false, enabled: true, order: 4 },
    { id: 'a5', key: 'subjectsOffered', label: 'Subjects Offered', section: 'Academic', type: 'textarea', required: false, enabled: true, order: 5 },
    { id: 'a6', key: 'reasonForLeaving', label: 'Reason for Leaving', section: 'Academic', type: 'textarea', required: false, enabled: true, order: 6 },
    { id: 'a7', key: 'previousSchoolResult', label: 'Previous School Result (Document)', section: 'Academic', type: 'file', required: false, enabled: true, acceptTypes: '.pdf,.jpg,.jpeg,.png', order: 7 },
  ];

  const admission: RegistrationFieldConfig[] = [
    { id: 'ad1', key: 'classApplyingFor', label: 'Class Applying For', section: 'Admission', type: 'text', required: true, enabled: true, order: 1 },
    { id: 'ad2', key: 'academicSession', label: 'Academic Session', section: 'Admission', type: 'text', required: true, enabled: true, order: 2 },
    { id: 'ad3', key: 'termSemester', label: 'Term / Semester', section: 'Admission', type: 'select', required: true, enabled: true, options: ['First Term', 'Second Term', 'Third Term', 'First Semester', 'Second Semester'], order: 3 },
    { id: 'ad4', key: 'dateOfAdmission', label: 'Date of Admission', section: 'Admission', type: 'date', required: true, enabled: true, order: 4 },
    { id: 'ad5', key: 'house', label: 'House / Group', section: 'Admission', type: 'text', required: false, enabled: true, order: 5 },
  ];

  const financial: RegistrationFieldConfig[] = [
    { id: 'fn1', key: 'feeCategory', label: 'Fee Category', section: 'Financial', type: 'select', required: false, enabled: true, options: ['Standard', 'Scholarship', 'Staff Ward', 'Sponsored'], order: 1 },
    { id: 'fn2', key: 'scholarshipStatus', label: 'Scholarship Status', section: 'Financial', type: 'select', required: false, enabled: true, options: ['None', 'Full', 'Partial'], order: 2 },
    { id: 'fn3', key: 'feePaymentPlan', label: 'Payment Plan', section: 'Financial', type: 'select', required: false, enabled: true, options: ['Full Payment', 'Installment 1', 'Installment 2', 'Installment 3'], order: 3 },
  ];

  const identity: RegistrationFieldConfig[] = [
    { id: 'i1', key: 'nin', label: 'NIN (National ID)', section: 'Identity', type: 'text', required: false, enabled: true, order: 1 },
  ];

  const documents: RegistrationFieldConfig[] = [
    { id: 'd1', key: 'birthCertificate', label: 'Birth Certificate', section: 'Documents', type: 'file', required: true, enabled: true, acceptTypes: '.pdf,.jpg,.jpeg,.png', order: 1 },
    { id: 'd2', key: 'parentIdDocument', label: 'Parent ID Document', section: 'Documents', type: 'file', required: false, enabled: true, acceptTypes: '.pdf,.jpg,.jpeg,.png', order: 2 },
  ];

  let allFields = [...personal, ...contact, ...parentGuardian, ...medical, ...academic, ...admission, ...financial, ...identity, ...documents];

  // Secondary adds extra academic/document fields
  if (level === 'Secondary' || level === 'College' || level === 'University') {
    allFields.push(
      { id: 'sec1', key: 'commonEntranceResult', label: 'Common Entrance Result', section: 'Academic', type: 'text', required: false, enabled: true, order: 8 },
      { id: 'sec2', key: 'transferLetter', label: 'Transfer Letter', section: 'Documents', type: 'file', required: false, enabled: true, acceptTypes: '.pdf,.jpg,.jpeg,.png', order: 3 },
      { id: 'sec3', key: 'testimonial', label: 'Testimonial', section: 'Documents', type: 'file', required: false, enabled: true, acceptTypes: '.pdf,.jpg,.jpeg,.png', order: 4 },
      { id: 'sec4', key: 'preferredSport', label: 'Preferred Sport', section: 'Personal', type: 'text', required: false, enabled: true, order: 13 },
      { id: 'sec5', key: 'specialTalent', label: 'Special Talent', section: 'Personal', type: 'text', required: false, enabled: true, order: 14 },
    );
  }

  // College and University add O-Level / JAMB fields
  if (level === 'College' || level === 'University') {
    allFields.push(
      { id: 'uni1', key: 'oLevelResults', label: 'O-Level Results', section: 'Academic', type: 'text', required: true, enabled: true, order: 9 },
      { id: 'uni2', key: 'oLevelSitting', label: 'O-Level Sitting', section: 'Academic', type: 'select', required: true, enabled: true, options: ['1 Sitting', '2 Sittings'], order: 10 },
      { id: 'uni3', key: 'oLevelExaminationBody', label: 'O-Level Exam Body', section: 'Academic', type: 'select', required: false, enabled: true, options: ['WAEC', 'NECO', 'NABTEB'], order: 11 },
      { id: 'uni4', key: 'oLevelExamNumber', label: 'O-Level Exam Number', section: 'Academic', type: 'text', required: false, enabled: true, order: 12 },
      { id: 'uni5', key: 'oLevelYear', label: 'O-Level Year', section: 'Academic', type: 'text', required: false, enabled: true, order: 13 },
      { id: 'uni6', key: 'oLevelSubjectsGrades', label: 'O-Level Subjects & Grades', section: 'Academic', type: 'textarea', required: true, enabled: true, order: 14 },
      { id: 'uni7', key: 'jambRegistrationNumber', label: 'JAMB Registration Number', section: 'Academic', type: 'text', required: true, enabled: true, order: 15 },
      { id: 'uni8', key: 'jambScore', label: 'JAMB Score', section: 'Academic', type: 'number', required: false, enabled: true, order: 16 },
      { id: 'uni9', key: 'institutionChoice', label: 'Institution Choice', section: 'Admission', type: 'text', required: false, enabled: true, order: 6 },
      { id: 'uni10', key: 'faculty', label: 'Faculty', section: 'Admission', type: 'text', required: false, enabled: true, order: 7 },
      { id: 'uni11', key: 'department', label: 'Department', section: 'Admission', type: 'text', required: false, enabled: true, order: 8 },
      { id: 'uni12', key: 'programme', label: 'Programme', section: 'Admission', type: 'text', required: false, enabled: true, order: 9 },
      { id: 'uni13', key: 'degreeType', label: 'Degree Type', section: 'Admission', type: 'select', required: false, enabled: true, options: ['B.Sc.', 'B.A.', 'B.Ed.', 'LLB', 'MBBS', 'HND', 'ND', 'NCE'], order: 10 },
      { id: 'uni14', key: 'admissionLetter', label: 'Admission Letter', section: 'Documents', type: 'file', required: true, enabled: true, acceptTypes: '.pdf', order: 5 },
      { id: 'uni15', key: 'stateOfOriginCertificate', label: 'State of Origin Certificate', section: 'Documents', type: 'file', required: false, enabled: true, acceptTypes: '.pdf,.jpg,.jpeg,.png', order: 6 },
    );
  }

  // University-only fields
  if (level === 'University') {
    allFields.push(
      { id: 'uniU1', key: 'aLevelResults', label: 'A-Level Results', section: 'Academic', type: 'textarea', required: false, enabled: true, order: 17 },
      { id: 'uniU2', key: 'acceptanceLetter', label: 'Acceptance Letter', section: 'Documents', type: 'file', required: false, enabled: true, acceptTypes: '.pdf', order: 7 },
      { id: 'uniU3', key: 'guarantorForm', label: 'Guarantor Form', section: 'Documents', type: 'file', required: false, enabled: true, acceptTypes: '.pdf', order: 8 },
      { id: 'uniU4', key: 'fingerprintId', label: 'Fingerprint ID', section: 'Identity', type: 'text', required: false, enabled: true, order: 2 },
      { id: 'uniU5', key: 'facialRecognitionId', label: 'Facial Recognition ID', section: 'Identity', type: 'text', required: false, enabled: true, order: 3 },
      { id: 'uniU6', key: 'matricNumber', label: 'Matric Number', section: 'Identity', type: 'text', required: false, enabled: true, order: 4 },
      { id: 'uniU7', key: 'localGovernmentCertificate', label: 'LGA Certificate', section: 'Documents', type: 'file', required: false, enabled: true, acceptTypes: '.pdf,.jpg,.jpeg,.png', order: 9 },
      { id: 'uniU8', key: 'immunizationCard', label: 'Immunization Card', section: 'Documents', type: 'file', required: false, enabled: true, acceptTypes: '.pdf,.jpg,.jpeg,.png', order: 10 },
    );
  }

  return allFields.sort((a, b) => a.order - b.order);
}

export default function RegistrationFieldsConfig() {
  const { schools, registrationConfigs, addRegistrationConfig, updateRegistrationConfig, deleteRegistrationConfig } = useDataStore();
  const showToast = useToastStore((state) => state.showToast);

  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [fields, setFields] = useState<RegistrationFieldConfig[]>([]);
  const [expandedSections, setExpandedSections] = useState<RegistrationFieldSection[]>(SECTIONS);
  const [hasChanges, setHasChanges] = useState(false);
  const [filterSection, setFilterSection] = useState<RegistrationFieldSection | 'All'>('All');
  const [showEnabledOnly, setShowEnabledOnly] = useState(false);

  const selectedSchool = useMemo(() => schools.find((s) => s.id === selectedSchoolId), [schools, selectedSchoolId]);
  const existingConfig = useMemo(() => registrationConfigs.find((c) => c.schoolId === selectedSchoolId), [registrationConfigs, selectedSchoolId]);

  useEffect(() => {
    if (selectedSchoolId && selectedSchool) {
      if (existingConfig) {
        setFields([...existingConfig.fields]);
      } else {
        setFields(getDefaultFieldsForLevel(selectedSchool.portalLevel));
      }
      setHasChanges(false);
    } else {
      setFields([]);
    }
  }, [selectedSchoolId, existingConfig, selectedSchool]);

  const handleFieldChange = (fieldId: string, updates: Partial<RegistrationFieldConfig>) => {
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
    setHasChanges(true);
  };

  const handleAddField = (section: RegistrationFieldSection) => {
    const newField: RegistrationFieldConfig = {
      id: `custom-${Date.now()}`,
      key: '',
      label: '',
      section,
      type: 'text',
      required: false,
      enabled: true,
      order: fields.filter((f) => f.section === section).length + 1,
    };
    setFields((prev) => [...prev, newField]);
    setHasChanges(true);
    if (!expandedSections.includes(section)) {
      setExpandedSections((prev) => [...prev, section]);
    }
  };

  const handleDeleteField = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    setHasChanges(true);
  };

  const handleOptionsChange = (fieldId: string, optionsStr: string) => {
    const options = optionsStr.split(',').map((o) => o.trim()).filter(Boolean);
    handleFieldChange(fieldId, { options });
  };

  const handleSave = () => {
    if (!selectedSchool) return;

    const invalid = fields.filter((f) => f.enabled && (!f.key || !f.label));
    if (invalid.length > 0) {
      showToast({
        title: 'Missing field data',
        description: `${invalid.length} field(s) have empty labels or keys. Please fill them in.`,
        variant: 'warning',
      });
      return;
    }

    const config = {
      schoolId: selectedSchool.id,
      schoolName: selectedSchool.name,
      portalLevel: selectedSchool.portalLevel,
      fields: fields.map((f, i) => ({ ...f, order: i + 1 })),
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (existingConfig) {
      updateRegistrationConfig(existingConfig.id, config);
    } else {
      addRegistrationConfig(config);
    }

    setHasChanges(false);
    showToast({
      title: 'Registration fields saved',
      description: `${fields.filter((f) => f.enabled).length} active fields saved for ${selectedSchool.name}.`,
      variant: 'success',
    });
  };

  const handleResetToDefaults = () => {
    if (!selectedSchool) return;
    setFields(getDefaultFieldsForLevel(selectedSchool.portalLevel));
    setHasChanges(true);
    showToast({
      title: 'Defaults loaded',
      description: `Default ${selectedSchool.portalLevel} fields restored. Save to apply.`,
      variant: 'info',
    });
  };

  const toggleSection = (section: RegistrationFieldSection) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const filteredFields = useMemo(() => {
    let result = fields;
    if (filterSection !== 'All') result = result.filter((f) => f.section === filterSection);
    if (showEnabledOnly) result = result.filter((f) => f.enabled);
    return result;
  }, [fields, filterSection, showEnabledOnly]);

  const sectionCounts = useMemo(() => {
    const counts: Record<string, { total: number; enabled: number }> = {};
    SECTIONS.forEach((s) => {
      const sectionFields = fields.filter((f) => f.section === s);
      counts[s] = { total: sectionFields.length, enabled: sectionFields.filter((f) => f.enabled).length };
    });
    return counts;
  }, [fields]);

  const totalEnabled = fields.filter((f) => f.enabled).length;
  const totalRequired = fields.filter((f) => f.enabled && f.required).length;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Registration Fields</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure which fields appear on each school's student registration form.</p>
        </div>
      </div>

      {/* School Selector Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Select School</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 dark:text-white appearance-none"
              >
                <option value="">— Choose a school —</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>{school.name} ({school.portalLevel})</option>
                ))}
              </select>
            </div>
          </div>

          {selectedSchool && (
            <>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Level</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedSchool.portalLevel}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Active Fields</p>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{totalEnabled}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 border border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Required</p>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{totalRequired}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedSchool && (
        <>
          {/* Filters & Actions Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />
              {(['All', ...SECTIONS] as const).map((section) => (
                <button
                  key={section}
                  onClick={() => setFilterSection(section)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold transition-all border",
                    filterSection === section
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                  )}
                >
                  {section}
                </button>
              ))}
              <button
                onClick={() => setShowEnabledOnly(!showEnabledOnly)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all border flex items-center gap-1",
                  showEnabledOnly
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                )}
              >
                <Eye className="w-3 h-3" />
                Active Only
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleResetToDefaults}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm",
                  hasChanges
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                )}
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </button>
            </div>
          </div>

          {/* Fields by Section */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-6">
            {SECTIONS.map((section) => {
              const sectionFields = filteredFields.filter((f) => f.section === section);
              if (filteredFields.length > 0 && sectionFields.length === 0) return null;
              const isExpanded = expandedSections.includes(section);
              const counts = sectionCounts[section];

              return (
                <div key={section} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", SECTION_COLORS[section])}>
                        {section}
                      </span>
                      <span className="text-xs text-slate-400">
                        {counts.enabled} / {counts.total} fields active
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddField(section); }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title={`Add ${section} field`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </button>

                  {/* Fields List */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-800">
                      {sectionFields.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          No fields in this section. Click <Plus className="w-3 h-3 inline" /> to add one.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {sectionFields.map((field) => (
                            <div key={field.id} className={cn(
                              "px-5 py-3.5 transition-colors",
                              !field.enabled && "opacity-50"
                            )}>
                              <div className="flex items-start gap-4">
                                {/* Enable Toggle */}
                                <button
                                  onClick={() => handleFieldChange(field.id, { enabled: !field.enabled })}
                                  className="mt-1.5 flex-shrink-0"
                                  title={field.enabled ? 'Disable field' : 'Enable field'}
                                >
                                  {field.enabled ? (
                                    <ToggleRight className="w-7 h-7 text-blue-600" />
                                  ) : (
                                    <ToggleLeft className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                                  )}
                                </button>

                                {/* Field Config */}
                                <div className="flex-1 grid grid-cols-12 gap-3 items-start">
                                  {/* Label */}
                                  <div className="col-span-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Field Label</label>
                                    <input
                                      type="text"
                                      value={field.label}
                                      onChange={(e) => {
                                        const label = e.target.value;
                                        const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '').replace(/^[0-9]/, '');
                                        handleFieldChange(field.id, { label, key });
                                      }}
                                      placeholder="e.g. Passport Photo"
                                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white"
                                    />
                                  </div>

                                  {/* Key */}
                                  <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Field Key</label>
                                    <input
                                      type="text"
                                      value={field.key}
                                      onChange={(e) => handleFieldChange(field.id, { key: e.target.value })}
                                      placeholder="passportUrl"
                                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500 dark:text-white"
                                    />
                                  </div>

                                  {/* Type */}
                                  <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Field Type</label>
                                    <select
                                      value={field.type}
                                      onChange={(e) => handleFieldChange(field.id, { type: e.target.value as RegistrationFieldType })}
                                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white appearance-none"
                                    >
                                      {FIELD_TYPES.map((ft) => (
                                        <option key={ft.value} value={ft.value}>{ft.label}</option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Required */}
                                  <div className="col-span-1 flex flex-col items-center pt-5">
                                    <button
                                      onClick={() => handleFieldChange(field.id, { required: !field.required })}
                                      className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        field.required
                                          ? "bg-amber-500 border-amber-500 text-white"
                                          : "border-slate-300 dark:border-slate-600 text-transparent hover:border-amber-400"
                                      )}
                                      title={field.required ? 'Required' : 'Optional'}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                                      {field.required ? 'Required' : 'Optional'}
                                    </span>
                                  </div>

                                  {/* Options / Accept Types / Delete */}
                                  <div className="col-span-3">
                                    {field.type === 'select' && (
                                      <>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                                          Options (comma separated)
                                        </label>
                                        <input
                                          type="text"
                                          value={field.options?.join(', ') || ''}
                                          onChange={(e) => handleOptionsChange(field.id, e.target.value)}
                                          placeholder="Option 1, Option 2, Option 3"
                                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white"
                                        />
                                      </>
                                    )}
                                    {field.type === 'file' && (
                                      <>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                                          Accepted File Types
                                        </label>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="text"
                                            value={field.acceptTypes || ''}
                                            onChange={(e) => handleFieldChange(field.id, { acceptTypes: e.target.value })}
                                            placeholder=".pdf,.jpg,.png"
                                            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white"
                                          />
                                          <Paperclip className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        </div>
                                      </>
                                    )}
                                    {field.type !== 'select' && field.type !== 'file' && (
                                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                                        Preview
                                      </label>
                                    )}
                                    {field.type !== 'select' && field.type !== 'file' && (
                                      <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-400 italic">
                                        {field.type === 'text' && 'Text input field'}
                                        {field.type === 'number' && 'Number input field'}
                                        {field.type === 'date' && 'Date picker field'}
                                        {field.type === 'textarea' && 'Multi-line text area'}
                                      </div>
                                    )}
                                  </div>

                                  {/* Delete */}
                                  <div className="col-span-1 flex justify-end pt-5">
                                    <button
                                      onClick={() => handleDeleteField(field.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                      title="Delete field"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty state when no school selected */}
      {!selectedSchool && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-2xl mx-auto w-fit">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Select a School</p>
              <p className="text-sm text-slate-400 mt-1">Choose a school above to configure its student registration fields.</p>
              <p className="text-xs text-slate-400 mt-3">Each school's fields are pre-populated based on its portal level (Primary, Secondary, College, University) and can be fully customized.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
