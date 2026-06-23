// app/clubs/fullstack/FSDRegistrationForm.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const COLOR = '#1B5FA8';

const PROGRAMS = ['B.Tech. (CSE)','M.Tech. (CS)','M.Tech. (DSML)','M.Sc. (CSDF)','PGD (CSDF)'];

function getSemesters(p: string) {
  if (p === 'B.Tech. (CSE)') return ['1st','2nd','3rd','4th','5th','6th','7th','8th'].map(s => s + ' Semester');
  if (p === 'PGD (CSDF)')    return ['1st Semester','2nd Semester'];
  if (p)                      return ['1st Semester','2nd Semester','3rd Semester','4th Semester'];
  return [];
}

const INTERESTS = [
  { value: 'hackathon', label: 'Participating in rapid-prototyping Hackathons' },
  { value: 'frontend',  label: 'Mastering Frontend frameworks (React, Next.js, or Vue)' },
  { value: 'backend',   label: 'Building robust Backend APIs and Microservices' },
  { value: 'database',  label: 'Database design and management (PostgreSQL, MongoDB)' },
  { value: 'devops',    label: 'DevOps, Containerisation (Docker/Kubernetes), and Cloud Deployment' },
  { value: 'uiux',      label: 'Implementing UI/UX design principles and Responsive Web Design' },
  { value: 'security',  label: 'Secure coding practices and web application security' },
];

const SKILLS = [
  { key: 'skill_cpp',      label: 'Frontend (HTML/CSS/React)' },
  { key: 'skill_python',   label: 'Backend (Node.js/Python/PHP)' },
  { key: 'skill_os',       label: 'Databases (SQL/NoSQL)' },
  { key: 'skill_assembly', label: 'Cloud/DevOps (Git/Docker/AWS)' },
];

function validateRRUEmail(email: string) {
  const d = email.trim().toLowerCase().split('@')[1];
  if (!['student.rru.ac.in','rru.ac.in'].includes(d))
    return 'Only RRU emails accepted (@student.rru.ac.in or @rru.ac.in).';
  return null;
}

export function FSDRegistrationForm({ clubId }: { clubId: string; clubName: string }) {
  const supabase = createClient();
  const [form, setForm] = useState({
    full_name: '', student_id: '', program: '', semester: '', email: '', whatsapp: '',
    ctf_participation: '', skill_cpp: 0, skill_python: 0, skill_os: 0, skill_assembly: 0,
    interests: [] as string[], statement: '', declaration_agreed: false,
  });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [serverError, setServerError] = useState('');

  const set = (k: string, v: any) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };
  const toggleInt = (v: string) => setForm(p => ({ ...p, interests: p.interests.includes(v) ? p.interests.filter(i => i !== v) : [...p.interests, v] }));

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.full_name.trim())      e.full_name         = 'Required.';
    if (!form.student_id.trim())     e.student_id        = 'Required.';
    if (!form.program)               e.program           = 'Select your program.';
    if (!form.semester)              e.semester          = 'Select your semester.';
    if (!form.whatsapp.trim())       e.whatsapp          = 'Required.';
    if (!form.ctf_participation)     e.ctf_participation = 'Please select one.';
    if (form.interests.length === 0) e.interests         = 'Select at least one.';
    if (!form.statement.trim())      e.statement         = 'Required.';
    if (!form.declaration_agreed)    e.declaration       = 'You must agree.';
    const ee = validateRRUEmail(form.email); if (ee) e.email = ee;
    SKILLS.forEach(({ key }) => { if ((form as any)[key] === 0) e[key] = 'Rate 1-5.'; });
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!validate()) return;
    setStatus('loading'); setServerError('');
    const { error } = await supabase.from('club_registrations').insert({
      club_id: clubId, full_name: form.full_name.trim(), student_id: form.student_id.trim(),
      program: form.program, semester: form.semester, email: form.email.trim().toLowerCase(),
      whatsapp: form.whatsapp.trim(), ctf_participation: form.ctf_participation,
      skill_cpp: form.skill_cpp, skill_python: form.skill_python, skill_os: form.skill_os,
      skill_assembly: form.skill_assembly, interests: form.interests,
      statement: form.statement.trim(), declaration_agreed: form.declaration_agreed, status: 'pending',
    });
    if (error) { setStatus('error'); setServerError('Submission failed. Please try again.'); }
    else setStatus('success');
  };

  if (status === 'success') return (
    <div className="max-w-2xl card p-12 text-center" style={{ borderTop: `3px solid ${COLOR}` }}>
      <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: COLOR }} />
      <h3 className="font-display text-2xl font-bold mb-3" style={{ color: 'hsl(var(--foreground))' }}>Registration submitted</h3>
      <p className="font-serif text-sm leading-relaxed" style={{ color: 'hsl(var(--foreground-muted))' }}>
        Your application to the Full Stack Development Club has been received. The mentor will notify you at your RRU email.
      </p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl" noValidate>

      <PartHeading n={1} title="Student Information" color={COLOR} />
      <div className={twoCol}>
        <Field label="Full Name" error={errors.full_name} required color={COLOR}>
          <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
            placeholder="e.g. Mr. A***** S*****" className={ic(!!errors.full_name)} />
        </Field>
        <Field label="Student ID / Roll Number" error={errors.student_id} required color={COLOR}>
          <input type="text" value={form.student_id} onChange={e => set('student_id', e.target.value)}
            placeholder="e.g. 22bcs*****" className={ic(!!errors.student_id)} />
        </Field>
      </div>
      <div className={twoCol}>
        <Field label="Program / Degree" error={errors.program} required color={COLOR}>
          <select value={form.program} onChange={e => { set('program', e.target.value); set('semester', ''); }} className={ic(!!errors.program)}>
            <option value="">Select program...</option>
            {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Current Semester" error={errors.semester} required color={COLOR}>
          <select value={form.semester} onChange={e => set('semester', e.target.value)}
            className={ic(!!errors.semester)} disabled={!form.program}>
            <option value="">{form.program ? 'Select semester...' : 'Select program first'}</option>
            {getSemesters(form.program).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <div className={twoCol}>
        <Field label="University Email Address" error={errors.email} required color={COLOR}>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="22bcs*****@student.rru.ac.in" className={ic(!!errors.email)} />
        </Field>
        <Field label="Contact Number (WhatsApp)" error={errors.whatsapp} required color={COLOR}>
          <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
            placeholder="+91 98***-*****" className={ic(!!errors.whatsapp)} />
        </Field>
      </div>

      <PartHeading n={2} title="Technical Background & Experience" color={COLOR} />
      <div className={twoCol}>
        <Field label="Have you participated in any previous Hackathons?" error={errors.ctf_participation} required color={COLOR}>
          <div className="space-y-2.5 pt-1">
            {[{ v:'yes_once',label:'Yes, once' },{ v:'yes_multiple',label:'Yes, multiple times' },{ v:'no',label:'No' }].map(o => (
              <CustomRadio key={o.v} checked={form.ctf_participation === o.v} label={o.label} color={COLOR}
                onClick={() => set('ctf_participation', o.v)} />
            ))}
          </div>
        </Field>
        <Field label="Areas of interest (check all that apply)" error={errors.interests} required color={COLOR}>
          <div className="space-y-2.5 pt-1">
            {INTERESTS.map(o => (
              <CustomCheckbox key={o.value} checked={form.interests.includes(o.value)} label={o.label} color={COLOR}
                onClick={() => toggleInt(o.value)} />
            ))}
          </div>
        </Field>
      </div>

      <div>
        <p className="font-sans text-xs font-semibold uppercase tracking-wide mb-5"
          style={{ color: 'hsl(var(--foreground-muted))' }}>
          Proficiency ratings <span className="font-normal" style={{ color: 'hsl(var(--foreground-subtle))' }}>(1 = Beginner · 5 = Advanced)</span>
          <span className="ml-1" style={{ color: COLOR }}>*</span>
        </p>
        <div className={twoCol}>
          {SKILLS.map(({ key, label }) => (
            <div key={key}>
              <div className="font-sans text-sm mb-2.5" style={{ color: 'hsl(var(--foreground))' }}>{label}</div>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => set(key, n)}
                    className="w-10 h-10 rounded-lg font-sans font-semibold text-sm transition-all"
                    style={(form as any)[key] === n
                      ? { background: `${COLOR}18`, color: COLOR, border: `1px solid ${COLOR}60` }
                      : { background: 'hsl(var(--card))', color: 'hsl(var(--foreground-muted))', border: '1px solid hsl(var(--border))' }}>
                    {n}
                  </button>
                ))}
              </div>
              {errors[key] && <p className="text-xs mt-1 text-red-500">{errors[key]}</p>}
            </div>
          ))}
        </div>
      </div>

      <PartHeading n={3} title="Statement of Interest" color={COLOR} />
      <Field label="Why do you want to join the Full Stack Dev Club and what do you hope to achieve?" error={errors.statement} required color={COLOR}>
        <textarea value={form.statement} onChange={e => set('statement', e.target.value)}
          rows={5} placeholder="Describe your motivation and what you can contribute..."
          className={`${ic(!!errors.statement)} resize-none`} />
      </Field>

      <PartHeading n={4} title="Declaration" color={COLOR} />
      <div className="card p-5 mb-4">
        <p className="font-serif text-sm leading-relaxed" style={{ color: 'hsl(var(--foreground-muted))' }}>
          By joining the Full Stack Dev Club, I agree to adhere to the ethical guidelines set forth by SITAICS and RRU. I understand that the tools and techniques discussed are following secure coding practices and privacy standards.
        </p>
      </div>
      <CustomCheckbox checked={form.declaration_agreed} color={COLOR}
        label="I agree to the declaration above *"
        onClick={() => set('declaration_agreed', !form.declaration_agreed)} />
      {errors.declaration && <p className="text-xs mt-1 text-red-500">{errors.declaration}</p>}

      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-500">{serverError}</p>
        </div>
      )}

      <button type="submit" disabled={status === 'loading'} className="btn-primary disabled:opacity-60">
        {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Shield className="w-4 h-4" /> Submit Registration</>}
      </button>
    </form>
  );
}

// ── Micro components ───────────────────────────────────────────────────────

function PartHeading({ n, title, color }: { n: number; title: string; color: string }) {
  return (
    <div className="pb-3" style={{ borderBottom: `1px solid hsl(var(--border))` }}>
      <span className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color }}>
        Part {n} — {title}
      </span>
    </div>
  );
}

function Field({ label, error, required, color, children }: {
  label: string; error?: string; required?: boolean; color: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-2"
        style={{ color: 'hsl(var(--foreground-muted))' }}>
        {label}{required && <span className="ml-1" style={{ color }}>*</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  );
}

function CustomCheckbox({ checked, label, color, onClick }: { checked: boolean; label: string; color: string; onClick: () => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer" onClick={onClick}>
      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors"
        style={checked
          ? { background: color, border: `1px solid ${color}` }
          : { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
        {checked && <div className="w-2 h-2 rounded-sm" style={{ background: 'white' }} />}
      </div>
      <span className="font-sans text-sm leading-tight" style={{ color: 'hsl(var(--foreground))' }}>{label}</span>
    </label>
  );
}

function CustomRadio({ checked, label, color, onClick }: { checked: boolean; label: string; color: string; onClick: () => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer" onClick={onClick}>
      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors"
        style={checked
          ? { background: color, border: `1px solid ${color}` }
          : { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
        {checked && <div className="w-2 h-2 rounded-full" style={{ background: 'white' }} />}
      </div>
      <span className="font-sans text-sm" style={{ color: 'hsl(var(--foreground))' }}>{label}</span>
    </label>
  );
}

function ic(err: boolean) {
  return `input-base ${err ? 'border-red-500 focus:border-red-500' : ''}`;
}

const twoCol = 'grid sm:grid-cols-2 gap-6';
