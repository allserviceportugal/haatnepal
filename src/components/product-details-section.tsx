import { formatPrice } from '@/lib/format';
import type { Listing } from '@/lib/supabase/types';

interface ProductDetailsSectionProps {
  listing: Partial<Listing> & {
    sku?: string;
    stock_quantity?: number;
    delivery_fee?: number;
    delivery_time_days?: number;
    warranty_period?: string;
    return_policy?: string;
    payment_methods?: string[];
  };
}

export function ProductDetailsSection({ listing }: ProductDetailsSectionProps) {
  if (
    !listing.sku &&
    !listing.stock_quantity &&
    !listing.delivery_fee &&
    !listing.delivery_time_days &&
    !listing.warranty_period &&
    !listing.return_policy &&
    !listing.payment_methods
  ) {
    return null;
  }

  const paymentMethods = Array.isArray(listing.payment_methods) ? listing.payment_methods : [];

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="font-black text-slate-900">Product Details</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {listing.sku && (
          <div>
            <p className="text-xs font-semibold text-slate-500">SKU</p>
            <p className="mt-1 font-semibold text-slate-900">{listing.sku}</p>
          </div>
        )}

        {listing.stock_quantity !== null && listing.stock_quantity !== undefined && (
          <div>
            <p className="text-xs font-semibold text-slate-500">Stock</p>
            <p className="mt-1 font-semibold text-slate-900">
              {listing.stock_quantity > 0 ? `${listing.stock_quantity} units` : 'Out of stock'}
            </p>
          </div>
        )}

        {listing.delivery_fee && (
          <div>
            <p className="text-xs font-semibold text-slate-500">Delivery Fee</p>
            <p className="mt-1 font-semibold text-slate-900">
              {formatPrice(listing.delivery_fee, 'NPR')}
            </p>
          </div>
        )}

        {listing.delivery_time_days && (
          <div>
            <p className="text-xs font-semibold text-slate-500">Delivery Time</p>
            <p className="mt-1 font-semibold text-slate-900">
              {listing.delivery_time_days} day{listing.delivery_time_days === 1 ? '' : 's'}
            </p>
          </div>
        )}

        {listing.warranty_period && (
          <div>
            <p className="text-xs font-semibold text-slate-500">Warranty</p>
            <p className="mt-1 font-semibold text-slate-900">{listing.warranty_period}</p>
          </div>
        )}

        {listing.return_policy && (
          <div>
            <p className="text-xs font-semibold text-slate-500">Return Policy</p>
            <p className="mt-1 font-semibold text-slate-900">{listing.return_policy}</p>
          </div>
        )}
      </div>

      {paymentMethods.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500">Accepted Payment Methods</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {paymentMethods.map((method: string) => (
              <span
                key={method}
                className="inline-block rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 capitalize"
              >
                {method.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
