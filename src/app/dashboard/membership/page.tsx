'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Check, CreditCard, Sparkles, AlertCircle, 
  DollarSign, Receipt, ShoppingCart, Percent 
} from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

const PLANS = [
  {
    name: 'Basic',
    price: 0,
    period: 'Free',
    features: [
      'Basic profile listing',
      'Community search filters',
      'Send interest up to 5 profiles daily',
      'Standard messaging access (limited)'
    ]
  },
  {
    name: 'Premium',
    price: 2999,
    period: '3 Months',
    features: [
      'Express unlimited interests',
      'View direct telephone/contact details',
      'Unlock secure chat room access',
      '2x higher search priority listing',
      'Standard profile verification badge'
    ]
  },
  {
    name: 'Elite',
    price: 9999,
    period: '1 Year',
    features: [
      'Dedicated personal Relationship Manager',
      'Unlock private video calling room',
      '5x top-tier search priority listing',
      'Personalized manual matchmaking selection',
      'Unlock horoscope compatibility sheets',
      'Private photo privacy settings activated'
    ]
  }
];

export default function MembershipPage() {
  const { user, refreshMe } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Discount/Checkout state
  const [selectedPlan, setSelectedPlan] = useState<any>(PLANS[1]); // Premium by default
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(PLANS[1].price);

  // Billing History state
  const [transactions, setTransactions] = useState<any[]>([]);

  // Calculate final pricing when plan or coupon changes
  const applyCoupon = () => {
    setError('');
    const c = coupon.toUpperCase();
    let discountPercent = 0;

    if (c === 'LADO10') discountPercent = 10;
    else if (c === 'SOULMATE50') discountPercent = 50;
    else if (c === 'WELCOME20') discountPercent = 20;
    else {
      setError("Invalid coupon code");
      setAppliedDiscount(0);
      setFinalPrice(selectedPlan.price);
      return;
    }

    const discountAmount = (selectedPlan.price * discountPercent) / 100;
    setAppliedDiscount(discountAmount);
    setFinalPrice(selectedPlan.price - discountAmount);
  };

  // Sync pricing when plan selection changes
  useEffect(() => {
    setCoupon('');
    setAppliedDiscount(0);
    setFinalPrice(selectedPlan.price);
  }, [selectedPlan]);

  // Fetch billing logs
  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/payments/checkout'); // standard fetch check
      // Wait, we will get transactions using a GET request or fall back
      const txRes = await fetch(`/api/payments/checkout?userId=${user?.id}`); // Or read history
      // Let's call standard fetch to read transaction lists
    } catch (err) {}
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/payments/checkout');
        // Let's implement dynamic mock logs if endpoint is not custom history
        const mockLogs = [
          { id: 'tx-1', planName: 'Basic Registration', amount: 0, paymentGateway: 'System', status: 'SUCCESS', invoiceNumber: 'LADO-2026-908123', createdAt: new Date().toISOString() }
        ];
        setTransactions(mockLogs);
      } catch (err) {}
    };
    fetchHistory();
  }, [user]);

  // Perform purchase simulation
  const handleCheckout = async (gateway: 'Stripe' | 'Razorpay') => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: selectedPlan.name,
          gateway,
          couponCode: appliedDiscount > 0 ? coupon : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        canvasConfetti({
          particleCount: 150,
          spread: 80,
          colors: ['#E91E63', '#FFB6C1', '#FFD700']
        });
        setSuccess(data.message);
        await refreshMe();
        
        // Add transaction to history
        setTransactions(prev => [data.transaction, ...prev]);

        // Auto reload page elements
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.error || 'Transaction failed');
      }
    } catch (err) {
      setError('Checkout failed. Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Premium Membership</h2>
        <p className="text-xs text-foreground/60">Upgrade your search priority to meet matches 10x faster.</p>
      </div>

      {/* Success/Error displays */}
      {success && (
        <div className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 p-4 rounded-2xl text-xs font-bold border border-green-200/50 flex items-center gap-2 shadow-sm">
          <Sparkles className="w-5 h-5 fill-green-600 text-white dark:text-green-950" /> {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-semibold border border-red-200/50 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Main pricing & discount layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Plan list */}
        <div className="lg:col-span-8 grid md:grid-cols-3 gap-4">
          {PLANS.map(plan => {
            const selected = selectedPlan.name === plan.name;
            return (
              <button
                key={plan.name}
                type="button"
                onClick={() => setSelectedPlan(plan)}
                className={`glass-panel p-5 rounded-3xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selected 
                    ? 'border-primary ring-2 ring-primary bg-primary/5' 
                    : 'border-primary/10 hover:border-primary/30 opacity-80'
                }`}
              >
                <div className="space-y-3">
                  <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {plan.name}
                  </span>
                  <div className="text-xl font-extrabold text-foreground">
                    {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                  </div>
                  <span className="text-[10px] opacity-60 block mt-1">Period: {plan.period}</span>
                  
                  <ul className="space-y-1.5 text-[10px] text-foreground/80 pt-3 border-t border-primary/5">
                    {plan.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Checkout Details */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-primary/15 flex flex-col justify-between shadow-sm space-y-6">
          <div className="space-y-5">
            <h3 className="text-xs font-extrabold uppercase opacity-65 flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-primary" /> Checkout Details
            </h3>

            {/* Price Calculations */}
            <div className="space-y-2 border-b border-primary/5 pb-4 text-xs">
              <div className="flex justify-between">
                <span className="opacity-60">Selected Plan:</span>
                <span className="font-extrabold">{selectedPlan.name} Tier</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Base Price:</span>
                <span className="font-extrabold">₹{selectedPlan.price}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="font-bold flex items-center gap-0.5"><Percent className="w-3.5 h-3.5" /> Coupon Discount:</span>
                  <span className="font-extrabold">-₹{appliedDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-dashed border-primary/10">
                <span>Total Amount:</span>
                <span className="text-primary">₹{finalPrice}</span>
              </div>
            </div>

            {/* Coupon Code input */}
            {selectedPlan.price > 0 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold opacity-60">Have a coupon code?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="e.g. SOULMATE50"
                    className="flex-1 h-9 px-3 rounded-lg border border-primary/15 glass-input text-xs uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="h-9 px-3 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-all text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                <span className="text-[8px] opacity-50 block leading-none">Try LADO10 (10% off) or SOULMATE50 (50% off)</span>
              </div>
            )}
          </div>

          {/* Simulated Checkout Buttons */}
          <div className="space-y-2 pt-4">
            {selectedPlan.price === 0 ? (
              <button
                disabled
                className="w-full h-10 rounded-xl border border-primary/20 text-foreground/40 text-xs font-bold"
              >
                Plan Active (Basic)
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleCheckout('Stripe')}
                  disabled={loading}
                  className="w-full h-10 rounded-xl bg-[#635BFF] hover:opacity-95 transition-all text-white text-xs font-bold flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 fill-white" /> Pay via Stripe Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckout('Razorpay')}
                  disabled={loading}
                  className="w-full h-10 rounded-xl bg-[#092C5C] hover:opacity-95 transition-all text-white text-xs font-bold flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 fill-white" /> Pay via Razorpay Sandbox
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Transactions billing logs table */}
      <div className="glass-panel p-6 rounded-3xl border border-primary/10 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold flex items-center gap-1.5 border-b border-primary/5 pb-3">
          <Receipt className="w-5 h-5 text-primary" /> Billing History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="opacity-60 border-b border-primary/5">
                <th className="py-2.5">Invoice No</th>
                <th>Plan Name</th>
                <th>Amount</th>
                <th>Gateway</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {transactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-primary/5">
                  <td className="py-3 font-extrabold">{tx.invoiceNumber}</td>
                  <td>{tx.planName}</td>
                  <td className="font-bold">₹{tx.amount}</td>
                  <td>{tx.paymentGateway}</td>
                  <td>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/10 text-green-600">
                      {tx.status}
                    </span>
                  </td>
                  <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="text-right">
                    <button
                      onClick={() => alert(`Invoice download simulation: PDF generated for ${tx.invoiceNumber}`)}
                      className="text-primary font-bold hover:underline"
                    >
                      Download Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
