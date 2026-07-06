'use client';

import { ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CoupleImages() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-charcoal-ink">Images & Media</h2>
        <p className="text-sm text-charcoal-ink/60 mt-1">Manage your hero banner, gallery photos, and story images</p>
      </div>
      <Card className="border-champagne-silk/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-charcoal-ink">
            <ImageIcon className="h-5 w-5 text-cinematic-gold" />
            Coming in Phase 3
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-charcoal-ink/60">
            Image upload and media management will be available in Phase 3, along with the guest management system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}