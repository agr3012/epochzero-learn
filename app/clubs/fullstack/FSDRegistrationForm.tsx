'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  clubId: string;
  clubName: string;
}

const PROGRAMS = [
  'B.Tech. (CSE)',
  'M.Tech. (CS)',
  'M.Tech. (DSML)',
  'M.Sc. (CSDF)',
  'PGD (CSDF)',
];

function getSemesters(program: string): string[] {
  if (program === 'B.Tech. (CSE)')
    return ['1st','2nd','3rd','4th','5th','6th','7th','8th'].map(s => s + ' Semester');
  if (program === 'PGD (CSDF)')
    return ['1st Semester', '2nd Semester'];
  if (program)
    return ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester'];
  return [];
}

const INTERESTS = [
  { value: 'hackathon',  label: 'Participating in rapid-prototyping Hackathons'                          },
  { value: 'frontend',   label: 'Mastering Frontend frameworks (React, Next.js, or Vue)'                 },
  { value: 'backend',    label: 'Building robust Backend APIs and Microservices (Node.js, Django, or Go)'},
  { value: 'database',   label: 'Database design and management (PostgreSQL, MongoDB, or Redis)'          },
  { value: 'devops',     label: 'DevOps, Containerisation (Docker/Kubernetes), and Cloud Deployment'     },
  { value: 'uiux',       label: 'Implementing UI/UX design principles and Responsive Web Design'         },
  { value: 'security',   label: 'Secure coding practices and web application security'                   },
];

const SKILL_AREAS = [
  { key: 'skill_cpp',      label: 'Frontend (HTML/CSS/React)'          },
  { key: 'skill_python',   label: 'Backend (Node.js/Python/PHP)'       },
  { key: 'skill_os',       label: 'Databases (SQL/NoSQL)'              },
  { key: 'skill_assembly', label: 'Cloud/DevOps (Git/Docker/AWS)'      },
];

const VALID_DOMAINS = ['student.rru.ac.in', 'rru.ac.in'];

function validateRRUEmail(email: string): string | null {
  const t = email.trim().toLowerCase();
  if (!t.includes('@')) return 'Enter a valid email address.';
  const domain = t.split('@')[1];
  if (!VALID_DOMAINS.includes(domain))
    return 'Only RRU email addresses accepted (@student.rru.ac.in or @rru.ac.in).';
  return null;
}

export function FSDRegistrationForm({ clubId }: Props) {
  const supabase = createClient();

  const [form, setForm] = useState({
    full_name: '', student_id: '', program: '', semester: '',
    email: '', whatsapp: '', ctf_participation: '',
    skill_cpp: 0, skill_python: 0, skill_os: 0, skill_assembly: 0,
    interests: [] as string[], statement: '', declaration_agreed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const set = (key: string, value: any) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const toggleInterest = (value: string) =>
    setForm(p => ({
      ...p,
      interests: p.interests.includes(value)
        ? p.interests.filter(i => i !== value)
        : [...p.interests, value],
    }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim())      e.full_name         = 'Required.';
    if (!form.student_id.trim())     e.student_id        = 'Required.';
    if (!form.program)               e.program           = 'Select your program.';
    if (!form.semester)              e.semester          = 'Select your semester.';
    if (!form.whatsapp.trim())       e.whatsapp          = 'Required.';
    if (!form.ctf_participation)     e.ctf_participation = 'Please select one.';
    if (form.interests.length === 0) e.interests         = 'Select at least one.';
    if (!form.statement.trim())      e.statement         = 'Required.';
    if (!form.declaration_agreed)    e.declaration       = 'You must agree to continue.';
    const emailErr = validateRRUEmail(form.email);
    if (emailErr) e.email = emailErr;
    SKILL_AREAS.forEach(({ key }) => {
      if ((form as any)[key] === 0) e[key] = 'Rate 1-5.';
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
      club_id: clubId,
      full_name: form.full_name.trim(),
      student_id: form.student_id.trim(),
      program: form.program,
      semester: form.semester,
      email: form.email.trim().toLowerCase(),
      whatsapp: form.whatsapp.trim(),
      ctf_participation: form.ctf_participation,
      skill_cpp: form.skill_cpp,
      skill_python: form.skill_python,
      skill_os: form.skill_os,
      skill_assembly: form.skill_assembly,
      interests: form.interests,
      statement: form.statement.trim(),
      declaration_agreed: form.declaration_agreed,
      status: 'pending',
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
        <h3 className="font-mono text-2xl font-bold text-bone-50 mb-3">Registration submitted</h3>
        <p className="font-serif text-bone-200 leading-relaxed">
          Your application to the Full Stack Development Club has been received. The club mentor will
          review your registration and notify you at your RRU email address.
        </p>
        <p className="font-mono text-xs text-bone-400 mt-6 uppercase tracking-wider">
          Build. Deploy. Scale.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>

      {/* Part 1 */}
      <div>
        <h3 className={partHeading}>Part 1 — Student Information</h3>
        <div className={twoCol}>
          <Field label="Full Name" error={errors.full_name} required>
            <input type="text" value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              placeholder="e.g. Ms. A***** G*****"
              className={ic(errors.full_name)} />
          </Field>
          <Field label="Student ID / Roll Number" error={errors.student_id} required>
            <input type="text" value={form.student_id}
              onChange={e => set('student_id', e.target.value)}
              placeholder="e.g. 25msc*****"
              className={ic(errors.student_id)} />
          </Field>
        </div>
        <div className={twoCol}>
          <Field label="Program / Degree" error={errors.program} required>
            <select value={form.program}
              onChange={e => { set('program', e.target.value); set('semester', ''); }}
              className={ic(errors.program)}>
              <option value="">Select program...</option>
              {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Current Semester" error={errors.semester} required>
            <select value={form.semester}
              onChange={e => set('semester', e.target.value)}
              className={ic(errors.semester)}
              disabled={!form.program}>
              <option value="">{form.program ? 'Select semester...' : 'Select program first'}</option>
              {getSemesters(form.program).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className={twoCol}>
          <Field label="University Email Address" error={errors.email} required>
            <input type="email" value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="25msc*****@student.rru.ac.in (@student.rru.ac.in only)"
              className={ic(errors.email)} />
          </Field>
          <Field label="Contact Number (WhatsApp)" error={errors.whatsapp} required>
            <input type="tel" value={form.whatsapp}
              onChange={e => set('whatsapp', e.target.value)}
              placeholder="+91 98***-*****"
              className={ic(errors.whatsapp)} />
          </Field>
        </div>
      </div>

      {/* Part 2 */}
      <div>
        <h3 className={partHeading}>Part 2 — Technical Background & Experience</h3>
        <div className={twoCol}>
          <Field label="Have you participated in any previous Hackathons?" error={errors.ctf_participation} required>
            <div className="space-y-2 pt-1">
              {[
                { value: 'yes_once',     label: 'Yes, once'          },
                { value: 'yes_multiple', label: 'Yes, multiple times' },
                { value: 'no',           label: 'No'                  },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${
                      form.ctf_participation === opt.value
                        ? 'border-gold-500 bg-gold-500'
                        : 'border-navy-600 group-hover:border-gold-500/60'
                    }`}
                    onClick={() => set('ctf_participation', opt.value)}
                  >
                    {form.ctf_participation === opt.value && <div className="w-2 h-2 bg-navy-900" />}
                  </div>
                  <span className="font-mono text-sm text-bone-200 cursor-pointer"
                    onClick={() => set('ctf_participation', opt.value)}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Areas of interest (check all that apply)" error={errors.interests} required>
            <div className="space-y-2 pt-1">
              {INTERESTS.map(opt => (
                <label key={opt.value} className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      form.interests.includes(opt.value)
                        ? 'border-gold-500 bg-gold-500'
                        : 'border-navy-600 group-hover:border-gold-500/60'
                    }`}
                    onClick={() => toggleInterest(opt.value)}
                  >
                    {form.interests.includes(opt.value) && <div className="w-2 h-2 bg-navy-900" />}
                  </div>
                  <span className="font-mono text-sm text-bone-200 cursor-pointer leading-tight"
                    onClick={() => toggleInterest(opt.value)}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </Field>
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-bone-300 block mb-4">
            Proficiency ratings <span className="text-bone-400">(1 = Beginner, 5 = Advanced)</span>
            <span className="text-gold-500 ml-1">*</span>
          </label>
          <div className={twoCol}>
            {SKILL_AREAS.map(({ key, label }) => (
              <div key={key}>
                <div className="font-mono text-sm text-bone-200 mb-2">{label}</div>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => set(key, n)}
                      className={`w-10 h-10 border font-mono text-sm transition-colors ${
                        (form as any)[key] === n
                          ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                          : 'border-navy-600 text-bone-400 hover:border-gold-500/40'
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
                {errors[key] && <p className="font-mono text-xs text-red-400 mt-1">{errors[key]}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Part 3 */}
      <div>
        <h3 className={partHeading}>Part 3 — Statement of Interest</h3>
        <Field
          label="Why do you want to join the Full Stack Development Club and what do you hope to achieve?"
          error={errors.statement} required>
          <textarea value={form.statement}
            onChange={e => set('statement', e.target.value)}
            rows={5}
            placeholder="Describe your motivation, goals, and what you can contribute to the club..."
            className={`${ic(errors.statement)} resize-none`} />
        </Field>
      </div>

      {/* Part 4 */}
      <div>
        <h3 className={partHeading}>Part 4 — Declaration</h3>
        <div className="p-6 border border-navy-700 bg-navy-900/50 mb-4">
          <p className="font-serif text-sm text-bone-200 leading-relaxed">
            By joining the Full Stack Development Club, I agree to adhere to the professional and
            ethical guidelines set forth by SITAICS and RRU. I understand that all club-developed
            tools, projects, and data handling must follow secure coding practices and privacy standards.
          </p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            className={`w-4 h-4 border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
              form.declaration_agreed
                ? 'border-gold-500 bg-gold-500'
                : errors.declaration ? 'border-red-500' : 'border-navy-600 group-hover:border-gold-500/60'
            }`}
            onClick={() => set('declaration_agreed', !form.declaration_agreed)}
          >
            {form.declaration_agreed && <div className="w-2 h-2 bg-navy-900" />}
          </div>
          <span className="font-mono text-sm text-bone-200 cursor-pointer"
            onClick={() => set('declaration_agreed', !form.declaration_agreed)}>
            I agree to the declaration above
            <span className="text-gold-500 ml-1">*</span>
          </span>
        </label>
        {errors.declaration && <p className="font-mono text-xs text-red-400 mt-2">{errors.declaration}</p>}
      </div>

      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 border border-red-500/40 bg-red-500/5">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="font-mono text-sm text-red-400">{serverError}</p>
        </div>
      )}

      <button type="submit" disabled={status === 'loading'}
        className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
        {status === 'loading'
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
          : <><Shield className="w-4 h-4" /> Submit Registration</>
        }
      </button>
    </form>
  );
}

const partHeading = 'font-mono text-sm uppercase tracking-[0.2em] text-gold-500 mb-6 pb-3 border-b border-navy-700';
const twoCol = 'grid sm:grid-cols-2 gap-6 mb-6';

function ic(error?: string) {
  return `w-full bg-navy-950 border ${
    error ? 'border-red-500' : 'border-navy-700 focus:border-gold-500'
  } px-4 py-3 font-mono text-sm text-bone-100 placeholder-bone-500 outline-none transition-colors`;
}

function Field({ label, error, hint, required, children }: {
  label: string; error?: string; hint?: string;
  required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-mono text-xs uppercase tracking-wider text-bone-300 block mb-2">
        {label}{required && <span className="text-gold-500 ml-1">*</span>}
      </label>
      {hint && <p className="font-mono text-[11px] text-bone-400 mb-2">{hint}</p>}
      {children}
      {error && <p className="font-mono text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
