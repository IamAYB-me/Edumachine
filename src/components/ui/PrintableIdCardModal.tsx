import React from 'react';
import { X, Printer, Mail, Phone, MapPin, Building2, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils';
import type { School } from '@/store/useDataStore';

type PrintableIdCardModalProps = {
  open: boolean;
  onClose: () => void;
  schoolProfile: School;
  fullName: string;
  roleLabel: string;
  identifier: string;
  email?: string;
  phone?: string;
  address?: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  status?: string;
  avatarUrl?: string;
  accentClassName?: string;
};

export function PrintableIdCardModal({
  open,
  onClose,
  schoolProfile,
  fullName,
  roleLabel,
  identifier,
  email,
  phone,
  address,
  secondaryLabel,
  secondaryValue,
  status,
  avatarUrl,
  accentClassName = 'from-blue-600 to-indigo-600',
}: PrintableIdCardModalProps) {
  if (!open) return null;

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fullName
  )}&size=256&background=2563eb&color=fff&bold=true`;
  const issuedOn = new Date().toLocaleDateString();
  const validUntil = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString();
  const schoolLevel = schoolProfile.portalLevel || 'Secondary';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md print:bg-white print:p-0"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl print:max-w-none print:rounded-none print:shadow-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Printable ID Card</h2>
            <p className="text-sm text-slate-500">Preview the school-branded identification card before printing.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <Printer className="h-4 w-4" />
              Print ID Card
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex justify-center bg-slate-100 p-8 print:bg-white print:p-0">
          <div className="grid w-full max-w-[940px] gap-6 md:grid-cols-2 print:max-w-none print:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl print:rounded-[1.5rem] print:shadow-none">
              <div className={cn('relative overflow-hidden rounded-t-[2rem] bg-gradient-to-r px-6 py-6 text-white print:rounded-t-[1.5rem]', accentClassName)}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_35%)]" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    {schoolProfile.logoUrl ? (
                      <img
                        src={schoolProfile.logoUrl}
                        alt={`${schoolProfile.name} logo`}
                        className="h-16 w-16 rounded-2xl border border-white/20 object-cover shadow-lg"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-black">
                        {(schoolProfile.name || 'S').slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/80">Official ID Card</p>
                      <h3 className="truncate text-xl font-black uppercase tracking-tight">{schoolProfile.name}</h3>
                      <p className="mt-1 text-xs font-medium text-white/80">{schoolProfile.code || 'School Profile'} • {schoolLevel}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">Issued</p>
                    <p className="mt-1 text-xs font-bold">{issuedOn}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img
                      src={avatarUrl || fallbackAvatar}
                      alt={fullName}
                      className="h-28 w-28 rounded-[1.4rem] border border-slate-200 object-cover shadow-sm"
                    />
                    <div className="absolute -bottom-2 -right-2 rounded-full bg-emerald-500 p-2 text-white shadow-lg">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">{roleLabel}</p>
                    <h4 className="mt-1 text-[1.65rem] font-black tracking-tight text-slate-900">{fullName}</h4>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
                        {identifier}
                      </p>
                      {status ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                          {status}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Role</p>
                      <p className="mt-2 text-sm font-bold text-slate-900">{roleLabel}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Institution</p>
                      <p className="mt-2 text-sm font-bold text-slate-900">{schoolLevel}</p>
                    </div>
                  </div>
                  {secondaryLabel && secondaryValue ? (
                    <div className="rounded-2xl bg-white/80 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{secondaryLabel}</p>
                      <p className="mt-2 text-sm font-bold text-slate-900">{secondaryValue}</p>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  {email ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{email}</span>
                    </div>
                  ) : null}
                  {phone ? (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{phone}</span>
                    </div>
                  ) : null}
                  {(address || schoolProfile.address) ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                      <span>{address || schoolProfile.address}</span>
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-4 border-t border-slate-200 pt-5">
                  <div>
                    <div className="flex h-12 items-end justify-center rounded-xl border-b border-dashed border-slate-300 bg-slate-50">
                      {schoolProfile.principalSignatureUrl ? (
                        <img
                          src={schoolProfile.principalSignatureUrl}
                          alt="Principal signature"
                          className="max-h-10 object-contain"
                        />
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Authorized By</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {schoolProfile.principalSignatoryName || 'Principal Signatory'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-end">
                    <div className="grid grid-cols-6 gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      {Array.from({ length: 24 }).map((_, index) => (
                        <span key={index} className={cn("h-2 w-2 rounded-sm", index % 3 === 0 ? "bg-slate-900" : "bg-slate-300")} />
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Scan / Verify</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl print:rounded-[1.5rem] print:shadow-none">
              <div className="border-b border-slate-200 bg-slate-900 px-6 py-5 text-white">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70">Card Reverse</p>
                <h4 className="mt-2 text-lg font-black uppercase tracking-tight">Identity & Validation</h4>
              </div>
              <div className="space-y-5 p-6">
                <div className="rounded-[1.5rem] bg-slate-50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">School Contact</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    {(schoolProfile.address || address) ? (
                      <div className="flex items-start gap-3">
                        <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
                        <span>{schoolProfile.address || address}</span>
                      </div>
                    ) : null}
                    {schoolProfile.phone ? (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{schoolProfile.phone}</span>
                      </div>
                    ) : null}
                    {schoolProfile.email ? (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{schoolProfile.email}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Issued On</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{issuedOn}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Valid Until</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{validUntil}</p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Usage Notice</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    <li>This card remains the property of {schoolProfile.name || 'the school'}.</li>
                    <li>It must be presented on request for access, verification, exams, and library or hostel services.</li>
                    <li>If found, return to the school administration immediately.</li>
                  </ul>
                </div>

                <div className="rounded-[1.5rem] bg-slate-900 px-5 py-6 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/60">Verification Band</p>
                  <div className="mt-4 flex items-end gap-1">
                    {Array.from({ length: 28 }).map((_, index) => (
                      <span
                        key={index}
                        className="w-2 rounded-sm bg-white"
                        style={{ height: `${12 + ((index % 5) * 6)}px`, opacity: index % 4 === 0 ? 1 : 0.82 }}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-white/70">{identifier} • {schoolProfile.code || 'EDU-ID'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
