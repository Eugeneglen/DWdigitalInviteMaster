'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, Upload, Video, X, ImageIcon, MapPin, BookOpen, Calendar, Camera, Sparkles, Eye, ArrowUpRight, ImageOff, Heart, MessageCircle, Home, Clock, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCoupleCMSStore } from '@/store/useCoupleCMSStore';
import { invalidateWeddingCache, type PublicWeddingData } from '@/hooks/usePublicWedding';

const WEDDING_API = '/api/cms/wedding?XTransformPort=3000';
const PUBLIC_API = '/api/wedding/public?XTransformPort=3000';

/* ─── Fallback image constants (mirrors the frontend exactly) ────────── */

const FALLBACK_HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBeAe38AA5-0h4B5MmgQCqv54oQXyPMGznDKaw2sJI_FnTbB_yXXWOpirFlFycj_2VI02IVLouUTt86Y1J7Ls-bRsMOHPAcfSqruVoh87sfhw3vi2Z6t1C7ogCLtkvF6QbJkwuV0av8pXTrUeAAi6ymnZpvyOr8qVjTNNorAOmqRrW_fohX_xlkscmBh39K4Wtvs6TH0Nvb_X3LQQRD9W_sySN_iWbWw9O0au8u1jO-hSekE9pSGNo5zsTz3o9PWy5xbzc6lq3knkIy';

const FALLBACK_BANNER_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA-OyKfcsxXAmZDArHbDXl1cVCgGUG5liFPzyHdVvMG6_4jN9pNTrN9GCrkdnegli9UPJUSPs39KJRsRP7AiLem4xYS-q1ZYq1T3DAIqyvn3wAvbdkoMVkufft0SpQw4gDTPSnIml6k62lRYobUrNu70UGIILiMZQ0fAydTXXwVZ1oswQZ-mjPT8H9mDDqfhxsMSI5zla8GKz_ILXbmdRjtRUk682dPEDBD6I81DzEx7dITgjb6vxQoee5599jkYf_vCYP7npydvxqx';

const FALLBACK_TEA_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA6SiJt49KQCmMAhF-X_tmX1Y1NKhTieT6ApO53PD9gYuvLO0e78WTxzg8BV7Wnhe6oJ6sG4SwJ4U-nH2m33dv7I89IhLgrHDkabts7ws-QwPlv-ycUzhyuBN0c04ka2inAyysumlM1w-sR8stBZ51HJOGZkQO6cAtfrn9RXWZRFlHJlUp8Jqzi-nBu3xGs57xm7L2Le06Put3xBDMAe39zkMMsdcuUkbeyw5c4Q6VxvXkSmMbcpLM-HJK1iMgYVLkn2kzqUPEALYpH';

const CEREMONY_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAsLNSEjy771owdkkDbKTl1nE5oEzBQFVHob_HKiQb9eJb1X7I79-CxGjCPeKwCSHhwswJRqSrt3ox_aktMQUGlyzg6Eoo5R0aH6CYxxKj5f3uZCWdaDfZEIqmxwZd5DgdvCUWZfIdnNvixcYvcspOOFnGM2ThX9BPZz-ftetacA-b6CkxEEp9BdSatnTG55-e8tZz1jlG1euZgtw17iI67tcMGtR2azzCg8GvNH-xQPfUJlAXxGC3jU9Q7dbVZPK-xnHwtTl5eRNknueI';

const CELEBRATION_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC01POr_eFI2RUG86kAb7dHs-q12Kj6HzxEoXpnzTnJ9n_VB9_BJL6Iy8vtGixOWTn1jVNZKDjXNQkHSy9Gsa8KI5IomZe3968VCNWHhXNZ44gbgs5LCBp4_Axjbj72RJwN0BWAIEmrqH8lgR-_j2_9Ci79wI4t583OCS4YuDca-s2xldrzBhBM-KeS4GFVFDSQdzWRY-4chmwkFfFgO3g-S4VS_jae416SCd-357i_ix3m68zwnHtpBSxyXFSjZISZ_Z66Jlxj6Npv_Lo';

const FALLBACK_VENUE_IMAGE = 'https://sfile.chatglm.cn/images-ppt/4adf4afbb9a2.jpg';

const STORY_HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBZxkwieg-SjxgRYOZxJlQ1v05okmlTqzvosp-ANHaaCSQStncGv3ORTlPiE-uSYP7mQcE_wcB5Povhsm25x-eThbTLAYPt1XD-14RTSL9R5a1etGsU54CUWIwAK_4ckHoB-gD85mc-uqQwOckXVYmn0J7u0r6WkNQ2eFKKTBWBJ8yU_nirHHy8GC7vKRVnGPL6P_TymHuuKnjM3ERN9Zvho_5v7pICElncd6F8dHF-lVKppvz4kKyQe9je7CIDwOSBlcyxaGU6yY-D';

const FALLBACK_PHOTOS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAm-8WDgkq_3PeNjdM4_SPcbdyPc4j1BN1NYWpstlUalLgRDkOi-VrJG2ZcdDt04YwBhlSegxOEQ4dbw-6zr2xKHQeTO5gJe67RlcYJ2IkUn3Dp8ZbTzfL8aD2Tq8rbse4QsZBGuz1fOPmW42rjorV-F8aY14aRHg_wk_TAMAaeqaBllL8Qpx_POk9EP9b5wjS_YXtMBnKH7-nGAPwIbuNCwetnkUm6A1gonIw4KTEsPRqq2sW_1A3jAX6wnSIeZTPdzM3VYkva56VG',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAaySYsDYGyX6N9CoV24yS9bjuLYqQWIJwG8qS2qCMj2do69ncL22s286MrboC8HGtgl1tP6_JTj85seIO4TolelvHDIqTInWBTwFyuk_MJZN0a5w6P0QX4AQUVLx2oCOPDelyGCdOmRviKG1bD4nqPr3zkgUKWgXNmnGP5a0b4U2k-nDG2Hl_lDM2moRehiYXKnwB872KgPkaI7Br6uq1DHIKKb34AY9ybXoB9pT-x3W5PKHguLL3DaI6VsnfHWT18OAeoVAgwQsvH',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCSIFjFy2YecMgyEcWPUwcxc0x0aeave6t83lRrx9I562NRYIPDn8I7lAYE1hLalBtCsq22XBSUM5UIQ9O7SG4LZbJXDpn7Y8iUaVW7FNVdfMuTbn2uGLOQCl3MV6EgnxcpYOsswCptEyKegR8_YCSeNk438RKjHVC3xs4HkIvlq5kEe3f5OTdP36lsirovgw_07Ry4YwVm06xv8uZ5GmhrX-oU02i7OASDM7Gdr1UkxL2NiOdyce7PSAl_0UW-xZMxl1DFIStbWdaU',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8RAoFnH7L9tFmSjN3sfNRhKNcQZhi5ysusn41rPRCnxgkRdC7gmZSPZ0XoULR83j3q0uqgavwoBitCxAoF2KF-DzsGg34B0pCMslmkusZodhIipUFKpkQj-cr4FRMLcyDdy5SzxPsOAi7OKQa4uioJSi0KhKwePpXNmReV2WzTMoSRUP-wqNUrofcUas0L_WwXeNwan3c9CMIkxBHHWhkKwYOKyjXd51ixRMzL_X37bZqgP1DUhrpEUz27iNPB8XgvhtSDOiH4Pd2',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAo_iwupchnJHvXMl5E17TFsoHJ23KgUb5kI8vnFt1NyIODCLIK9tSJ-5NmvdWcdS21fueeNi-8HX5FPWZ-rXZPyru8V-DUKsc_aEK6yGqTQyOAJubhxaZWj_07HSUyF0yvxVn5G5WmJtNxLq9EZh0X8EJ5Q_4ZMQ7HMh_FQqAIW6OofZZw4zhAhwyIOyrlVwaURh_XvFES7-3dVvxz2sJ0iTNmt9VV0roh3t83hM1Vam0FV-9y9b3d4c46RZVcBv84AwjC1tew60c7',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA6yfZZlKuOgc7f9BoIGCAh3JLsOmPBPPzDUbciYvBGuEIyibR3sGWAMVAKm1otVVQWGI5yGzzdXPiiZbtmXiSvQY5Mk_ZQI-pJjKHbsc3qcwpp3mK6LwLmHQQyCZYIp1ELY6UEftahE-61i-LgWdRzahJMkrnhPI9bwahxFIRLxhjIoG9HE-FPNqZI_2KBnRoblo5SKLkW6SreAOLXOETB3qeo3ymZ6wtPqOZTBpRsIId11CRKbr1xaKqF1sqRtv0N5vQHlAWhlHqA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCXe37633UXErQ8VKr_s7lNWN-MZNVGtupB_D1WmBY3PqnOFWIYr8BqlsYPPX-k-mJA8AbmrOauWIohhltVLnmMvLgbkjNALuIFpdEGRiKe3wDFCRt21tZvTIc3SMgCtoDnEBZOx7_HGu5RSa3uuFbCugmJpXpDg-QE9vxZG9QXDgqETu3c1_QmYtU8K41OyOTkwqFdFlYxdRj_WCCBTKgLSI4NchqgRYqQv4_xZQICoqEfBOB1aMyFqVS4OSA6-X7VuOvui4qjJnc_',
];

const FALLBACK_STORY_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAQPSczTWgJLZS_vzNbN6wuPsTVw72YpOY0ldIaXb2nEM0DjbAoH__IyOfEvlXkIvif3k6TiVwdgbsAPvCUuustCXJ5ogM8o9Mf8qfnHNM052duEcCK8KPbJVfqn8sOuo9cpUPx6XWqHpBxvEfinvKzqiiI7zy3XkVYQ7w0ElfPw1kVlE-oTiwbdti2a6Q3pUBuogYx0KyKtviULD2olRj3ZTd29I37Yi80hUtQtS9LWTuKEtFJvAKUdLp2wmjdEM8om4Ku67LEDI4t',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzzvAxvGICtmDJ5Ase_8SKR0gvAAqXe_96pLSdSUEjYyVgenag3qekxDbjpLG_SXknWJEoOXPP_XcdU4WMSloZvzj9Pn-dxdG0BBlp0lglCSzzoxLL3-2CaKrawuVRqBglPiiimHDNTlMHai2pnrr404Xg8EgQq8tdW5qRhs-bx2k6N52M80DDUW27KtR0Nc4-WkNjwCsNX8XuiyHBZTqdhpBqml323YRMNj-0offH-_Sn3jp1yxw-EAZs939pzoyGzEfpRwsteoXv',
];


/** ─── Hero Visual Section (image OR video) — used by CoupleHome ──────────── */

export function HeroVisualSection({ weddingData }: { weddingData: Record<string, unknown> | null }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const heroImgUrl = (weddingData as Record<string, string>)?.heroImageUrl || '';
  const heroVideoUrl = (weddingData as Record<string, string>)?.heroVideoUrl || '';

  const handleFile = async (file: File) => {
    const isVideo = file.type.startsWith('video/');
    if (!isVideo && !file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image or video file', variant: 'destructive' });
      return;
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: 'Error', description: `File too large. Max ${isVideo ? '50 MB' : '10 MB'}.`, variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fieldKey = isVideo ? 'heroVideoUrl' : 'heroImageUrl';
      const clearKey = isVideo ? 'heroImageUrl' : 'heroVideoUrl';

      const res = await fetch(WEDDING_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [fieldKey]: dataUrl,
          [clearKey]: '',
        }),
      });

      if (!res.ok) throw new Error('Failed to upload');

      const weddingRes = await fetch(WEDDING_API);
      if (weddingRes.ok) {
        const data = await weddingRes.json();
        useCoupleCMSStore.getState().setWeddingData(data.wedding ?? data);
      }
      invalidateWeddingCache();
      toast({ title: 'Success', description: `${isVideo ? 'Video' : 'Image'} updated` });
    } catch {
      toast({ title: 'Error', description: 'Failed to upload', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (type: 'image' | 'video') => {
    try {
      const res = await fetch(WEDDING_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type === 'image' ? 'heroImageUrl' : 'heroVideoUrl']: '' }),
      });
      if (!res.ok) throw new Error('Failed to remove');

      const weddingRes = await fetch(WEDDING_API);
      if (weddingRes.ok) {
        const data = await weddingRes.json();
        useCoupleCMSStore.getState().setWeddingData(data.wedding ?? data);
      }
      invalidateWeddingCache();
      toast({ title: 'Removed', description: `${type === 'image' ? 'Image' : 'Video'} removed` });
    } catch {
      toast({ title: 'Error', description: 'Failed to remove', variant: 'destructive' });
    }
  };

  return (
    <>
      <Card className="border-charcoal-ink/5 shadow-none">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-cinematic-gold/10">
              <Sparkles className="size-3.5 text-cinematic-gold" />
            </div>
            <div>
              <Label className="text-xs font-medium text-charcoal-ink/70 uppercase tracking-wider">Hero Visual</Label>
              <p className="text-[11px] text-charcoal-ink/40">Full-bleed hero image or video on the home page</p>
            </div>
          </div>

          {heroVideoUrl ? (
            <div className="relative aspect-video rounded-lg overflow-hidden border border-charcoal-ink/10 group">
              <video src={heroVideoUrl} className="w-full h-full object-cover" controls />
              <button
                type="button"
                onClick={() => handleRemove('video')}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                title="Remove video"
              >
                <X className="size-3.5" />
              </button>
              <div className="absolute bottom-2 left-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium">
                  <Video className="size-3" /> Video
                </span>
              </div>
            </div>
          ) : heroImgUrl ? (
            <div
              className="relative aspect-video rounded-lg overflow-hidden border border-charcoal-ink/10 group cursor-pointer"
              onClick={() => setPreviewUrl(heroImgUrl)}
            >
              <img src={heroImgUrl} alt="Hero" className="w-full h-full object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove('image'); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                title="Remove image"
              >
                <X className="size-3.5" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to preview · Drag to replace
                </span>
              </div>
            </div>
          ) : (
            <div
              className="relative aspect-video rounded-lg border-2 border-dashed border-charcoal-ink/10 hover:border-cinematic-gold hover:bg-cinematic-gold/5 transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center gap-2"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
            >
              {uploading ? (
                <Loader2 className="size-6 animate-spin text-cinematic-gold" />
              ) : (
                <>
                  <Upload className="size-6 text-charcoal-ink/25" />
                  <p className="text-xs text-charcoal-ink/40 font-medium">Upload hero image or video</p>
                  <p className="text-[10px] text-charcoal-ink/25">Image (max 10 MB) or Video (max 50 MB)</p>
                </>
              )}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/ogg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-3xl p-2">
          <DialogHeader>
            <DialogTitle className="sr-only">Hero Preview</DialogTitle>
          </DialogHeader>
          <img src={previewUrl ?? ''} alt="Preview" className="w-full rounded-lg" unoptimized />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** ─── Banner Section — used by CoupleHome ─────────────────────────────── */

export function BannerSection({ weddingData }: { weddingData: Record<string, unknown> | null }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const bannerUrl = (weddingData as Record<string, string>)?.bannerUrl || '';

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File too large. Max 10 MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(WEDDING_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerUrl: dataUrl }),
      });

      if (!res.ok) throw new Error('Failed to upload');

      const weddingRes = await fetch(WEDDING_API);
      if (weddingRes.ok) {
        const data = await weddingRes.json();
        useCoupleCMSStore.getState().setWeddingData(data.wedding ?? data);
      }
      invalidateWeddingCache();
      toast({ title: 'Success', description: 'Banner updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to upload', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      const res = await fetch(WEDDING_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerUrl: '' }),
      });
      if (!res.ok) throw new Error('Failed to remove');

      const weddingRes = await fetch(WEDDING_API);
      if (weddingRes.ok) {
        const data = await weddingRes.json();
        useCoupleCMSStore.getState().setWeddingData(data.wedding ?? data);
      }
      invalidateWeddingCache();
      toast({ title: 'Removed', description: 'Banner removed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to remove', variant: 'destructive' });
    }
  };

  return (
    <>
      <Card className="border-charcoal-ink/5 shadow-none">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-cinematic-gold/10">
              <ImageIcon className="size-3.5 text-cinematic-gold" />
            </div>
            <div>
              <Label className="text-xs font-medium text-charcoal-ink/70 uppercase tracking-wider">Banner Design</Label>
              <p className="text-[11px] text-charcoal-ink/40">Top banner shown across all pages</p>
            </div>
          </div>

          {bannerUrl ? (
            <div
              className="relative aspect-[21/9] rounded-lg overflow-hidden border border-charcoal-ink/10 group cursor-pointer"
              onClick={() => setPreviewUrl(bannerUrl)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
            >
              <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                title="Remove banner"
              >
                <X className="size-3.5" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to preview · Drag to replace
                </span>
              </div>
            </div>
          ) : (
            <div
              className="relative aspect-[21/9] rounded-lg border-2 border-dashed border-charcoal-ink/10 hover:border-cinematic-gold hover:bg-cinematic-gold/5 transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center gap-2"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
            >
              {uploading ? (
                <Loader2 className="size-6 animate-spin text-cinematic-gold" />
              ) : (
                <>
                  <Upload className="size-6 text-charcoal-ink/25" />
                  <p className="text-xs text-charcoal-ink/40 font-medium">Upload banner image</p>
                  <p className="text-[10px] text-charcoal-ink/25">Max 10 MB · Wide aspect ratio recommended</p>
                </>
              )}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-3xl p-2">
          <DialogHeader>
            <DialogTitle className="sr-only">Banner Preview</DialogTitle>
          </DialogHeader>
          <img src={previewUrl ?? ''} alt="Preview" className="w-full rounded-lg" unoptimized />
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   View-Only Gallery — mirrors exactly what the guest frontend renders
   ═══════════════════════════════════════════════════════════════════════ */

/** ─── Shared view-only image card ──────────────────────────────────────── */

function LiveImage({
  src,
  alt,
  isCustom,
  aspectClass = 'aspect-video',
  badge,
  onPreview,
}: {
  src: string;
  alt: string;
  isCustom: boolean;
  aspectClass?: string;
  badge?: string;
  onPreview: () => void;
}) {
  return (
    <Card className="border-charcoal-ink/5 shadow-none overflow-hidden group hover:border-champagne-silk transition-colors duration-200">
      <div
        className={`relative ${aspectClass} bg-charcoal-ink/5 cursor-pointer`}
        onClick={onPreview}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" unoptimized />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <Eye className="size-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
        {/* Top-left: custom/default badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {isCustom ? (
            <Badge className="bg-cinematic-gold/90 text-charcoal-ink text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 hover:bg-cinematic-gold/90">
              Custom
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-white/80 text-charcoal-ink/50 text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 border-charcoal-ink/15 hover:bg-white/80">
              Default
            </Badge>
          )}
          {badge && (
            <Badge className="bg-black/50 text-white text-[9px] font-medium px-1.5 py-0.5 hover:bg-black/50">
              {badge}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

/** ─── Page section wrapper ────────────────────────────────────────────── */

function PageSection({
  icon: Icon,
  label,
  description,
  editTab,
  onEditTab,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  editTab: string;
  onEditTab: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-cinematic-gold/10 shrink-0 mt-0.5">
            <Icon className="size-3.5 text-cinematic-gold" />
          </div>
          <div>
            <Label className="text-xs font-medium text-charcoal-ink/70 uppercase tracking-wider">{label}</Label>
            <p className="text-[11px] text-charcoal-ink/40 mt-0.5">{description}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEditTab}
          className="text-[11px] text-charcoal-ink/40 hover:text-cinematic-gold hover:bg-cinematic-gold/5 h-7 px-2 shrink-0 gap-1"
        >
          Edit in {editTab}
          <ArrowUpRight className="size-3" />
        </Button>
      </div>
      {children}
    </section>
  );
}

/** ─── Main Images Page ─────────────────────────────────────────────────── */

export default function CoupleImages() {
  const { setPage } = useCoupleCMSStore();
  const [data, setData] = useState<PublicWeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  // Fetch the same public data the frontend uses
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(PUBLIC_API);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper: get content field (mirrors usePublicWedding.getField)
  const getField = (section: string, fieldKey: string, fallback = ''): string => {
    if (!data) return fallback;
    return data.content[section]?.[fieldKey] ?? fallback;
  };

  // Media by category
  const scheduleImages = data?.mediaByCategory?.schedule ?? [];
  const storyImages = data?.mediaByCategory?.story ?? [];
  const momentsMedia = data?.mediaByCategory?.moments ?? [];

  // ── Compute what the guest actually sees (with fallbacks) ──

  // Home Page
  const heroImg = data?.wedding.heroImageUrl || FALLBACK_HERO_IMG;
  const heroVideo = data?.wedding.heroVideoUrl || null;
  const bannerImg = data?.wedding.bannerUrl || FALLBACK_BANNER_BG;
  const teaCeremonyImg = getField('hero', 'teaCeremonyImage', FALLBACK_TEA_IMG);

  // Schedule Page
  const ceremonyImg = scheduleImages[0]?.url || CEREMONY_IMG;
  const celebrationImg = scheduleImages[1]?.url || CELEBRATION_IMG;
  const venueImg = getField('getting-there', 'venueImage', FALLBACK_VENUE_IMAGE);

  // Story Page
  const storyHeroImg = storyImages[0]?.url || STORY_HERO_IMG;
  const stories = (data?.stories && data.stories.length > 0) ? data.stories : null;
  const storyChapterImages = stories
    ? stories.filter((s) => s.imageUrl).map((s) => ({ url: s.imageUrl!, title: s.title, isCustom: true }))
    : FALLBACK_STORY_IMAGES.map((url, i) => ({ url, title: `Default Story ${i + 1}`, isCustom: false }));

  // Moments Page
  const momentsPhotos = (momentsMedia.length > 0)
    ? momentsMedia.map((m) => ({ src: m.url, alt: m.fileName || 'Gallery Photo', isCustom: true }))
    : FALLBACK_PHOTOS.map((src) => ({ src, alt: 'Default Gallery Photo', isCustom: false }));

  // Wishes Page
  const wishImages = (data?.wishes ?? []).filter((w) => w.imageUrl).map((w) => ({
    url: w.imageUrl!,
    name: w.name,
  }));

  // Custom flags (did the couple upload their own?)
  const hasCustomHero = !!data?.wedding.heroImageUrl;
  const hasCustomBanner = !!data?.wedding.bannerUrl;
  const hasCustomTea = !!data?.content?.hero?.teaCeremonyImage;
  const hasCustomCeremony = scheduleImages.length > 0 && !!scheduleImages[0]?.url;
  const hasCustomCelebration = scheduleImages.length > 1 && !!scheduleImages[1]?.url;
  const hasCustomVenue = !!data?.content?.['getting-there']?.venueImage;
  const hasCustomStoryHero = storyImages.length > 0 && !!storyImages[0]?.url;
  const hasCustomMoments = momentsMedia.length > 0;

  // Total unique images the guest sees
  const totalImages = 1 // hero (image or video)
    + 1 // banner
    + 1 // tea ceremony
    + 2 // ceremony + celebration
    + 1 // venue
    + 1 // story hero
    + storyChapterImages.length
    + momentsPhotos.length
    + wishImages.length;

  const openPreview = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-charcoal-ink">Images & Media</h2>
        <p className="text-sm text-charcoal-ink/50 mt-1">
          Live preview of all images your guests see.{' '}
          <span className="text-charcoal-ink/35">
            {totalImages} image{totalImages !== 1 ? 's' : ''} across 5 pages.
          </span>
        </p>
        <p className="text-[11px] text-charcoal-ink/30 mt-0.5">
          <Badge variant="outline" className="bg-cinematic-gold/10 text-cinematic-gold text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0 border-cinematic-gold/20 mr-1.5">Custom</Badge>
          Your upload{' '}
          <Badge variant="outline" className="bg-charcoal-ink/5 text-charcoal-ink/40 text-[9px] font-medium uppercase tracking-wider px-1.5 py-0 border-charcoal-ink/10 ml-3 mr-1.5">Default</Badge>
          System placeholder shown to guests
        </p>
      </div>

      <Separator className="bg-champagne-silk" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="size-8 animate-spin text-cinematic-gold" />
          <p className="text-sm text-charcoal-ink/50 font-medium">Loading live images…</p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ═══ HOME PAGE ═══════════════════════════════════════════ */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Home className="size-4 text-charcoal-ink/40" />
              <Label className="text-xs font-semibold text-charcoal-ink/50 uppercase tracking-wider">Home Page</Label>
              <div className="flex-1 border-t border-charcoal-ink/10" />
            </div>

            {/* Hero */}
            <PageSection
              icon={Sparkles}
              label="Hero Visual"
              description="Full-bleed hero at the top of the home page"
              editTab="Home"
              onEditTab={() => setPage('home')}
            >
              {heroVideo ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-charcoal-ink/10">
                  <video src={heroVideo} className="w-full h-full object-cover" controls />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                    <Badge className="bg-cinematic-gold/90 text-charcoal-ink text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 hover:bg-cinematic-gold/90">Custom</Badge>
                    <Badge className="bg-black/50 text-white text-[9px] font-medium px-1.5 py-0.5 hover:bg-black/50"><Video className="size-2.5 mr-1 inline" />Video</Badge>
                  </div>
                </div>
              ) : (
                <LiveImage
                  src={heroImg}
                  alt="Hero image"
                  isCustom={hasCustomHero}
                  aspectClass="aspect-video"
                  onPreview={() => openPreview(heroImg, 'Hero Image')}
                />
              )}
            </PageSection>

            {/* Banner */}
            <PageSection
              icon={ImageIcon}
              label="Banner"
              description="Top banner — also shown on Schedule, Story, Moments, Getting There, Wishes pages"
              editTab="Home"
              onEditTab={() => setPage('home')}
            >
              <LiveImage
                src={bannerImg}
                alt="Banner"
                isCustom={hasCustomBanner}
                aspectClass="aspect-[21/9]"
                badge="6 pages"
                onPreview={() => openPreview(bannerImg, 'Banner')}
              />
            </PageSection>

            {/* Tea Ceremony */}
            <PageSection
              icon={Calendar}
              label="Tea Ceremony"
              description="Portrait in the tea ceremony section on the home page"
              editTab="Home"
              onEditTab={() => setPage('home')}
            >
              <LiveImage
                src={teaCeremonyImg}
                alt="Tea ceremony image"
                isCustom={hasCustomTea}
                aspectClass="aspect-[2/3]"
                onPreview={() => openPreview(teaCeremonyImg, 'Tea Ceremony')}
              />
            </PageSection>
          </div>

          <Separator className="bg-champagne-silk" />

          {/* ═══ SCHEDULE PAGE ═════════════════════════════════════════ */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-charcoal-ink/40" />
              <Label className="text-xs font-semibold text-charcoal-ink/50 uppercase tracking-wider">Schedule Page</Label>
              <div className="flex-1 border-t border-charcoal-ink/10" />
            </div>

            {/* Ceremony & Celebration intro images */}
            <PageSection
              icon={Calendar}
              label="Event Intro Images"
              description={`Ceremony & celebration section images (${scheduleImages.length}/3 uploaded)`}
              editTab="Schedule"
              onEditTab={() => setPage('schedule')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <LiveImage
                  src={ceremonyImg}
                  alt="Ceremony intro image"
                  isCustom={hasCustomCeremony}
                  badge="Ceremony"
                  onPreview={() => openPreview(ceremonyImg, 'Ceremony Image')}
                />
                <LiveImage
                  src={celebrationImg}
                  alt="Celebration intro image"
                  isCustom={hasCustomCelebration}
                  badge="Celebration"
                  onPreview={() => openPreview(celebrationImg, 'Celebration Image')}
                />
              </div>
            </PageSection>

            {/* Venue */}
            <PageSection
              icon={MapPin}
              label="Venue Photo"
              description="Venue image displayed at the bottom of the Schedule page and on the Getting There page"
              editTab="Getting There"
              onEditTab={() => setPage('getting-there')}
            >
              <LiveImage
                src={venueImg}
                alt="Venue image"
                isCustom={hasCustomVenue}
                aspectClass="aspect-[4/3]"
                onPreview={() => openPreview(venueImg, 'Venue')}
              />
            </PageSection>
          </div>

          <Separator className="bg-champagne-silk" />

          {/* ═══ STORY PAGE ════════════════════════════════════════════ */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-charcoal-ink/40" />
              <Label className="text-xs font-semibold text-charcoal-ink/50 uppercase tracking-wider">Story Page</Label>
              <div className="flex-1 border-t border-charcoal-ink/10" />
            </div>

            {/* Story hero */}
            <PageSection
              icon={BookOpen}
              label="Story Hero"
              description="16:9 hero image at the top of the story page"
              editTab="Story"
              onEditTab={() => setPage('story')}
            >
              <LiveImage
                src={storyHeroImg}
                alt="Story hero image"
                isCustom={hasCustomStoryHero}
                onPreview={() => openPreview(storyHeroImg, 'Story Hero')}
              />
            </PageSection>

            {/* Per-chapter story images */}
            {storyChapterImages.length > 0 && (
              <PageSection
                icon={BookOpen}
                label="Chapter Images"
                description={`${storyChapterImages.length} timeline chapter image${storyChapterImages.length !== 1 ? 's' : ''}`}
                editTab="Story"
                onEditTab={() => setPage('story')}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {storyChapterImages.map((img, i) => (
                    <LiveImage
                      key={i}
                      src={img.url}
                      alt={img.title}
                      isCustom={img.isCustom}
                      aspectClass="aspect-[4/3]"
                      badge={img.title}
                      onPreview={() => openPreview(img.url, img.title)}
                    />
                  ))}
                </div>
              </PageSection>
            )}
          </div>

          <Separator className="bg-champagne-silk" />

          {/* ═══ MOMENTS PAGE ══════════════════════════════════════════ */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Camera className="size-4 text-charcoal-ink/40" />
              <Label className="text-xs font-semibold text-charcoal-ink/50 uppercase tracking-wider">Moments Page</Label>
              <div className="flex-1 border-t border-charcoal-ink/10" />
            </div>

            <PageSection
              icon={Camera}
              label="Photo Gallery"
              description={`Masonry gallery — ${hasCustomMoments ? `${momentsPhotos.length} uploaded` : `${momentsPhotos.length} default photos shown`}`}
              editTab="Moments"
              onEditTab={() => setPage('moments')}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {momentsPhotos.map((photo, i) => (
                  <LiveImage
                    key={i}
                    src={photo.src}
                    alt={photo.alt}
                    isCustom={photo.isCustom}
                    aspectClass="aspect-square"
                    onPreview={() => openPreview(photo.src, photo.alt)}
                  />
                ))}
              </div>
            </PageSection>
          </div>

          {/* ═══ WISHES PAGE (only if wish images exist) ════════════ */}
          {wishImages.length > 0 && (
            <>
              <Separator className="bg-champagne-silk" />
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <Heart className="size-4 text-charcoal-ink/40" />
                  <Label className="text-xs font-semibold text-charcoal-ink/50 uppercase tracking-wider">Wishes Page</Label>
                  <div className="flex-1 border-t border-charcoal-ink/10" />
                </div>

                <section className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-cinematic-gold/10 shrink-0 mt-0.5">
                      <Heart className="size-3.5 text-cinematic-gold" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-charcoal-ink/70 uppercase tracking-wider">Guest Wish Photos</Label>
                      <p className="text-[11px] text-charcoal-ink/40 mt-0.5">
                        {wishImages.length} photo{wishImages.length !== 1 ? 's' : ''} submitted by guests with their wishes
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {wishImages.map((w) => (
                      <LiveImage
                        key={w.url}
                        src={w.url}
                        alt={`Wish from ${w.name}`}
                        isCustom={true}
                        badge={w.name}
                        aspectClass="aspect-square"
                        onPreview={() => openPreview(w.url, `Wish from ${w.name}`)}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      )}

      {/* Global Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-3xl p-2">
          <DialogHeader>
            <DialogTitle className="sr-only">{previewTitle} Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <img src={previewUrl} alt={previewTitle} className="w-full rounded-lg" unoptimized />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}