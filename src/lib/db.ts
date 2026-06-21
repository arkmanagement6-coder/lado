import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { MockDB, User, Profile, Interest, ChatMessage, Notification, Transaction, SuccessStory, Blog } from './mockDb';
import { fdb, hasFirebaseConfig } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, limit } from 'firebase/firestore';

let canUsePrisma = false;
let prismaInstance: any = null;

if (!hasFirebaseConfig && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("postgres:postgres@localhost")) {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
    canUsePrisma = true;
    console.log("PostgreSQL Database initialized via Prisma Pg Adapter.");
  } catch (err) {
    console.warn("Could not connect to PostgreSQL via Prisma. Falling back to local JSON MockDB.");
    canUsePrisma = false;
    prismaInstance = null;
  }
}

export const prisma = prismaInstance;

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

// Helper to fetch all documents in a Firestore collection
async function getFirestoreDocs(collName: string): Promise<any[]> {
  try {
    const snap = await getDocs(collection(fdb, collName));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(`Firebase error fetching collection ${collName}:`, err);
    return [];
  }
}

// Helper to get a single document from Firestore
async function getFirestoreDoc(collName: string, id: string): Promise<any | null> {
  try {
    const snap = await getDoc(doc(fdb, collName, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error(`Firebase error getting doc ${collName}/${id}:`, err);
    return null;
  }
}

// Custom Database Wrapper that mirrors standard Prisma API
export const db = {
  isMock: () => !hasFirebaseConfig && !canUsePrisma,
  isFirebase: () => hasFirebaseConfig,

  user: {
    findUnique: async (args: { where: { email: string } }) => {
      if (hasFirebaseConfig) {
        const q = query(collection(fdb, 'users'), where('email', '==', args.where.email), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) return null;
        return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
      }
      if (canUsePrisma) return prisma.user.findUnique(args);
      const users = MockDB.getUsers();
      return users.find(u => u.email === args.where.email) || null;
    },
    findFirst: async (args: { where: { id: string } }) => {
      if (hasFirebaseConfig) {
        return getFirestoreDoc('users', args.where.id);
      }
      if (canUsePrisma) return prisma.user.findFirst(args);
      const users = MockDB.getUsers();
      return users.find(u => u.id === args.where.id) || null;
    },
    findMany: async (args?: any) => {
      if (hasFirebaseConfig) {
        return getFirestoreDocs('users');
      }
      if (canUsePrisma) return prisma.user.findMany(args);
      return MockDB.getUsers();
    },
    create: async (args: any) => {
      const id = args.data.id || Math.random().toString(36).substring(2, 15);
      const payload = {
        name: args.data.name,
        email: args.data.email,
        passwordHash: args.data.passwordHash,
        mobileNumber: args.data.mobileNumber || null,
        role: args.data.role || 'CUSTOMER',
        isVerified: args.data.isVerified || false,
        status: args.data.status || 'ACTIVE',
        twoFactorEnabled: args.data.twoFactorEnabled || false,
        deviceHistory: args.data.deviceHistory || null,
        otp: args.data.otp || null,
        otpExpiry: args.data.otpExpiry || null,
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'users', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data;
      }
      if (canUsePrisma) return prisma.user.create(args);
      const users = MockDB.getUsers();
      const newUser = {
        ...payload,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(newUser);
      MockDB.saveUsers(users);
      return newUser;
    },
    update: async (args: { where: { id: string }; data: any }) => {
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'users', args.where.id);
        const data = {
          ...args.data,
          updatedAt: new Date().toISOString()
        };
        await updateDoc(docRef, data);
        return getFirestoreDoc('users', args.where.id);
      }
      if (canUsePrisma) return prisma.user.update(args as any);
      const users = MockDB.getUsers();
      const idx = users.findIndex(u => u.id === args.where.id);
      if (idx === -1) throw new Error("User not found");
      const updatedUser = {
        ...users[idx],
        ...args.data,
        updatedAt: new Date().toISOString()
      };
      users[idx] = updatedUser;
      MockDB.saveUsers(users);
      return updatedUser;
    },
    delete: async (args: { where: { id: string } }) => {
      if (hasFirebaseConfig) {
        const target = await getFirestoreDoc('users', args.where.id);
        if (!target) return null;
        await deleteDoc(doc(fdb, 'users', args.where.id));
        return target;
      }
      if (canUsePrisma) return prisma.user.delete(args);
      const users = MockDB.getUsers();
      const user = users.find(u => u.id === args.where.id);
      const filtered = users.filter(u => u.id !== args.where.id);
      MockDB.saveUsers(filtered);
      return user || null;
    }
  },

  profile: {
    findUnique: async (args: { where: { id: string } }) => {
      if (hasFirebaseConfig) {
        return getFirestoreDoc('profiles', args.where.id);
      }
      if (canUsePrisma) return prisma.profile.findUnique(args);
      const profiles = MockDB.getProfiles();
      return profiles.find(p => p.id === args.where.id) || null;
    },
    findMany: async (args?: any) => {
      if (hasFirebaseConfig) {
        let list = await getFirestoreDocs('profiles');
        if (args && args.where) {
          const w = args.where;
          if (w.id && w.id.not) {
            list = list.filter(p => p.id !== w.id.not);
          }
          if (w.gender) {
            list = list.filter(p => p.gender === w.gender);
          }
          if (w.religion) {
            list = list.filter(p => p.religion === w.religion);
          }
          if (w.motherTongue) {
            list = list.filter(p => p.motherTongue === w.motherTongue);
          }
          if (w.city) {
            list = list.filter(p => p.city?.toLowerCase() === w.city.toLowerCase());
          }
          if (w.completionPercent && w.completionPercent.gte) {
            list = list.filter(p => p.completionPercent >= w.completionPercent.gte);
          }
          if (w.profileBoost) {
            list = list.filter(p => p.profileBoost === w.profileBoost);
          }
        }
        return list;
      }
      if (canUsePrisma) return prisma.profile.findMany(args);
      let list = MockDB.getProfiles();
      if (args && args.where) {
        const w = args.where;
        if (w.id && w.id.not) {
          list = list.filter(p => p.id !== w.id.not);
        }
        if (w.gender) {
          list = list.filter(p => p.gender === w.gender);
        }
        if (w.religion) {
          list = list.filter(p => p.religion === w.religion);
        }
        if (w.motherTongue) {
          list = list.filter(p => p.motherTongue === w.motherTongue);
        }
        if (w.city) {
          list = list.filter(p => p.city?.toLowerCase() === w.city.toLowerCase());
        }
        if (w.completionPercent && w.completionPercent.gte) {
          list = list.filter(p => p.completionPercent >= w.completionPercent.gte);
        }
        if (w.profileBoost) {
          list = list.filter(p => p.profileBoost === w.profileBoost);
        }
      }
      return list;
    },
    create: async (args: { data: Partial<Profile> & { id: string } }) => {
      const payload = {
        photoPrivacy: 'PUBLIC',
        completionPercent: 10,
        viewsCount: 0,
        profileBoost: false,
        ...args.data,
        id: args.data.id
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'profiles', args.data.id);
        const data = {
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data;
      }
      if (canUsePrisma) return prisma.profile.create(args as any);
      const profiles = MockDB.getProfiles();
      const newProfile: Profile = {
        photoPrivacy: 'PUBLIC',
        completionPercent: 10,
        viewsCount: 0,
        profileBoost: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...args.data,
        id: args.data.id
      };
      profiles.push(newProfile);
      MockDB.saveProfiles(profiles);
      return newProfile;
    },
    update: async (args: { where: { id: string }; data: Partial<Profile> }) => {
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'profiles', args.where.id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          const newProfile = {
            id: args.where.id,
            photoPrivacy: 'PUBLIC',
            completionPercent: 20,
            viewsCount: 0,
            profileBoost: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...args.data
          };
          await setDoc(docRef, newProfile);
          return newProfile;
        }
        const data = {
          ...args.data,
          updatedAt: new Date().toISOString()
        };
        await updateDoc(docRef, data);
        return getFirestoreDoc('profiles', args.where.id);
      }
      if (canUsePrisma) return prisma.profile.update(args as any);
      const profiles = MockDB.getProfiles();
      const idx = profiles.findIndex(p => p.id === args.where.id);
      if (idx === -1) {
        const newProfile: Profile = {
          id: args.where.id,
          photoPrivacy: 'PUBLIC',
          completionPercent: 20,
          viewsCount: 0,
          profileBoost: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...args.data
        };
        profiles.push(newProfile);
        MockDB.saveProfiles(profiles);
        return newProfile;
      }
      const updatedProfile = {
        ...profiles[idx],
        ...args.data,
        updatedAt: new Date().toISOString()
      };
      profiles[idx] = updatedProfile as Profile;
      MockDB.saveProfiles(profiles);
      return updatedProfile;
    }
  },

  interest: {
    findMany: async (args?: any) => {
      if (hasFirebaseConfig) {
        const list = await getFirestoreDocs('interests');
        if (!args || !args.where) return list;
        if (args.where.OR) {
          const conds = args.where.OR as any[];
          return list.filter(i => 
            conds.some((c: any) => 
              (c.senderId && i.senderId === c.senderId) || 
              (c.receiverId && i.receiverId === c.receiverId)
            )
          );
        }
        let filtered = list;
        if (args.where.senderId) {
          filtered = filtered.filter(i => i.senderId === args.where.senderId);
        }
        if (args.where.receiverId) {
          filtered = filtered.filter(i => i.receiverId === args.where.receiverId);
        }
        return filtered;
      }
      if (canUsePrisma) return prisma.interest.findMany(args);
      const interests = MockDB.getInterests();
      if (!args || !args.where) return interests;
      if (args.where.OR) {
        const conds = args.where.OR as any[];
        return interests.filter(i => 
          conds.some((c: any) => 
            (c.senderId && i.senderId === c.senderId) || 
            (c.receiverId && i.receiverId === c.receiverId)
          )
        );
      }
      let filtered = interests;
      if (args.where.senderId) {
        filtered = filtered.filter(i => i.senderId === args.where.senderId);
      }
      if (args.where.receiverId) {
        filtered = filtered.filter(i => i.receiverId === args.where.receiverId);
      }
      return filtered;
    },
    create: async (args: { data: { senderId: string; receiverId: string; status?: string } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        senderId: args.data.senderId,
        receiverId: args.data.receiverId,
        status: args.data.status || 'SENT'
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'interests', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data;
      }
      if (canUsePrisma) return prisma.interest.create(args as any);
      const interests = MockDB.getInterests();
      const newInterest: Interest = {
        id,
        senderId: args.data.senderId,
        receiverId: args.data.receiverId,
        status: (args.data.status || 'SENT') as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      interests.push(newInterest);
      MockDB.saveInterests(interests);
      return newInterest;
    },
    update: async (args: { where: { id: string }; data: { status: string } }) => {
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'interests', args.where.id);
        const data = {
          status: args.data.status,
          updatedAt: new Date().toISOString()
        };
        await updateDoc(docRef, data);
        return getFirestoreDoc('interests', args.where.id);
      }
      if (canUsePrisma) return prisma.interest.update(args as any);
      const interests = MockDB.getInterests();
      const idx = interests.findIndex(i => i.id === args.where.id);
      if (idx === -1) throw new Error("Interest not found");
      interests[idx].status = args.data.status as any;
      interests[idx].updatedAt = new Date().toISOString();
      MockDB.saveInterests(interests);
      return interests[idx];
    },
    delete: async (args: { where: { id: string } }) => {
      if (hasFirebaseConfig) {
        const target = await getFirestoreDoc('interests', args.where.id);
        if (!target) return null;
        await deleteDoc(doc(fdb, 'interests', args.where.id));
        return target;
      }
      if (canUsePrisma) return prisma.interest.delete(args);
      const interests = MockDB.getInterests();
      const interest = interests.find(i => i.id === args.where.id);
      const filtered = interests.filter(i => i.id !== args.where.id);
      MockDB.saveInterests(filtered);
      return interest || null;
    }
  },

  chatMessage: {
    findMany: async (args?: any) => {
      if (hasFirebaseConfig) {
        let list = await getFirestoreDocs('chatMessages');
        if (args && args.where && args.where.OR) {
          const conds = args.where.OR;
          list = list.filter(m => 
            (m.senderId === conds[0].senderId && m.receiverId === conds[0].receiverId) ||
            (m.senderId === conds[1].senderId && m.receiverId === conds[1].receiverId)
          );
        }
        if (args && args.orderBy?.createdAt === 'asc') {
          list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else {
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return list;
      }
      if (canUsePrisma) return prisma.chatMessage.findMany(args);
      const messages = MockDB.getChatMessages();
      let filtered = messages;
      if (args && args.where && args.where.OR) {
        const conds = args.where.OR;
        filtered = messages.filter(m => 
          (m.senderId === conds[0].senderId && m.receiverId === conds[0].receiverId) ||
          (m.senderId === conds[1].senderId && m.receiverId === conds[1].receiverId)
        );
      }
      if (args && args.orderBy?.createdAt === 'asc') {
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return filtered;
    },
    create: async (args: { data: { senderId: string; receiverId: string; content?: string; imageUrl?: string; voiceUrl?: string } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        senderId: args.data.senderId,
        receiverId: args.data.receiverId,
        content: args.data.content || null,
        imageUrl: args.data.imageUrl || null,
        voiceUrl: args.data.voiceUrl || null,
        isSeen: false
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'chatMessages', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data;
      }
      if (canUsePrisma) return prisma.chatMessage.create(args);
      const messages = MockDB.getChatMessages();
      const newMsg: ChatMessage = {
        id,
        senderId: args.data.senderId,
        receiverId: args.data.receiverId,
        content: args.data.content,
        imageUrl: args.data.imageUrl,
        voiceUrl: args.data.voiceUrl,
        isSeen: false,
        createdAt: new Date().toISOString()
      };
      messages.push(newMsg);
      MockDB.saveChatMessages(messages);
      return newMsg;
    }
  },

  notification: {
    findMany: async (args: { where: { userId: string }; orderBy?: { createdAt: 'desc' } }) => {
      if (hasFirebaseConfig) {
        let list = await getFirestoreDocs('notifications');
        list = list.filter(n => n.userId === args.where.userId);
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return list;
      }
      if (canUsePrisma) return prisma.notification.findMany(args);
      const notifications = MockDB.getNotifications();
      const filtered = notifications.filter(n => n.userId === args.where.userId);
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return filtered;
    },
    create: async (args: { data: { userId: string; type: string; title: string; content: string } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        userId: args.data.userId,
        type: args.data.type,
        title: args.data.title,
        content: args.data.content,
        isRead: false
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'notifications', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data;
      }
      if (canUsePrisma) return prisma.notification.create(args as any);
      const notifications = MockDB.getNotifications();
      const newNotif: Notification = {
        id,
        userId: args.data.userId,
        type: args.data.type as any,
        title: args.data.title,
        content: args.data.content,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      notifications.push(newNotif);
      MockDB.saveNotifications(notifications);
      return newNotif;
    },
    updateMany: async (args: { where: { userId: string; isRead?: boolean }; data: { isRead: boolean } }) => {
      if (hasFirebaseConfig) {
        const list = await getFirestoreDocs('notifications');
        let count = 0;
        for (const item of list) {
          if (item.userId === args.where.userId) {
            count++;
            const docRef = doc(fdb, 'notifications', item.id);
            await updateDoc(docRef, { isRead: args.data.isRead });
          }
        }
        return { count };
      }
      if (canUsePrisma) return prisma.notification.updateMany(args);
      const notifications = MockDB.getNotifications();
      let count = 0;
      const updated = notifications.map(n => {
        if (n.userId === args.where.userId) {
          count++;
          return { ...n, isRead: args.data.isRead };
        }
        return n;
      });
      MockDB.saveNotifications(updated);
      return { count };
    }
  },

  transaction: {
    findMany: async (args?: { where?: { userId: string }; orderBy?: { createdAt: 'desc' } }) => {
      if (hasFirebaseConfig) {
        let list = await getFirestoreDocs('transactions');
        if (args?.where?.userId) {
          list = list.filter(t => t.userId === args.where!.userId);
        }
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return list;
      }
      if (canUsePrisma) return prisma.transaction.findMany(args);
      let txs = MockDB.getTransactions();
      if (args?.where?.userId) {
        txs = txs.filter(t => t.userId === args.where!.userId);
      }
      txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return txs;
    },
    create: async (args: { data: { userId: string; planName: string; amount: number; paymentGateway: string; gatewayPaymentId: string; status?: string; couponCode?: string; invoiceNumber: string } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        userId: args.data.userId,
        planName: args.data.planName,
        amount: args.data.amount,
        currency: 'INR',
        paymentGateway: args.data.paymentGateway,
        gatewayPaymentId: args.data.gatewayPaymentId,
        status: args.data.status || 'SUCCESS',
        couponCode: args.data.couponCode || null,
        invoiceNumber: args.data.invoiceNumber
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'transactions', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data;
      }
      if (canUsePrisma) return prisma.transaction.create(args as any);
      const transactions = MockDB.getTransactions();
      const newTx: Transaction = {
        id,
        userId: args.data.userId,
        planName: args.data.planName,
        amount: args.data.amount,
        currency: 'INR',
        paymentGateway: args.data.paymentGateway,
        gatewayPaymentId: args.data.gatewayPaymentId,
        status: (args.data.status || 'SUCCESS') as any,
        couponCode: args.data.couponCode,
        invoiceNumber: args.data.invoiceNumber,
        createdAt: new Date().toISOString()
      };
      transactions.push(newTx);
      MockDB.saveTransactions(transactions);
      return newTx;
    }
  },

  successStory: {
    findMany: async () => {
      if (hasFirebaseConfig) {
        return getFirestoreDocs('successStories');
      }
      if (canUsePrisma) return prisma.successStory.findMany();
      return MockDB.getSuccessStories();
    },
    create: async (args: { data: { coupleImage: string; brideName: string; groomName: string; weddingDate: string; story: string } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        coupleImage: args.data.coupleImage,
        brideName: args.data.brideName,
        groomName: args.data.groomName,
        weddingDate: args.data.weddingDate,
        story: args.data.story
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'successStories', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data;
      }
      if (canUsePrisma) return prisma.successStory.create(args);
      const stories = MockDB.getSuccessStories();
      const newStory: SuccessStory = {
        id,
        coupleImage: args.data.coupleImage,
        brideName: args.data.brideName,
        groomName: args.data.groomName,
        weddingDate: args.data.weddingDate,
        story: args.data.story,
        createdAt: new Date().toISOString()
      };
      stories.push(newStory);
      MockDB.saveSuccessStories(stories);
      return newStory;
    }
  },

  blog: {
    findMany: async () => {
      if (hasFirebaseConfig) {
        return getFirestoreDocs('blogs');
      }
      if (canUsePrisma) return prisma.blog.findMany();
      return MockDB.getBlogs();
    },
    findUnique: async (args: { where: { slug: string } }) => {
      if (hasFirebaseConfig) {
        const list = await getFirestoreDocs('blogs');
        return list.find(b => b.slug === args.where.slug) || null;
      }
      if (canUsePrisma) return prisma.blog.findUnique(args);
      const blogs = MockDB.getBlogs();
      return blogs.find(b => b.slug === args.where.slug) || null;
    },
    create: async (args: { data: { title: string; slug: string; content: string; category: string; image: string; author?: string } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        title: args.data.title,
        slug: args.data.slug,
        content: args.data.content,
        category: args.data.category,
        image: args.data.image,
        author: args.data.author || 'Admin'
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'blogs', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data;
      }
      if (canUsePrisma) return prisma.blog.create(args);
      const blogs = MockDB.getBlogs();
      const newBlog: Blog = {
        id,
        title: args.data.title,
        slug: args.data.slug,
        content: args.data.content,
        category: args.data.category,
        image: args.data.image,
        author: args.data.author || 'Admin',
        createdAt: new Date().toISOString()
      };
      blogs.push(newBlog);
      MockDB.saveBlogs(blogs);
      return newBlog;
    }
  },

  parentProfile: {
    findUnique: async (args: { where: { parentId?: string; childId?: string } }) => {
      if (hasFirebaseConfig) {
        const list = await getFirestoreDocs('parentProfiles');
        return list.find(p => (args.where.parentId && p.parentId === args.where.parentId) || (args.where.childId && p.childId === args.where.childId)) || null;
      }
      if (canUsePrisma) return prisma.parentProfile.findUnique(args);
      const list = MockDB.getParentProfiles();
      return list.find(p => (args.where.parentId && p.parentId === args.where.parentId) || (args.where.childId && p.childId === args.where.childId)) || null;
    },
    create: async (args: { data: { parentId: string; childId: string; relation?: string } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        parentId: args.data.parentId,
        childId: args.data.childId,
        relation: args.data.relation || 'Father'
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'parentProfiles', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data as any;
      }
      if (canUsePrisma) return prisma.parentProfile.create(args as any);
      const list = MockDB.getParentProfiles();
      const newItem = {
        id,
        parentId: args.data.parentId,
        childId: args.data.childId,
        relation: args.data.relation || 'Father',
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      MockDB.saveParentProfiles(list);
      return newItem as any;
    }
  },

  horoscopeReport: {
    findUnique: async (args: { where: { profileId: string } }) => {
      if (hasFirebaseConfig) {
        const list = await getFirestoreDocs('horoscopeReports');
        return list.find(h => h.profileId === args.where.profileId) || null;
      }
      if (canUsePrisma) return prisma.horoscopeReport.findUnique(args);
      const list = MockDB.getHoroscopeReports();
      return list.find(h => h.profileId === args.where.profileId) || null;
    },
    create: async (args: { data: { profileId: string; nakshatra: string; rashi: string; charana?: number; gunMilan?: number; isManglik?: boolean; dosha?: string; marriagePrediction?: string; luckyDates?: string } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        profileId: args.data.profileId,
        nakshatra: args.data.nakshatra,
        rashi: args.data.rashi,
        charana: args.data.charana || 1,
        gunMilan: args.data.gunMilan || 24,
        isManglik: args.data.isManglik || false,
        dosha: args.data.dosha || null,
        marriagePrediction: args.data.marriagePrediction || null,
        luckyDates: args.data.luckyDates || null
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'horoscopeReports', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data as any;
      }
      if (canUsePrisma) return prisma.horoscopeReport.create(args as any);
      const list = MockDB.getHoroscopeReports();
      const newItem = {
        id,
        profileId: args.data.profileId,
        nakshatra: args.data.nakshatra,
        rashi: args.data.rashi,
        charana: args.data.charana || 1,
        gunMilan: args.data.gunMilan || 24,
        isManglik: args.data.isManglik || false,
        dosha: args.data.dosha || null as any,
        marriagePrediction: args.data.marriagePrediction || null as any,
        luckyDates: args.data.luckyDates || null as any,
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      MockDB.saveHoroscopeReports(list);
      return newItem as any;
    }
  },

  aiCompatibilityReport: {
    findFirst: async (args: { where: { OR: Array<{ userOneId: string; userTwoId: string }> } }) => {
      if (hasFirebaseConfig) {
        const list = await getFirestoreDocs('aiCompatibilityReports');
        const orConds = args.where.OR;
        return list.find(r => orConds.some(c => 
          (r.userOneId === c.userOneId && r.userTwoId === c.userTwoId) ||
          (r.userOneId === c.userTwoId && r.userTwoId === c.userOneId)
        )) || null;
      }
      if (canUsePrisma) return prisma.aiCompatibilityReport.findFirst(args as any);
      const list = MockDB.getAICompatibilityReports();
      const orConds = args.where.OR;
      return list.find(r => orConds.some(c => 
        (r.userOneId === c.userOneId && r.userTwoId === c.userTwoId) ||
        (r.userOneId === c.userTwoId && r.userTwoId === c.userOneId)
      )) || null;
    },
    create: async (args: { data: { userOneId: string; userTwoId: string; overallMatch?: number; personalityMatch?: number; lifestyleMatch?: number; educationMatch?: number; careerMatch?: number; religionMatch?: number; familyMatch?: number; emotionalMatch?: number; communicationStyle?: string; matchingAnalysis?: string } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        userOneId: args.data.userOneId,
        userTwoId: args.data.userTwoId,
        overallMatch: args.data.overallMatch || 80,
        personalityMatch: args.data.personalityMatch || 80,
        lifestyleMatch: args.data.lifestyleMatch || 80,
        educationMatch: args.data.educationMatch || 80,
        careerMatch: args.data.careerMatch || 80,
        religionMatch: args.data.religionMatch || 80,
        familyMatch: args.data.familyMatch || 80,
        emotionalMatch: args.data.emotionalMatch || 80,
        communicationStyle: args.data.communicationStyle || null,
        matchingAnalysis: args.data.matchingAnalysis || null
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'aiCompatibilityReports', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data as any;
      }
      if (canUsePrisma) return prisma.aiCompatibilityReport.create(args as any);
      const list = MockDB.getAICompatibilityReports();
      const newItem = {
        id,
        userOneId: args.data.userOneId,
        userTwoId: args.data.userTwoId,
        overallMatch: args.data.overallMatch || 80,
        personalityMatch: args.data.personalityMatch || 80,
        lifestyleMatch: args.data.lifestyleMatch || 80,
        educationMatch: args.data.educationMatch || 80,
        careerMatch: args.data.careerMatch || 80,
        religionMatch: args.data.religionMatch || 80,
        familyMatch: args.data.familyMatch || 80,
        emotionalMatch: args.data.emotionalMatch || 80,
        communicationStyle: args.data.communicationStyle || null as any,
        matchingAnalysis: args.data.matchingAnalysis || null as any,
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      MockDB.saveAICompatibilityReports(list);
      return newItem as any;
    }
  },

  vendorProfile: {
    findUnique: async (args: { where: { userId: string } }) => {
      if (hasFirebaseConfig) {
        const list = await getFirestoreDocs('vendorProfiles');
        return list.find(v => v.userId === args.where.userId) || null;
      }
      if (canUsePrisma) return prisma.vendorProfile.findUnique(args);
      const list = MockDB.getVendorProfiles();
      return list.find(v => v.userId === args.where.userId) || null;
    },
    findMany: async (args?: any) => {
      if (hasFirebaseConfig) {
        const list = await getFirestoreDocs('vendorProfiles');
        if (args && args.where && args.where.category) {
          return list.filter(v => v.category === args.where.category);
        }
        return list;
      }
      if (canUsePrisma) return prisma.vendorProfile.findMany(args);
      const list = MockDB.getVendorProfiles();
      if (args && args.where && args.where.category) {
        return list.filter(v => v.category === args.where.category);
      }
      return list;
    },
    create: async (args: { data: { userId: string; companyName: string; category: string; packagesDetails?: string; portfolioPhotos?: string; location: string; contactNumber?: string } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        userId: args.data.userId,
        companyName: args.data.companyName,
        category: args.data.category,
        packagesDetails: args.data.packagesDetails || null,
        portfolioPhotos: args.data.portfolioPhotos || null,
        location: args.data.location,
        contactNumber: args.data.contactNumber || null,
        rating: 5.0,
        isVerified: false
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'vendorProfiles', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data as any;
      }
      if (canUsePrisma) return prisma.vendorProfile.create(args as any);
      const list = MockDB.getVendorProfiles();
      const newItem = {
        id,
        userId: args.data.userId,
        companyName: args.data.companyName,
        category: args.data.category,
        packagesDetails: args.data.packagesDetails || null as any,
        portfolioPhotos: args.data.portfolioPhotos || null as any,
        location: args.data.location,
        contactNumber: args.data.contactNumber || null as any,
        rating: 5.0,
        isVerified: false,
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      MockDB.saveVendorProfiles(list);
      return newItem as any;
    },
    update: async (args: { where: { userId: string }; data: any }) => {
      if (hasFirebaseConfig) {
        const list = await getFirestoreDocs('vendorProfiles');
        const target = list.find(v => v.userId === args.where.userId);
        if (!target) throw new Error("Vendor not found");
        const docRef = doc(fdb, 'vendorProfiles', target.id);
        const updatedData = { ...target, ...args.data };
        await setDoc(docRef, updatedData);
        return updatedData;
      }
      if (canUsePrisma) return prisma.vendorProfile.update(args as any);
      const list = MockDB.getVendorProfiles();
      const idx = list.findIndex(v => v.userId === args.where.userId);
      if (idx === -1) throw new Error("Vendor not found");
      const updated = { ...list[idx], ...args.data };
      list[idx] = updated;
      MockDB.saveVendorProfiles(list);
      return updated as any;
    }
  },

  vendorLead: {
    findMany: async (args: { where: { vendorProfileId?: string; userId?: string } }) => {
      if (hasFirebaseConfig) {
        let list = await getFirestoreDocs('vendorLeads');
        if (args.where.vendorProfileId) {
          list = list.filter(l => l.vendorProfileId === args.where.vendorProfileId);
        }
        if (args.where.userId) {
          list = list.filter(l => l.userId === args.where.userId);
        }
        return list;
      }
      if (canUsePrisma) return prisma.vendorLead.findMany(args as any);
      let list = MockDB.getVendorLeads();
      if (args.where.vendorProfileId) {
        list = list.filter(l => l.vendorProfileId === args.where.vendorProfileId);
      }
      if (args.where.userId) {
        list = list.filter(l => l.userId === args.where.userId);
      }
      return list;
    },
    create: async (args: { data: { userId: string; vendorProfileId: string; eventDate?: string; notes?: string } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        userId: args.data.userId,
        vendorProfileId: args.data.vendorProfileId,
        status: 'PENDING',
        eventDate: args.data.eventDate || null,
        notes: args.data.notes || null
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'vendorLeads', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data as any;
      }
      if (canUsePrisma) return prisma.vendorLead.create(args as any);
      const list = MockDB.getVendorLeads();
      const newItem = {
        id,
        userId: args.data.userId,
        vendorProfileId: args.data.vendorProfileId,
        status: 'PENDING',
        eventDate: args.data.eventDate || null as any,
        notes: args.data.notes || null as any,
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      MockDB.saveVendorLeads(list);
      return newItem as any;
    },
    update: async (args: { where: { id: string }; data: { status: string } }) => {
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'vendorLeads', args.where.id);
        const target = await getFirestoreDoc('vendorLeads', args.where.id);
        if (!target) throw new Error("Lead not found");
        const updatedData = { ...target, status: args.data.status };
        await setDoc(docRef, updatedData);
        return updatedData;
      }
      if (canUsePrisma) return prisma.vendorLead.update(args as any);
      const list = MockDB.getVendorLeads();
      const idx = list.findIndex(l => l.id === args.where.id);
      if (idx === -1) throw new Error("Lead not found");
      list[idx].status = args.data.status;
      MockDB.saveVendorLeads(list);
      return list[idx] as any;
    }
  },

  meetingSchedule: {
    findMany: async (args: { where: { OR: Array<any> } }) => {
      if (hasFirebaseConfig) {
        const list = await getFirestoreDocs('meetingSchedules');
        const orConds = args.where.OR;
        return list.filter(m => orConds.some((c: any) => 
          (c.hostId && m.hostId === c.hostId) ||
          (c.guestId && m.guestId === c.guestId)
        ));
      }
      if (canUsePrisma) return prisma.meetingSchedule.findMany(args as any);
      const list = MockDB.getMeetingSchedules();
      const orConds = args.where.OR;
      return list.filter(m => orConds.some((c: any) => 
        (c.hostId && m.hostId === c.hostId) ||
        (c.guestId && m.guestId === c.guestId)
      ));
    },
    create: async (args: { data: { hostId: string; guestId: string; meetingType?: string; scheduledAt: string; notes?: string } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        hostId: args.data.hostId,
        guestId: args.data.guestId,
        meetingType: args.data.meetingType || 'VIDEO',
        scheduledAt: args.data.scheduledAt,
        status: 'PENDING',
        notes: args.data.notes || null
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'meetingSchedules', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data as any;
      }
      if (canUsePrisma) return prisma.meetingSchedule.create(args as any);
      const list = MockDB.getMeetingSchedules();
      const newItem = {
        id,
        hostId: args.data.hostId,
        guestId: args.data.guestId,
        meetingType: args.data.meetingType || 'VIDEO',
        scheduledAt: args.data.scheduledAt,
        status: 'PENDING',
        notes: args.data.notes || null as any,
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      MockDB.saveMeetingSchedules(list);
      return newItem as any;
    },
    update: async (args: { where: { id: string }; data: { status: string } }) => {
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'meetingSchedules', args.where.id);
        const target = await getFirestoreDoc('meetingSchedules', args.where.id);
        if (!target) throw new Error("Meeting not found");
        const updatedData = { ...target, status: args.data.status };
        await setDoc(docRef, updatedData);
        return updatedData;
      }
      if (canUsePrisma) return prisma.meetingSchedule.update(args as any);
      const list = MockDB.getMeetingSchedules();
      const idx = list.findIndex(m => m.id === args.where.id);
      if (idx === -1) throw new Error("Meeting not found");
      list[idx].status = args.data.status;
      MockDB.saveMeetingSchedules(list);
      return list[idx] as any;
    }
  },

  supportTicket: {
    findMany: async (args: { where: { userId?: string } }) => {
      if (hasFirebaseConfig) {
        const list = await getFirestoreDocs('supportTickets');
        if (args && args.where && args.where.userId) {
          return list.filter(t => t.userId === args.where.userId);
        }
        return list;
      }
      if (canUsePrisma) return prisma.supportTicket.findMany(args);
      const list = MockDB.getSupportTickets();
      if (args && args.where && args.where.userId) {
        return list.filter(t => t.userId === args.where.userId);
      }
      return list;
    },
    create: async (args: { data: { userId: string; subject: string; category: string; priority?: string; description: string } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        userId: args.data.userId,
        subject: args.data.subject,
        category: args.data.category,
        priority: args.data.priority || 'MEDIUM',
        status: 'OPEN',
        description: args.data.description
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'supportTickets', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data as any;
      }
      if (canUsePrisma) return prisma.supportTicket.create(args as any);
      const list = MockDB.getSupportTickets();
      const newItem = {
        id,
        userId: args.data.userId,
        subject: args.data.subject,
        category: args.data.category,
        priority: args.data.priority || 'MEDIUM',
        status: 'OPEN',
        description: args.data.description,
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      MockDB.saveSupportTickets(list);
      return newItem as any;
    },
    update: async (args: { where: { id: string }; data: { status: string } }) => {
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'supportTickets', args.where.id);
        const target = await getFirestoreDoc('supportTickets', args.where.id);
        if (!target) throw new Error("Ticket not found");
        const updatedData = { ...target, status: args.data.status };
        await setDoc(docRef, updatedData);
        return updatedData;
      }
      if (canUsePrisma) return prisma.supportTicket.update(args as any);
      const list = MockDB.getSupportTickets();
      const idx = list.findIndex(t => t.id === args.where.id);
      if (idx === -1) throw new Error("Ticket not found");
      list[idx].status = args.data.status;
      MockDB.saveSupportTickets(list);
      return list[idx] as any;
    }
  },

  referral: {
    findMany: async (args: { where: { inviterId: string } }) => {
      if (hasFirebaseConfig) {
        const list = await getFirestoreDocs('referrals');
        return list.filter(r => r.inviterId === args.where.inviterId);
      }
      if (canUsePrisma) return prisma.referral.findMany(args);
      const list = MockDB.getReferrals();
      return list.filter(r => r.inviterId === args.where.inviterId);
    },
    create: async (args: { data: { inviterId: string; inviteeId: string; rewardAmount?: number } }) => {
      const id = Math.random().toString(36).substring(2, 15);
      const payload = {
        inviterId: args.data.inviterId,
        inviteeId: args.data.inviteeId,
        status: 'PENDING',
        rewardAmount: args.data.rewardAmount || 0.0,
        walletBalance: 0.0
      };
      if (hasFirebaseConfig) {
        const docRef = doc(fdb, 'referrals', id);
        const data = {
          ...payload,
          id,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, data);
        return data as any;
      }
      if (canUsePrisma) return prisma.referral.create(args as any);
      const list = MockDB.getReferrals();
      const newItem = {
        id,
        inviterId: args.data.inviterId,
        inviteeId: args.data.inviteeId,
        status: 'PENDING',
        rewardAmount: args.data.rewardAmount || 0.0,
        walletBalance: 0.0,
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      MockDB.saveReferrals(list);
      return newItem as any;
    }
  }
};
