'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import { convertToBusinessAction } from '@/lib/actions/account';
import { switchPlanAction } from '@/lib/actions/subscriptions';
import type { SubscriptionTier } from '@/lib/supabase/types';

interface PlanActionButtonProps {
  planKey: Exclude<SubscriptionTier, 'custom'>;
  planName: string;
  accountType: 'individual' | 'business';
  requiresBusinessAccount: boolean;
}

export function PlanActionButton({
  planKey,
  planName,
  accountType,
  requiresBusinessAccount,
}: PlanActionButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const needsBusinessConversion =
    requiresBusinessAccount && accountType === 'individual';

  const handleSwitchOnly = () => {
    startTransition(async () => {
      await switchPlanAction(planKey);
    });
  };

  const handleConvertAndSwitch = () => {
    startTransition(async () => {
      await convertToBusinessAction();
      await switchPlanAction(planKey);
    });
  };

  if (showConfirm && needsBusinessConversion) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-900">
          <p className="font-semibold">{planName} requires a Business account</p>
          <p className="mt-1">Convert your account to unlock branded storefront features.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="flex-1 rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleConvertAndSwitch}
            disabled={isPending}
            className="flex-1 rounded-full bg-orange-500 px-3 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {isPending ? '...' : 'Convert & upgrade'}
          </button>
        </div>
        <button
          onClick={handleSwitchOnly}
          disabled={isPending}
          className="w-full rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Keep as Individual
        </button>
      </div>
    );
  }

  if (needsBusinessConversion) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        className="w-full rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
      >
        Switch to {planName}
      </button>
    );
  }

  return (
    <button
      onClick={handleSwitchOnly}
      disabled={isPending}
      className="w-full rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
    >
      Switch to {planName}
    </button>
  );
}
