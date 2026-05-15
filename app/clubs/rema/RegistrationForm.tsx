'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  clubId: string;
  clubName: string;
}

const INTERESTS = [
  { value: 'ctf',    label: 'Participating in Capture The Flag (CTF) competitions'       },
  { value: 'malware',label: 'Learning static and dynamic malware analysis'                },
  { value: 'yara',   label: 'Writing YARA and Sigma detection rules'                      },
  { value: 'tools',  label: 'Tool development and scripting for automation'               },
  { value: 'osint',  label: 'Open-Source Intelligence (OSINT) for threat hunting'         },
  { value: 'ml',     label: 'Applying Machine Learning for polymorphic malware detection' },
];

const SKILL_AREAS = [
  { key: 'skill_cpp',      label: 'C/C++ Programming'                        },
  { key: 'skill_python',   label: 'Python Scripting'                         },
  { key: 'skill_os',       label: 'Operating System Internals (Windows/Linux)'},
  { key: 'skill_assembly', label: 'Assembly Language (x86/x64)'              },
];

const VALID_DOMAINS = ['student.rru.ac.in', 'rru.ac.in'];

function validateRRUEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed.includes('@')) return 'Enter a valid email address.';
  const domain = trimmed.split('@')[1];
  if (!VALID_DOMAINS.includes(domain)) {
    return `Only RRU email addresses are accepted (@student.rru.ac.in or @rru.ac.in).`;
  }
  return null;
}

export function ClubRegistrationForm({ clubId, clubName }: Props) {
  const supabase = createClient();

  const [form, setForm] = useState({
    full_name:          '',
    student_id:         '',
    program:            '',
    semester:           '',
    email:              '',
    whatsapp:           '',
    ctf_participation:  '',
    skill_cpp:          0,
    skill_python:       0,
    skill_os:           0,
    skill_assembly:     0,
    interests:          [] as string[],
    statement:          '',
    declaration_agreed: false,
  });

  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const set = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const toggleInterest = (value: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter((i) => i !== value)
        : [...prev.interests, value],
    }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.full_name.trim())       e.full_name      = 'Full name is required.';
    if (!form.student_id.trim())      e.student_id     = 'Student ID / Roll number is required.';
    if (!form.program.trim())         e.program        = 'Program / Degree is required.';
    if (!form.semester.trim())        e.semester       = 'Current semester is required.';
    if (!form.whatsapp.trim())        e.whatsapp       = 'WhatsApp number is required.';
    if (!form.ctf_participation)      e.ctf_participation = 'Please select an option.';
    if (form.interests.length === 0)  e.interests      = 'Select at least one area of interest.';
    if (!form.statement.trim())       e.statement      = 'Statement of interest is required.';
    if (!form.declaration_agreed)     e.declaration    = 'You must agree to the declaration to register.';

    const emailErr = validateRRUEmail(form.email);
    if (emailErr) e.email = emailErr;

    // Skill validation
    SKILL_AREAS.forEach(({ key }) => {
      if ((form as any)[key] === 0) e[key] = 'Rate your proficiency (1-5).';
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    setServerError('');

    const { error } = await supabase.from('club_registrations').insert({
      club_id:            clubId,
      full_name:          form.full_name.trim(),
      student_id:         form.student_id.trim(),
      program:            form.program.trim(),
      semester:           form.semester.trim(),
      email:              form.email.trim().toLowerCase(),
      whatsapp:           form.whatsapp.trim(),
      ctf_participation:  form.ctf_participation,
      skill_cpp:          form.skill_cpp,
      skill_python:       form.skill_python,
      skill_os:           form.skill_os,
      skill_assembly:     form.skill_assembly,
      interests:          form.interests,
      statement:          form.statement.trim(),
      declaration_agreed: form.declaration_agreed,
      status:             'pending',
    });

    if (error) {
      setStatus('error');
      setServerError('Submission failed. Please try again or contact the club mentor.');
    } else {
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-2xl card-forensic p-12 text-center border-gold-500/30">
        <CheckCircle className="w-12 h-12 text-gold-500 mx-auto mb-4" />
        <h3 className="font-mono text-2xl font-bold text-bone-50 mb-3">
          Registration submitted
        </h3>
        <p className="font-serif text-bone-200 leading-relaxed">
          Your application to the REMA Club has been received. The club mentor will
          review your registration and notify you at your RRU email address.
        </p>
        <p className="font-mono text-xs text-bone-400 mt-6 uppercase tracking-wider">
          Reverse. Reveal. Respond.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-10" noValidate>

      {/* Part 1: Student Information */}
      <div>
        <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-gold-500 mb-6 pb-3 border-b border-navy-700">
          Part 1 — Student Information
        </h3>
        <div className="space-y-4">

          <Field label="Full Name" error={errors.full_name} required>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)}
              placeholder="e.g. Mr. Arjun Sharma"
              className={inputCls(errors.full_name)}
            />
          </Field>

          <Field label="Student ID / Roll Number" error={errors.student_id} required>
            <input
              type="text"
              value={form.student_id}
              onChange={(e) => set('student_id', e.target.value)}
              placeholder="e.g. 22bcscs005"
              className={inputCls(errors.student_id)}
            />
          </Field>

          <Field label="Program / Degree" error={errors.program} required>
            <input
              type="text"
              value={form.program}
              onChange={(e) => set('program', e.target.value)}
              placeholder="e.g. B.Tech (CSE), M.Tech (Cyber Security), M.Sc. (CSDF)"
              className={inputCls(errors.program)}
            />
          </Field>

          <Field label="Current Semester" error={errors.semester} required>
            <input
              type="text"
              value={form.semester}
              onChange={(e) => set('semester', e.target.value)}
              placeholder="e.g. 3rd Semester"
              className={inputCls(errors.semester)}
            />
          </Field>

          <Field
            label="University Email Address"
            error={errors.email}
            required
            hint="Must be your official RRU email (@student.rru.ac.in or @rru.ac.in)"
          >
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="22bcscs005@student.rru.ac.in"
              className={inputCls(errors.email)}
            />
          </Field>

          <Field label="Contact Number (WhatsApp)" error={errors.whatsapp} required>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => set('whatsapp', e.target.value)}
              placeholder="+91 98765 43210"
              className={inputCls(errors.whatsapp)}
            />
          </Field>
        </div>
      </div>

      {/* Part 2: Technical Background */}
      <div>
        <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-gold-500 mb-6 pb-3 border-b border-navy-700">
          Part 2 — Technical Background & Experience
        </h3>
        <div className="space-y-6">

          {/* CTF participation */}
          <Field label="Have you participated in any of the previous REMA CTFs?" error={errors.ctf_participation} required>
            <div className="space-y-2">
              {[
                { value: 'yes_once',     label: 'Yes, once'         },
                { value: 'yes_multiple', label: 'Yes, multiple times'},
                { value: 'no',           label: 'No'                },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${
                      form.ctf_participation === opt.value
                        ? 'border-gold-500 bg-gold-500'
                        : 'border-navy-600 group-hover:border-gold-500/60'
                    }`}
                    onClick={() => set('ctf_participation', opt.value)}
                  >
                    {form.ctf_participation === opt.value && (
                      <div className="w-2 h-2 bg-navy-900" />
                    )}
                  </div>
                  <span
                    className="font-mono text-sm text-bone-200 cursor-pointer"
                    onClick={() => set('ctf_participation', opt.value)}
                  >
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </Field>

          {/* Skill ratings */}
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-bone-300 block mb-4">
              Rate your proficiency{' '}
              <span className="text-bone-400">(1 = Beginner, 5 = Advanced)</span>
              <span className="text-gold-500 ml-1">*</span>
            </label>
            <div className="space-y-4">
              {SKILL_AREAS.map(({ key, label }) => (
                <div key={key}>
                  <div className="font-mono text-sm text-bone-200 mb-2">{label}</div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set(key, n)}
                        className={`w-10 h-10 border font-mono text-sm transition-colors ${
                          (form as any)[key] === n
                            ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                            : 'border-navy-600 text-bone-400 hover:border-gold-500/40 hover:text-bone-200'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  {errors[key] && (
                    <p className="font-mono text-xs text-red-400 mt-1">{errors[key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interests */}
          <Field label="Areas of interest (check all that apply)" error={errors.interests} required>
            <div className="space-y-2">
              {INTERESTS.map((opt) => (
                <label key={opt.value} className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      form.interests.includes(opt.value)
                        ? 'border-gold-500 bg-gold-500'
                        : 'border-navy-600 group-hover:border-gold-500/60'
                    }`}
                    onClick={() => toggleInterest(opt.value)}
                  >
                    {form.interests.includes(opt.value) && (
                      <div className="w-2 h-2 bg-navy-900" />
                    )}
                  </div>
                  <span
                    className="font-mono text-sm text-bone-200 cursor-pointer leading-tight"
                    onClick={() => toggleInterest(opt.value)}
                  >
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </Field>
        </div>
      </div>

      {/* Part 3: Statement */}
      <div>
        <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-gold-500 mb-6 pb-3 border-b border-navy-700">
          Part 3 — Statement of Interest
        </h3>
        <Field
          label="Briefly tell us why you want to join the REMA club and what you hope to achieve"
          error={errors.statement}
          required
        >
          <textarea
            value={form.statement}
            onChange={(e) => set('statement', e.target.value)}
            rows={5}
            placeholder="Describe your motivation, goals, and what you can contribute to the club..."
            className={`${inputCls(errors.statement)} resize-none`}
          />
        </Field>
      </div>

      {/* Part 4: Declaration */}
      <div>
        <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-gold-500 mb-6 pb-3 border-b border-navy-700">
          Part 4 — Declaration
        </h3>
        <div className="p-6 border border-navy-700 bg-navy-900/50 mb-4">
          <p className="font-serif text-sm text-bone-200 leading-relaxed">
            By joining the REMA Club, I agree to adhere to the ethical guidelines set
            forth by SITAICS and RRU. I understand that the tools and techniques discussed
            are for educational and defensive purposes only.
          </p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            className={`w-4 h-4 border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
              form.declaration_agreed
                ? 'border-gold-500 bg-gold-500'
                : errors.declaration
                ? 'border-red-500'
                : 'border-navy-600 group-hover:border-gold-500/60'
            }`}
            onClick={() => set('declaration_agreed', !form.declaration_agreed)}
          >
            {form.declaration_agreed && <div className="w-2 h-2 bg-navy-900" />}
          </div>
          <span
            className="font-mono text-sm text-bone-200 cursor-pointer"
            onClick={() => set('declaration_agreed', !form.declaration_agreed)}
          >
            I agree to the declaration above
            <span className="text-gold-500 ml-1">*</span>
          </span>
        </label>
        {errors.declaration && (
          <p className="font-mono text-xs text-red-400 mt-2">{errors.declaration}</p>
        )}
      </div>

      {/* Server error */}
      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 border border-red-500/40 bg-red-500/5">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="font-mono text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4" />
            Submit Registration
          </>
        )}
      </button>
    </form>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function inputCls(error?: string) {
  return `w-full bg-navy-950 border ${
    error ? 'border-red-500' : 'border-navy-700 focus:border-gold-500'
  } px-4 py-3 font-mono text-sm text-bone-100 placeholder-bone-500 outline-none transition-colors`;
}

function Field({
  label, error, hint, required, children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-mono text-xs uppercase tracking-wider text-bone-300 block mb-2">
        {label}
        {required && <span className="text-gold-500 ml-1">*</span>}
      </label>
      {hint && (
        <p className="font-mono text-[11px] text-bone-400 mb-2">{hint}</p>
      )}
      {children}
      {error && (
        <p className="font-mono text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
