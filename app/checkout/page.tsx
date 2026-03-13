"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { useCart } from "@/contexts/CartContext";
import { shippingSchema, paymentSchema, ShippingFormValues, PaymentFormValues } from "@/schemas/checkoutSchemas";
import { getProductsByIds } from "@/services/products";
import { Product } from "@/types";
import SystemWindow from "@/components/SystemWindow";
import GoldRefillModal from "@/components/GoldRefillModal";

const FormLabel = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-xs font-orbitron font-bold text-system-accent uppercase tracking-widest mb-1">{children}</label>
);

const FormInput = ({ id, value, onChange, error }: { id: string, value: string, onChange: (val: string) => void, error?: string }) => (
  <div>
    <input
      type="text"
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-sm border border-system-border/50 bg-black/50 py-2 px-3 text-sm font-rajdhani text-system-text focus:border-system-accent focus:outline-none focus:ring-1 focus:ring-system-accent transition-colors"
    />
    {error && <p className="mt-1 text-xs font-orbitron text-system-error tracking-wider">{error}</p>}
  </div>
);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isLoading, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [showRefillModal, setShowRefillModal] = useState(false);

  
  // Form States
  const [shipping, setShipping] = useState<Partial<ShippingFormValues>>({});
  const [payment, setPayment] = useState<Partial<PaymentFormValues>>({ method: "gold" });
  const [upiProvider, setUpiProvider] = useState<string | null>(null);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    async function fetchCartProducts() {
      if (items.length > 0) {
        const productIds = items.map(i => i.productId);
        const fetchedProducts = await getProductsByIds(productIds);
        const map: Record<string, Product> = {};
        fetchedProducts.forEach(p => { map[p.id] = p; });
        setProducts(map);
      }
    }
    if (!isLoading && items.length > 0) {
      fetchCartProducts();
    } else if (!isLoading && items.length === 0 && step === 1) {
      router.push("/cart"); // Can't checkout empty cart
    }
  }, [items, isLoading, step, router]);

  const subtotal = items.reduce((total, item) => total + (item.priceSnapshot * item.quantity), 0);
  const shippingCost = 15.00; // Mock flat rate
  const total = subtotal + shippingCost;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Sanitize before validation
    const cleanData = {
      name: DOMPurify.sanitize(shipping.name || ""),
      address: DOMPurify.sanitize(shipping.address || ""),
      city: DOMPurify.sanitize(shipping.city || ""),
      postalCode: DOMPurify.sanitize(shipping.postalCode || ""),
      country: DOMPurify.sanitize(shipping.country || ""),
    };

    const result = shippingSchema.safeParse(cleanData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setShipping(cleanData);
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = paymentSchema.safeParse(payment);
    if (!result.success) {
      setErrors({ method: result.error.errors[0].message });
      return;
    }

    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setErrors({});
    
    // Simulate current user ID (Since checkout might be done by a guest, 
    // we should ideally read this from context. For now we fetch from firebase auth directly)
    const { auth } = await import("@/lib/firebase");
    const userId = auth.currentUser?.uid || "guest";
    
    const { createOrder } = await import("@/services/orders");
    
    // items contain { productId, quantity, priceSnapshot }
    const res = await createOrder(userId, items, shipping, total, payment.method || "gold");
    
    if (res.success) {
      clearCart();
      router.push("/order-success");
    } else {
      if (res.error === "INSUFFICIENT_FUNDS") {
        setShowRefillModal(true);
      } else {
        setErrors({ form: res.error || "Transaction failed. Please try again." });
      }
      setIsSubmitting(false);
    }
  };

  if (isLoading || items.length === 0) return null; // Let effect redirect empty carts


  return (
    <div className="w-full flex-grow animate-fade-in-up pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SystemWindow title="SECURE TRANSACTION PROTOCOL">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start p-2">
          
          {/* Main Form Area */}
          <div className="lg:col-span-7">
            
            {/* Step 1: Shipping */}
            <div className={`bg-black/60 shadow-system-glow relative rounded-sm mb-6 border \${step === 1 ? 'border-system-accent ring-1 ring-system-accent/50' : 'border-system-border/30 opacity-70'} transition-all`}>
              <div className="px-4 py-4 flex justify-between items-center bg-system-bg/80 border-b border-system-border/50">
                <h3 className="text-sm font-orbitron font-bold text-system-text tracking-widest uppercase">
                  <span className="text-system-accent mr-2">01.</span>Delivery Coordinates
                </h3>
                {step > 1 && (
                  <button onClick={() => setStep(1)} className="text-system-accent text-xs font-orbitron hover:text-white transition-colors uppercase tracking-widest">[ Edit ]</button>
                )}
              </div>
              
              {step === 1 && (
                <div className="px-4 py-5 sm:p-6 text-system-text">
                  <form onSubmit={handleShippingSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div className="sm:col-span-2">
                      <FormLabel htmlFor="name">Entity Designation (Name)</FormLabel>
                      <FormInput id="name" value={shipping.name || ""} onChange={(v) => setShipping({ ...shipping, name: v })} error={errors.name} />
                    </div>

                    <div className="sm:col-span-2">
                      <FormLabel htmlFor="address">Base Coordinates (Address)</FormLabel>
                      <FormInput id="address" value={shipping.address || ""} onChange={(v) => setShipping({ ...shipping, address: v })} error={errors.address} />
                    </div>

                    <div>
                      <FormLabel htmlFor="city">Sector (City)</FormLabel>
                      <FormInput id="city" value={shipping.city || ""} onChange={(v) => setShipping({ ...shipping, city: v })} error={errors.city} />
                    </div>

                    <div>
                      <FormLabel htmlFor="country">Region (Country)</FormLabel>
                      <FormInput id="country" value={shipping.country || ""} onChange={(v) => setShipping({ ...shipping, country: v })} error={errors.country} />
                    </div>

                    <div>
                      <FormLabel htmlFor="postalCode">Zone Code (Postal)</FormLabel>
                      <FormInput id="postalCode" value={shipping.postalCode || ""} onChange={(v) => setShipping({ ...shipping, postalCode: v })} error={errors.postalCode} />
                    </div>

                    <div className="sm:col-span-2 mt-4 pt-4 border-t border-system-border/30">
                      <button type="submit" className="w-full relative overflow-hidden bg-system-accent/10 border border-system-accent py-3 px-4 rounded-sm text-sm font-orbitron font-bold uppercase tracking-widest text-system-accent transition-all hover:bg-system-accent hover:text-black hover:shadow-system-glow focus:outline-none">
                        Lock Coordinates
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {step > 1 && (
                <div className="px-4 py-4 text-sm font-rajdhani text-system-muted">
                  {shipping.name}<br/>
                  {shipping.address}<br/>
                  {shipping.city}, {shipping.postalCode} {shipping.country}
                </div>
              )}
            </div>

            {/* Step 2: Payment */}
            <div className={`bg-black/60 shadow-system-glow relative rounded-sm mb-6 border \${step === 2 ? 'border-system-accent ring-1 ring-system-accent/50' : 'border-system-border/30'} \${step < 2 ? 'opacity-40 grayscale' : 'opacity-70'} transition-all`}>
              <div className="px-4 py-4 flex justify-between items-center bg-system-bg/80 border-b border-system-border/50">
                <h3 className="text-sm font-orbitron font-bold text-system-text tracking-widest uppercase">
                  <span className="text-system-accent mr-2">02.</span>Fund Transfer Method
                </h3>
                {step > 2 && (
                  <button onClick={() => setStep(2)} className="text-system-accent text-xs font-orbitron hover:text-white transition-colors uppercase tracking-widest">[ Edit ]</button>
                )}
              </div>
              
              {step === 2 && (
                <div className="px-4 py-5 sm:p-6 text-system-text">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "gold", label: "Registry Gold", icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /> },
                      { id: "upi", label: "UPI Transfer", icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
                      { id: "credit_card", label: "Credit Card", icon: <path d="M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM3 6h18v4H3V6zm18 12H3V12h18v6z" /> },
                      { id: "paypal", label: "PayPal", icon: <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" /> },
                      { id: "apple_pay", label: "Apple Pay", icon: <path d="M17.05 20.28c-.96.95-2.05 1.44-3.13 1.44-1.18 0-2.15-.45-3.32-1.44-1.18.99-2.25 1.44-3.34 1.44-1.09 0-2.17-.49-3.13-1.44C2.39 18.52 1.5 15.63 1.5 12.38c0-3.31 1.13-5.22 3.01-6.19.86-.45 1.74-.63 2.65-.63 1.41 0 2.48.54 3.19 1.14.71-.6 1.78-1.14 3.19-1.14.91 0 1.79.18 2.65.63 1.88.97 3.01 2.88 3.01 6.19 0 3.25-.89 6.14-2.65 7.9z" /> }
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setPayment({ ...payment, method: method.id as any });
                          if (method.id === "upi") setShowUpiModal(true);
                        }}
                        className={`flex items-center gap-4 p-4 rounded-sm border transition-all ${
                          payment.method === method.id 
                          ? 'border-system-accent bg-system-accent/10 shadow-system-glow' 
                          : 'border-system-border/30 bg-black/40 hover:border-system-muted'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${payment.method === method.id ? 'bg-system-accent text-black' : 'bg-system-border/20 text-system-muted'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {method.icon}
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-orbitron font-bold uppercase tracking-widest text-system-text">{method.label}</p>
                          {method.id === "upi" && upiProvider && (
                            <p className="text-[8px] font-mono text-system-accent uppercase mt-1">Provider: {upiProvider}</p>
                          )}
                        </div>
                        {payment.method === method.id && (
                          <div className="ml-auto w-1.5 h-1.5 bg-system-accent rounded-full animate-pulse shadow-system-glow"></div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {errors.method && <p className="mt-4 text-xs font-orbitron text-system-error">{errors.method}</p>}
                  
                  <div className="mt-8 pt-4 border-t border-system-border/30">
                    <button 
                      type="button"
                      onClick={() => setStep(3)}
                      className="w-full relative overflow-hidden bg-system-accent/10 border border-system-accent py-3 px-4 rounded-sm text-sm font-orbitron font-bold uppercase tracking-widest text-system-accent transition-all hover:bg-system-accent hover:text-black hover:shadow-system-glow focus:outline-none"
                    >
                      Verify Funds
                    </button>
                  </div>
                </div>
              )}
              {step > 2 && (
                <div className="px-4 py-4 flex items-center gap-3">
                  <div className="w-2 h-2 bg-system-accent rounded-full shadow-system-glow"></div>
                  <div className="text-sm font-orbitron text-system-muted uppercase tracking-wider">
                    {payment.method?.replace('_', ' ')} {upiProvider ? `(${upiProvider})` : ''}
                  </div>
                </div>
              )}

            </div>

            {/* Step 3: Review */}
            <div className={`bg-black/60 shadow-system-glow relative rounded-sm border ${step === 3 ? 'border-system-accent ring-1 ring-system-accent/50 opacity-100' : 'border-system-border/30'} ${step < 3 ? 'opacity-40 grayscale' : ''} transition-all`}>
              <div className="px-4 py-4 bg-system-bg/80 border-b border-system-border/50">
                <h3 className="text-sm font-orbitron font-bold text-system-text tracking-widest uppercase">
                  <span className="text-system-accent mr-2">03.</span>Execute Transaction
                </h3>
              </div>
              
              {step === 3 && (
                <div className="px-4 py-5 sm:p-6 text-system-text text-center">
                  <p className="text-sm font-rajdhani text-system-muted mb-6">Awaiting final confirmation to deduct funds and dispatch items.</p>
                  
                  {errors.form && <p className="mb-4 text-xs font-orbitron text-system-error p-2 bg-system-error/10 border border-system-error">{errors.form}</p>}
                  
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="w-full bg-system-success/20 border border-system-success py-4 px-4 text-lg font-orbitron font-bold uppercase tracking-widest text-system-success hover:bg-system-success hover:text-black focus:outline-none focus:ring-1 focus:ring-system-success disabled:opacity-50 transition-all hover:shadow-system-success"
                  >
                    {isSubmitting ? "PROCESSING..." : `CONFIRM [ ${total.toFixed(2)} G ]`}
                  </button>
                </div>
              )}
            </div>
            
          </div>

          {/* Order Summary Sidebar */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="bg-black/40 shadow-inner border border-system-border/50 rounded-sm">
              <div className="px-4 py-4 bg-system-bg/60 border-b border-system-border/50">
                <h2 className="text-sm font-orbitron font-bold text-system-accent uppercase tracking-[0.2em]">Transaction Registry</h2>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <ul className="divide-y divide-system-border/30 border-b border-system-border/30 pb-4 mb-4">
                  {items.map(item => {
                    const prod = products[item.productId];
                    return (
                      <li key={item.productId} className="py-3 flex text-sm font-rajdhani">
                        <div className="flex-1 flex flex-col pr-4">
                          <span className="font-bold text-system-text line-clamp-1">{prod?.title || 'Loading...'}</span>
                          <span className="text-system-muted text-xs font-orbitron mt-1 tracking-wider uppercase">Qty: {item.quantity}</span>
                        </div>
                        <span className="text-system-accent font-orbitron whitespace-nowrap">{(item.priceSnapshot * item.quantity).toFixed(2)} G</span>
                      </li>
                    );
                  })}
                </ul>

                <dl className="space-y-4 text-sm font-orbitron tracking-widest">
                  <div className="flex justify-between text-system-muted">
                    <dt className="uppercase">Equip Value</dt>
                    <dd>{subtotal.toFixed(2)} G</dd>
                  </div>
                  <div className="flex justify-between text-system-muted">
                    <dt className="uppercase">Transfer Fee</dt>
                    <dd>{shippingCost.toFixed(2)} G</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-system-border/50 pt-4 text-lg font-bold text-system-accent drop-shadow-[0_0_5px_rgba(0,240,255,0.6)]">
                    <dt className="uppercase">Total Deduction</dt>
                    <dd>{total.toFixed(2)} G</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

        </div>
      </SystemWindow>

      {showRefillModal && (
        <GoldRefillModal 
          onClose={() => setShowRefillModal(false)} 
          onSuccess={() => {
            // Once refilled, user might want to try again
            // We can just stay on the current step and let them click confirm again
            // or show a message.
          }} 
        />
      )}
      {showUpiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md transform animate-scale-in">
            <SystemWindow 
              title="UPI PROVIDER SELECTION"
              headerAction={
                <button onClick={() => setShowUpiModal(false)} className="text-system-muted hover:text-system-accent transition-colors font-orbitron text-xs uppercase">[ Back ]</button>
              }
            >
              <div className="p-6">
                <p className="text-center text-xs font-rajdhani text-system-muted mb-6 uppercase tracking-widest">Select your preferred UPI portal</p>
                <div className="grid grid-cols-1 gap-3">
                  {["PhonePe", "GPay", "Navi", "Paytm", "Pop UPI"].map((provider) => (
                    <button
                      key={provider}
                      onClick={() => {
                        setUpiProvider(provider);
                        setShowUpiModal(false);
                      }}
                      className="flex items-center justify-between p-4 bg-black/40 border border-system-border/30 rounded-sm hover:border-system-accent transition-all group"
                    >
                      <span className="text-xs font-orbitron font-bold uppercase tracking-widest text-system-text group-hover:text-system-accent">{provider}</span>
                      <div className="w-2 h-2 border border-system-border/50 rounded-full group-hover:bg-system-accent group-hover:shadow-system-glow transition-all"></div>
                    </button>
                  ))}
                </div>
              </div>
            </SystemWindow>
          </div>
        </div>
      )}
    </div>
  );
}
