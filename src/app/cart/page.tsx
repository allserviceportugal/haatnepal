'use client';

import Link from 'next/link';
import { useCart, type CartItem } from '@/lib/cart/cart-context';

export default function CartPage() {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Your cart is empty</h2>
          <p className="text-slate-600 mb-6">Start shopping to add items to your cart</p>
          <Link href="/search" className="inline-block rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Group items by seller
  const itemsBySeller = state.items.reduce<Record<string, CartItem[]>>(
    (acc: Record<string, CartItem[]>, item: CartItem) => {
      if (!acc[item.sellerId]) acc[item.sellerId] = [];
      acc[item.sellerId].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-900">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(itemsBySeller).map(([sellerId, items]) => (
              <div key={sellerId} className="border rounded-lg bg-white p-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                  From {items[0]?.sellerName} ({items.length} item{items.length !== 1 ? 's' : ''})
                </h3>

                {items.map((item) => (
                  <div key={item.listingId} className="flex gap-4 py-4 border-b last:border-b-0">
                    {/* Image */}
                    {item.image && (
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1">
                      <Link href={`/listing/${item.listingId}`} className="font-semibold text-slate-900 hover:text-orange-600">
                        {item.title}
                      </Link>
                      <p className="text-slate-600 text-sm">
                        ₹{item.price.toLocaleString('en-IN')} each
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.listingId, item.quantity - 1)}
                        className="px-2 py-1 border rounded hover:bg-slate-100"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.listingId, parseInt(e.target.value))}
                        className="w-12 text-center border rounded"
                      />
                      <button
                        onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                        className="px-2 py-1 border rounded hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.listingId)}
                        className="text-red-600 text-sm hover:underline mt-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border rounded-lg bg-white p-6 h-fit sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal ({state.items.length} items)</span>
                <span>₹{state.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Shipping</span>
                <span>
                  {state.shipping === 0 ? (
                    <span className="text-green-600 font-semibold">Free</span>
                  ) : (
                    `₹${state.shipping.toLocaleString('en-IN')}`
                  )}
                </span>
              </div>
              {state.subtotal < 5000 && state.shipping > 0 && (
                <p className="text-xs text-slate-500">
                  Free shipping on orders over ₹5,000
                </p>
              )}
            </div>

            <div className="flex justify-between text-lg font-bold mb-6 text-slate-900">
              <span>Total</span>
              <span>₹{state.total.toLocaleString('en-IN')}</span>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 mb-3"
            >
              Proceed to Checkout
            </Link>

            <button
              onClick={clearCart}
              className="w-full text-center text-sm font-semibold text-slate-600 hover:text-slate-900 py-2"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
