'use client';

import { useState } from 'react';
import AdminLayout from '@/components/wedding/AdminLayout';

const moderationTabs = ['ALL MEDIA', 'PENDING', 'HIDDEN'] as const;

const photos = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC04uBxqq_ykKbZ3-gsclFm8eXikW9dxNG1YqzCVEZul4TA_SfA8-5KBmutj4NIex6HAD8AczU_maMqi45HQD-fPdwYC9GEzt4mRwYml3JtiEDCh-v9gMebGcmrliiKOqFdAkERaqg5qARQ8vez35H8LAy9jfMhEfIS_r548vPKdPoGgh2rolNon5zQcoGfcI9hxX2y00Id1h113Hy0IpuJl-z_vHotjTQXbqkASH-gfC5SNVmQY2IeKItfhF0zlmUWgBk4N3zjlwFE',
    uploadedBy: 'Julianne V. \u2022 2m ago',
    status: 'approved' as const,
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYOLHlQLO3ePWXKS_j-PuQhexURKycIoqoaVuHss98mipov4urICFrjndb5KpVa90qz7Pd-_q9LqZjkVjckxkg3oa6SjfoIW9pbZ0aTOCEQbc8XN8T-jZiKvEl9aJWVHGeR3Y1ehw6gMCW3baqLni1xU4Vj8Zg8hmyMTYDbXq3b64RMjkQY755EfJ3uWQLLyJL7g4zSySDlfwryr4cT_JRz5k2GDLevYNE28Nf6Hm1JXviyN8q4TvO8bpW7LgJRSiHCPyekuNHTXJQ',
    uploadedBy: 'Marcus Thorne \u2022 12m ago',
    status: 'pending' as const,
    isNew: true,
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwi4S64Lt1sT05goeeVPIqm-79KKBDrh0JwVjWQbjDBSlDHCKoiDNcfN9kv3WFSv26I7Hlaf9aoDx47AGKZGWE_B52s12DHZcXLKmKUxuwFkMHM5ckgaUH47TLEjYqTpcBSPgoifl8Mm2TbNcTzkkLwYMunK9cfLw9ermY7k78XyFIYXckBJGI5TEV9Fi8aDqhliG7lApJ7IMnx1rXCJ_MwqyDrUvUltFraME4OuyMI0jbFgfy0J1C8nPkN2HAHssOpXcoR8ZG_B4H',
    uploadedBy: 'Elena S. \u2022 1h ago',
    status: 'approved' as const,
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC04uBxqq_ykKbZ3-gsclFm8eXikW9dxNG1YqzCVEZul4TA_SfA8-5KBmutj4NIex6HAD8AczU_maMqi45HQD-fPdwYC9GEzt4mRwYml3JtiEDCh-v9gMebGcmrliiKOqFdAkERaqg5qARQ8vez35H8LAy9jfMhEfIS_r548vPKdPoGgh2rolNon5zQcoGfcI9hxX2y00Id1h113Hy0IpuJl-z_vHotjTQXbqkASH-gfC5SNVmQY2IeKItfhF0zlmUWgBk4N3zjlwFE',
    uploadedBy: 'Professional Team \u2022 2h ago',
    status: 'featured' as const,
  },
];

export default function AdminMediaPage() {
  const [liveStream, setLiveStream] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL MEDIA');

  return (
    <AdminLayout>
      <section className="px-4 md:px-canvas-margin max-w-7xl">
        {/* Hero Stats & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end mb-12">
          <div className="lg:col-span-2">
            <span className="text-[12px] text-cinematic-gold mb-2 block tracking-[0.2em] uppercase font-semibold">
              Curation Engine
            </span>
            <h3 className="text-3xl md:text-5xl mb-4 tracking-tight text-charcoal-ink font-medium">
              Media Management
            </h3>
            <p className="text-lg text-charcoal-ink/80 max-w-2xl italic">
              Oversee the visual narrative of the celebration. Moderate guest uploads in
              real-time or populate the heirloom gallery with professional editorial captures.
            </p>
          </div>
          <div className="bg-champagne-silk p-6 border border-cinematic-gold/10 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-charcoal-ink tracking-[0.1em] uppercase font-semibold">
                LIVE STREAM STATUS
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={liveStream}
                  className="sr-only peer"
                  type="checkbox"
                  onChange={(e) => setLiveStream(e.target.checked)}
                />
                <div className="w-11 h-6 bg-paper-cream/50 rounded-full peer-checked:bg-cinematic-gold relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
            <div className="flex items-center gap-2 text-charcoal-ink/60">
              <span className="material-symbols-outlined text-[16px]">sensors</span>
              <span className="text-[10px] tracking-[0.15em] uppercase">
                {liveStream
                  ? 'BROADCASTING FROM THE MAIN BALLROOM'
                  : 'LIVE STREAM CURRENTLY OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Bulk Upload Area */}
          <div className="md:col-span-2 bg-champagne-silk border border-cinematic-gold/30 p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-paper-cream transition-colors duration-500 min-h-[300px]">
            <div className="w-16 h-16 rounded-full border border-dashed border-cinematic-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-cinematic-gold text-3xl">
                cloud_upload
              </span>
            </div>
            <h4 className="text-xl mb-2 tracking-tight text-charcoal-ink font-medium">
              Bulk Professional Upload
            </h4>
            <p className="text-charcoal-ink/70 mb-6 max-w-xs italic">
              Drag and drop high-resolution TIFF or RAW files for the heirloom collection.
            </p>
            <button className="px-8 py-3 bg-charcoal-ink text-paper-cream text-[12px] uppercase tracking-[0.2em] font-semibold hover:opacity-90 transition-opacity">
              Select Files
            </button>
          </div>

          {/* Live Feed Stats */}
          <div className="md:col-span-1 bg-champagne-silk border border-cinematic-gold/10 p-8 flex flex-col justify-between">
            <div>
              <span className="text-[12px] text-cinematic-gold tracking-[0.2em] uppercase font-semibold">
                GUEST ACTIVITY
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl tracking-tight text-charcoal-ink font-medium">
                  1,284
                </span>
                <span className="text-[12px] text-charcoal-ink/40 tracking-[0.1em] uppercase font-semibold">
                  UPLOADS
                </span>
              </div>
            </div>
            <div className="pt-6 border-t border-cinematic-gold/10">
              <div className="flex justify-between text-[10px] mb-2 tracking-[0.1em] uppercase text-charcoal-ink font-semibold">
                <span>MODERATION QUEUE</span>
                <span className="text-cinematic-gold">12 PENDING</span>
              </div>
              <div className="w-full h-1 bg-paper-cream">
                <div className="h-full bg-charcoal-ink" style={{ width: '25%' }} />
              </div>
            </div>
          </div>

          {/* Storage Info */}
          <div className="md:col-span-1 bg-charcoal-ink text-paper-cream p-8 flex flex-col justify-between">
            <span className="material-symbols-outlined text-cinematic-gold text-4xl">
              database
            </span>
            <div>
              <h4 className="text-[12px] uppercase tracking-[0.2em] text-paper-cream/60 mb-2 font-semibold">
                Storage Usage
              </h4>
              <p className="text-2xl tracking-tight font-medium">
                64.2 GB{' '}
                <span className="text-sm text-paper-cream/40 italic font-normal">
                  of 100 GB
                </span>
              </p>
            </div>
            <button className="w-full py-2 border border-cinematic-gold/40 text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-cinematic-gold hover:text-charcoal-ink transition-all">
              Expand Vault
            </button>
          </div>
        </div>

        {/* Content Moderation Section */}
        <div className="mt-section-gap">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-8 gap-4">
            <h3 className="text-2xl tracking-tight text-charcoal-ink font-medium">
              Guest Gallery Moderation
            </h3>
            <div className="flex gap-4">
              {moderationTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[12px] pb-1 tracking-[0.2em] uppercase font-semibold transition-colors ${
                    activeTab === tab
                      ? 'text-cinematic-gold border-b border-cinematic-gold'
                      : 'text-charcoal-ink/50 hover:text-charcoal-ink'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {photos.map((photo, idx) => (
              <div key={idx} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-champagne-silk shadow-xl">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={photo.src}
                    alt=""
                  />
                  {photo.isNew && (
                    <div className="absolute inset-x-0 top-0 p-4 flex justify-end">
                      <span className="bg-charcoal-ink text-paper-cream text-[8px] px-2 py-1 tracking-[0.2em] uppercase font-semibold">
                        New
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-paper-cream text-[10px] mb-1 tracking-[0.2em] uppercase font-semibold">
                      UPLOADED BY
                    </p>
                    <p className="text-paper-cream text-sm italic">{photo.uploadedBy}</p>
                  </div>
                </div>

                {/* Status Controls */}
                <div className="mt-4 flex items-center justify-between border-b border-cinematic-gold/10 pb-4">
                  {photo.status === 'approved' && (
                    <>
                      <div className="flex items-center gap-2">
                        <span
                          className="material-symbols-outlined text-[18px] text-charcoal-ink/70"
                          style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                          check_circle
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.1em] text-charcoal-ink font-semibold">
                          Approved
                        </span>
                      </div>
                      <button className="text-charcoal-ink/40 hover:text-red-600 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">
                          visibility_off
                        </span>
                      </button>
                    </>
                  )}
                  {photo.status === 'pending' && (
                    <div className="flex gap-4">
                      <button className="bg-charcoal-ink text-paper-cream px-3 py-1 text-[10px] uppercase tracking-[0.1em] font-semibold">
                        Approve
                      </button>
                      <button className="border border-charcoal-ink/20 text-charcoal-ink px-3 py-1 text-[10px] uppercase tracking-[0.1em] font-semibold hover:bg-red-600/10 hover:text-red-600 transition-all">
                        Hide
                      </button>
                    </div>
                  )}
                  {photo.status === 'featured' && (
                    <>
                      <div className="flex items-center gap-2">
                        <span
                          className="material-symbols-outlined text-[18px] text-cinematic-gold"
                          style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                          stars
                        </span>
                        <span className="text-[10px] uppercase text-cinematic-gold font-bold tracking-[0.1em]">
                          Featured
                        </span>
                      </div>
                      <button className="text-charcoal-ink/40 hover:text-red-600 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">
                          visibility_off
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <button className="group flex items-center gap-4 text-charcoal-ink/60 hover:text-charcoal-ink transition-colors">
              <span className="w-12 h-px bg-cinematic-gold/30 group-hover:w-24 transition-all" />
              <span className="text-[12px] uppercase tracking-[0.3em] font-semibold">
                View Full Archive
              </span>
              <span className="w-12 h-px bg-cinematic-gold/30 group-hover:w-24 transition-all" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full py-12 border-t border-cinematic-gold/10 flex flex-col items-center gap-4 mt-section-gap">
          <p className="text-[12px] text-charcoal-ink/50 tracking-[0.2em] uppercase text-center px-4 font-semibold">
            &copy; 2024 DREAMWEAVERS &bull; EDITORIAL UTILITY FOR THE MODERN HEIRLOOM
          </p>
          <div className="flex gap-8">
            <span
              className="text-[12px] text-charcoal-ink/50 uppercase tracking-[0.2em] opacity-40 cursor-not-allowed font-semibold"
              aria-disabled="true"
              title="Coming soon"
            >
              Support
            </span>
            <span
              className="text-[12px] text-charcoal-ink/50 uppercase tracking-[0.2em] opacity-40 cursor-not-allowed font-semibold"
              aria-disabled="true"
              title="Coming soon"
            >
              Privacy
            </span>
            <span
              className="text-[12px] text-charcoal-ink/50 uppercase tracking-[0.2em] opacity-40 cursor-not-allowed font-semibold"
              aria-disabled="true"
              title="Coming soon"
            >
              Documentation
            </span>
          </div>
        </footer>
      </section>
    </AdminLayout>
  );
}