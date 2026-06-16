import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

// Helper to calculate age from DOB string (YYYY-MM-DD)
function getAge(dobString?: string): number {
  if (!dobString) return 28; // Default fallback age
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Calculate compatibility score (50% - 100%)
function calculateMatch(userProfile: any, targetProfile: any) {
  let score = 50; // Base compatible level
  const details: string[] = [];

  const userAge = getAge(userProfile.dob);
  const targetAge = getAge(targetProfile.dob);

  // 1. Age check (Max 15%)
  const prefAgeFrom = userProfile.prefAgeFrom || 18;
  const prefAgeTo = userProfile.prefAgeTo || 50;
  if (targetAge >= prefAgeFrom && targetAge <= prefAgeTo) {
    score += 15;
    details.push("Age preferences match");
  } else if (Math.abs(targetAge - prefAgeFrom) <= 3 || Math.abs(targetAge - prefAgeTo) <= 3) {
    score += 8;
    details.push("Age close to preferences");
  }

  // 2. Religion & Caste (Max 15%)
  if (userProfile.religion && targetProfile.religion && userProfile.religion === targetProfile.religion) {
    score += 8;
    details.push("Same religion");
    if (userProfile.caste && targetProfile.caste && userProfile.caste === targetProfile.caste) {
      score += 7;
      details.push("Same caste");
    }
  }

  // 3. Location matching (Max 10%)
  if (userProfile.country && targetProfile.country && userProfile.country === targetProfile.country) {
    score += 4;
    if (userProfile.state && targetProfile.state && userProfile.state === targetProfile.state) {
      score += 3;
      if (userProfile.city && targetProfile.city && userProfile.city === targetProfile.city) {
        score += 3;
        details.push("Same city");
      } else {
        details.push("Same state");
      }
    } else {
      details.push("Same country");
    }
  }

  // 4. Mother tongue (Max 5%)
  if (userProfile.motherTongue && targetProfile.motherTongue && userProfile.motherTongue === targetProfile.motherTongue) {
    score += 5;
    details.push("Same mother tongue");
  }

  // 5. Diet preference (Max 5%)
  if (userProfile.diet && targetProfile.diet && userProfile.diet === targetProfile.diet) {
    score += 5;
    details.push("Matching dietary choices");
  }

  // 6. Complete profile verification/boost bonus (Max 5%)
  if (targetProfile.profileBoost) {
    score += 3;
  }

  const finalScore = Math.min(score, 100);
  
  let label = "Compatible Match";
  if (finalScore >= 90) label = "Perfect Match";
  else if (finalScore >= 70) label = "Good Match";

  return {
    score: finalScore,
    label,
    details
  };
}

export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse search parameters
    const { searchParams } = new URL(req.url);
    const gender = searchParams.get('gender'); // Bride or Groom
    const ageFrom = searchParams.get('ageFrom') ? parseInt(searchParams.get('ageFrom')!) : null;
    const ageTo = searchParams.get('ageTo') ? parseInt(searchParams.get('ageTo')!) : null;
    const religion = searchParams.get('religion');
    const caste = searchParams.get('caste');
    const motherTongue = searchParams.get('motherTongue');
    const country = searchParams.get('country');
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const maritalStatus = searchParams.get('maritalStatus');
    const diet = searchParams.get('diet');
    const premiumOnly = searchParams.get('premiumOnly') === 'true';
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

    // Fetch active user profile
    const userProfile = await db.profile.findUnique({ where: { id: authUser.userId } });
    if (!userProfile) {
      return NextResponse.json({ error: 'Please set up your profile first' }, { status: 400 });
    }

    // Determine target gender to show
    // By default, show opposite gender
    const targetGender = gender || (userProfile.gender === 'Bride' ? 'Groom' : 'Bride');

    // Fetch potential matches
    const allProfiles = await db.profile.findMany();
    const allUsers = await db.user.findMany();

    // Map profiles to their corresponding user account information
    let matches = allProfiles
      .filter((p: any) => p.id !== authUser.userId) // Exclude current user
      .map((p: any) => {
        const u = allUsers.find((user: any) => user.id === p.id);
        return {
          ...p,
          user: u ? {
            id: u.id,
            name: u.name,
            email: u.email,
            mobileNumber: u.mobileNumber,
            role: u.role,
            isVerified: u.isVerified,
            status: u.status
          } : null
        };
      })
      .filter((p: any) => p.user !== null && p.user.status === 'ACTIVE');

    // Apply strict filtering
    if (targetGender) {
      matches = matches.filter((p: any) => p.gender === targetGender);
    }
    if (religion) {
      matches = matches.filter((p: any) => p.religion?.toLowerCase() === religion.toLowerCase());
    }
    if (caste) {
      matches = matches.filter((p: any) => p.caste?.toLowerCase() === caste.toLowerCase());
    }
    if (motherTongue) {
      matches = matches.filter((p: any) => p.motherTongue?.toLowerCase() === motherTongue.toLowerCase());
    }
    if (country) {
      matches = matches.filter((p: any) => p.country?.toLowerCase() === country.toLowerCase());
    }
    if (state) {
      matches = matches.filter((p: any) => p.state?.toLowerCase() === state.toLowerCase());
    }
    if (city) {
      matches = matches.filter((p: any) => p.city?.toLowerCase() === city.toLowerCase());
    }
    if (maritalStatus) {
      matches = matches.filter((p: any) => p.maritalStatus?.toLowerCase() === maritalStatus.toLowerCase());
    }
    if (diet) {
      matches = matches.filter((p: any) => p.diet?.toLowerCase() === diet.toLowerCase());
    }
    if (premiumOnly) {
      matches = matches.filter((p: any) => p.user?.role === 'PREMIUM' || p.user?.role === 'ELITE');
    }
    if (verifiedOnly) {
      matches = matches.filter((p: any) => p.user?.isVerified === true);
    }

    // Map calculations
    let results = matches.map((target: any) => {
      const targetAge = getAge(target.dob);
      const compatibility = calculateMatch(userProfile, target);
      return {
        ...target,
        age: targetAge,
        compatibility
      };
    });

    // Apply age filters if specified
    if (ageFrom !== null) {
      results = results.filter((r: any) => r.age >= ageFrom);
    }
    if (ageTo !== null) {
      results = results.filter((r: any) => r.age <= ageTo);
    }

    // Sort by compatibility score (descending)
    results.sort((a: any, b: any) => b.compatibility.score - a.compatibility.score);

    return NextResponse.json(results);
  } catch (err: any) {
    console.error('Matches fetch error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
