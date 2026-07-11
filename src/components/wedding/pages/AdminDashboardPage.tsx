'use client';

import AdminLayout from '@/components/wedding/AdminLayout';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-[10px] text-charcoal-ink/50 uppercase tracking-[0.25em] mb-6 font-semibold">
            Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {/* Total RSVPs */}
            <div className="bg-white p-6 lg:p-8 border border-cinematic-gold/10 relative group">
              <div className="absolute top-4 right-4 text-cinematic-gold/10 group-hover:text-cinematic-gold/30 transition-colors">
                <span className="material-symbols-outlined text-4xl lg:text-5xl">event_available</span>
              </div>
              <p className="text-[10px] text-cinematic-gold uppercase mb-2 tracking-[0.25em] font-semibold">
                Total RSVPs
              </p>
              <p className="text-4xl lg:text-5xl text-charcoal-ink font-medium">
                124 <span className="text-charcoal-ink/20 text-lg font-light italic ml-1">/ 150</span>
              </p>
              <div className="mt-6 w-full bg-paper-cream h-px">
                <div className="bg-cinematic-gold h-px w-[82.6%] shadow-[0_0_8px_rgba(197,160,89,0.3)]" />
              </div>
            </div>

            {/* Guest Count */}
            <div className="bg-white p-6 lg:p-8 border border-cinematic-gold/10 relative group">
              <div className="absolute top-4 right-4 text-cinematic-gold/10 group-hover:text-cinematic-gold/30 transition-colors">
                <span className="material-symbols-outlined text-4xl lg:text-5xl">group</span>
              </div>
              <p className="text-[10px] text-cinematic-gold uppercase mb-2 tracking-[0.25em] font-semibold">
                Guest Count
              </p>
              <p className="text-4xl lg:text-5xl text-charcoal-ink font-medium">248</p>
              <p className="text-[10px] text-charcoal-ink/40 mt-3 uppercase tracking-[0.25em]">
                Confirmed Guests
              </p>
            </div>

            {/* Media Uploads */}
            <div className="bg-white p-6 lg:p-8 border border-cinematic-gold/10 relative group">
              <div className="absolute top-4 right-4 text-cinematic-gold/10 group-hover:text-cinematic-gold/30 transition-colors">
                <span className="material-symbols-outlined text-4xl lg:text-5xl">photo_library</span>
              </div>
              <p className="text-[10px] text-cinematic-gold uppercase mb-2 tracking-[0.25em] font-semibold">
                Media Uploads
              </p>
              <p className="text-4xl lg:text-5xl text-charcoal-ink font-medium">1,402</p>
              <p className="text-[10px] text-charcoal-ink/40 mt-3 uppercase tracking-[0.25em]">
                High-Res Assets
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-[10px] text-charcoal-ink/50 uppercase tracking-[0.25em] mb-6 font-semibold">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-charcoal-ink text-paper-cream p-6 flex flex-col items-center justify-center gap-3 hover:bg-black transition-all active:scale-95">
              <span className="material-symbols-outlined text-3xl font-light">person_add</span>
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">Add Guest</span>
            </button>
            <button className="bg-white text-charcoal-ink border border-cinematic-gold/20 p-6 flex flex-col items-center justify-center gap-3 hover:bg-paper-cream transition-all active:scale-95">
              <span className="material-symbols-outlined text-3xl text-cinematic-gold font-light">cloud_upload</span>
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">Upload Media</span>
            </button>
            <button className="bg-white text-charcoal-ink border border-cinematic-gold/20 p-6 flex flex-col items-center justify-center gap-3 hover:bg-paper-cream transition-all active:scale-95">
              <span className="material-symbols-outlined text-3xl text-cinematic-gold font-light">visibility</span>
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">Live View</span>
            </button>
            <button className="bg-white text-charcoal-ink border border-cinematic-gold/20 p-6 flex flex-col items-center justify-center gap-3 hover:bg-paper-cream transition-all active:scale-95">
              <span className="material-symbols-outlined text-3xl text-cinematic-gold font-light">mail</span>
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">Send Invites</span>
            </button>
          </div>
        </section>

        {/* Activity & Progress Split */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Recent Activity */}
          <section>
            <div className="flex justify-between items-end mb-6 border-b border-cinematic-gold/10 pb-4">
              <h2 className="text-[10px] text-charcoal-ink/50 uppercase tracking-[0.25em] font-semibold">
                Recent Activity
              </h2>
              <button className="text-[10px] text-cinematic-gold uppercase tracking-[0.25em] hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {/* Activity 1 */}
              <div className="flex items-center gap-4 bg-white/60 p-4 border-l border-cinematic-gold/40 hover:bg-white transition-colors">
                <div className="w-10 h-10 rounded-full bg-paper-cream overflow-hidden flex-shrink-0 border border-cinematic-gold/10">
                  <img
                    alt="Guest"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC04uBxqq_ykKbZ3-gsclFm8eXikW9dxNG1YqzCVEZul4TA_SfA8-5KBmutj4NIex6HAD8AczU_maMqi45HQD-fPdwYC9GEzt4mRwYml3JtiEDCh-v9gMebGcmrliiKOqFdAkERaqg5qARQ8vez35H8LAy9jfMhEfIS_r548vPKdPoGgh2rolNon5zQcoGfcI9hxX2y00Id1h113Hy0IpuJl-z_vHotjTQXbqkASH-gfC5SNVmQY2IeKItfhF0zlmUWgBk4N3zjlwFE"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm font-medium">
                    Eleanor Vance{' '}
                    <span className="text-charcoal-ink/40 italic font-normal">confirmed attendance</span>
                  </h3>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-charcoal-ink/40">2 minutes ago</p>
                </div>
                <span
                  className="material-symbols-outlined text-cinematic-gold text-lg"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  check_circle
                </span>
              </div>

              {/* Activity 2 */}
              <div className="flex items-center gap-4 bg-white/60 p-4 border-l border-transparent hover:bg-white transition-colors">
                <div className="w-10 h-10 rounded-full bg-paper-cream overflow-hidden flex-shrink-0 border border-cinematic-gold/10">
                  <img
                    alt="Guest"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYOLHlQLO3ePWXKS_j-PuQhexURKycIoqoaVuHss98mipov4urICFrjndb5KpVa90qz7Pd-_q9LqZjkVjckxkg3oa6SjfoIW9pbZ0aTOCEQbc8XN8T-jZiKvEl9aJWVHGeR3Y1ehw6gMCW3baqLni1xU4Vj8Zg8hmyMTYDbXq3b64RMjkQY755EfJ3uWQLLyJL7g4zSySDlfwryr4cT_JRz5k2GDLevYNE28Nf6Hm1JXviyN8q4TvO8bpW7LgJRSiHCPyekuNHTXJQ"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm font-medium">
                    Julian Thorne{' '}
                    <span className="text-charcoal-ink/40 italic font-normal">uploaded 12 photos</span>
                  </h3>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-charcoal-ink/40">1 hour ago</p>
                </div>
                <span className="material-symbols-outlined text-charcoal-ink/20 text-lg">image</span>
              </div>

              {/* Activity 3 */}
              <div className="flex items-center gap-4 bg-white/60 p-4 border-l border-transparent hover:bg-white transition-colors">
                <div className="w-10 h-10 rounded-full bg-paper-cream overflow-hidden flex-shrink-0 border border-cinematic-gold/10">
                  <img
                    alt="Guest"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC04uBxqq_ykKbZ3-gsclFm8eXikW9dxNG1YqzCVEZul4TA_SfA8-5KBmutj4NIex6HAD8AczU_maMqi45HQD-fPdwYC9GEzt4mRwYml3JtiEDCh-v9gMebGcmrliiKOqFdAkERaqg5qARQ8vez35H8LAy9jfMhEfIS_r548vPKdPoGgh2rolNon5zQcoGfcI9hxX2y00Id1h113Hy0IpuJl-z_vHotjTQXbqkASH-gfC5SNVmQY2IeKItfhF0zlmUWgBk4N3zjlwFE"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm font-medium">
                    Clara Montes{' '}
                    <span className="text-charcoal-ink/40 italic font-normal">
                      updated dietary preferences
                    </span>
                  </h3>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-charcoal-ink/40">4 hours ago</p>
                </div>
                <span className="material-symbols-outlined text-charcoal-ink/20 text-lg">restaurant</span>
              </div>
            </div>
          </section>

          {/* Venue Progress */}
          <section>
            <div className="flex justify-between items-end mb-6 border-b border-cinematic-gold/10 pb-4">
              <h2 className="text-[10px] text-charcoal-ink/50 uppercase tracking-[0.25em] font-semibold">
                Venue Setup Progress
              </h2>
            </div>
            <div className="inner-frame aspect-video bg-charcoal-ink overflow-hidden shadow-2xl relative">
              <img
                alt="The Conservatory Grand Ballroom"
                className="w-full h-full object-cover opacity-80"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABqSLEgEEMUz8tbBXDG5K-76azx_HVR6ssmXdwneruY_sK9X8qjrz8xCFulFbQV9qleo3HYsBDPZXxRDjUYjbU18zvvt1tBFOh12CnOczPsODU2X2d-mxPM4Np6kiMAfYHTiRPy8nAYtPgRV5QLhZ6rsUKswzd4J1j4TIDPLaEAd7q3T0cDIq1_5ruAFFGL8LmhRwimEI9ZbZb7gYTGb-kf2dTnzyJuxJVFX-hzYqbuejxj9-0cyqwSETgTrzfOZpxHtZvAd35PyJ2"
              />
              <div className="absolute inset-0 cinematic-gradient" />
              <div className="absolute bottom-10 left-10 right-10">
                <p className="text-[10px] text-cinematic-gold uppercase tracking-[0.25em] font-semibold mb-2">
                  Venue Progress
                </p>
                <h3 className="text-2xl lg:text-3xl text-white font-medium tracking-tight">
                  The Conservatory Grand Ballroom
                </h3>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="w-full py-12 mt-12 bg-white/30 border-t border-cinematic-gold/10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6">
            <div className="flex gap-8 lg:gap-12">
              <span
                className="text-[10px] uppercase tracking-[0.25em] text-charcoal-ink/40 opacity-40 cursor-not-allowed"
                aria-disabled="true"
                title="Coming soon"
              >
                Support
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.25em] text-charcoal-ink/40 opacity-40 cursor-not-allowed"
                aria-disabled="true"
                title="Coming soon"
              >
                Privacy
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.25em] text-charcoal-ink/40 opacity-40 cursor-not-allowed"
                aria-disabled="true"
                title="Coming soon"
              >
                Documentation
              </span>
            </div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-charcoal-ink/30 text-center">
              &copy; 2024 DREAMWEAVERS &bull; EDITORIAL UTILITY FOR THE MODERN HEIRLOOM
            </p>
          </div>
        </footer>
      </div>
    </AdminLayout>
  );
}