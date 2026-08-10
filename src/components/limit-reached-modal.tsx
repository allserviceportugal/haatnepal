"use client";

import Link from "next/link";
import { useState } from "react";

type LimitType = "listings" | "featured";

type Props = {
  isOpen: boolean;
  limitType: LimitType;
  currentPlan: string;
  reason: string;
  onClose: () => void;
};

const PLANS = {
  normal: {
    name: "Normal (Free)",
    listings: 5,
    featured: 0,
    price: "FREE",
    features: ["5 listings/month", "No featured listings"],
  },
  business: {
    name: "Business (Free)",
    listings: 10,
    featured: 0,
    price: "FREE",
    features: ["10 listings/month", "No featured listings", "For registered businesses"],
  },
  plus: {
    name: "Plus",
    listings: 100,
    featured: 3,
    price: "₹499/month",
    features: ["100 listings/month", "3 featured/month", "Ideal for active sellers"],
  },
  pro: {
    name: "Pro",
    listings: "Unlimited",
    featured: "Unlimited",
    price: "₹999/month",
    features: ["Unlimited listings", "Unlimited featured", "Promoted placement", "Branded storefront"],
  },
  custom: {
    name: "Custom Enterprise",
    listings: "Unlimited",
    featured: "Unlimited",
    price: "Custom pricing",
    features: ["Everything in Pro", "No limits", "Dedicated support", "Custom solutions"],
  },
};

export function LimitReachedModal({ isOpen, limitType, currentPlan, reason, onClose }: Props) {
  const [isLoading] = useState(false);

  if (!isOpen) return null;

  const isFeaturedLimit = limitType === "featured";
  const title = isFeaturedLimit
    ? "Featured Listings Limit Reached"
    : "Monthly Listing Limit Reached";

  const currentPlanData = PLANS[currentPlan as keyof typeof PLANS] || PLANS.normal;

  // Determine upgrade paths based on current plan
  const upgradePaths: Record<string, string[]> = {
    normal: ["business", "plus", "pro"],
    business: ["plus", "pro"],
    plus: ["pro", "custom"],
    pro: ["custom"],
    custom: [],
  };

  const nextPlanOptions = upgradePaths[currentPlan] || ["plus", "pro"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <svg className="h-12 w-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 0 1 5.11 6.524a6 6 0 0 1 8.367 8.366m1.414-1.414A8 8 0 1 0 3.11 4.11M8.707 7.293a1 1 0 0 0-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 1 0 1.414 1.414L10 11.414l1.293 1.293a1 1 0 0 0 1.414-1.414L11.414 10l1.293-1.293a1 1 0 0 0-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="mt-2 text-slate-600">{reason}</p>
        </div>

        {/* Current Plan Info */}
        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Your Current Plan</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{currentPlanData.name}</p>
          <div className="mt-2 space-y-1 text-sm text-slate-600">
            <p>📝 {currentPlanData.listings} listings/month</p>
            <p>⭐ {currentPlanData.featured} featured/month</p>
          </div>
        </div>

        {/* Upgrade Options */}
        {nextPlanOptions.length > 0 ? (
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-slate-700">Recommended Upgrades</p>
            <div className="space-y-3">
              {nextPlanOptions.map((planKey) => {
                const plan = PLANS[planKey as keyof typeof PLANS];
                return (
                  <div
                    key={planKey}
                    className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">{plan.name}</h3>
                        <p className="mt-1 text-sm font-semibold text-orange-600">
                          {plan.price}
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-slate-700">
                          <li>📝 {plan.listings} listings/month</li>
                          <li>⭐ {plan.featured} featured/month</li>
                          {(plan as any).features?.map((feature: string) => (
                            <li key={feature}>✓ {feature}</li>
                          ))}
                        </ul>
                      </div>
                      <Link
                        href="/pricing"
                        className="ml-4 flex-shrink-0 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 whitespace-nowrap"
                      >
                        Upgrade
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-center">
            <p className="text-sm font-semibold text-green-700">
              ✓ You're on our highest tier plan!
            </p>
            <p className="mt-1 text-xs text-green-600">
              Contact our support team for custom solutions
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
          <Link
            href="/pricing"
            className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-center font-medium text-white transition hover:bg-orange-700"
          >
            View All Plans
          </Link>
        </div>

        {/* Info */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Limits reset on the 1st of every month
        </p>
      </div>
    </div>
  );
}
