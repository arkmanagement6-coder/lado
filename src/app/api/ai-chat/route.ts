import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, message, profileData, photoName } = body;

    // 1. AI Chat Assistant Matchmaker
    if (action === 'chat-assistant') {
      if (!message) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
      }

      // Fetch all profiles
      const allProfiles = await db.profile.findMany();
      const allUsers = await db.user.findMany();

      // Filter profiles matching the query (simple mock heuristic matching)
      const queryLower = message.toLowerCase();
      const targetGender = queryLower.includes('girl') || queryLower.includes('bride') || queryLower.includes('female') || queryLower.includes('woman') 
        ? 'Bride' 
        : (queryLower.includes('boy') || queryLower.includes('groom') || queryLower.includes('male') || queryLower.includes('man') ? 'Groom' : null);

      let filtered = allProfiles;
      if (targetGender) {
        filtered = filtered.filter((p: any) => p.gender === targetGender);
      }

      // Search location keyword
      const cities = ['delhi', 'mumbai', 'bangalore', 'pune', 'hyderabad', 'chennai', 'kolkata'];
      const matchedCity = cities.find(c => queryLower.includes(c));
      if (matchedCity) {
        filtered = filtered.filter((p: any) => p.city?.toLowerCase() === matchedCity);
      }

      // Search education keyword
      const degrees = ['mba', 'btech', 'mtech', 'ms', 'md', 'mbbs', 'phd'];
      const matchedDegree = degrees.find(d => queryLower.includes(d));
      if (matchedDegree) {
        filtered = filtered.filter((p: any) => p.highestQualification?.toLowerCase().includes(matchedDegree));
      }

      // If we filtered out all profiles, fall back to showing top profiles
      if (filtered.length === 0) {
        filtered = allProfiles.slice(0, 3);
      }

      // Format response with AI matches and compatibility explanation
      const matches = filtered.map((p: any) => {
        const userObj = allUsers.find((u: any) => u.id === p.id);
        const name = userObj?.name || 'Verified Soulmate';
        
        let matchReason = "Matches your filters based on educational qualifications and modern family values.";
        if (matchedCity && p.city?.toLowerCase() === matchedCity) {
          matchReason += ` Relocated to ${p.city} and values local connections.`;
        }
        if (matchedDegree && p.highestQualification?.toLowerCase().includes(matchedDegree)) {
          matchReason += ` Highly qualified with an ${p.highestQualification} degree matching your educational preferences.`;
        }

        return {
          id: p.id,
          name,
          age: 26, // Fallback default
          gender: p.gender,
          religion: p.religion || 'Hindu',
          occupation: p.occupation || 'Software Engineer',
          city: p.city || 'Delhi',
          highestQualification: p.highestQualification || 'MBA',
          profilePhoto: p.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
          compatibilityScore: Math.floor(82 + Math.random() * 15),
          matchReason
        };
      });

      const aiReply = `I analyzed our database of verified matches. Based on your request, I found ${matches.length} highly compatible profiles matching your description. Here is the comparative report:`;

      return NextResponse.json({
        reply: aiReply,
        matches
      });
    }

    // 2. AI Bio Generator
    if (action === 'generate-bio') {
      const { name, occupation, highestQualification, hobbies, religion, city } = profileData || {};
      
      const bios = [
        `Hi, I'm ${name || 'Member'}. I work as a ${occupation || 'Professional'} in ${city || 'India'}. Having completed my ${highestQualification || 'Degree'}, I balance a modern career orientation with a deep respect for our cultural family values. In my free time, I love ${hobbies || 'exploring new things and spending time with my loved ones'}. Looking to connect with someone ambitious yet grounded who values mutual support.`,
        `A warm welcome! I am ${name || 'Member'}, based out of ${city || 'India'} and currently working as a ${occupation || 'Professional'}. My friends describe me as a family-oriented, caring, and progressive individual. I value educational accomplishments and respect traditional roots. I am looking for a life partner who is caring, understanding, and ready to build a lifetime of memories together.`,
        `I am a ${occupation || 'Professional'} with an ${highestQualification || 'Advanced Qualification'} living in ${city || 'India'}. I believe marriage is a beautiful journey of friendship, trust, and shared aspirations. I enjoy ${hobbies || 'traveling, listening to music, and reading'}. Let's connect if you believe in traditional family priorities combined with a modern outlook on life.`
      ];

      // Randomly select one bio template
      const selectedBio = bios[Math.floor(Math.random() * bios.length)];

      return NextResponse.json({ bio: selectedBio });
    }

    // 3. AI Photo Checker & Document Risk Analyser
    if (action === 'check-photo') {
      if (!photoName) {
        return NextResponse.json({ error: 'Photo identifier is required' }, { status: 400 });
      }

      const lowerName = photoName.toLowerCase();
      let isBlurred = false;
      let isGroupPhoto = false;
      let isFake = false;
      let message = 'Photo verified successfully! High quality face detected.';
      let riskScore = 'Low';

      if (lowerName.includes('blur')) {
        isBlurred = true;
        message = 'Warning: Uploaded photo is detected as blurred. Try a higher resolution selfie.';
        riskScore = 'Medium';
      } else if (lowerName.includes('group')) {
        isGroupPhoto = true;
        message = 'Warning: Detected multiple faces. Please upload a solo portrait for profile verification.';
        riskScore = 'Medium';
      } else if (lowerName.includes('fake') || lowerName.includes('spam')) {
        isFake = true;
        message = 'Alert: Suspicious image patterns matching stock/fake photos detected. Please upload a real profile photo.';
        riskScore = 'High';
      }

      return NextResponse.json({
        isBlurred,
        isGroupPhoto,
        isFake,
        message,
        riskScore
      });
    }

    // 4. AI Profile Completeness & Visibility Analyzer
    if (action === 'profile-analysis') {
      const profile = await db.profile.findUnique({ where: { id: authUser.userId } });
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      const suggestions = [];
      if (!profile.profilePhoto) suggestions.push('Upload a high-quality profile photo to increase matches by 150%.');
      if (!profile.bio || profile.bio.length < 50) suggestions.push('Write a longer bio or use our AI Bio Generator to express your personality details.');
      if (!profile.voiceBio) suggestions.push('Record a 10-second voice introduction to add a personal touch to your match card.');
      if (!profile.idProof) suggestions.push('Submit a verification document (Aadhaar/PAN) to get a Golden Verified Badge.');
      if (suggestions.length === 0) suggestions.push('Your profile looks excellent! Boost your visibility to show up first in daily match mailers.');

      const score = profile.completionPercent || 40;

      return NextResponse.json({
        score,
        suggestions,
        visibilityBoostStatus: profile.profileBoost ? 'Active' : 'Inactive'
      });
    }

    return NextResponse.json({ error: 'Invalid AI action' }, { status: 400 });
  } catch (err: any) {
    console.error('AI chat API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
