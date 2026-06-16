import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

// Seed mock vendors if none exist
const MOCK_VENDORS = [
  {
    userId: 'vendor-user-1',
    companyName: 'Royal Frame Studio',
    category: 'Photographer',
    packagesDetails: 'Pre-Wedding shoot + Wedding coverage: ₹75,000 | Premium Cinematography package: ₹1,50,000',
    portfolioPhotos: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80,https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
    location: 'Delhi NCR',
    contactNumber: '+91 98765 43210',
    rating: 4.9,
    isVerified: true
  },
  {
    userId: 'vendor-user-2',
    companyName: 'Glow by Meera',
    category: 'Makeup Artist',
    packagesDetails: 'Bridal HD Makeup: ₹25,000 | Airbrush Premium package: ₹45,000',
    portfolioPhotos: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80',
    location: 'Mumbai',
    contactNumber: '+91 99998 88887',
    rating: 4.8,
    isVerified: true
  },
  {
    userId: 'vendor-user-3',
    companyName: 'Grand Palace Banquet',
    category: 'Banquet Hall',
    packagesDetails: 'Hall Rent + basic decor: ₹2,00,000 | Premium Catering + Hall: ₹5,00,000 per day',
    portfolioPhotos: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80',
    location: 'Bangalore',
    contactNumber: '+91 88888 77777',
    rating: 4.7,
    isVerified: true
  },
  {
    userId: 'vendor-user-4',
    companyName: 'Vaidik Pandit Seva',
    category: 'Pandit',
    packagesDetails: 'Wedding Pujas + Kundali matching rituals: ₹15,000',
    portfolioPhotos: 'https://images.unsplash.com/photo-1532980400857-e8d9d275d858?w=600&q=80',
    location: 'Pune',
    contactNumber: '+91 77777 66666',
    rating: 5.0,
    isVerified: true
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    // Retrieve vendors
    let vendors = await db.vendorProfile.findMany();

    // If none in database, seed them into the mock DB
    if (vendors.length === 0) {
      for (const v of MOCK_VENDORS) {
        await db.vendorProfile.create({ data: v });
      }
      vendors = await db.vendorProfile.findMany();
    }

    if (category) {
      vendors = vendors.filter((v: any) => v.category === category);
    }

    return NextResponse.json(vendors);
  } catch (err: any) {
    console.error('Marketplace GET error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { vendorProfileId, eventDate, notes } = body;

    if (!vendorProfileId) {
      return NextResponse.json({ error: 'Vendor Profile ID is required' }, { status: 400 });
    }

    const newLead = await db.vendorLead.create({
      data: {
        userId: authUser.userId,
        vendorProfileId,
        eventDate,
        notes
      }
    });

    return NextResponse.json({ success: true, lead: newLead });
  } catch (err: any) {
    console.error('Marketplace POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
