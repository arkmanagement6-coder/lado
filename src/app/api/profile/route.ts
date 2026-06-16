import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

// GET active profile
export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.profile.findUnique({ where: { id: authUser.userId } });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (err: any) {
    console.error('Get Profile API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST/PUT to update profile wizard steps
export async function PUT(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Clean fields before writing
    const profileData: any = {};
    const fields = [
      'gender', 'dob', 'maritalStatus', 'height', 'weight', 'bloodGroup',
      'religion', 'caste', 'subCaste', 'motherTongue', 'gothra',
      'highestQualification', 'college', 'occupation', 'annualIncome',
      'fatherOccupation', 'motherOccupation', 'brothers', 'sisters', 'familyType', 'familyStatus',
      'diet', 'smoking', 'drinking', 'hobbies',
      'country', 'state', 'city', 'address',
      'profilePhoto', 'galleryPhotos', 'horoscope', 'idProof',
      'prefAgeFrom', 'prefAgeTo', 'prefHeightFrom', 'prefHeightTo',
      'prefReligion', 'prefCaste', 'prefEducation', 'prefOccupation', 'prefLocation',
      'bio', 'voiceBio', 'videoIntroduction', 'photoPrivacy', 'profileBoost'
    ];

    fields.forEach(f => {
      if (body[f] !== undefined) {
        profileData[f] = body[f];
      }
    });

    // Handle number conversions
    if (profileData.annualIncome !== undefined) profileData.annualIncome = parseFloat(profileData.annualIncome) || 0;
    if (profileData.brothers !== undefined) profileData.brothers = parseInt(profileData.brothers) || 0;
    if (profileData.sisters !== undefined) profileData.sisters = parseInt(profileData.sisters) || 0;
    if (profileData.prefAgeFrom !== undefined) profileData.prefAgeFrom = parseInt(profileData.prefAgeFrom) || 18;
    if (profileData.prefAgeTo !== undefined) profileData.prefAgeTo = parseInt(profileData.prefAgeTo) || 50;

    // Check current profile to compute final completion %
    const existingProfile = await db.profile.findUnique({ where: { id: authUser.userId } }) || {};
    
    // Combine existing fields and updated fields for completion calculation
    const merged = { ...existingProfile, ...profileData };
    
    let completionPercent = 10; // Base registration status
    
    // 1. Basic Info (Gender, DOB, Marital Status)
    if (merged.gender && merged.dob && merged.maritalStatus) completionPercent += 15;
    
    // 2. Religion (Religion, Caste, Mother Tongue)
    if (merged.religion && merged.caste && merged.motherTongue) completionPercent += 15;
    
    // 3. Education/Career (Highest Qualification, Occupation, Annual Income)
    if (merged.highestQualification && merged.occupation && merged.annualIncome !== undefined) completionPercent += 15;
    
    // 4. Family (Father/Mother occupation)
    if (merged.fatherOccupation || merged.motherOccupation) completionPercent += 10;
    
    // 5. Lifestyle (Diet, Hobbies)
    if (merged.diet && merged.hobbies) completionPercent += 10;
    
    // 6. Location (Country, State, City)
    if (merged.country && merged.state && merged.city) completionPercent += 15;
    
    // 7. Media Uploads (Profile Photo)
    if (merged.profilePhoto) completionPercent += 10;

    profileData.completionPercent = Math.min(completionPercent, 100);

    const updatedProfile = await db.profile.update({
      where: { id: authUser.userId },
      data: profileData,
    });

    return NextResponse.json(updatedProfile);
  } catch (err: any) {
    console.error('Update Profile API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Support POST same as PUT
export async function POST(req: Request) {
  return PUT(req);
}
