'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  QrCode,
  Link,
  Copy,
  Check,
  Download,
  ExternalLink,
  Users,
  Globe,
  Search,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCoupleCMSStore } from '@/store/useCoupleCMSStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GuestItem {
  id: string;
  name: string;
  invitationCode: string;
  rsvpStatus: string;
  sentVia: string | null;
  sentAt: string | null;
}

// ---------------------------------------------------------------------------
// Section heading
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-charcoal-ink/50">
      {children}
    </h3>
  );
}

// ---------------------------------------------------------------------------
// CopyButton — reusable copy with checkmark feedback
// ---------------------------------------------------------------------------

function CopyButton({
  text,
  variant = 'outline',
  className = '',
  label = 'Copy',
}: {
  text: string;
  variant?: 'outline' | 'ghost';
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  }, [text]);

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleCopy}
      className={`gap-1.5 text-xs font-medium ${className}`}
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-600" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? 'Copied!' : label}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CoupleSharing() {
  const { weddingData } = useCoupleCMSStore();
  const slug = (weddingData as Record<string, string>)?.slug ?? '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const weddingUrl = slug ? `${origin}/${slug}` : '';
  const qrApiUrl = weddingUrl
    ? `/api/cms/qr-code?XTransformPort=3000&url=${encodeURIComponent(weddingUrl)}&size=400`
    : '';

  // Guest state
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [guestLoading, setGuestLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch guests
  useEffect(() => {
    async function fetchGuests() {
      setGuestLoading(true);
      try {
        const res = await fetch('/api/cms/guests?XTransformPort=3000');
        if (res.ok) {
          const data = await res.json();
          setGuests(data.guests ?? []);
        }
      } catch {
        // silent
      } finally {
        setGuestLoading(false);
      }
    }
    fetchGuests();
  }, []);

  const filteredGuests = search.trim()
    ? guests.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase()),
      )
    : guests;

  const allInvitationLinks = guests
    .map((g) => `${weddingUrl}?code=${g.invitationCode}`)
    .join('\n');

  // Download QR
  const handleDownloadQR = useCallback(async () => {
    if (!qrApiUrl) return;
    try {
      const res = await fetch(qrApiUrl);
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${slug || 'wedding'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('QR code downloaded');
    } catch {
      toast.error('Failed to download QR code');
    }
  }, [qrApiUrl, slug]);

  // Copy QR to clipboard
  const handleCopyQR = useCallback(async () => {
    if (!qrApiUrl) return;
    try {
      const res = await fetch(qrApiUrl);
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      toast.success('QR code copied to clipboard');
    } catch {
      toast.error('Failed to copy QR code — try downloading instead');
    }
  }, [qrApiUrl]);

  // No slug guard
  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Globe className="mb-3 size-10 text-charcoal-ink/20" />
        <p className="text-sm text-charcoal-ink/50">
          No wedding slug configured. Set up your wedding details first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-semibold text-charcoal-ink flex items-center gap-2">
          <QrCode className="size-5 text-cinematic-gold" />
          Sharing &amp; Invitations
        </h2>
        <p className="mt-1 text-sm text-charcoal-ink/50">
          Generate QR codes and invitation links for your guests.
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Section 1: Wedding Page Link                                     */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <SectionHeading>
          <span className="flex items-center gap-1.5">
            <Globe className="size-3" /> Wedding Page Link
          </span>
        </SectionHeading>
        <Card className="ring-1 ring-charcoal-ink/5">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Link className="size-4 shrink-0 text-cinematic-gold" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-charcoal-ink truncate">
                    {weddingUrl}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-1.5 font-mono text-[11px] text-charcoal-ink/60 border-champagne-silk"
                  >
                    /{slug}
                  </Badge>
                </div>
              </div>
              <CopyButton
                text={weddingUrl}
                className="shrink-0 border-charcoal-ink/15 text-charcoal-ink hover:border-cinematic-gold hover:text-cinematic-gold"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Section 2: QR Code                                               */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <SectionHeading>
          <span className="flex items-center gap-1.5">
            <QrCode className="size-3" /> QR Code
          </span>
        </SectionHeading>
        <Card className="ring-1 ring-charcoal-ink/5">
          <CardContent className="p-4">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
              {/* QR image with gold border */}
              <div className="inline-flex rounded-xl border-2 border-cinematic-gold/60 bg-white p-3 shadow-sm">
                <img
                  src={qrApiUrl}
                  alt="Wedding QR Code"
                  width={200}
                  height={200}
                  className="size-[200px]"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-1">
                <div>
                  <p className="text-sm font-medium text-charcoal-ink">
                    Scan to Visit
                  </p>
                  <p className="mt-0.5 text-xs text-charcoal-ink/50">
                    Guests can scan this code to open your wedding page.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadQR}
                    className="gap-1.5 border-charcoal-ink/15 text-charcoal-ink hover:border-cinematic-gold hover:text-cinematic-gold text-xs font-medium"
                  >
                    <Download className="size-3.5" />
                    Download QR Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyQR}
                    className="gap-1.5 border-charcoal-ink/15 text-charcoal-ink hover:border-cinematic-gold hover:text-cinematic-gold text-xs font-medium"
                  >
                    <Copy className="size-3.5" />
                    Copy QR Code
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(weddingUrl, '_blank')}
                    className="gap-1.5 text-charcoal-ink/60 hover:text-cinematic-gold text-xs font-medium"
                  >
                    <ExternalLink className="size-3.5" />
                    Open Link
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Section 3: Guest Invitation Links                                */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <SectionHeading>
          <span className="flex items-center gap-1.5">
            <Users className="size-3" /> Guest Invitation Links
          </span>
        </SectionHeading>
        <Card className="ring-1 ring-charcoal-ink/5">
          <CardContent className="p-4 space-y-4">
            {/* Search + Copy All */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-charcoal-ink/30" />
                <Input
                  placeholder="Search guests…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 border-charcoal-ink/15 pl-8 text-xs"
                />
              </div>
              <CopyButton
                text={allInvitationLinks}
                label="Copy All Links"
                className="shrink-0 border-charcoal-ink/15 text-charcoal-ink hover:border-cinematic-gold hover:text-cinematic-gold"
              />
            </div>

            {/* Guest list */}
            {guestLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-cinematic-gold" />
              </div>
            ) : filteredGuests.length === 0 ? (
              <p className="py-8 text-center text-sm text-charcoal-ink/40">
                {search ? 'No guests match your search.' : 'No guests yet.'}
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1 [scrollbar-width:thin] [scrollbar-color:theme(colors.champagne-silk)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:bg-champagne-silk [&::-webkit-scrollbar-track]:bg-transparent">
                {filteredGuests.map((guest) => {
                  const inviteUrl = `${weddingUrl}?code=${guest.invitationCode}`;
                  const isSent = guest.sentAt !== null;

                  return (
                    <div
                      key={guest.id}
                      className="flex flex-col gap-2 rounded-md border border-charcoal-ink/5 bg-paper-cream/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-charcoal-ink truncate">
                            {guest.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] text-cinematic-gold border-cinematic-gold/30"
                          >
                            {guest.invitationCode}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              isSent
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]'
                                : 'border-amber-200 bg-amber-50 text-amber-700 text-[10px]'
                            }
                          >
                            {isSent ? 'Sent' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="truncate font-mono text-[11px] text-charcoal-ink/50">
                          {inviteUrl}
                        </p>
                      </div>
                      <CopyButton
                        text={inviteUrl}
                        variant="ghost"
                        label="Copy"
                        className="shrink-0 text-charcoal-ink/50 hover:text-cinematic-gold"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Guest count */}
            {!guestLoading && guests.length > 0 && (
              <p className="text-right text-[11px] text-charcoal-ink/30">
                Showing {filteredGuests.length} of {guests.length} guest
                {guests.length !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}