'use client';

import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MasterUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">User Management</h2>
        <p className="text-slate-500 mt-1">Manage platform users and couple accounts</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-400" />
            Coming in Phase 2
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">
            User management with role assignment, account creation, and activity tracking will be available in Phase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}