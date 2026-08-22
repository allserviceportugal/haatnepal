'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TransactionConfig } from '@/lib/queries/transaction_config';
import { trackLead } from '@/lib/queries/transaction_config';
import { useCart } from '@/lib/cart/cart-context';
import { createClient } from '@/lib/supabase/client';
import { startConversationAction } from '@/lib/actions/conversations';

interface ListingCTASectionProps {
  listingId: string;
  sellerId: string;
  sellerPhone?: string;
  sellerEmail?: string;
  listingContactPhone?: string | null;
  sellerName: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string | null;
  config: TransactionConfig;
  currentUserId?: string;
  priceOnRequest?: boolean;
}

export function ListingCTASection({
  listingId,
  sellerId,
  sellerPhone,
  sellerEmail,
  listingContactPhone,
  sellerName,
  listingTitle,
  listingPrice,
  listingImage,
  config,
  currentUserId,
  priceOnRequest,
}: ListingCTASectionProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const supabase = createClient();
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  // Use listing's contact phone if provided, otherwise fall back to seller's phone
  const contactPhone = listingContactPhone || sellerPhone;

  const handleContactReveal = useCallback(async () => {
    if (!currentUserId) {
      router.push(`/login?next=/listing/${listingId}`);
      return;
    }

    // Track lead
    await trackLead(supabase, {
      listingId,
      sellerId,
      buyerId: currentUserId,
      leadType: 'contact_revealed',
    });
  }, [currentUserId, listingId, sellerId, supabase, router]);

  const handlePhoneClick = useCallback(async () => {
    if (!currentUserId) {
      router.push(`/login?next=/listing/${listingId}`);
      return;
    }

    await trackLead(supabase, {
      listingId,
      sellerId,
      buyerId: currentUserId,
      leadType: 'phone_click',
    });

    // Open phone dialer
    if (contactPhone) {
      window.location.href = `tel:${contactPhone}`;
    }
  }, [currentUserId, listingId, sellerId, supabase, router, contactPhone]);

  const handleWhatsAppClick = useCallback(async () => {
    if (!currentUserId) {
      router.push(`/login?next=/listing/${listingId}`);
      return;
    }

    await trackLead(supabase, {
      listingId,
      sellerId,
      buyerId: currentUserId,
      leadType: 'whatsapp_click',
    });

    // Open WhatsApp
    if (contactPhone) {
      window.location.href = `https://wa.me/${contactPhone}`;
    }
  }, [currentUserId, listingId, sellerId, supabase, router, contactPhone]);

  const handleEmailClick = useCallback(async () => {
    if (!currentUserId) {
      router.push(`/login?next=/listing/${listingId}`);
      return;
    }

    await trackLead(supabase, {
      listingId,
      sellerId,
      buyerId: currentUserId,
      leadType: 'email_click',
    });

    // Open email
    if (sellerEmail) {
      window.location.href = `mailto:${sellerEmail}`;
    }
  }, [currentUserId, listingId, sellerId, supabase, router, sellerEmail]);

  const handleBuyNow = useCallback(() => {
    if (!currentUserId) {
      router.push(`/login?next=/listing/${listingId}`);
      return;
    }

    // Add to cart and navigate to cart
    addItem({
      listingId,
      title: listingTitle,
      price: listingPrice,
      currency: 'NPR',
      image: listingImage,
      sellerId,
      sellerName,
      district: '',
      quantity: 1,
    });

    router.push('/cart');
  }, [currentUserId, listingId, listingTitle, listingPrice, listingImage, sellerId, sellerName, addItem, router]);

  const handleAddToCart = useCallback(() => {
    if (!currentUserId) {
      router.push(`/login?next=/listing/${listingId}`);
      return;
    }

    // Add to cart
    addItem({
      listingId,
      title: listingTitle,
      price: listingPrice,
      currency: 'NPR',
      image: listingImage,
      sellerId,
      sellerName,
      district: '',
      quantity: 1,
    });

    // Show toast or redirect to cart
    router.push('/cart');
  }, [currentUserId, listingId, listingTitle, listingPrice, listingImage, sellerId, sellerName, addItem, router]);

  return (
    <div className="listing-cta-section space-y-3">
      {/* Anonymous user: show login prompts */}
      {!currentUserId && (
        <>
          {config.allow_contact && (
            <button
              onClick={() => router.push(`/login?next=/listing/${listingId}`)}
              className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
            >
              🔒 Login to view contact
            </button>
          )}
          {config.allow_message && (
            <button
              onClick={() => router.push(`/login?next=/listing/${listingId}`)}
              className="w-full rounded-full border-2 border-orange-500 px-6 py-3 text-sm font-bold text-orange-500 transition hover:bg-orange-50"
            >
              Login to message seller
            </button>
          )}
          {config.allow_checkout && !priceOnRequest && (
            <button
              onClick={() => router.push(`/login?next=/listing/${listingId}`)}
              className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              🛒 Login to buy
            </button>
          )}
        </>
      )}

      {/* Logged-in user: show available CTAs */}
      {currentUserId && (
        <>
          {/* Single call CTA. Respects allow_contact — the previous version
              ignored it, so the phone showed even where contact was disabled. */}
          {config.allow_contact && contactPhone && (
            phoneRevealed ? (
              <button
                onClick={handlePhoneClick}
                className="w-full rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-green-700"
              >
                ☎️ Call {contactPhone}
              </button>
            ) : (
              <button
                onClick={async () => {
                  await handleContactReveal();
                  setPhoneRevealed(true);
                }}
                className="w-full rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-green-700"
              >
                ☎️ Call Seller
              </button>
            )
          )}

          {/* Direct Purchase CTAs */}
          {config.default_transaction_mode === 'direct_purchase' && !priceOnRequest && (
            <>
              <button
                onClick={handleBuyNow}
                className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full rounded-full border-2 border-blue-600 px-6 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
              >
                Add to Cart
              </button>
            </>
          )}

          {/* Classified CTAs */}
          {(config.default_transaction_mode === 'classified' ||
            config.default_transaction_mode === 'hybrid') && (
            <>
              {config.allow_contact && sellerPhone ? (
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full rounded-full border-2 border-green-600 px-6 py-3 text-sm font-bold text-green-600 transition hover:bg-green-50"
                >
                  💬 WhatsApp
                </button>
              ) : null}

              {config.allow_contact && sellerEmail ? (
                <button
                  onClick={handleEmailClick}
                  className="w-full rounded-full border-2 border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  ✉️ Email
                </button>
              ) : null}

              {config.allow_message && (
                <form action={startConversationAction.bind(null, listingId)}>
                  <button
                    type="submit"
                    className="w-full rounded-full border-2 border-orange-500 px-6 py-3 text-sm font-bold text-orange-500 transition hover:bg-orange-50"
                  >
                    💬 Message {sellerName}
                  </button>
                </form>
              )}

              {config.allow_offer && (
                <button
                  onClick={() => router.push(`/dashboard/messages?listing=${listingId}&offer=true`)}
                  className="w-full rounded-full border-2 border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  💰 Make Offer
                </button>
              )}
            </>
          )}

          {/* Hybrid: also show buy options */}
          {config.default_transaction_mode === 'hybrid' && config.allow_checkout && (
            <button
              onClick={handleBuyNow}
              className="w-full rounded-full border-2 border-blue-600 px-6 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
            >
              💳 Buy Now
            </button>
          )}
        </>
      )}
    </div>
  );
}
