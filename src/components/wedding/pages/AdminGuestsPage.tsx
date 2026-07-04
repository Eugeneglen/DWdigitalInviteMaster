'use client';

import { useState } from 'react';
import AdminLayout from '@/components/wedding/AdminLayout';

const filterTabs = ['All', 'Attending', 'Declined', 'Pending'] as const;
type FilterTab = (typeof filterTabs)[number];

const guests = [
  {
    name: 'Julianna & Marc Vossen',
    email: 'vossen.estate@example.com',
    relationship: 'The Vossen Estate',
    status: 'Attending' as const,
    dietary: 'Nut allergy (Marc), Pescatarian (Julianna)',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCY_N7aI7O6f3J1Z8u_D5-vE0k3n_1fP4f0-D3_Wz4_z5_O_N_p_f_p_f_p_f',
    inv: 'INV-0042',
    service: 'Plated Dinner',
  },
  {
    name: 'Eleanor Stirling',
    email: 'e.stirling@example.com',
    relationship: 'Stirling Household',
    status: 'Pending' as const,
    dietary: 'No specific requirements noted yet.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_P_N7aI7O6f3J1Z8u_D5-vE0k3n_1fP4f0-D3_Wz4_z5_O_N_p_f_p_f_p_f',
    inv: 'INV-0089',
    service: 'VIP List',
    highlight: true,
  },
  {
    name: 'Alistair Beaumont',
    email: 'beaumont@international.com',
    relationship: 'Beaumont International',
    status: 'Declined' as const,
    dietary: 'N/A - Regrets sent via mail.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_P_N7aI7O6f3J1Z8u_D5-vE0k3n_1fP4f0-D3_Wz4_z5_O_N_p_f_p_f_p_f',
    inv: 'INV-0012',
    service: 'International',
  },
];

function statusBadge(status: string) {
  if (status === 'Attending') {
    return (
      <span className="px-5 py-2 bg-charcoal-ink text-paper-cream text-[9px] uppercase tracking-[0.3em] font-bold">
        Attending
      </span>
    );
  }
  if (status === 'Pending') {
    return (
      <span className="px-5 py-2 bg-cinematic-gold text-charcoal-ink text-[9px] uppercase tracking-[0.3em] font-bold">
        Pending
      </span>
    );
  }
  return (
    <span className="px-5 py-2 bg-charcoal-ink/5 text-charcoal-ink/40 text-[9px] uppercase tracking-[0.3em] font-bold">
      Declined
    </span>
  );
}

export default function AdminGuestsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');

  return (
    <AdminLayout>
      <section className="px-6 md:px-canvas-margin max-w-7xl">
        {/* Header */}
        <div className="mb-16">
          <span className="text-[12px] font-bold uppercase tracking-[0.4em] text-cinematic-gold mb-4 block">
            Curation
          </span>
          <h1 className="text-5xl md:text-8xl italic font-medium leading-tight">
            The Guest Registry
          </h1>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-10 items-end justify-between border-b border-cinematic-gold/10 pb-12 mb-16">
          <div className="w-full md:w-2/3">
            <label className="text-[10px] uppercase tracking-[0.3em] text-charcoal-ink/50 block mb-4">
              Search Directory
            </label>
            <div className="relative">
              <input
                className="w-full bg-transparent border-b-2 border-cinematic-gold/20 focus:border-cinematic-gold outline-none py-4 text-2xl md:text-4xl italic tracking-tight transition-all placeholder:text-cinematic-gold/20"
                placeholder="Search by name or household..."
                type="text"
              />
              <span className="material-symbols-outlined absolute right-0 top-4 text-cinematic-gold text-3xl">
                search
              </span>
            </div>
          </div>
          <div className="flex gap-8 w-full md:w-auto overflow-x-auto no-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-2 py-3 border-b-2 text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${
                  activeFilter === tab
                    ? 'border-cinematic-gold text-charcoal-ink'
                    : 'border-transparent text-charcoal-ink/30 hover:text-charcoal-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: Data Table */}
        <div className="hidden md:block overflow-hidden border border-cinematic-gold/20 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.02)]"
          style={{ backgroundColor: '#F3EFE6' }}
        >
          <table className="w-full text-left">
            <thead
              className="border-b border-cinematic-gold/10"
              style={{ backgroundColor: '#F3EFE6' }}
            >
              <tr>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.25em] text-charcoal-ink/40">
                  Guest Details
                </th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.25em] text-charcoal-ink/40">
                  Relationship
                </th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.25em] text-charcoal-ink/40">
                  Status
                </th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.25em] text-charcoal-ink/40">
                  Dietary Notes
                </th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.25em] text-charcoal-ink/40 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinematic-gold/10">
              {guests.map((guest) => (
                <tr
                  key={guest.name}
                  className="hover:bg-paper-cream/30 transition-colors group"
                >
                  <td className="px-8 py-10">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-cinematic-gold/5 border border-cinematic-gold/20 rounded-full overflow-hidden">
                        <img
                          alt=""
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                          src={guest.avatar}
                        />
                      </div>
                      <div>
                        <div className="text-xl italic font-semibold">{guest.name}</div>
                        <div className="text-[11px] tracking-[0.2em] text-charcoal-ink/40 uppercase mt-1">
                          {guest.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-10 italic text-charcoal-ink/70">
                    {guest.relationship}
                  </td>
                  <td className="px-8 py-10">{statusBadge(guest.status)}</td>
                  <td className="px-8 py-10 text-charcoal-ink/60 max-w-xs text-sm leading-relaxed">
                    {guest.dietary}
                  </td>
                  <td className="px-8 py-10 text-right">
                    <button className="material-symbols-outlined text-cinematic-gold opacity-0 group-hover:opacity-100 transition-opacity">
                      edit_note
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Register New Guest Row */}
          <div className="p-10 text-center border-t border-cinematic-gold/10 hover:bg-paper-cream transition-all cursor-pointer group">
            <div className="flex items-center justify-center gap-6">
              <span className="material-symbols-outlined text-cinematic-gold text-3xl">
                person_add
              </span>
              <span className="text-xl uppercase tracking-[0.4em] font-medium">
                Register New Guest
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-charcoal-ink/30 border-l border-cinematic-gold/20 pl-6 hidden lg:block">
                Manual Entry or CSV Upload
              </span>
            </div>
          </div>
        </div>

        {/* Mobile: Card-Based Layout */}
        <div className="md:hidden space-y-6 pb-20">
          {guests.map((guest) => (
            <div
              key={guest.name}
              className={`${
                guest.highlight
                  ? 'bg-charcoal-ink text-paper-cream'
                  : 'bg-[#F3EFE6]'
              } border border-cinematic-gold/10 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]`}
            >
              <div className="mb-8">
                <h3 className="text-3xl font-semibold mb-1">{guest.name}</h3>
                <p
                  className={`text-[11px] uppercase tracking-[0.25em] ${
                    guest.highlight ? 'text-paper-cream/50' : 'text-charcoal-ink/40'
                  }`}
                >
                  {guest.relationship}
                </p>
              </div>
              {guest.status === 'Declined' && (
                <p
                  className={`text-sm italic mb-8 ${
                    guest.highlight ? 'text-paper-cream/60' : 'text-charcoal-ink/60'
                  }`}
                >
                  {guest.dietary}
                </p>
              )}
              <div
                className={`pt-6 border-t flex justify-between items-center ${
                  guest.highlight ? 'border-cinematic-gold/20' : 'border-cinematic-gold/10'
                }`}
              >
                <span
                  className={`text-[10px] uppercase tracking-[0.2em] ${
                    guest.highlight ? 'text-paper-cream/30' : 'text-charcoal-ink/30'
                  }`}
                >
                  {guest.inv}
                </span>
                <span className="text-[10px] text-cinematic-gold uppercase tracking-[0.2em] font-bold">
                  {guest.service}
                </span>
              </div>
            </div>
          ))}

          {/* Mobile Add Guest */}
          <div className="border-2 border-dashed border-cinematic-gold/30 p-10 flex flex-col items-center justify-center text-center bg-white/50">
            <div className="w-16 h-16 rounded-2xl bg-cinematic-gold/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-cinematic-gold text-4xl">
                person_add
              </span>
            </div>
            <h4 className="text-lg uppercase tracking-[0.3em] font-bold mb-2">
              Register New Guest
            </h4>
            <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal-ink/40">
              Manual Entry or CSV Upload
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-20 mt-20 border-t border-cinematic-gold/10 flex flex-col items-center gap-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal-ink/40 px-6 text-center">
          &copy; 2024 DREAMWEAVERS &bull; EDITORIAL UTILITY FOR THE MODERN HEIRLOOM
        </p>
        <div className="flex gap-12">
          <span
            className="text-[10px] uppercase tracking-[0.3em] text-charcoal-ink/40 opacity-40 cursor-not-allowed"
            aria-disabled="true"
            title="Coming soon"
          >
            Support
          </span>
          <span
            className="text-[10px] uppercase tracking-[0.3em] text-charcoal-ink/40 opacity-40 cursor-not-allowed"
            aria-disabled="true"
            title="Coming soon"
          >
            Privacy
          </span>
          <span
            className="text-[10px] uppercase tracking-[0.3em] text-charcoal-ink/40 opacity-40 cursor-not-allowed"
            aria-disabled="true"
            title="Coming soon"
          >
            Documentation
          </span>
        </div>
      </footer>
    </AdminLayout>
  );
}