import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';
import { signToken } from '@/lib/jwt';

// Coupon configurations
const COUPONS: Record<string, number> = {
  'LADO10': 10,       // 10% Off
  'SOULMATE50': 50,   // 50% Off (Elite Launch Deal)
  'WELCOME20': 20     // 20% Off
};

// Plan price details
const PLANS: Record<string, number> = {
  'Basic': 0,
  'Premium': 2999,    // INR 2999
  'Elite': 9999       // INR 9999
};

export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planName, gateway, couponCode } = body; // gateway = 'Stripe' | 'Razorpay'

    if (!planName || !gateway) {
      return NextResponse.json({ error: 'Plan name and Payment Gateway are required' }, { status: 400 });
    }

    const basePrice = PLANS[planName];
    if (basePrice === undefined) {
      return NextResponse.json({ error: 'Invalid plan choice' }, { status: 400 });
    }

    // Apply coupon discounts
    let discount = 0;
    let finalAmount = basePrice;
    
    if (couponCode) {
      const discountPercent = COUPONS[couponCode.toUpperCase()];
      if (discountPercent !== undefined) {
        discount = (basePrice * discountPercent) / 100;
        finalAmount = basePrice - discount;
      } else {
        return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 });
      }
    }

    const txId = `txn_${Math.random().toString(36).substring(2, 10)}`;
    const invoiceNum = `LADO-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    // Upgrade the user role based on plan purchased
    let userRole: 'CUSTOMER' | 'PREMIUM' | 'ADMIN' | 'RELATIONSHIP_MANAGER' | 'SUPPORT' = 'CUSTOMER';
    if (planName === 'Premium') userRole = 'PREMIUM';
    else if (planName === 'Elite') userRole = 'PREMIUM'; // ELITE profiles are PREMIUM users in DB with Elite features
    
    // update User in DB
    const updatedUser = await db.user.update({
      where: { id: authUser.userId },
      data: { role: userRole }
    });

    // Create transaction log
    const tx = await db.transaction.create({
      data: {
        userId: authUser.userId,
        planName,
        amount: finalAmount,
        paymentGateway: gateway,
        gatewayPaymentId: txId,
        status: 'SUCCESS',
        couponCode: couponCode || null,
        invoiceNumber: invoiceNum
      }
    });

    // Send notification
    await db.notification.create({
      data: {
        userId: authUser.userId,
        type: 'SUBSCRIPTION_EXPIRY',
        title: 'Membership Activated!',
        content: `Congratulations! Your Lado ${planName} Membership is active. Invoice: ${invoiceNum}`
      }
    });

    // We must issue a fresh JWT token to update the role cookie on the frontend
    const token = signToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    const response = NextResponse.json({
      success: true,
      transaction: tx,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified
      },
      message: `Successfully purchased Lado ${planName} plan!`
    });

    response.headers.set('Set-Cookie', `lado_auth_token=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`);
    return response;

  } catch (err: any) {
    console.error('Checkout API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
