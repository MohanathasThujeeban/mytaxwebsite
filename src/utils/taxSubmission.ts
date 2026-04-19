export type UploadMode = 'missing' | 'uploaded' | 'later';
export type DocumentVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface UploadDocRef {
  mode: UploadMode;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileDataUrl?: string;
  verificationStatus?: DocumentVerificationStatus;
  verifiedAt?: string;
  updatedAt: string;
}

export interface IncomeTypeSelection {
  employment: boolean;
  business: boolean;
  investment: boolean;
  solar: boolean;
  nilReturn: boolean;
}

export interface M1TaxFormData {
  nic: string;
  tin: string;
  fullName: string;
  contactNo: string;
  mailAddress: string;
  district: string;
  dsDivision: string;
  gsDivision: string;
  postalNo: string;
  addressLine1: string;
  addressLine2: string;

  residenceType: '' | 'own' | 'rental';
  propertyLocation: string;
  purchaseYear: string;
  approxValue: string;
  deedNo: string;
  monthlyRent: string;
  advancePaid: string;

  incomeTypes: IncomeTypeSelection;

  businessBankUse: '' | 'yes' | 'no';
  businessBankDetails: string;

  nicDocs: {
    nicFront: UploadDocRef;
    nicBack: UploadDocRef;
  };

  employmentDocs: {
    t10Certificate: UploadDocRef;
    salarySheetSummary: UploadDocRef;
    bankStatements: UploadDocRef;
    loanOutstandingLetter: UploadDocRef;
  };

  businessType: '' | 'sole_proprietor' | 'partnership';
  businessDocs: {
    brDocument: UploadDocRef;
    tradeLicense: UploadDocRef;
    bankStatements: UploadDocRef;
    loanOutstandingLetter: UploadDocRef;
    cAndRForms: UploadDocRef;
    utilityBills: UploadDocRef;
  };

  investment: {
    bankInterest: boolean;
    bankInterestWhtCertificate: UploadDocRef;
    fixedDeposit: boolean;
    fixedDepositWhtCertificate: UploadDocRef;
    rentalIncome: boolean;
    rentalIncomeAgreementAndDeed: UploadDocRef;
    shareInvestment: boolean;
  };

  solar: {
    investmentAmount: string;
    annualIncome: string;
    whtDeducted: '' | 'yes' | 'no';
  };

  assets: {
    declareAssets: '' | 'yes' | 'no';
    landBuilding: boolean;
    landDeedNo: string;
    landCostValue: string;
    landPurchaseYear: string;
    landLocation: string;
    landDeedUpload: UploadDocRef;

    vehicles: boolean;
    vehicleModel: string;
    vehicleValue: string;
    vehiclePurchaseYear: string;
    vehicleRegistrationNo: string;
    vehicleCrUpload: UploadDocRef;

    cashInHand: string;
    goldJewelryValue: string;
    loanReceivables: string;
  };

  liabilities: {
    hasLoans: '' | 'yes' | 'no';
    loanOutstandingLetter: UploadDocRef;
  };

  declarationConfirmed: boolean;
}

export interface SubmissionUserProfile {
  nic: string;
  tin?: string;
  fullName?: string;
  contactNo?: string;
  mailAddress?: string;
  district?: string;
  dsDivision?: string;
  gsDivision?: string;
  postalNo?: string;
  addressLine1?: string;
  addressLine2?: string;
}

export interface M1SubmissionRecord {
  id: string;
  taxYear: number;
  status: 'draft' | 'submitted';
  progress: number;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  userProfile: SubmissionUserProfile;
  form: M1TaxFormData;
}

const STORAGE_KEY = 'mytax_m1_submissions_v1';

const nowIso = (): string => new Date().toISOString();

const createUploadDoc = (): UploadDocRef => ({
  mode: 'missing',
  verificationStatus: 'pending',
  updatedAt: nowIso(),
});

const sanitizeUploadDoc = (raw: unknown): UploadDocRef => {
  if (!raw || typeof raw !== 'object') {
    return createUploadDoc();
  }

  const item = raw as Partial<UploadDocRef>;
  const mode: UploadMode = item.mode === 'uploaded' || item.mode === 'later' ? item.mode : 'missing';
  const verificationStatus: DocumentVerificationStatus =
    item.verificationStatus === 'verified' || item.verificationStatus === 'rejected'
      ? item.verificationStatus
      : 'pending';

  return {
    mode,
    fileName: typeof item.fileName === 'string' ? item.fileName : undefined,
    fileSize: typeof item.fileSize === 'number' ? item.fileSize : undefined,
    fileType: mode === 'uploaded' && typeof item.fileType === 'string' ? item.fileType : undefined,
    fileDataUrl: mode === 'uploaded' && typeof item.fileDataUrl === 'string' ? item.fileDataUrl : undefined,
    verificationStatus: mode === 'uploaded' ? verificationStatus : 'pending',
    verifiedAt: mode === 'uploaded' && typeof item.verifiedAt === 'string' ? item.verifiedAt : undefined,
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : nowIso(),
  };
};

const sanitizeString = (value: unknown): string => (typeof value === 'string' ? value : '');

const sanitizeBool = (value: unknown): boolean => value === true;

export const createDefaultM1Form = (profile?: SubmissionUserProfile): M1TaxFormData => ({
  nic: profile?.nic || '',
  tin: profile?.tin || '',
  fullName: profile?.fullName || '',
  contactNo: profile?.contactNo || '',
  mailAddress: profile?.mailAddress || '',
  district: profile?.district || '',
  dsDivision: profile?.dsDivision || '',
  gsDivision: profile?.gsDivision || '',
  postalNo: profile?.postalNo || '',
  addressLine1: profile?.addressLine1 || '',
  addressLine2: profile?.addressLine2 || '',

  residenceType: '',
  propertyLocation: '',
  purchaseYear: '',
  approxValue: '',
  deedNo: '',
  monthlyRent: '',
  advancePaid: '',

  incomeTypes: {
    employment: false,
    business: false,
    investment: false,
    solar: false,
    nilReturn: false,
  },

  businessBankUse: '',
  businessBankDetails: '',

  nicDocs: {
    nicFront: createUploadDoc(),
    nicBack: createUploadDoc(),
  },

  employmentDocs: {
    t10Certificate: createUploadDoc(),
    salarySheetSummary: createUploadDoc(),
    bankStatements: createUploadDoc(),
    loanOutstandingLetter: createUploadDoc(),
  },

  businessType: '',
  businessDocs: {
    brDocument: createUploadDoc(),
    tradeLicense: createUploadDoc(),
    bankStatements: createUploadDoc(),
    loanOutstandingLetter: createUploadDoc(),
    cAndRForms: createUploadDoc(),
    utilityBills: createUploadDoc(),
  },

  investment: {
    bankInterest: false,
    bankInterestWhtCertificate: createUploadDoc(),
    fixedDeposit: false,
    fixedDepositWhtCertificate: createUploadDoc(),
    rentalIncome: false,
    rentalIncomeAgreementAndDeed: createUploadDoc(),
    shareInvestment: false,
  },

  solar: {
    investmentAmount: '',
    annualIncome: '',
    whtDeducted: '',
  },

  assets: {
    declareAssets: '',
    landBuilding: false,
    landDeedNo: '',
    landCostValue: '',
    landPurchaseYear: '',
    landLocation: '',
    landDeedUpload: createUploadDoc(),

    vehicles: false,
    vehicleModel: '',
    vehicleValue: '',
    vehiclePurchaseYear: '',
    vehicleRegistrationNo: '',
    vehicleCrUpload: createUploadDoc(),

    cashInHand: '',
    goldJewelryValue: '',
    loanReceivables: '',
  },

  liabilities: {
    hasLoans: '',
    loanOutstandingLetter: createUploadDoc(),
  },

  declarationConfirmed: false,
});

export const restoreM1Form = (raw: unknown, profile?: SubmissionUserProfile): M1TaxFormData => {
  const fallback = createDefaultM1Form(profile);
  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const data = raw as Partial<M1TaxFormData>;

  return {
    ...fallback,
    nic: sanitizeString(data.nic) || fallback.nic,
    tin: sanitizeString(data.tin) || fallback.tin,
    fullName: sanitizeString(data.fullName) || fallback.fullName,
    contactNo: sanitizeString(data.contactNo) || fallback.contactNo,
    mailAddress: sanitizeString(data.mailAddress) || fallback.mailAddress,
    district: sanitizeString(data.district) || fallback.district,
    dsDivision: sanitizeString(data.dsDivision) || fallback.dsDivision,
    gsDivision: sanitizeString(data.gsDivision) || fallback.gsDivision,
    postalNo: sanitizeString(data.postalNo) || fallback.postalNo,
    addressLine1: sanitizeString(data.addressLine1) || fallback.addressLine1,
    addressLine2: sanitizeString(data.addressLine2) || fallback.addressLine2,

    residenceType: data.residenceType === 'own' || data.residenceType === 'rental' ? data.residenceType : '',
    propertyLocation: sanitizeString(data.propertyLocation),
    purchaseYear: sanitizeString(data.purchaseYear),
    approxValue: sanitizeString(data.approxValue),
    deedNo: sanitizeString(data.deedNo),
    monthlyRent: sanitizeString(data.monthlyRent),
    advancePaid: sanitizeString(data.advancePaid),

    incomeTypes: {
      employment: sanitizeBool(data.incomeTypes?.employment),
      business: sanitizeBool(data.incomeTypes?.business),
      investment: sanitizeBool(data.incomeTypes?.investment),
      solar: sanitizeBool(data.incomeTypes?.solar),
      nilReturn: sanitizeBool(data.incomeTypes?.nilReturn),
    },

    businessBankUse: data.businessBankUse === 'yes' || data.businessBankUse === 'no' ? data.businessBankUse : '',
    businessBankDetails: sanitizeString(data.businessBankDetails),

    nicDocs: {
      nicFront: sanitizeUploadDoc(data.nicDocs?.nicFront),
      nicBack: sanitizeUploadDoc(data.nicDocs?.nicBack),
    },

    employmentDocs: {
      t10Certificate: sanitizeUploadDoc(data.employmentDocs?.t10Certificate),
      salarySheetSummary: sanitizeUploadDoc(data.employmentDocs?.salarySheetSummary),
      bankStatements: sanitizeUploadDoc(data.employmentDocs?.bankStatements),
      loanOutstandingLetter: sanitizeUploadDoc(data.employmentDocs?.loanOutstandingLetter),
    },

    businessType: data.businessType === 'sole_proprietor' || data.businessType === 'partnership' ? data.businessType : '',
    businessDocs: {
      brDocument: sanitizeUploadDoc(data.businessDocs?.brDocument),
      tradeLicense: sanitizeUploadDoc(data.businessDocs?.tradeLicense),
      bankStatements: sanitizeUploadDoc(data.businessDocs?.bankStatements),
      loanOutstandingLetter: sanitizeUploadDoc(data.businessDocs?.loanOutstandingLetter),
      cAndRForms: sanitizeUploadDoc(data.businessDocs?.cAndRForms),
      utilityBills: sanitizeUploadDoc(data.businessDocs?.utilityBills),
    },

    investment: {
      bankInterest: sanitizeBool(data.investment?.bankInterest),
      bankInterestWhtCertificate: sanitizeUploadDoc(data.investment?.bankInterestWhtCertificate),
      fixedDeposit: sanitizeBool(data.investment?.fixedDeposit),
      fixedDepositWhtCertificate: sanitizeUploadDoc(data.investment?.fixedDepositWhtCertificate),
      rentalIncome: sanitizeBool(data.investment?.rentalIncome),
      rentalIncomeAgreementAndDeed: sanitizeUploadDoc(data.investment?.rentalIncomeAgreementAndDeed),
      shareInvestment: sanitizeBool(data.investment?.shareInvestment),
    },

    solar: {
      investmentAmount: sanitizeString(data.solar?.investmentAmount),
      annualIncome: sanitizeString(data.solar?.annualIncome),
      whtDeducted: data.solar?.whtDeducted === 'yes' || data.solar?.whtDeducted === 'no' ? data.solar.whtDeducted : '',
    },

    assets: {
      declareAssets: data.assets?.declareAssets === 'yes' || data.assets?.declareAssets === 'no' ? data.assets.declareAssets : '',
      landBuilding: sanitizeBool(data.assets?.landBuilding),
      landDeedNo: sanitizeString(data.assets?.landDeedNo),
      landCostValue: sanitizeString(data.assets?.landCostValue),
      landPurchaseYear: sanitizeString(data.assets?.landPurchaseYear),
      landLocation: sanitizeString(data.assets?.landLocation),
      landDeedUpload: sanitizeUploadDoc(data.assets?.landDeedUpload),

      vehicles: sanitizeBool(data.assets?.vehicles),
      vehicleModel: sanitizeString(data.assets?.vehicleModel),
      vehicleValue: sanitizeString(data.assets?.vehicleValue),
      vehiclePurchaseYear: sanitizeString(data.assets?.vehiclePurchaseYear),
      vehicleRegistrationNo: sanitizeString(data.assets?.vehicleRegistrationNo),
      vehicleCrUpload: sanitizeUploadDoc(data.assets?.vehicleCrUpload),

      cashInHand: sanitizeString(data.assets?.cashInHand),
      goldJewelryValue: sanitizeString(data.assets?.goldJewelryValue),
      loanReceivables: sanitizeString(data.assets?.loanReceivables),
    },

    liabilities: {
      hasLoans: data.liabilities?.hasLoans === 'yes' || data.liabilities?.hasLoans === 'no' ? data.liabilities.hasLoans : '',
      loanOutstandingLetter: sanitizeUploadDoc(data.liabilities?.loanOutstandingLetter),
    },

    declarationConfirmed: sanitizeBool(data.declarationConfirmed),
  };
};

const isUploadComplete = (doc: UploadDocRef): boolean => doc.mode === 'uploaded' || doc.mode === 'later';

const validateIncomeSelection = (form: M1TaxFormData): boolean =>
  Object.values(form.incomeTypes).some(Boolean);

const validateBasicInfo = (form: M1TaxFormData): boolean => {
  const baseIdentity = Boolean(form.nic.trim() && form.fullName.trim() && form.contactNo.trim());
  const nicDocsComplete = form.nicDocs.nicFront.mode === 'uploaded' && form.nicDocs.nicBack.mode === 'uploaded';
  const housing =
    form.residenceType === 'own'
      ? Boolean(form.propertyLocation.trim() && form.purchaseYear.trim() && form.approxValue.trim() && form.deedNo.trim())
      : form.residenceType === 'rental'
        ? Boolean(form.monthlyRent.trim() && form.advancePaid.trim())
        : false;

  const businessBank =
    form.businessBankUse === 'yes'
      ? Boolean(form.businessBankDetails.trim())
      : form.businessBankUse === 'no';

  return baseIdentity && nicDocsComplete && housing && businessBank;
};

const validateEmployment = (form: M1TaxFormData): boolean => {
  if (!form.incomeTypes.employment) return true;
  return (
    isUploadComplete(form.employmentDocs.t10Certificate) &&
    isUploadComplete(form.employmentDocs.salarySheetSummary) &&
    isUploadComplete(form.employmentDocs.bankStatements) &&
    isUploadComplete(form.employmentDocs.loanOutstandingLetter)
  );
};

const validateBusiness = (form: M1TaxFormData): boolean => {
  if (!form.incomeTypes.business) return true;
  const hasType = form.businessType === 'sole_proprietor' || form.businessType === 'partnership';
  return (
    hasType &&
    isUploadComplete(form.businessDocs.brDocument) &&
    isUploadComplete(form.businessDocs.tradeLicense) &&
    isUploadComplete(form.businessDocs.bankStatements) &&
    isUploadComplete(form.businessDocs.loanOutstandingLetter) &&
    isUploadComplete(form.businessDocs.cAndRForms) &&
    isUploadComplete(form.businessDocs.utilityBills)
  );
};

const validateInvestment = (form: M1TaxFormData): boolean => {
  if (!form.incomeTypes.investment) return true;

  if (form.investment.bankInterest && !isUploadComplete(form.investment.bankInterestWhtCertificate)) {
    return false;
  }

  if (form.investment.fixedDeposit && !isUploadComplete(form.investment.fixedDepositWhtCertificate)) {
    return false;
  }

  if (form.investment.rentalIncome && !isUploadComplete(form.investment.rentalIncomeAgreementAndDeed)) {
    return false;
  }

  return true;
};

const validateSolar = (form: M1TaxFormData): boolean => {
  if (!form.incomeTypes.solar) return true;
  return Boolean(
    form.solar.investmentAmount.trim() &&
      form.solar.annualIncome.trim() &&
      (form.solar.whtDeducted === 'yes' || form.solar.whtDeducted === 'no')
  );
};

const validateIncomeDocuments = (form: M1TaxFormData): boolean =>
  validateEmployment(form) && validateBusiness(form) && validateInvestment(form) && validateSolar(form);

const validateAssetsAndLiabilities = (form: M1TaxFormData): boolean => {
  const assetsBlock =
    form.assets.declareAssets === 'yes'
      ? (!form.assets.landBuilding || Boolean(
          form.assets.landDeedNo.trim() &&
            form.assets.landCostValue.trim() &&
            form.assets.landPurchaseYear.trim() &&
            form.assets.landLocation.trim() &&
            isUploadComplete(form.assets.landDeedUpload)
        )) &&
        (!form.assets.vehicles || Boolean(
          form.assets.vehicleModel.trim() &&
            form.assets.vehicleValue.trim() &&
            form.assets.vehiclePurchaseYear.trim() &&
            form.assets.vehicleRegistrationNo.trim() &&
            isUploadComplete(form.assets.vehicleCrUpload)
        ))
      : form.assets.declareAssets === 'no';

  const loansBlock =
    form.liabilities.hasLoans === 'yes'
      ? isUploadComplete(form.liabilities.loanOutstandingLetter)
      : form.liabilities.hasLoans === 'no';

  return assetsBlock && loansBlock;
};

export const getProgressPercentage = (form: M1TaxFormData): number => {
  const checks = [
    validateIncomeSelection(form),
    validateBasicInfo(form),
    validateIncomeDocuments(form),
    validateAssetsAndLiabilities(form),
    form.declarationConfirmed,
  ];

  const completeCount = checks.filter(Boolean).length;
  return Math.round((completeCount / checks.length) * 100);
};

export const canSubmitM1Form = (form: M1TaxFormData): boolean =>
  validateIncomeSelection(form) &&
  validateBasicInfo(form) &&
  validateIncomeDocuments(form) &&
  validateAssetsAndLiabilities(form) &&
  form.declarationConfirmed;

const normalizeRecord = (raw: unknown): M1SubmissionRecord | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const item = raw as Partial<M1SubmissionRecord>;
  const nic = sanitizeString(item.userProfile?.nic) || sanitizeString(item.form?.nic);
  if (!nic) {
    return null;
  }

  const userProfile: SubmissionUserProfile = {
    nic,
    tin: sanitizeString(item.userProfile?.tin),
    fullName: sanitizeString(item.userProfile?.fullName),
    contactNo: sanitizeString(item.userProfile?.contactNo),
    mailAddress: sanitizeString(item.userProfile?.mailAddress),
    district: sanitizeString(item.userProfile?.district),
    dsDivision: sanitizeString(item.userProfile?.dsDivision),
    gsDivision: sanitizeString(item.userProfile?.gsDivision),
    postalNo: sanitizeString(item.userProfile?.postalNo),
    addressLine1: sanitizeString(item.userProfile?.addressLine1),
    addressLine2: sanitizeString(item.userProfile?.addressLine2),
  };

  const form = restoreM1Form(item.form, userProfile);

  return {
    id: sanitizeString(item.id) || `M1-${nic}-${Date.now()}`,
    taxYear: typeof item.taxYear === 'number' ? item.taxYear : new Date().getFullYear(),
    status: item.status === 'submitted' ? 'submitted' : 'draft',
    progress: typeof item.progress === 'number' ? item.progress : getProgressPercentage(form),
    createdAt: sanitizeString(item.createdAt) || nowIso(),
    updatedAt: sanitizeString(item.updatedAt) || nowIso(),
    submittedAt: item.submittedAt && typeof item.submittedAt === 'string' ? item.submittedAt : null,
    userProfile,
    form,
  };
};

const saveAllRecords = (records: M1SubmissionRecord[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const getAllM1Submissions = (): M1SubmissionRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(item => normalizeRecord(item))
      .filter((item): item is M1SubmissionRecord => item !== null)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
};

export const getLatestM1SubmissionByNic = (nic: string): M1SubmissionRecord | null => {
  const target = nic.trim().toLowerCase();
  if (!target) {
    return null;
  }
  const records = getAllM1Submissions().filter(item => item.userProfile.nic.trim().toLowerCase() === target);
  return records.length ? records[0] : null;
};

export const hasSubmittedM1ForNic = (nic: string): boolean => {
  const item = getLatestM1SubmissionByNic(nic);
  return Boolean(item && item.status === 'submitted');
};

const upsertByNic = (record: M1SubmissionRecord): M1SubmissionRecord[] => {
  const all = getAllM1Submissions();
  const nic = record.userProfile.nic.trim().toLowerCase();
  const idx = all.findIndex(item => item.userProfile.nic.trim().toLowerCase() === nic);

  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.unshift(record);
  }

  all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  saveAllRecords(all);
  return all;
};

const buildRecord = (
  form: M1TaxFormData,
  profile: SubmissionUserProfile,
  status: 'draft' | 'submitted'
): M1SubmissionRecord => {
  const existing = getLatestM1SubmissionByNic(profile.nic || form.nic);
  const currentTime = nowIso();

  const userProfile: SubmissionUserProfile = {
    nic: profile.nic || form.nic,
    tin: profile.tin || form.tin,
    fullName: profile.fullName || form.fullName,
    contactNo: profile.contactNo || form.contactNo,
    mailAddress: profile.mailAddress || form.mailAddress,
    district: profile.district || form.district,
    dsDivision: profile.dsDivision || form.dsDivision,
    gsDivision: profile.gsDivision || form.gsDivision,
    postalNo: profile.postalNo || form.postalNo,
    addressLine1: profile.addressLine1 || form.addressLine1,
    addressLine2: profile.addressLine2 || form.addressLine2,
  };

  const progress = getProgressPercentage(form);

  return {
    id: existing?.id || `M1-${userProfile.nic}-${Date.now()}`,
    taxYear: existing?.taxYear || new Date().getFullYear(),
    status,
    progress,
    createdAt: existing?.createdAt || currentTime,
    updatedAt: currentTime,
    submittedAt: status === 'submitted' ? currentTime : existing?.submittedAt || null,
    userProfile,
    form,
  };
};

export const saveM1Draft = (form: M1TaxFormData, profile: SubmissionUserProfile): M1SubmissionRecord => {
  const record = buildRecord(form, profile, 'draft');
  upsertByNic(record);
  return record;
};

export const submitM1Form = (form: M1TaxFormData, profile: SubmissionUserProfile): M1SubmissionRecord => {
  const record = buildRecord(form, profile, 'submitted');
  upsertByNic(record);
  return record;
};

const collectUploadDocs = (form: M1TaxFormData): UploadDocRef[] => [
  form.nicDocs.nicFront,
  form.nicDocs.nicBack,
  form.employmentDocs.t10Certificate,
  form.employmentDocs.salarySheetSummary,
  form.employmentDocs.bankStatements,
  form.employmentDocs.loanOutstandingLetter,
  form.businessDocs.brDocument,
  form.businessDocs.tradeLicense,
  form.businessDocs.bankStatements,
  form.businessDocs.loanOutstandingLetter,
  form.businessDocs.cAndRForms,
  form.businessDocs.utilityBills,
  form.investment.bankInterestWhtCertificate,
  form.investment.fixedDepositWhtCertificate,
  form.investment.rentalIncomeAgreementAndDeed,
  form.assets.landDeedUpload,
  form.assets.vehicleCrUpload,
  form.liabilities.loanOutstandingLetter,
];

interface SubmissionDocumentDescriptor {
  key: string;
  label: string;
  category: string;
  get: (form: M1TaxFormData) => UploadDocRef;
  set: (form: M1TaxFormData, doc: UploadDocRef) => M1TaxFormData;
}

export interface SubmissionDocumentEntry {
  key: string;
  label: string;
  category: string;
  doc: UploadDocRef;
}

const DOCUMENT_DESCRIPTORS: SubmissionDocumentDescriptor[] = [
  {
    key: 'nicDocs.nicFront',
    label: 'NIC Front Image',
    category: 'Identity',
    get: form => form.nicDocs.nicFront,
    set: (form, doc) => ({
      ...form,
      nicDocs: {
        ...form.nicDocs,
        nicFront: doc,
      },
    }),
  },
  {
    key: 'nicDocs.nicBack',
    label: 'NIC Back Image',
    category: 'Identity',
    get: form => form.nicDocs.nicBack,
    set: (form, doc) => ({
      ...form,
      nicDocs: {
        ...form.nicDocs,
        nicBack: doc,
      },
    }),
  },
  {
    key: 'employmentDocs.t10Certificate',
    label: 'T10 Certificate',
    category: 'Employment',
    get: form => form.employmentDocs.t10Certificate,
    set: (form, doc) => ({
      ...form,
      employmentDocs: {
        ...form.employmentDocs,
        t10Certificate: doc,
      },
    }),
  },
  {
    key: 'employmentDocs.salarySheetSummary',
    label: 'Salary Sheet Summary',
    category: 'Employment',
    get: form => form.employmentDocs.salarySheetSummary,
    set: (form, doc) => ({
      ...form,
      employmentDocs: {
        ...form.employmentDocs,
        salarySheetSummary: doc,
      },
    }),
  },
  {
    key: 'employmentDocs.bankStatements',
    label: 'Employment Bank Statements',
    category: 'Employment',
    get: form => form.employmentDocs.bankStatements,
    set: (form, doc) => ({
      ...form,
      employmentDocs: {
        ...form.employmentDocs,
        bankStatements: doc,
      },
    }),
  },
  {
    key: 'employmentDocs.loanOutstandingLetter',
    label: 'Employment Loan Confirmation Letter',
    category: 'Employment',
    get: form => form.employmentDocs.loanOutstandingLetter,
    set: (form, doc) => ({
      ...form,
      employmentDocs: {
        ...form.employmentDocs,
        loanOutstandingLetter: doc,
      },
    }),
  },
  {
    key: 'businessDocs.brDocument',
    label: 'BR Document',
    category: 'Business',
    get: form => form.businessDocs.brDocument,
    set: (form, doc) => ({
      ...form,
      businessDocs: {
        ...form.businessDocs,
        brDocument: doc,
      },
    }),
  },
  {
    key: 'businessDocs.tradeLicense',
    label: 'Trade License',
    category: 'Business',
    get: form => form.businessDocs.tradeLicense,
    set: (form, doc) => ({
      ...form,
      businessDocs: {
        ...form.businessDocs,
        tradeLicense: doc,
      },
    }),
  },
  {
    key: 'businessDocs.bankStatements',
    label: 'Business Bank Statements',
    category: 'Business',
    get: form => form.businessDocs.bankStatements,
    set: (form, doc) => ({
      ...form,
      businessDocs: {
        ...form.businessDocs,
        bankStatements: doc,
      },
    }),
  },
  {
    key: 'businessDocs.loanOutstandingLetter',
    label: 'Business Loan Confirmation Letter',
    category: 'Business',
    get: form => form.businessDocs.loanOutstandingLetter,
    set: (form, doc) => ({
      ...form,
      businessDocs: {
        ...form.businessDocs,
        loanOutstandingLetter: doc,
      },
    }),
  },
  {
    key: 'businessDocs.cAndRForms',
    label: 'C and R Forms',
    category: 'Business',
    get: form => form.businessDocs.cAndRForms,
    set: (form, doc) => ({
      ...form,
      businessDocs: {
        ...form.businessDocs,
        cAndRForms: doc,
      },
    }),
  },
  {
    key: 'businessDocs.utilityBills',
    label: 'Utility Bills',
    category: 'Business',
    get: form => form.businessDocs.utilityBills,
    set: (form, doc) => ({
      ...form,
      businessDocs: {
        ...form.businessDocs,
        utilityBills: doc,
      },
    }),
  },
  {
    key: 'investment.bankInterestWhtCertificate',
    label: 'Bank Interest WHT Certificate',
    category: 'Investment',
    get: form => form.investment.bankInterestWhtCertificate,
    set: (form, doc) => ({
      ...form,
      investment: {
        ...form.investment,
        bankInterestWhtCertificate: doc,
      },
    }),
  },
  {
    key: 'investment.fixedDepositWhtCertificate',
    label: 'Fixed Deposit WHT Certificate',
    category: 'Investment',
    get: form => form.investment.fixedDepositWhtCertificate,
    set: (form, doc) => ({
      ...form,
      investment: {
        ...form.investment,
        fixedDepositWhtCertificate: doc,
      },
    }),
  },
  {
    key: 'investment.rentalIncomeAgreementAndDeed',
    label: 'Rental Income Agreement and Deed',
    category: 'Investment',
    get: form => form.investment.rentalIncomeAgreementAndDeed,
    set: (form, doc) => ({
      ...form,
      investment: {
        ...form.investment,
        rentalIncomeAgreementAndDeed: doc,
      },
    }),
  },
  {
    key: 'assets.landDeedUpload',
    label: 'Land Deed Upload',
    category: 'Assets',
    get: form => form.assets.landDeedUpload,
    set: (form, doc) => ({
      ...form,
      assets: {
        ...form.assets,
        landDeedUpload: doc,
      },
    }),
  },
  {
    key: 'assets.vehicleCrUpload',
    label: 'Vehicle CR Upload',
    category: 'Assets',
    get: form => form.assets.vehicleCrUpload,
    set: (form, doc) => ({
      ...form,
      assets: {
        ...form.assets,
        vehicleCrUpload: doc,
      },
    }),
  },
  {
    key: 'liabilities.loanOutstandingLetter',
    label: 'Liability Loan Confirmation Letter',
    category: 'Liabilities',
    get: form => form.liabilities.loanOutstandingLetter,
    set: (form, doc) => ({
      ...form,
      liabilities: {
        ...form.liabilities,
        loanOutstandingLetter: doc,
      },
    }),
  },
];

const findDocumentDescriptor = (key: string): SubmissionDocumentDescriptor | undefined =>
  DOCUMENT_DESCRIPTORS.find(item => item.key === key);

export const getSubmissionDocuments = (submission: M1SubmissionRecord): SubmissionDocumentEntry[] =>
  DOCUMENT_DESCRIPTORS.map(item => ({
    key: item.key,
    label: item.label,
    category: item.category,
    doc: item.get(submission.form),
  }));

const updateM1SubmissionRecordById = (
  submissionId: string,
  updater: (record: M1SubmissionRecord) => M1SubmissionRecord
): M1SubmissionRecord | null => {
  const records = getAllM1Submissions();
  const index = records.findIndex(item => item.id === submissionId);
  if (index < 0) {
    return null;
  }

  const nextRecord = updater(records[index]);
  const normalized: M1SubmissionRecord = {
    ...nextRecord,
    progress: getProgressPercentage(nextRecord.form),
    updatedAt: nowIso(),
  };

  records[index] = normalized;
  records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  saveAllRecords(records);
  return normalized;
};

export const setSubmissionDocumentVerification = (
  submissionId: string,
  documentKey: string,
  verificationStatus: DocumentVerificationStatus
): M1SubmissionRecord | null => {
  const descriptor = findDocumentDescriptor(documentKey);
  if (!descriptor) {
    return null;
  }

  return updateM1SubmissionRecordById(submissionId, record => {
    const doc = descriptor.get(record.form);
    if (doc.mode !== 'uploaded') {
      return record;
    }

    const updatedDoc: UploadDocRef = {
      ...doc,
      verificationStatus,
      verifiedAt: verificationStatus === 'pending' ? undefined : nowIso(),
      updatedAt: nowIso(),
    };

    return {
      ...record,
      form: descriptor.set(record.form, updatedDoc),
    };
  });
};

export const getSubmissionVerificationSummary = (submission: M1SubmissionRecord): {
  uploaded: number;
  verified: number;
  rejected: number;
  pending: number;
} => {
  const uploadedDocs = getSubmissionDocuments(submission).filter(item => item.doc.mode === 'uploaded');
  return {
    uploaded: uploadedDocs.length,
    verified: uploadedDocs.filter(item => item.doc.verificationStatus === 'verified').length,
    rejected: uploadedDocs.filter(item => item.doc.verificationStatus === 'rejected').length,
    pending: uploadedDocs.filter(item => (item.doc.verificationStatus || 'pending') === 'pending').length,
  };
};

const yesNo = (value: boolean): string => (value ? 'Yes' : 'No');

const boolToLabel = (value: '' | 'yes' | 'no'): string => (value === 'yes' ? 'Yes' : value === 'no' ? 'No' : '');

const incomeTypeLabel = (form: M1TaxFormData): string =>
  [
    form.incomeTypes.employment ? 'Employment' : '',
    form.incomeTypes.business ? 'Business' : '',
    form.incomeTypes.investment ? 'Investment' : '',
    form.incomeTypes.solar ? 'Solar' : '',
    form.incomeTypes.nilReturn ? 'NIL Return' : '',
  ]
    .filter(Boolean)
    .join(', ');

const investmentTypeLabel = (form: M1TaxFormData): string =>
  [
    form.investment.bankInterest ? 'Bank Interest' : '',
    form.investment.fixedDeposit ? 'Fixed Deposit' : '',
    form.investment.rentalIncome ? 'Rental Income' : '',
    form.investment.shareInvestment ? 'Share Investment' : '',
  ]
    .filter(Boolean)
    .join(', ');

const escapeCsv = (value: string): string => {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
};

const downloadBlob = (content: string, mime: string, fileName: string): void => {
  const blob = new Blob([content], { type: mime });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export interface M1ExportRow {
  submissionId: string;
  taxYear: string;
  status: string;
  progress: string;
  submittedAt: string;
  updatedAt: string;
  nic: string;
  tin: string;
  fullName: string;
  contactNo: string;
  mailAddress: string;
  district: string;
  residenceType: string;
  propertyLocation: string;
  purchaseYear: string;
  approxValue: string;
  deedNo: string;
  monthlyRent: string;
  advancePaid: string;
  incomeTypes: string;
  businessType: string;
  businessBankUse: string;
  businessBankDetails: string;
  investmentTypes: string;
  solarInvestmentAmount: string;
  solarAnnualIncome: string;
  solarWhtDeducted: string;
  declareAssets: string;
  hasLoans: string;
  cashInHand: string;
  goldJewelryValue: string;
  loanReceivables: string;
  uploadedDocs: string;
  uploadLaterDocs: string;
}

export const toM1ExportRows = (records: M1SubmissionRecord[]): M1ExportRow[] =>
  records.map(record => {
    const uploadDocs = collectUploadDocs(record.form);
    const uploadedCount = uploadDocs.filter(item => item.mode === 'uploaded').length;
    const laterCount = uploadDocs.filter(item => item.mode === 'later').length;

    return {
      submissionId: record.id,
      taxYear: String(record.taxYear),
      status: record.status,
      progress: `${record.progress}%`,
      submittedAt: record.submittedAt || '',
      updatedAt: record.updatedAt,
      nic: record.userProfile.nic,
      tin: record.userProfile.tin || '',
      fullName: record.userProfile.fullName || '',
      contactNo: record.userProfile.contactNo || '',
      mailAddress: record.userProfile.mailAddress || '',
      district: record.userProfile.district || '',
      residenceType: record.form.residenceType,
      propertyLocation: record.form.propertyLocation,
      purchaseYear: record.form.purchaseYear,
      approxValue: record.form.approxValue,
      deedNo: record.form.deedNo,
      monthlyRent: record.form.monthlyRent,
      advancePaid: record.form.advancePaid,
      incomeTypes: incomeTypeLabel(record.form),
      businessType:
        record.form.businessType === 'sole_proprietor'
          ? 'Sole Proprietor'
          : record.form.businessType === 'partnership'
            ? 'Partnership'
            : '',
      businessBankUse: boolToLabel(record.form.businessBankUse),
      businessBankDetails: record.form.businessBankDetails,
      investmentTypes: investmentTypeLabel(record.form),
      solarInvestmentAmount: record.form.solar.investmentAmount,
      solarAnnualIncome: record.form.solar.annualIncome,
      solarWhtDeducted: boolToLabel(record.form.solar.whtDeducted),
      declareAssets: boolToLabel(record.form.assets.declareAssets),
      hasLoans: boolToLabel(record.form.liabilities.hasLoans),
      cashInHand: record.form.assets.cashInHand,
      goldJewelryValue: record.form.assets.goldJewelryValue,
      loanReceivables: record.form.assets.loanReceivables,
      uploadedDocs: String(uploadedCount),
      uploadLaterDocs: String(laterCount),
    };
  });

export const downloadM1SubmissionsCsv = (records: M1SubmissionRecord[]): void => {
  const rows = toM1ExportRows(records);
  const headers = Object.keys(rows[0] || {
    submissionId: '',
    taxYear: '',
    status: '',
    progress: '',
    submittedAt: '',
    updatedAt: '',
    nic: '',
    tin: '',
    fullName: '',
    contactNo: '',
    mailAddress: '',
    district: '',
    residenceType: '',
    propertyLocation: '',
    purchaseYear: '',
    approxValue: '',
    deedNo: '',
    monthlyRent: '',
    advancePaid: '',
    incomeTypes: '',
    businessType: '',
    businessBankUse: '',
    businessBankDetails: '',
    investmentTypes: '',
    solarInvestmentAmount: '',
    solarAnnualIncome: '',
    solarWhtDeducted: '',
    declareAssets: '',
    hasLoans: '',
    cashInHand: '',
    goldJewelryValue: '',
    loanReceivables: '',
    uploadedDocs: '',
    uploadLaterDocs: '',
  });

  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(header => escapeCsv(String(row[header as keyof M1ExportRow] || ''))).join(',')),
  ].join('\r\n');

  downloadBlob(csv, 'text/csv;charset=utf-8', `mytax-m1-submissions-${new Date().toISOString().slice(0, 10)}.csv`);
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const downloadM1SubmissionsExcel = (records: M1SubmissionRecord[]): void => {
  const rows = toM1ExportRows(records);
  const headers = Object.keys(rows[0] || {
    submissionId: '',
    taxYear: '',
    status: '',
    progress: '',
    submittedAt: '',
    updatedAt: '',
    nic: '',
    tin: '',
    fullName: '',
    contactNo: '',
    mailAddress: '',
    district: '',
    residenceType: '',
    propertyLocation: '',
    purchaseYear: '',
    approxValue: '',
    deedNo: '',
    monthlyRent: '',
    advancePaid: '',
    incomeTypes: '',
    businessType: '',
    businessBankUse: '',
    businessBankDetails: '',
    investmentTypes: '',
    solarInvestmentAmount: '',
    solarAnnualIncome: '',
    solarWhtDeducted: '',
    declareAssets: '',
    hasLoans: '',
    cashInHand: '',
    goldJewelryValue: '',
    loanReceivables: '',
    uploadedDocs: '',
    uploadLaterDocs: '',
  });

  const headerHtml = headers.map(header => `<th>${escapeHtml(header)}</th>`).join('');
  const bodyHtml = rows
    .map(
      row =>
        `<tr>${headers
          .map(header => `<td>${escapeHtml(String(row[header as keyof M1ExportRow] || ''))}</td>`)
          .join('')}</tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
  th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; }
  th { background: #efefef; }
</style>
</head>
<body>
<table>
<thead><tr>${headerHtml}</tr></thead>
<tbody>${bodyHtml}</tbody>
</table>
</body>
</html>`;

  downloadBlob(html, 'application/vnd.ms-excel;charset=utf-8', `mytax-m1-submissions-${new Date().toISOString().slice(0, 10)}.xls`);
};

export const getUploadSummary = (form: M1TaxFormData): { uploaded: number; later: number; missing: number } => {
  const uploads = collectUploadDocs(form);
  return {
    uploaded: uploads.filter(item => item.mode === 'uploaded').length,
    later: uploads.filter(item => item.mode === 'later').length,
    missing: uploads.filter(item => item.mode === 'missing').length,
  };
};

export const formatIncomeLabel = (form: M1TaxFormData): string => incomeTypeLabel(form) || '-';

export const formatInvestmentLabel = (form: M1TaxFormData): string => investmentTypeLabel(form) || '-';

export const formatYesNo = (value: '' | 'yes' | 'no'): string => boolToLabel(value) || '-';

export const formatBool = (value: boolean): string => yesNo(value);
