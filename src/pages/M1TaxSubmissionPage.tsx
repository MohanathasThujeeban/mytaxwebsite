import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Car,
  CheckCircle2,
  CircleDot,
  Coins,
  FileSpreadsheet,
  HandCoins,
  Home,
  IdCard,
  Landmark,
  Mic,
  Save,
  Send,
  Sun,
  Upload,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  M1TaxFormData,
  SubmissionUserProfile,
  UploadDocRef,
  canSubmitM1Form,
  createDefaultM1Form,
  formatYesNo,
  getLatestM1SubmissionByNic,
  getProgressPercentage,
  restoreM1Form,
  saveM1Draft,
  submitM1Form,
} from '../utils/taxSubmission';

type StepIndex = 0 | 1 | 2 | 3 | 4;

type SpeechResultEvent = {
  results?: ArrayLike<ArrayLike<{ transcript?: string }>>;
};

type SpeechErrorEvent = {
  error?: string;
};

interface BasicSpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => BasicSpeechRecognition;

type BrowserSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

const STEPS: { id: StepIndex; title: string; subtitle: string }[] = [
  { id: 0, title: 'Select Income Type', subtitle: 'Choose what you file this year' },
  { id: 1, title: 'Basic Details', subtitle: 'Housing, profile and bank usage' },
  { id: 2, title: 'Income Documents', subtitle: 'Only required sections appear' },
  { id: 3, title: 'Assets & Liabilities', subtitle: 'Declare assets and loans' },
  { id: 4, title: 'Review & Submit', subtitle: 'Confirm and submit return' },
];

const uploadComplete = (upload: UploadDocRef): boolean => upload.mode === 'uploaded' || upload.mode === 'later';

interface UploadedFilePayload {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

const readFileAsDataUrl = (file: File): Promise<UploadedFilePayload> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to read file for preview.'));
        return;
      }

      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result,
      });
    };

    reader.onerror = () => reject(new Error('Unable to read file for preview.'));
    reader.readAsDataURL(file);
  });

const UploadQuestion: React.FC<{
  title: string;
  icon: React.ReactNode;
  doc: UploadDocRef;
  onUpload: (file: UploadedFilePayload | null) => void;
  onUploadLater: () => void;
  onClear: () => void;
  allowUploadLater?: boolean;
  accept?: string;
  onUploadFailed?: (message: string) => void;
}> = ({
  title,
  icon,
  doc,
  onUpload,
  onUploadLater,
  onClear,
  allowUploadLater = true,
  accept,
  onUploadFailed,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const statusLabel =
    doc.mode === 'uploaded'
      ? `Uploaded: ${doc.fileName || 'File attached'}`
      : doc.mode === 'later'
        ? 'Upload later selected'
        : 'Awaiting upload';

  return (
    <div className="m1-upload-row">
      <div className="m1-upload-row__title">
        <span>{icon}</span>
        <span>{title}</span>
      </div>

      <div className="m1-upload-row__controls">
        <button type="button" className="btn-outline" onClick={() => inputRef.current?.click()}>
          <Upload size={14} style={{ marginRight: 6 }} /> Upload File
        </button>
        {allowUploadLater && (
          <button type="button" className="btn-outline" onClick={onUploadLater}>
            Upload Later
          </button>
        )}
        {doc.mode !== 'missing' && (
          <button type="button" className="m1-link-btn" onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      <p className={`m1-upload-row__status status-${doc.mode}`}>{statusLabel}</p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={async event => {
          const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;

          if (!file) {
            onUpload(null);
            event.target.value = '';
            return;
          }

          try {
            const payload = await readFileAsDataUrl(file);
            onUpload(payload);
          } catch (error) {
            onUploadFailed?.((error as Error)?.message || 'Unable to read selected file.');
          }

          event.target.value = '';
        }}
      />
    </div>
  );
};

const YesNoToggle: React.FC<{
  label: string;
  value: '' | 'yes' | 'no';
  onChange: (value: 'yes' | 'no') => void;
}> = ({ label, value, onChange }) => (
  <div className="m1-toggle">
    <p>{label}</p>
    <div>
      <button type="button" className={`m1-chip${value === 'yes' ? ' active' : ''}`} onClick={() => onChange('yes')}>
        Yes
      </button>
      <button type="button" className={`m1-chip${value === 'no' ? ' active' : ''}`} onClick={() => onChange('no')}>
        No
      </button>
    </div>
  </div>
);

const M1TaxSubmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<StepIndex>(0);
  const [snack, setSnack] = useState('');
  const [listeningField, setListeningField] = useState('');
  const [form, setForm] = useState<M1TaxFormData>(() =>
    createDefaultM1Form({
      nic: user?.nic || '',
      fullName: user?.fullName,
      contactNo: user?.contactNo,
      mailAddress: user?.mailAddress,
      district: user?.district,
      dsDivision: user?.dsDivision,
      gsDivision: user?.gsDivision,
      postalNo: user?.postalNo,
      addressLine1: user?.addressLine1,
      addressLine2: user?.addressLine2,
    })
  );

  const recognitionRef = useRef<BasicSpeechRecognition | null>(null);

  const progress = useMemo(() => getProgressPercentage(form), [form]);

  const showSnack = (message: string) => {
    setSnack(message);
    window.setTimeout(() => setSnack(''), 3200);
  };

  useEffect(() => {
    if (!user) {
      navigate('/verify', { replace: true });
      return;
    }

    const draft = getLatestM1SubmissionByNic(user.nic);
    if (draft) {
      setForm(restoreM1Form(draft.form, {
        nic: user.nic,
        fullName: user.fullName,
        contactNo: user.contactNo,
        mailAddress: user.mailAddress,
        district: user.district,
        dsDivision: user.dsDivision,
        gsDivision: user.gsDivision,
        postalNo: user.postalNo,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2,
      }));
    }
  }, [navigate, user]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  if (!user) {
    return null;
  }

  const profile: SubmissionUserProfile = {
    nic: user.nic,
    fullName: user.fullName,
    contactNo: user.contactNo,
    mailAddress: user.mailAddress,
    district: user.district,
    dsDivision: user.dsDivision,
    gsDivision: user.gsDivision,
    postalNo: user.postalNo,
    addressLine1: user.addressLine1,
    addressLine2: user.addressLine2,
    tin: form.tin,
  };

  const setValue = <K extends keyof M1TaxFormData>(key: K, value: M1TaxFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateUpload = (current: UploadDocRef, file: UploadedFilePayload | null, modeOverride?: 'missing' | 'later') => {
    if (modeOverride === 'missing') {
      return {
        ...current,
        mode: 'missing' as const,
        fileName: undefined,
        fileSize: undefined,
        fileType: undefined,
        fileDataUrl: undefined,
        verificationStatus: 'pending' as const,
        verifiedAt: undefined,
        updatedAt: new Date().toISOString(),
      };
    }

    if (modeOverride === 'later') {
      return {
        ...current,
        mode: 'later' as const,
        fileName: undefined,
        fileSize: undefined,
        fileType: undefined,
        fileDataUrl: undefined,
        verificationStatus: 'pending' as const,
        verifiedAt: undefined,
        updatedAt: new Date().toISOString(),
      };
    }

    if (!file) {
      return current;
    }

    return {
      ...current,
      mode: 'uploaded' as const,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileDataUrl: file.dataUrl,
      verificationStatus: 'pending' as const,
      verifiedAt: undefined,
      updatedAt: new Date().toISOString(),
    };
  };

  const startVoiceInput = (fieldId: string, applyText: (value: string) => void) => {
    const speechWindow = window as BrowserSpeech;
    const Speech = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!Speech) {
      showSnack('Voice input is not supported in this browser.');
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new Speech();
    recognition.lang = 'en-LK';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = event => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || '';
      if (transcript) {
        applyText(transcript);
      }
    };

    recognition.onerror = () => {
      showSnack('Could not capture voice now. Please try again.');
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
      setListeningField('');
    };

    recognitionRef.current = recognition;
    setListeningField(fieldId);
    recognition.start();
  };

  const saveDraft = () => {
    saveM1Draft(form, profile);
    showSnack('Draft saved successfully.');
  };

  const handleSubmit = () => {
    if (!canSubmitM1Form(form)) {
      showSnack('Please complete all required items before submit.');
      return;
    }

    submitM1Form(form, profile);
    showSnack('M1 Tax Return submitted successfully.');
    window.setTimeout(() => navigate('/dashboard'), 700);
  };

  const validateCurrentStep = (): boolean => {
    if (step === 0) {
      return Object.values(form.incomeTypes).some(Boolean);
    }

    if (step === 1) {
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
    }

    if (step === 2) {
      const employmentValid = !form.incomeTypes.employment ||
        (uploadComplete(form.employmentDocs.t10Certificate) &&
          uploadComplete(form.employmentDocs.salarySheetSummary) &&
          uploadComplete(form.employmentDocs.bankStatements) &&
          uploadComplete(form.employmentDocs.loanOutstandingLetter));

      const businessValid = !form.incomeTypes.business ||
        ((form.businessType === 'sole_proprietor' || form.businessType === 'partnership') &&
          uploadComplete(form.businessDocs.brDocument) &&
          uploadComplete(form.businessDocs.tradeLicense) &&
          uploadComplete(form.businessDocs.bankStatements) &&
          uploadComplete(form.businessDocs.loanOutstandingLetter) &&
          uploadComplete(form.businessDocs.cAndRForms) &&
          uploadComplete(form.businessDocs.utilityBills));

      const investmentValid = !form.incomeTypes.investment ||
        (!form.investment.bankInterest || uploadComplete(form.investment.bankInterestWhtCertificate)) &&
        (!form.investment.fixedDeposit || uploadComplete(form.investment.fixedDepositWhtCertificate)) &&
        (!form.investment.rentalIncome || uploadComplete(form.investment.rentalIncomeAgreementAndDeed));

      const solarValid = !form.incomeTypes.solar ||
        Boolean(
          form.solar.investmentAmount.trim() &&
            form.solar.annualIncome.trim() &&
            (form.solar.whtDeducted === 'yes' || form.solar.whtDeducted === 'no')
        );

      return employmentValid && businessValid && investmentValid && solarValid;
    }

    if (step === 3) {
      const assetsValid =
        form.assets.declareAssets === 'yes'
          ? (!form.assets.landBuilding || Boolean(
              form.assets.landDeedNo.trim() &&
                form.assets.landCostValue.trim() &&
                form.assets.landPurchaseYear.trim() &&
                form.assets.landLocation.trim() &&
                uploadComplete(form.assets.landDeedUpload)
            )) &&
            (!form.assets.vehicles || Boolean(
              form.assets.vehicleModel.trim() &&
                form.assets.vehicleValue.trim() &&
                form.assets.vehiclePurchaseYear.trim() &&
                form.assets.vehicleRegistrationNo.trim() &&
                uploadComplete(form.assets.vehicleCrUpload)
            ))
          : form.assets.declareAssets === 'no';

      const liabilitiesValid =
        form.liabilities.hasLoans === 'yes'
          ? uploadComplete(form.liabilities.loanOutstandingLetter)
          : form.liabilities.hasLoans === 'no';

      return assetsValid && liabilitiesValid;
    }

    return form.declarationConfirmed;
  };

  const goNext = () => {
    if (!validateCurrentStep()) {
      showSnack('Please answer the required questions in this step first.');
      return;
    }

    if (step < 4) {
      setStep(prev => (prev + 1) as StepIndex);
      saveM1Draft(form, profile);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep(prev => (prev - 1) as StepIndex);
    }
  };

  const incomeCards = [
    { key: 'employment' as const, label: 'Employment Income', icon: <BriefcaseBusiness size={20} /> },
    { key: 'business' as const, label: 'Business Income', icon: <Building2 size={20} /> },
    { key: 'investment' as const, label: 'Investment Income', icon: <Coins size={20} /> },
    { key: 'solar' as const, label: 'Solar Income', icon: <Sun size={20} /> },
    { key: 'nilReturn' as const, label: 'NIL Return (No income)', icon: <HandCoins size={20} /> },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="m1-header-copy">
          <p className="m1-eyebrow">M1 TAX FILE SUBMISSION</p>
          <h1>
            <FileSpreadsheet size={22} /> Complete Your Annual Tax Return
          </h1>
          <p>
            Friendly step-by-step form with auto-hidden questions, icons, voice helper, and upload-later support.
          </p>
        </div>
        <img
          src="/images/logo.png"
          alt="MyTax"
          className="m1-header-logo"
          onError={e => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
        />
      </div>

      <div className="dashboard-inner animate-in">
        <div className="m1-progress-card">
          <div className="m1-progress-meta">
            <span>Progress</span>
            <strong>{progress}% done</strong>
          </div>
          <div className="m1-progress-track">
            <div className="m1-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="m1-step-list">
            {STEPS.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStep(item.id)}
                className={`m1-step-pill${step === item.id ? ' active' : ''}${item.id < step ? ' completed' : ''}`}
              >
                <span>{item.id + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="m1-assist-box">
          <p>
            <Mic size={15} /> Need help typing? Tap microphone buttons to speak answers. Keep answers short and clear.
          </p>
          <button type="button" className="m1-link-btn" onClick={saveDraft}>
            <Save size={14} style={{ marginRight: 6 }} /> Save Draft
          </button>
        </div>

        {step === 0 && (
          <section className="admin-panel m1-section">
            <div className="admin-panel__title">What do you want to file this year?</div>
            <div className="m1-income-grid">
              {incomeCards.map(item => {
                const selected = form.incomeTypes[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`m1-income-card${selected ? ' selected' : ''}`}
                    onClick={() =>
                      setForm(prev => ({
                        ...prev,
                        incomeTypes: { ...prev.incomeTypes, [item.key]: !prev.incomeTypes[item.key] },
                      }))
                    }
                  >
                    <div className="m1-income-card__icon">{item.icon}</div>
                    <p>{item.label}</p>
                    <span>{selected ? 'Selected' : 'Tap to select'}</span>
                  </button>
                );
              })}
            </div>

            <div className="m1-note-card">
              <strong>Simple flow</strong>
              <p>Start → Select Income Type → Basic Info → Relevant sections only → Review → Submit</p>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="admin-panel m1-section">
            <div className="admin-panel__title">Basic Details</div>

            <div className="m1-prefill-grid">
              <div>
                <label>NIC (pre-filled)</label>
                <div className="input-wrapper m1-static">{form.nic || '-'}</div>
              </div>
              <div>
                <label>TIN (if available)</label>
                <div className="input-wrapper">
                  <input
                    value={form.tin}
                    onChange={e => setValue('tin', e.target.value)}
                    placeholder="TIN Number"
                  />
                  <button
                    type="button"
                    className={`m1-mic-btn${listeningField === 'tin' ? ' listening' : ''}`}
                    onClick={() => startVoiceInput('tin', value => setValue('tin', value))}
                  >
                    <Mic size={14} />
                  </button>
                </div>
              </div>
              <div>
                <label>Full Name</label>
                <div className="input-wrapper m1-static">{form.fullName || '-'}</div>
              </div>
              <div>
                <label>Contact No</label>
                <div className="input-wrapper m1-static">{form.contactNo || '-'}</div>
              </div>
            </div>

            <div className="m1-divider" />

            <div className="m1-subsection">
              <h3>
                <IdCard size={16} /> Identity Documents (Required)
              </h3>

              <UploadQuestion
                title="NIC Front Image"
                icon={<CircleDot size={14} />}
                doc={form.nicDocs.nicFront}
                allowUploadLater={false}
                accept="image/*"
                onUploadFailed={showSnack}
                onUpload={file =>
                  setForm(prev => ({
                    ...prev,
                    nicDocs: {
                      ...prev.nicDocs,
                      nicFront: updateUpload(prev.nicDocs.nicFront, file),
                    },
                  }))
                }
                onUploadLater={() => {
                  showSnack('NIC front image is required before submitting.');
                }}
                onClear={() =>
                  setForm(prev => ({
                    ...prev,
                    nicDocs: {
                      ...prev.nicDocs,
                      nicFront: updateUpload(prev.nicDocs.nicFront, null, 'missing'),
                    },
                  }))
                }
              />

              <UploadQuestion
                title="NIC Back Image"
                icon={<CircleDot size={14} />}
                doc={form.nicDocs.nicBack}
                allowUploadLater={false}
                accept="image/*"
                onUploadFailed={showSnack}
                onUpload={file =>
                  setForm(prev => ({
                    ...prev,
                    nicDocs: {
                      ...prev.nicDocs,
                      nicBack: updateUpload(prev.nicDocs.nicBack, file),
                    },
                  }))
                }
                onUploadLater={() => {
                  showSnack('NIC back image is required before submitting.');
                }}
                onClear={() =>
                  setForm(prev => ({
                    ...prev,
                    nicDocs: {
                      ...prev.nicDocs,
                      nicBack: updateUpload(prev.nicDocs.nicBack, null, 'missing'),
                    },
                  }))
                }
              />
            </div>

            <div className="m1-divider" />

            <div className="m1-block-title">
              <Home size={16} /> Where do you live?
            </div>
            <div className="m1-toggle-choices">
              <button
                type="button"
                className={`m1-chip${form.residenceType === 'own' ? ' active' : ''}`}
                onClick={() => setValue('residenceType', 'own')}
              >
                Own House
              </button>
              <button
                type="button"
                className={`m1-chip${form.residenceType === 'rental' ? ' active' : ''}`}
                onClick={() => setValue('residenceType', 'rental')}
              >
                Rental House
              </button>
            </div>

            {form.residenceType === 'own' && (
              <div className="m1-form-grid">
                <div>
                  <label>Property Location</label>
                  <div className="input-wrapper">
                    <input
                      value={form.propertyLocation}
                      onChange={e => setValue('propertyLocation', e.target.value)}
                      placeholder="Location"
                    />
                    <button
                      type="button"
                      className={`m1-mic-btn${listeningField === 'propertyLocation' ? ' listening' : ''}`}
                      onClick={() =>
                        startVoiceInput('propertyLocation', value => setValue('propertyLocation', value))
                      }
                    >
                      <Mic size={14} />
                    </button>
                  </div>
                </div>
                <div>
                  <label>Purchase Year</label>
                  <div className="input-wrapper">
                    <input
                      value={form.purchaseYear}
                      onChange={e => setValue('purchaseYear', e.target.value)}
                      placeholder="YYYY"
                    />
                  </div>
                </div>
                <div>
                  <label>Approx Value</label>
                  <div className="input-wrapper">
                    <input
                      value={form.approxValue}
                      onChange={e => setValue('approxValue', e.target.value)}
                      placeholder="LKR"
                    />
                  </div>
                </div>
                <div>
                  <label>Deed Number</label>
                  <div className="input-wrapper">
                    <input
                      value={form.deedNo}
                      onChange={e => setValue('deedNo', e.target.value)}
                      placeholder="Deed No"
                    />
                  </div>
                </div>
              </div>
            )}

            {form.residenceType === 'rental' && (
              <div className="m1-form-grid">
                <div>
                  <label>Monthly Rent</label>
                  <div className="input-wrapper">
                    <input
                      value={form.monthlyRent}
                      onChange={e => setValue('monthlyRent', e.target.value)}
                      placeholder="LKR"
                    />
                  </div>
                </div>
                <div>
                  <label>Advance Paid</label>
                  <div className="input-wrapper">
                    <input
                      value={form.advancePaid}
                      onChange={e => setValue('advancePaid', e.target.value)}
                      placeholder="LKR"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="m1-divider" />

            <YesNoToggle
              label="Do you use a business bank account?"
              value={form.businessBankUse}
              onChange={value => setValue('businessBankUse', value)}
            />

            {form.businessBankUse === 'yes' && (
              <div>
                <label>Business Bank Account Details</label>
                <div className="input-wrapper">
                  <input
                    value={form.businessBankDetails}
                    onChange={e => setValue('businessBankDetails', e.target.value)}
                    placeholder="Bank name, account number, branch"
                  />
                  <button
                    type="button"
                    className={`m1-mic-btn${listeningField === 'businessBankDetails' ? ' listening' : ''}`}
                    onClick={() =>
                      startVoiceInput('businessBankDetails', value => setValue('businessBankDetails', value))
                    }
                  >
                    <Mic size={14} />
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {step === 2 && (
          <section className="admin-panel m1-section">
            <div className="admin-panel__title">Income Details & Documents</div>

            {form.incomeTypes.employment && (
              <div className="m1-subsection">
                <h3>
                  <BriefcaseBusiness size={16} /> Employment Income
                </h3>
                <UploadQuestion
                  title="Upload T10 Certificate"
                  icon={<CircleDot size={14} />}
                  doc={form.employmentDocs.t10Certificate}
                  onUpload={file =>
                    setForm(prev => ({
                      ...prev,
                      employmentDocs: {
                        ...prev.employmentDocs,
                        t10Certificate: updateUpload(prev.employmentDocs.t10Certificate, file),
                      },
                    }))
                  }
                  onUploadLater={() =>
                    setForm(prev => ({
                      ...prev,
                      employmentDocs: {
                        ...prev.employmentDocs,
                        t10Certificate: updateUpload(prev.employmentDocs.t10Certificate, null, 'later'),
                      },
                    }))
                  }
                  onClear={() =>
                    setForm(prev => ({
                      ...prev,
                      employmentDocs: {
                        ...prev.employmentDocs,
                        t10Certificate: updateUpload(prev.employmentDocs.t10Certificate, null, 'missing'),
                      },
                    }))
                  }
                />

                <UploadQuestion
                  title="Upload Salary Sheet Summary"
                  icon={<CircleDot size={14} />}
                  doc={form.employmentDocs.salarySheetSummary}
                  onUpload={file =>
                    setForm(prev => ({
                      ...prev,
                      employmentDocs: {
                        ...prev.employmentDocs,
                        salarySheetSummary: updateUpload(prev.employmentDocs.salarySheetSummary, file),
                      },
                    }))
                  }
                  onUploadLater={() =>
                    setForm(prev => ({
                      ...prev,
                      employmentDocs: {
                        ...prev.employmentDocs,
                        salarySheetSummary: updateUpload(prev.employmentDocs.salarySheetSummary, null, 'later'),
                      },
                    }))
                  }
                  onClear={() =>
                    setForm(prev => ({
                      ...prev,
                      employmentDocs: {
                        ...prev.employmentDocs,
                        salarySheetSummary: updateUpload(prev.employmentDocs.salarySheetSummary, null, 'missing'),
                      },
                    }))
                  }
                />

                <UploadQuestion
                  title="Upload Bank Statements for the Period"
                  icon={<CircleDot size={14} />}
                  doc={form.employmentDocs.bankStatements}
                  onUpload={file =>
                    setForm(prev => ({
                      ...prev,
                      employmentDocs: {
                        ...prev.employmentDocs,
                        bankStatements: updateUpload(prev.employmentDocs.bankStatements, file),
                      },
                    }))
                  }
                  onUploadLater={() =>
                    setForm(prev => ({
                      ...prev,
                      employmentDocs: {
                        ...prev.employmentDocs,
                        bankStatements: updateUpload(prev.employmentDocs.bankStatements, null, 'later'),
                      },
                    }))
                  }
                  onClear={() =>
                    setForm(prev => ({
                      ...prev,
                      employmentDocs: {
                        ...prev.employmentDocs,
                        bankStatements: updateUpload(prev.employmentDocs.bankStatements, null, 'missing'),
                      },
                    }))
                  }
                />

                <UploadQuestion
                  title="Upload Loan Outstanding Confirmation Letter"
                  icon={<CircleDot size={14} />}
                  doc={form.employmentDocs.loanOutstandingLetter}
                  onUpload={file =>
                    setForm(prev => ({
                      ...prev,
                      employmentDocs: {
                        ...prev.employmentDocs,
                        loanOutstandingLetter: updateUpload(prev.employmentDocs.loanOutstandingLetter, file),
                      },
                    }))
                  }
                  onUploadLater={() =>
                    setForm(prev => ({
                      ...prev,
                      employmentDocs: {
                        ...prev.employmentDocs,
                        loanOutstandingLetter: updateUpload(prev.employmentDocs.loanOutstandingLetter, null, 'later'),
                      },
                    }))
                  }
                  onClear={() =>
                    setForm(prev => ({
                      ...prev,
                      employmentDocs: {
                        ...prev.employmentDocs,
                        loanOutstandingLetter: updateUpload(prev.employmentDocs.loanOutstandingLetter, null, 'missing'),
                      },
                    }))
                  }
                />
              </div>
            )}

            {form.incomeTypes.business && (
              <div className="m1-subsection">
                <h3>
                  <Building2 size={16} /> Business Income
                </h3>
                <div className="m1-toggle-choices">
                  <button
                    type="button"
                    className={`m1-chip${form.businessType === 'sole_proprietor' ? ' active' : ''}`}
                    onClick={() => setValue('businessType', 'sole_proprietor')}
                  >
                    Sole Proprietor
                  </button>
                  <button
                    type="button"
                    className={`m1-chip${form.businessType === 'partnership' ? ' active' : ''}`}
                    onClick={() => setValue('businessType', 'partnership')}
                  >
                    Partnership
                  </button>
                </div>

                <UploadQuestion
                  title="BR Document"
                  icon={<CircleDot size={14} />}
                  doc={form.businessDocs.brDocument}
                  onUpload={file =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        brDocument: updateUpload(prev.businessDocs.brDocument, file),
                      },
                    }))
                  }
                  onUploadLater={() =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        brDocument: updateUpload(prev.businessDocs.brDocument, null, 'later'),
                      },
                    }))
                  }
                  onClear={() =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        brDocument: updateUpload(prev.businessDocs.brDocument, null, 'missing'),
                      },
                    }))
                  }
                />

                <UploadQuestion
                  title="Trade License"
                  icon={<CircleDot size={14} />}
                  doc={form.businessDocs.tradeLicense}
                  onUpload={file =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        tradeLicense: updateUpload(prev.businessDocs.tradeLicense, file),
                      },
                    }))
                  }
                  onUploadLater={() =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        tradeLicense: updateUpload(prev.businessDocs.tradeLicense, null, 'later'),
                      },
                    }))
                  }
                  onClear={() =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        tradeLicense: updateUpload(prev.businessDocs.tradeLicense, null, 'missing'),
                      },
                    }))
                  }
                />

                <UploadQuestion
                  title="Business Bank Statements"
                  icon={<CircleDot size={14} />}
                  doc={form.businessDocs.bankStatements}
                  onUpload={file =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        bankStatements: updateUpload(prev.businessDocs.bankStatements, file),
                      },
                    }))
                  }
                  onUploadLater={() =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        bankStatements: updateUpload(prev.businessDocs.bankStatements, null, 'later'),
                      },
                    }))
                  }
                  onClear={() =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        bankStatements: updateUpload(prev.businessDocs.bankStatements, null, 'missing'),
                      },
                    }))
                  }
                />

                <UploadQuestion
                  title="Loan Outstanding Confirmation Letter"
                  icon={<CircleDot size={14} />}
                  doc={form.businessDocs.loanOutstandingLetter}
                  onUpload={file =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        loanOutstandingLetter: updateUpload(prev.businessDocs.loanOutstandingLetter, file),
                      },
                    }))
                  }
                  onUploadLater={() =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        loanOutstandingLetter: updateUpload(prev.businessDocs.loanOutstandingLetter, null, 'later'),
                      },
                    }))
                  }
                  onClear={() =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        loanOutstandingLetter: updateUpload(prev.businessDocs.loanOutstandingLetter, null, 'missing'),
                      },
                    }))
                  }
                />

                <UploadQuestion
                  title="C Form & R Form (if employees)"
                  icon={<CircleDot size={14} />}
                  doc={form.businessDocs.cAndRForms}
                  onUpload={file =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        cAndRForms: updateUpload(prev.businessDocs.cAndRForms, file),
                      },
                    }))
                  }
                  onUploadLater={() =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        cAndRForms: updateUpload(prev.businessDocs.cAndRForms, null, 'later'),
                      },
                    }))
                  }
                  onClear={() =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        cAndRForms: updateUpload(prev.businessDocs.cAndRForms, null, 'missing'),
                      },
                    }))
                  }
                />

                <UploadQuestion
                  title="Utility Bills"
                  icon={<CircleDot size={14} />}
                  doc={form.businessDocs.utilityBills}
                  onUpload={file =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        utilityBills: updateUpload(prev.businessDocs.utilityBills, file),
                      },
                    }))
                  }
                  onUploadLater={() =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        utilityBills: updateUpload(prev.businessDocs.utilityBills, null, 'later'),
                      },
                    }))
                  }
                  onClear={() =>
                    setForm(prev => ({
                      ...prev,
                      businessDocs: {
                        ...prev.businessDocs,
                        utilityBills: updateUpload(prev.businessDocs.utilityBills, null, 'missing'),
                      },
                    }))
                  }
                />
              </div>
            )}

            {form.incomeTypes.investment && (
              <div className="m1-subsection">
                <h3>
                  <Landmark size={16} /> Investment Income
                </h3>
                <div className="m1-check-grid">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.investment.bankInterest}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          investment: { ...prev.investment, bankInterest: e.target.checked },
                        }))
                      }
                    />
                    <span>Bank Interest</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.investment.fixedDeposit}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          investment: { ...prev.investment, fixedDeposit: e.target.checked },
                        }))
                      }
                    />
                    <span>Fixed Deposit</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.investment.rentalIncome}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          investment: { ...prev.investment, rentalIncome: e.target.checked },
                        }))
                      }
                    />
                    <span>Rental Income</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.investment.shareInvestment}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          investment: { ...prev.investment, shareInvestment: e.target.checked },
                        }))
                      }
                    />
                    <span>Share Investment</span>
                  </label>
                </div>

                {form.investment.bankInterest && (
                  <UploadQuestion
                    title="WHT Deduction Certificate (Bank Interest)"
                    icon={<CircleDot size={14} />}
                    doc={form.investment.bankInterestWhtCertificate}
                    onUpload={file =>
                      setForm(prev => ({
                        ...prev,
                        investment: {
                          ...prev.investment,
                          bankInterestWhtCertificate: updateUpload(prev.investment.bankInterestWhtCertificate, file),
                        },
                      }))
                    }
                    onUploadLater={() =>
                      setForm(prev => ({
                        ...prev,
                        investment: {
                          ...prev.investment,
                          bankInterestWhtCertificate: updateUpload(prev.investment.bankInterestWhtCertificate, null, 'later'),
                        },
                      }))
                    }
                    onClear={() =>
                      setForm(prev => ({
                        ...prev,
                        investment: {
                          ...prev.investment,
                          bankInterestWhtCertificate: updateUpload(prev.investment.bankInterestWhtCertificate, null, 'missing'),
                        },
                      }))
                    }
                  />
                )}

                {form.investment.fixedDeposit && (
                  <UploadQuestion
                    title="WHT Deduction Certificate (Fixed Deposit)"
                    icon={<CircleDot size={14} />}
                    doc={form.investment.fixedDepositWhtCertificate}
                    onUpload={file =>
                      setForm(prev => ({
                        ...prev,
                        investment: {
                          ...prev.investment,
                          fixedDepositWhtCertificate: updateUpload(prev.investment.fixedDepositWhtCertificate, file),
                        },
                      }))
                    }
                    onUploadLater={() =>
                      setForm(prev => ({
                        ...prev,
                        investment: {
                          ...prev.investment,
                          fixedDepositWhtCertificate: updateUpload(prev.investment.fixedDepositWhtCertificate, null, 'later'),
                        },
                      }))
                    }
                    onClear={() =>
                      setForm(prev => ({
                        ...prev,
                        investment: {
                          ...prev.investment,
                          fixedDepositWhtCertificate: updateUpload(prev.investment.fixedDepositWhtCertificate, null, 'missing'),
                        },
                      }))
                    }
                  />
                )}

                {form.investment.rentalIncome && (
                  <UploadQuestion
                    title="Agreement & Deed Copy with WHT Certificate"
                    icon={<CircleDot size={14} />}
                    doc={form.investment.rentalIncomeAgreementAndDeed}
                    onUpload={file =>
                      setForm(prev => ({
                        ...prev,
                        investment: {
                          ...prev.investment,
                          rentalIncomeAgreementAndDeed: updateUpload(prev.investment.rentalIncomeAgreementAndDeed, file),
                        },
                      }))
                    }
                    onUploadLater={() =>
                      setForm(prev => ({
                        ...prev,
                        investment: {
                          ...prev.investment,
                          rentalIncomeAgreementAndDeed: updateUpload(prev.investment.rentalIncomeAgreementAndDeed, null, 'later'),
                        },
                      }))
                    }
                    onClear={() =>
                      setForm(prev => ({
                        ...prev,
                        investment: {
                          ...prev.investment,
                          rentalIncomeAgreementAndDeed: updateUpload(prev.investment.rentalIncomeAgreementAndDeed, null, 'missing'),
                        },
                      }))
                    }
                  />
                )}
              </div>
            )}

            {form.incomeTypes.solar && (
              <div className="m1-subsection">
                <h3>
                  <Sun size={16} /> Solar Income
                </h3>
                <div className="m1-form-grid">
                  <div>
                    <label>Investment Amount</label>
                    <div className="input-wrapper">
                      <input
                        value={form.solar.investmentAmount}
                        onChange={e =>
                          setForm(prev => ({
                            ...prev,
                            solar: { ...prev.solar, investmentAmount: e.target.value },
                          }))
                        }
                        placeholder="LKR"
                      />
                    </div>
                  </div>
                  <div>
                    <label>Annual Income</label>
                    <div className="input-wrapper">
                      <input
                        value={form.solar.annualIncome}
                        onChange={e =>
                          setForm(prev => ({
                            ...prev,
                            solar: { ...prev.solar, annualIncome: e.target.value },
                          }))
                        }
                        placeholder="LKR"
                      />
                    </div>
                  </div>
                </div>

                <YesNoToggle
                  label="WHT deducted?"
                  value={form.solar.whtDeducted}
                  onChange={value =>
                    setForm(prev => ({
                      ...prev,
                      solar: { ...prev.solar, whtDeducted: value },
                    }))
                  }
                />
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="admin-panel m1-section">
            <div className="admin-panel__title">Assets & Liabilities</div>

            <YesNoToggle
              label="Do you want to declare assets?"
              value={form.assets.declareAssets}
              onChange={value =>
                setForm(prev => ({
                  ...prev,
                  assets: { ...prev.assets, declareAssets: value },
                }))
              }
            />

            {form.assets.declareAssets === 'yes' && (
              <>
                <div className="m1-divider" />

                <label className="m1-checkline">
                  <input
                    type="checkbox"
                    checked={form.assets.landBuilding}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        assets: { ...prev.assets, landBuilding: e.target.checked },
                      }))
                    }
                  />
                  <span>Land & Building</span>
                </label>

                {form.assets.landBuilding && (
                  <div className="m1-subsection">
                    <div className="m1-form-grid">
                      <div>
                        <label>Deed No</label>
                        <div className="input-wrapper">
                          <input
                            value={form.assets.landDeedNo}
                            onChange={e =>
                              setForm(prev => ({ ...prev, assets: { ...prev.assets, landDeedNo: e.target.value } }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label>Cost Value</label>
                        <div className="input-wrapper">
                          <input
                            value={form.assets.landCostValue}
                            onChange={e =>
                              setForm(prev => ({ ...prev, assets: { ...prev.assets, landCostValue: e.target.value } }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label>Year of Purchase</label>
                        <div className="input-wrapper">
                          <input
                            value={form.assets.landPurchaseYear}
                            onChange={e =>
                              setForm(prev => ({
                                ...prev,
                                assets: { ...prev.assets, landPurchaseYear: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label>Location</label>
                        <div className="input-wrapper">
                          <input
                            value={form.assets.landLocation}
                            onChange={e =>
                              setForm(prev => ({ ...prev, assets: { ...prev.assets, landLocation: e.target.value } }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <UploadQuestion
                      title="Upload Deed"
                      icon={<Home size={14} />}
                      doc={form.assets.landDeedUpload}
                      onUpload={file =>
                        setForm(prev => ({
                          ...prev,
                          assets: {
                            ...prev.assets,
                            landDeedUpload: updateUpload(prev.assets.landDeedUpload, file),
                          },
                        }))
                      }
                      onUploadLater={() =>
                        setForm(prev => ({
                          ...prev,
                          assets: {
                            ...prev.assets,
                            landDeedUpload: updateUpload(prev.assets.landDeedUpload, null, 'later'),
                          },
                        }))
                      }
                      onClear={() =>
                        setForm(prev => ({
                          ...prev,
                          assets: {
                            ...prev.assets,
                            landDeedUpload: updateUpload(prev.assets.landDeedUpload, null, 'missing'),
                          },
                        }))
                      }
                    />
                  </div>
                )}

                <label className="m1-checkline">
                  <input
                    type="checkbox"
                    checked={form.assets.vehicles}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        assets: { ...prev.assets, vehicles: e.target.checked },
                      }))
                    }
                  />
                  <span>Vehicles</span>
                </label>

                {form.assets.vehicles && (
                  <div className="m1-subsection">
                    <div className="m1-form-grid">
                      <div>
                        <label>Model</label>
                        <div className="input-wrapper">
                          <input
                            value={form.assets.vehicleModel}
                            onChange={e =>
                              setForm(prev => ({ ...prev, assets: { ...prev.assets, vehicleModel: e.target.value } }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label>Value</label>
                        <div className="input-wrapper">
                          <input
                            value={form.assets.vehicleValue}
                            onChange={e =>
                              setForm(prev => ({ ...prev, assets: { ...prev.assets, vehicleValue: e.target.value } }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label>Year of Purchase</label>
                        <div className="input-wrapper">
                          <input
                            value={form.assets.vehiclePurchaseYear}
                            onChange={e =>
                              setForm(prev => ({
                                ...prev,
                                assets: { ...prev.assets, vehiclePurchaseYear: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label>Registration No</label>
                        <div className="input-wrapper">
                          <input
                            value={form.assets.vehicleRegistrationNo}
                            onChange={e =>
                              setForm(prev => ({
                                ...prev,
                                assets: { ...prev.assets, vehicleRegistrationNo: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <UploadQuestion
                      title="Upload CR"
                      icon={<Car size={14} />}
                      doc={form.assets.vehicleCrUpload}
                      onUpload={file =>
                        setForm(prev => ({
                          ...prev,
                          assets: {
                            ...prev.assets,
                            vehicleCrUpload: updateUpload(prev.assets.vehicleCrUpload, file),
                          },
                        }))
                      }
                      onUploadLater={() =>
                        setForm(prev => ({
                          ...prev,
                          assets: {
                            ...prev.assets,
                            vehicleCrUpload: updateUpload(prev.assets.vehicleCrUpload, null, 'later'),
                          },
                        }))
                      }
                      onClear={() =>
                        setForm(prev => ({
                          ...prev,
                          assets: {
                            ...prev.assets,
                            vehicleCrUpload: updateUpload(prev.assets.vehicleCrUpload, null, 'missing'),
                          },
                        }))
                      }
                    />
                  </div>
                )}

                <div className="m1-form-grid">
                  <div>
                    <label>Cash in hand on 31 March</label>
                    <div className="input-wrapper">
                      <input
                        value={form.assets.cashInHand}
                        onChange={e => setForm(prev => ({ ...prev, assets: { ...prev.assets, cashInHand: e.target.value } }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label>Gold / Jewelry value on 31 March</label>
                    <div className="input-wrapper">
                      <input
                        value={form.assets.goldJewelryValue}
                        onChange={e =>
                          setForm(prev => ({ ...prev, assets: { ...prev.assets, goldJewelryValue: e.target.value } }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label>Loan Receivables on 31 March</label>
                    <div className="input-wrapper">
                      <input
                        value={form.assets.loanReceivables}
                        onChange={e =>
                          setForm(prev => ({ ...prev, assets: { ...prev.assets, loanReceivables: e.target.value } }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="m1-divider" />

            <YesNoToggle
              label="Do you have loans?"
              value={form.liabilities.hasLoans}
              onChange={value =>
                setForm(prev => ({
                  ...prev,
                  liabilities: { ...prev.liabilities, hasLoans: value },
                }))
              }
            />

            {form.liabilities.hasLoans === 'yes' && (
              <UploadQuestion
                title="Upload Loan Outstanding Confirmation Letter"
                icon={<Wallet size={14} />}
                doc={form.liabilities.loanOutstandingLetter}
                onUpload={file =>
                  setForm(prev => ({
                    ...prev,
                    liabilities: {
                      ...prev.liabilities,
                      loanOutstandingLetter: updateUpload(prev.liabilities.loanOutstandingLetter, file),
                    },
                  }))
                }
                onUploadLater={() =>
                  setForm(prev => ({
                    ...prev,
                    liabilities: {
                      ...prev.liabilities,
                      loanOutstandingLetter: updateUpload(prev.liabilities.loanOutstandingLetter, null, 'later'),
                    },
                  }))
                }
                onClear={() =>
                  setForm(prev => ({
                    ...prev,
                    liabilities: {
                      ...prev.liabilities,
                      loanOutstandingLetter: updateUpload(prev.liabilities.loanOutstandingLetter, null, 'missing'),
                    },
                  }))
                }
              />
            )}
          </section>
        )}

        {step === 4 && (
          <section className="admin-panel m1-section">
            <div className="admin-panel__title">Review & Final Declaration</div>

            <div className="m1-review-grid">
              <div className="m1-review-card">
                <h4>
                  <CheckCircle2 size={15} /> Basic Profile
                </h4>
                <p><strong>NIC:</strong> {form.nic || '-'}</p>
                <p><strong>TIN:</strong> {form.tin || '-'}</p>
                <p><strong>Name:</strong> {form.fullName || '-'}</p>
                <p><strong>Contact:</strong> {form.contactNo || '-'}</p>
                <p><strong>Email:</strong> {form.mailAddress || '-'}</p>
                <p><strong>NIC Front:</strong> {form.nicDocs.nicFront.mode === 'uploaded' ? 'Uploaded' : 'Missing'}</p>
                <p><strong>NIC Back:</strong> {form.nicDocs.nicBack.mode === 'uploaded' ? 'Uploaded' : 'Missing'}</p>
                <p><strong>Residence:</strong> {form.residenceType || '-'}</p>
              </div>

              <div className="m1-review-card">
                <h4>
                  <Landmark size={15} /> Filing Summary
                </h4>
                <p><strong>Income Types:</strong> {Object.entries(form.incomeTypes).filter(([, value]) => value).map(([key]) => key).join(', ') || '-'}</p>
                <p><strong>Business Type:</strong> {form.businessType || '-'}</p>
                <p><strong>Investment Types:</strong> {[form.investment.bankInterest ? 'Bank Interest' : '', form.investment.fixedDeposit ? 'Fixed Deposit' : '', form.investment.rentalIncome ? 'Rental Income' : '', form.investment.shareInvestment ? 'Share Investment' : ''].filter(Boolean).join(', ') || '-'}</p>
                <p><strong>Business Bank:</strong> {formatYesNo(form.businessBankUse)}</p>
                <p><strong>Assets Declared:</strong> {formatYesNo(form.assets.declareAssets)}</p>
                <p><strong>Loans:</strong> {formatYesNo(form.liabilities.hasLoans)}</p>
              </div>
            </div>

            <label className="m1-final-declaration">
              <input
                type="checkbox"
                checked={form.declarationConfirmed}
                onChange={e => setValue('declarationConfirmed', e.target.checked)}
              />
              <span>
                I confirm all information provided is correct. I understand this return will be submitted with my declaration.
              </span>
            </label>

            <button
              type="button"
              className="btn-primary btn-full"
              disabled={!canSubmitM1Form(form)}
              onClick={handleSubmit}
            >
              <Send size={16} style={{ marginRight: 6 }} /> Submit Return
            </button>
          </section>
        )}

        <div className="m1-nav-row">
          <button type="button" className="btn-outline" disabled={step === 0} onClick={goBack}>
            <ArrowLeft size={15} style={{ marginRight: 6 }} /> Previous
          </button>

          <button type="button" className="btn-outline" onClick={saveDraft}>
            <Save size={15} style={{ marginRight: 6 }} /> Save Draft
          </button>

          {step < 4 ? (
            <button type="button" className="btn-primary" onClick={goNext}>
              Next <ArrowRight size={15} style={{ marginLeft: 6 }} />
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={handleSubmit} disabled={!canSubmitM1Form(form)}>
              <Send size={15} style={{ marginRight: 6 }} /> Submit
            </button>
          )}
        </div>
      </div>

      {snack && <div className="snackbar">{snack}</div>}
    </div>
  );
};

export default M1TaxSubmissionPage;
