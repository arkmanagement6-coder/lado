import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

// Helper to calculate deterministic mock astro sign details based on user ID
function getAstroDetails(userId: string) {
  const nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  const rashis = ['Mesh (Aries)', 'Vrishabh (Taurus)', 'Mithun (Gemini)', 'Kark (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchik (Scorpio)', 'Dhanu (Sagittarius)', 'Makar (Capricorn)', 'Kumbh (Aquarius)', 'Meen (Pisces)'];

  // Sum character codes to get a stable index
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash += userId.charCodeAt(i);
  }

  const nakshatra = nakshatras[hash % nakshatras.length];
  const rashi = rashis[hash % rashis.length];
  const charana = (hash % 4) + 1;
  const isManglik = hash % 5 === 0; // 20% Manglik rate

  return { nakshatra, rashi, charana, isManglik };
}

export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { partnerId } = body;

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }

    // Get astro details of both users
    const myAstro = getAstroDetails(authUser.userId);
    const partnerAstro = getAstroDetails(partnerId);

    // Sum their IDs to calculate a stable shared seed for Gun Milan
    let seed = 0;
    const combinedId = authUser.userId + partnerId;
    for (let i = 0; i < combinedId.length; i++) {
      seed += combinedId.charCodeAt(i);
    }

    // Gun Milan matches are typically between 18 and 36 for acceptable matches
    const gunMilan = 18 + (seed % 19); 
    
    // Assess Manglik Compatibility
    let manglikStatus = 'Compatible';
    if (myAstro.isManglik && !partnerAstro.isManglik) {
      manglikStatus = 'Partial Dosha (Anumodan Required)';
    } else if (!myAstro.isManglik && partnerAstro.isManglik) {
      manglikStatus = 'Partial Dosha (Anumodan Required)';
    } else if (myAstro.isManglik && partnerAstro.isManglik) {
      manglikStatus = 'Double Manglik (Highly Compatible)';
    }

    // Dosha calculations
    const doshas = ['None', 'Nadi Dosha (Remedy Applicable)', 'Bhakoot Dosha (Pooja Suggested)', 'None'];
    const dosha = doshas[seed % doshas.length];

    // Predictions text
    let marriagePrediction = 'The combination represents a balanced relationship with shared spiritual energy. ';
    if (gunMilan >= 28) {
      marriagePrediction += 'Excellent Gun Milan. Astrological signs indicate strong emotional bonding, high financial prosperity, and strong long-term family harmony.';
    } else if (gunMilan >= 22) {
      marriagePrediction += 'Good match. The couple will share harmonious interactions, though they should align on career expectations and communication styles.';
    } else {
      marriagePrediction += 'Average match. Astrological remedies are recommended to smooth over differences in temperaments and family alignments.';
    }

    // Auspicious dates (mock next 3 dates)
    const luckyDates = ['2026-11-23', '2026-12-14', '2027-01-18'];

    return NextResponse.json({
      myAstro,
      partnerAstro,
      gunMilan,
      manglikStatus,
      dosha,
      marriagePrediction,
      luckyDates
    });
  } catch (err: any) {
    console.error('Horoscope matching API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
