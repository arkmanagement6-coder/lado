import fs from 'fs';
import path from 'path';

// Define the schema types for local JS data
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  mobileNumber?: string;
  role: 'ADMIN' | 'CUSTOMER' | 'PREMIUM' | 'RELATIONSHIP_MANAGER' | 'SUPPORT';
  isVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  otp?: string;
  otpExpiry?: string;
  twoFactorEnabled: boolean;
  deviceHistory?: string;
}

export interface Profile {
  id: string; // references User.id
  gender?: 'Bride' | 'Groom';
  dob?: string;
  maritalStatus?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  religion?: string;
  caste?: string;
  subCaste?: string;
  motherTongue?: string;
  gothra?: string;
  highestQualification?: string;
  college?: string;
  occupation?: string;
  annualIncome?: number;
  fatherOccupation?: string;
  motherOccupation?: string;
  brothers?: number;
  sisters?: number;
  familyType?: string;
  familyStatus?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  hobbies?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  profilePhoto?: string;
  galleryPhotos?: string; // Comma separated URLs
  horoscope?: string;
  idProof?: string;
  prefAgeFrom?: number;
  prefAgeTo?: number;
  prefHeightFrom?: string;
  prefHeightTo?: string;
  prefReligion?: string;
  prefCaste?: string;
  prefEducation?: string;
  prefOccupation?: string;
  prefLocation?: string;
  bio?: string;
  voiceBio?: string;
  videoIntroduction?: string;
  photoPrivacy: 'PUBLIC' | 'HIDDEN' | 'PREMIUM_ONLY';
  completionPercent: number;
  viewsCount: number;
  profileBoost: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Interest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'SENT' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content?: string;
  imageUrl?: string;
  voiceUrl?: string;
  isSeen: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'INTEREST_RECEIVED' | 'MATCH_FOUND' | 'CHAT_MESSAGE' | 'SUBSCRIPTION_EXPIRY' | 'PROFILE_VIEWED';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  currency: string;
  paymentGateway: string;
  gatewayPaymentId: string;
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
  couponCode?: string;
  invoiceNumber: string;
  createdAt: string;
}

export interface SuccessStory {
  id: string;
  coupleImage: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  story: string;
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  image: string;
  author: string;
  createdAt: string;
}

export interface ParentProfile {
  id: string;
  parentId: string;
  childId: string;
  relation: string;
  createdAt: string;
}

export interface HoroscopeReport {
  id: string;
  profileId: string;
  nakshatra: string;
  rashi: string;
  charana: number;
  gunMilan: number;
  isManglik: boolean;
  dosha?: string;
  marriagePrediction?: string;
  luckyDates?: string;
  createdAt: string;
}

export interface AICompatibilityReport {
  id: string;
  userOneId: string;
  userTwoId: string;
  overallMatch: number;
  personalityMatch: number;
  lifestyleMatch: number;
  educationMatch: number;
  careerMatch: number;
  religionMatch: number;
  familyMatch: number;
  emotionalMatch: number;
  communicationStyle?: string;
  matchingAnalysis?: string;
  createdAt: string;
}

export interface VendorProfile {
  id: string;
  userId: string;
  companyName: string;
  category: string;
  packagesDetails?: string;
  portfolioPhotos?: string;
  location: string;
  contactNumber?: string;
  rating: number;
  isVerified: boolean;
  createdAt: string;
}

export interface VendorLead {
  id: string;
  userId: string;
  vendorProfileId: string;
  status: string;
  eventDate?: string;
  notes?: string;
  createdAt: string;
}

export interface MeetingSchedule {
  id: string;
  hostId: string;
  guestId: string;
  meetingType: string;
  scheduledAt: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  inviterId: string;
  inviteeId: string;
  status: string;
  rewardAmount: number;
  walletBalance: number;
  createdAt: string;
}

interface DBData {
  users: User[];
  profiles: Profile[];
  interests: Interest[];
  chatMessages: ChatMessage[];
  notifications: Notification[];
  transactions: Transaction[];
  successStories: SuccessStory[];
  blogs: Blog[];
  parentProfiles: ParentProfile[];
  horoscopeReports: HoroscopeReport[];
  aiCompatibilityReports: AICompatibilityReport[];
  vendorProfiles: VendorProfile[];
  vendorLeads: VendorLead[];
  meetingSchedules: MeetingSchedule[];
  supportTickets: SupportTicket[];
  referrals: Referral[];
}

const DB_FILE = path.join(process.cwd(), 'lado_dev_db.json');

// Initial seed data
const getInitialData = (): DBData => {
  const users: User[] = [
    {
      id: 'admin-id-1234',
      name: 'Super Admin',
      email: 'admin@lado.com',
      passwordHash: '$2a$10$tZ9c2gQyZfT7FqD8yqG1kO92eXW2YqUf9zE3uH0w/tG.vE.NqVpPq', // password: admin
      role: 'ADMIN',
      isVerified: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      twoFactorEnabled: false
    },
    {
      id: 'bride-id-1',
      name: 'Aaradhya Sharma',
      email: 'aaradhya@example.com',
      passwordHash: '$2a$10$tZ9c2gQyZfT7FqD8yqG1kO92eXW2YqUf9zE3uH0w/tG.vE.NqVpPq', // password: admin
      role: 'CUSTOMER',
      isVerified: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      twoFactorEnabled: false
    },
    {
      id: 'bride-id-2',
      name: 'Priya Patel',
      email: 'priya@example.com',
      passwordHash: '$2a$10$tZ9c2gQyZfT7FqD8yqG1kO92eXW2YqUf9zE3uH0w/tG.vE.NqVpPq',
      role: 'PREMIUM',
      isVerified: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      twoFactorEnabled: false
    },
    {
      id: 'bride-id-3',
      name: 'Meera Iyer',
      email: 'meera@example.com',
      passwordHash: '$2a$10$tZ9c2gQyZfT7FqD8yqG1kO92eXW2YqUf9zE3uH0w/tG.vE.NqVpPq',
      role: 'CUSTOMER',
      isVerified: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      twoFactorEnabled: false
    },
    {
      id: 'groom-id-1',
      name: 'Rohan Malhotra',
      email: 'rohan@example.com',
      passwordHash: '$2a$10$tZ9c2gQyZfT7FqD8yqG1kO92eXW2YqUf9zE3uH0w/tG.vE.NqVpPq',
      role: 'PREMIUM',
      isVerified: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      twoFactorEnabled: false
    },
    {
      id: 'groom-id-2',
      name: 'Vikram Singh',
      email: 'vikram@example.com',
      passwordHash: '$2a$10$tZ9c2gQyZfT7FqD8yqG1kO92eXW2YqUf9zE3uH0w/tG.vE.NqVpPq',
      role: 'CUSTOMER',
      isVerified: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      twoFactorEnabled: false
    },
    {
      id: 'groom-id-3',
      name: 'Arjun Reddy',
      email: 'arjun@example.com',
      passwordHash: '$2a$10$tZ9c2gQyZfT7FqD8yqG1kO92eXW2YqUf9zE3uH0w/tG.vE.NqVpPq',
      role: 'PREMIUM',
      isVerified: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      twoFactorEnabled: false
    }
  ];

  const profiles: Profile[] = [
    {
      id: 'bride-id-1',
      gender: 'Bride',
      dob: '1998-05-15',
      maritalStatus: 'Never Married',
      height: "5'4\"",
      weight: '55 kg',
      bloodGroup: 'B+',
      religion: 'Hindu',
      caste: 'Brahmin',
      subCaste: 'Saraswat',
      motherTongue: 'Hindi',
      gothra: 'Vashishta',
      highestQualification: 'B.Tech in Computer Science',
      college: 'IIT Delhi',
      occupation: 'Senior Software Engineer',
      annualIncome: 1800000,
      fatherOccupation: 'Retired Government Officer',
      motherOccupation: 'High School Teacher',
      brothers: 1,
      sisters: 0,
      familyType: 'Nuclear',
      familyStatus: 'Upper Middle Class',
      diet: 'Veg',
      smoking: 'No',
      drinking: 'No',
      hobbies: 'Classical Dancing, Painting, Hiking',
      country: 'India',
      state: 'Delhi',
      city: 'New Delhi',
      address: 'Vasant Kunj, New Delhi',
      profilePhoto: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=500&q=80',
      galleryPhotos: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=500&q=80,https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
      horoscope: 'https://placehold.co/400x600/png?text=Aaradhya+Kundali',
      idProof: 'https://placehold.co/400x300/png?text=Aadhaar+Card',
      prefAgeFrom: 26,
      prefAgeTo: 32,
      prefHeightFrom: "5'8\"",
      prefHeightTo: "6'2\"",
      prefReligion: 'Hindu',
      prefCaste: 'Brahmin',
      prefEducation: 'Master or Bachelor Engineering',
      prefOccupation: 'IT Professional, Business Executive',
      prefLocation: 'Delhi NCR, Bangalore, Pune',
      bio: 'A simple, family-oriented girl with modern values. I work in a multinational tech company. I enjoy traditional Indian music and love traveling on weekends. Looking for a partner who values mutual respect and shares a friendly bond.',
      photoPrivacy: 'PUBLIC',
      completionPercent: 95,
      viewsCount: 145,
      profileBoost: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'bride-id-2',
      gender: 'Bride',
      dob: '1996-09-22',
      maritalStatus: 'Never Married',
      height: "5'3\"",
      weight: '52 kg',
      bloodGroup: 'O+',
      religion: 'Hindu',
      caste: 'Patel',
      subCaste: 'Kadva Patel',
      motherTongue: 'Gujarati',
      gothra: 'N/A',
      highestQualification: 'MD in Pediatrics',
      college: 'KEM Hospital Mumbai',
      occupation: 'Pediatrician',
      annualIncome: 2400000,
      fatherOccupation: 'Real Estate Developer',
      motherOccupation: 'Homemaker',
      brothers: 0,
      sisters: 1,
      familyType: 'Nuclear',
      familyStatus: 'Rich',
      diet: 'Veg',
      smoking: 'No',
      drinking: 'No',
      hobbies: 'Reading novels, Baking, Volunteer Work',
      country: 'India',
      state: 'Maharashtra',
      city: 'Mumbai',
      address: 'Juhu, Mumbai',
      profilePhoto: 'https://images.unsplash.com/photo-1588001291548-948fec6b2660?w=500&q=80',
      galleryPhotos: 'https://images.unsplash.com/photo-1588001291548-948fec6b2660?w=500&q=80',
      horoscope: 'https://placehold.co/400x600/png?text=Priya+Kundali',
      idProof: 'https://placehold.co/400x300/png?text=Passport',
      prefAgeFrom: 28,
      prefAgeTo: 34,
      prefHeightFrom: "5'7\"",
      prefHeightTo: "6'1\"",
      prefReligion: 'Hindu',
      prefCaste: 'Patel, Vaishnav',
      prefEducation: 'Doctorate, MBA, Post Graduate',
      prefOccupation: 'Doctor, Entrepreneur, Senior Manager',
      prefLocation: 'Mumbai, Gujarat, USA',
      bio: 'Compassionate, independent pediatrician practicing in Mumbai. I balance my professional life with warm family bindings. I enjoy cooking traditional dishes and exploring historical architectures.',
      photoPrivacy: 'PUBLIC',
      completionPercent: 100,
      viewsCount: 232,
      profileBoost: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'bride-id-3',
      gender: 'Bride',
      dob: '1999-11-04',
      maritalStatus: 'Never Married',
      height: "5'5\"",
      weight: '58 kg',
      bloodGroup: 'A+',
      religion: 'Hindu',
      caste: 'Iyer',
      subCaste: 'Vadama',
      motherTongue: 'Tamil',
      gothra: 'Bharadwaj',
      highestQualification: 'Master of Fine Arts (Design)',
      college: 'NID Ahmedabad',
      occupation: 'UX Designer',
      annualIncome: 1200000,
      fatherOccupation: 'Retired Banker',
      motherOccupation: 'Professor',
      brothers: 0,
      sisters: 0,
      familyType: 'Nuclear',
      familyStatus: 'Middle Class',
      diet: 'Veg',
      smoking: 'No',
      drinking: 'Occasionally',
      hobbies: 'Photography, Carnatic Singing, Sketching',
      country: 'India',
      state: 'Tamil Nadu',
      city: 'Chennai',
      address: 'Adyar, Chennai',
      profilePhoto: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
      galleryPhotos: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
      horoscope: 'https://placehold.co/400x600/png?text=Meera+Kundali',
      idProof: 'https://placehold.co/400x300/png?text=Voter+ID',
      prefAgeFrom: 25,
      prefAgeTo: 30,
      prefHeightFrom: "5'7\"",
      prefHeightTo: "6'0\"",
      prefReligion: 'Hindu',
      prefCaste: 'Iyer, Iyengar',
      prefEducation: 'Post Graduate, Bachelor of Engineering',
      prefOccupation: 'Designer, Tech Engineer, Professor',
      prefLocation: 'Chennai, Bangalore, Abroad',
      bio: 'Creative soul with a deep respect for traditions. I work as a Lead UX Designer. I appreciate art, coffee-table conversations, and South Indian classical arts. Looking for a partner who is progressive yet culturally grounded.',
      photoPrivacy: 'PUBLIC',
      completionPercent: 90,
      viewsCount: 95,
      profileBoost: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'groom-id-1',
      gender: 'Groom',
      dob: '1995-03-12',
      maritalStatus: 'Never Married',
      height: "5'11\"",
      weight: '78 kg',
      bloodGroup: 'A-',
      religion: 'Hindu',
      caste: 'Khatri',
      subCaste: 'Malhotra',
      motherTongue: 'Punjabi',
      gothra: 'Bhardwaj',
      highestQualification: 'MBA in Finance',
      college: 'IIM Ahmedabad',
      occupation: 'Investment Banker',
      annualIncome: 3500000,
      fatherOccupation: 'Business Owner (Apparel Manufacturing)',
      motherOccupation: 'Boutique Designer',
      brothers: 1,
      sisters: 1,
      familyType: 'Joint',
      familyStatus: 'Rich',
      diet: 'Non-Veg',
      smoking: 'Occasionally',
      drinking: 'Occasionally',
      hobbies: 'Golf, Driving, Playing Guitar, Stock Analysis',
      country: 'India',
      state: 'Haryana',
      city: 'Gurugram',
      address: 'DLF Phase 5, Gurugram',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80',
      galleryPhotos: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80,https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80',
      horoscope: 'https://placehold.co/400x600/png?text=Rohan+Kundali',
      idProof: 'https://placehold.co/400x300/png?text=PAN+Card',
      prefAgeFrom: 23,
      prefAgeTo: 29,
      prefHeightFrom: "5'2\"",
      prefHeightTo: "5'8\"",
      prefReligion: 'Hindu, Sikh',
      prefCaste: 'Khatri, Arora, Rajput',
      prefEducation: 'MBA, PG, Engineering',
      prefOccupation: 'Corporate Executive, Doctor, Banker',
      prefLocation: 'Delhi NCR, Mumbai, Bangalore',
      bio: 'Dynamic and progressive Investment Banker based in Gurugram. Coming from a well-respected business family. I enjoy sports, music, and fitness. Looking for a partner who is ambitious, warm-hearted, and loves family get-togethers.',
      photoPrivacy: 'PUBLIC',
      completionPercent: 96,
      viewsCount: 312,
      profileBoost: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'groom-id-2',
      gender: 'Groom',
      dob: '1993-07-28',
      maritalStatus: 'Never Married',
      height: "6'0\"",
      weight: '82 kg',
      bloodGroup: 'AB+',
      religion: 'Hindu',
      caste: 'Rajput',
      subCaste: 'Shekhawat',
      motherTongue: 'Hindi',
      gothra: 'Surya',
      highestQualification: 'Bachelor of Business Administration',
      college: 'Rajasthan University',
      occupation: 'Real Estate Developer',
      annualIncome: 4500000,
      fatherOccupation: 'Industrialist',
      motherOccupation: 'Homemaker',
      brothers: 0,
      sisters: 2,
      familyType: 'Joint',
      familyStatus: 'Elite',
      diet: 'Veg',
      smoking: 'No',
      drinking: 'No',
      hobbies: 'Horse Riding, Rifle Shooting, Traditional Cooking',
      country: 'India',
      state: 'Rajasthan',
      city: 'Jaipur',
      address: 'Malviya Nagar, Jaipur',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80',
      galleryPhotos: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80',
      horoscope: 'https://placehold.co/400x600/png?text=Vikram+Kundali',
      idProof: 'https://placehold.co/400x300/png?text=Aadhaar+Card',
      prefAgeFrom: 22,
      prefAgeTo: 30,
      prefHeightFrom: "5'3\"",
      prefHeightTo: "5'9\"",
      prefReligion: 'Hindu',
      prefCaste: 'Rajput',
      prefEducation: 'Bachelor or Master Graduate',
      prefOccupation: 'Homemaker, Doctor, Corporate Professional',
      prefLocation: 'Rajasthan, Delhi NCR, Mumbai',
      bio: 'Belong to a traditional Rajput family in Jaipur. Managing our real estate and agriculture ventures. I value royal heritage, respect for elders, and a peaceful lifestyle. Seeking a warm, graceful girl to share my life.',
      photoPrivacy: 'PUBLIC',
      completionPercent: 88,
      viewsCount: 180,
      profileBoost: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'groom-id-3',
      gender: 'Groom',
      dob: '1996-10-10',
      maritalStatus: 'Never Married',
      height: "5'9\"",
      weight: '74 kg',
      bloodGroup: 'O-',
      religion: 'Hindu',
      caste: 'Reddy',
      subCaste: 'N/A',
      motherTongue: 'Telugu',
      gothra: 'Shiva',
      highestQualification: 'MS in Computer Science',
      college: 'Stanford University',
      occupation: 'Senior Product Manager',
      annualIncome: 3000000,
      fatherOccupation: 'Retired Chief Engineer',
      motherOccupation: 'Software Company VP',
      brothers: 1,
      sisters: 0,
      familyType: 'Nuclear',
      familyStatus: 'Upper Middle Class',
      diet: 'Veg',
      smoking: 'No',
      drinking: 'Occasionally',
      hobbies: 'Squash, Tech Blogging, Playing Keyboard',
      country: 'India',
      state: 'Telangana',
      city: 'Hyderabad',
      address: 'Gachibowli, Hyderabad',
      profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=80',
      galleryPhotos: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=80',
      horoscope: 'https://placehold.co/400x600/png?text=Arjun+Kundali',
      idProof: 'https://placehold.co/400x300/png?text=Passport',
      prefAgeFrom: 24,
      prefAgeTo: 29,
      prefHeightFrom: "5'2\"",
      prefHeightTo: "5'7\"",
      prefReligion: 'Hindu',
      prefCaste: 'Reddy, Naidu, Kamma',
      prefEducation: 'MS, B.Tech, MBA from top universities',
      prefOccupation: 'Software Engineer, Product Manager, Data Scientist',
      prefLocation: 'Hyderabad, Bangalore, USA',
      bio: 'Stanford graduate currently working in tech. I am a blend of modern thought with respect for Indian heritage. I love music, tennis, and good food. Looking for a partner who is intellectual, warm, and shares similar wavelengths.',
      photoPrivacy: 'PUBLIC',
      completionPercent: 94,
      viewsCount: 167,
      profileBoost: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const successStories: SuccessStory[] = [
    {
      id: 'story-1',
      brideName: 'Aanchal',
      groomName: 'Rahul',
      weddingDate: '2025-11-20',
      coupleImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80',
      story: 'We met through Lado Matrimonial in early 2025. What started as a casual conversation on chat turned into hours of calls. Our thoughts, family values, and goals matched perfectly. Within six months, with our families blessings, we tied the knot in an elegant ceremony. Thank you Lado for helping us find each other!',
      createdAt: new Date().toISOString()
    },
    {
      id: 'story-2',
      brideName: 'Sneha',
      groomName: 'Amit',
      weddingDate: '2026-02-14',
      coupleImage: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=600&q=80',
      story: 'Amit was in Bangalore and I was in Mumbai. Thanks to the detailed profile preferences on Lado Matrimonial, our profiles were marked as a 95% Perfect Match. The relationship managers guided both families and set up a video meeting. Today, we are happily married. Lado Matrimonial made the distance disappear!',
      createdAt: new Date().toISOString()
    },
    {
      id: 'story-3',
      brideName: 'Preeti',
      groomName: 'Vikranth',
      weddingDate: '2025-08-10',
      coupleImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80',
      story: 'Finding someone with matching dietary preferences and spiritual values felt difficult until I searched on Lado. The premium filters helped me meet Vikranth. We had a gorgeous traditional wedding and are building our life together. Truly, marriages are made in heaven and matched by Lado.',
      createdAt: new Date().toISOString()
    }
  ];

  const blogs: Blog[] = [
    {
      id: 'blog-1',
      title: '7 Crucial Conversations to Have Before Getting Married',
      slug: 'crucial-conversations-before-marriage',
      content: 'Marriage is a life-altering partnership. Before saying "I Do", it is critical to speak about key life elements. Talk about financial boundaries, career projections, parental expectations, conflict resolutions, child preferences, values, and individual personal spaces. Clear discussions set a durable foundation for a happy, conflict-managed life together.',
      category: 'Relationship Advice',
      image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&q=80',
      author: 'Relationship Coach S. Sharma',
      createdAt: new Date().toISOString()
    },
    {
      id: 'blog-2',
      title: 'Trending Indian Wedding Themes for 2026',
      slug: 'trending-wedding-themes-2026',
      content: 'Indian weddings are embracing sustainability and intimate designs. In 2026, we see a rise in pastel palettes, garden glass-house mandaps, handwoven heritage decor, eco-friendly local sourcing, and heritage venue revivals. Couples are focusing on creating bespoke experiences for close guests rather than lavish gatherings.',
      category: 'Wedding Planning',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
      author: 'Event Planner Ritika Malhotra',
      createdAt: new Date().toISOString()
    },
    {
      id: 'blog-3',
      title: 'Understanding horoscope matching (Kundali Milan) in Modern Times',
      slug: 'understanding-horoscope-matching',
      content: 'Kundali Milan is deep-rooted in traditional matchmaking. While modern couples are progressive, horoscope check provides cultural assurance to elders. In astrology, it aligns psychological tendencies (Gunas), health factors, and temperaments. In modern times, combining Kundali with deep personality matches makes the process harmonious.',
      category: 'Horoscope',
      image: 'https://images.unsplash.com/photo-1532980400857-e8d9d275d858?w=600&q=80',
      author: 'Astrologer Acharya Shastri',
      createdAt: new Date().toISOString()
    }
  ];

  return {
    users,
    profiles,
    interests: [],
    chatMessages: [],
    notifications: [],
    transactions: [],
    successStories,
    blogs,
    parentProfiles: [],
    horoscopeReports: [],
    aiCompatibilityReports: [],
    vendorProfiles: [],
    vendorLeads: [],
    meetingSchedules: [],
    supportTickets: [],
    referrals: []
  };
};

// Main mock DB reader/writer
export class MockDB {
  private static read(): DBData {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading mock DB file, resetting to initial', err);
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
  }

  private static write(data: DBData): void {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // User APIs
  public static getUsers(): User[] {
    return this.read().users;
  }
  public static saveUsers(users: User[]): void {
    const data = this.read();
    data.users = users;
    this.write(data);
  }

  // Profile APIs
  public static getProfiles(): Profile[] {
    return this.read().profiles;
  }
  public static saveProfiles(profiles: Profile[]): void {
    const data = this.read();
    data.profiles = profiles;
    this.write(data);
  }

  // Interests APIs
  public static getInterests(): Interest[] {
    return this.read().interests;
  }
  public static saveInterests(interests: Interest[]): void {
    const data = this.read();
    data.interests = interests;
    this.write(data);
  }

  // Chats APIs
  public static getChatMessages(): ChatMessage[] {
    return this.read().chatMessages;
  }
  public static saveChatMessages(messages: ChatMessage[]): void {
    const data = this.read();
    data.chatMessages = messages;
    this.write(data);
  }

  // Notifications APIs
  public static getNotifications(): Notification[] {
    return this.read().notifications;
  }
  public static saveNotifications(notifications: Notification[]): void {
    const data = this.read();
    data.notifications = notifications;
    this.write(data);
  }

  // Transactions APIs
  public static getTransactions(): Transaction[] {
    return this.read().transactions;
  }
  public static saveTransactions(transactions: Transaction[]): void {
    const data = this.read();
    data.transactions = transactions;
    this.write(data);
  }

  // Success Stories APIs
  public static getSuccessStories(): SuccessStory[] {
    return this.read().successStories;
  }
  public static saveSuccessStories(stories: SuccessStory[]): void {
    const data = this.read();
    data.successStories = stories;
    this.write(data);
  }

  // Blogs APIs
  public static getBlogs(): Blog[] {
    return this.read().blogs;
  }
  public static saveBlogs(blogs: Blog[]): void {
    const data = this.read();
    data.blogs = blogs;
    this.write(data);
  }

  // Parent Profiles APIs
  public static getParentProfiles(): ParentProfile[] {
    return this.read().parentProfiles || [];
  }
  public static saveParentProfiles(parentProfiles: ParentProfile[]): void {
    const data = this.read();
    data.parentProfiles = parentProfiles;
    this.write(data);
  }

  // Horoscope Reports APIs
  public static getHoroscopeReports(): HoroscopeReport[] {
    return this.read().horoscopeReports || [];
  }
  public static saveHoroscopeReports(horoscopeReports: HoroscopeReport[]): void {
    const data = this.read();
    data.horoscopeReports = horoscopeReports;
    this.write(data);
  }

  // AI Compatibility Reports APIs
  public static getAICompatibilityReports(): AICompatibilityReport[] {
    return this.read().aiCompatibilityReports || [];
  }
  public static saveAICompatibilityReports(aiCompatibilityReports: AICompatibilityReport[]): void {
    const data = this.read();
    data.aiCompatibilityReports = aiCompatibilityReports;
    this.write(data);
  }

  // Vendor Profiles APIs
  public static getVendorProfiles(): VendorProfile[] {
    return this.read().vendorProfiles || [];
  }
  public static saveVendorProfiles(vendorProfiles: VendorProfile[]): void {
    const data = this.read();
    data.vendorProfiles = vendorProfiles;
    this.write(data);
  }

  // Vendor Leads APIs
  public static getVendorLeads(): VendorLead[] {
    return this.read().vendorLeads || [];
  }
  public static saveVendorLeads(vendorLeads: VendorLead[]): void {
    const data = this.read();
    data.vendorLeads = vendorLeads;
    this.write(data);
  }

  // Meeting Schedules APIs
  public static getMeetingSchedules(): MeetingSchedule[] {
    return this.read().meetingSchedules || [];
  }
  public static saveMeetingSchedules(meetingSchedules: MeetingSchedule[]): void {
    const data = this.read();
    data.meetingSchedules = meetingSchedules;
    this.write(data);
  }

  // Support Tickets APIs
  public static getSupportTickets(): SupportTicket[] {
    return this.read().supportTickets || [];
  }
  public static saveSupportTickets(supportTickets: SupportTicket[]): void {
    const data = this.read();
    data.supportTickets = supportTickets;
    this.write(data);
  }

  // Referrals APIs
  public static getReferrals(): Referral[] {
    return this.read().referrals || [];
  }
  public static saveReferrals(referrals: Referral[]): void {
    const data = this.read();
    data.referrals = referrals;
    this.write(data);
  }
}
