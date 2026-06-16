import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

// Mock auto-replies for seeded profiles to make the chat feel alive
const AUTO_REPLIES: Record<string, string[]> = {
  'bride-id-1': [
    "Hi there! Thanks for writing. I read your profile bio and found it very interesting.",
    "I'm currently wrapping up some office work, but I would love to talk more about our hobbies this evening!",
    "Do you prefer a phone call or should we continue chatting here first?"
  ],
  'bride-id-2': [
    "Hello! It is nice to connect with you. Yes, I am practicing in Mumbai.",
    "My family is quite supportive of my career. How about yours? What are your family's thoughts on location preference?",
    "That sounds wonderful! Let us align our horoscopes or talk further this weekend."
  ],
  'bride-id-3': [
    "Hey! I saw your request. Yes, design is my passion!",
    "I love exploring quiet cafes and taking photographs. What do you do on weekends?",
    "Let's connect on a quick video call here on Lado if you have some time later."
  ],
  'groom-id-1': [
    "Hey! Thanks for reaching out. Yes, investment banking keeps me busy, but finding a life partner is my priority right now.",
    "My family is based in Delhi NCR and they are very excited to meet potential matches.",
    "I would love to set up a chat or a phone call. Let me know what time works for you!"
  ],
  'groom-id-2': [
    "Pranam! Thank you for the interest. I am based in Jaipur managing our family ventures.",
    "Values and traditions are very important to me. I would love to know about your expectations in a partner.",
    "Sure, let us involve our parents once we have a basic understanding here."
  ],
  'groom-id-3': [
    "Hi! Great to connect. Yes, I did my MS at Stanford and currently manage product lines here.",
    "I'm looking for someone who is career-oriented and has a friendly, positive outlook on life.",
    "Sounds great. Let's schedule a call soon!"
  ]
};

export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const receiverId = searchParams.get('receiverId');

    // Case 1: Fetch messages between active user and a specific user
    if (receiverId) {
      const messages = await db.chatMessage.findMany({
        where: {
          OR: [
            { senderId: authUser.userId, receiverId },
            { senderId: receiverId, receiverId: authUser.userId }
          ]
        },
        orderBy: { createdAt: 'asc' }
      });

      // Mark messages received from the other user as read (isSeen = true)
      const mockDBModule = require('@/lib/mockDb').MockDB;
      const allMessages = mockDBModule.getChatMessages();
      let updatedCount = 0;
      const updatedMessages = allMessages.map((m: any) => {
        if (m.senderId === receiverId && m.receiverId === authUser.userId && !m.isSeen) {
          updatedCount++;
          return { ...m, isSeen: true };
        }
        return m;
      });

      if (updatedCount > 0) {
        mockDBModule.saveChatMessages(updatedMessages);
      }

      return NextResponse.json(messages);
    }

    // Case 2: List conversations (channels)
    const messages = await db.chatMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const conversationsMap = new Map<string, any>();
    const allUsers = await db.user.findMany();
    const allProfiles = await db.profile.findMany();

    messages.forEach((msg: any) => {
      const isSender = msg.senderId === authUser.userId;
      const partnerId = isSender ? msg.receiverId : msg.senderId;

      if (!conversationsMap.has(partnerId)) {
        const partner = allUsers.find((u: any) => u.id === partnerId);
        const partnerProfile = allProfiles.find((p: any) => p.id === partnerId);

        if (partner) {
          conversationsMap.set(partnerId, {
            partnerId,
            partnerName: partner.name,
            partnerRole: partner.role,
            partnerVerified: partner.isVerified,
            partnerPhoto: partnerProfile?.profilePhoto || null,
            lastMessage: msg.content || (msg.imageUrl ? 'Sent an image' : msg.voiceUrl ? 'Sent a voice note' : ''),
            isSeen: isSender ? true : msg.isSeen,
            createdAt: msg.createdAt,
            senderId: msg.senderId
          });
        }
      }
    });

    return NextResponse.json(Array.from(conversationsMap.values()));
  } catch (err: any) {
    console.error('Fetch Chat Messages Error:', err);
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
    const { receiverId, content, imageUrl, voiceUrl } = body;

    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
    }

    if (receiverId === authUser.userId) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    // Create the message in DB
    const newMsg = await db.chatMessage.create({
      data: {
        senderId: authUser.userId,
        receiverId,
        content,
        imageUrl,
        voiceUrl
      }
    });

    // Handle auto reply from seed mock accounts
    if (AUTO_REPLIES[receiverId]) {
      // Create a mock trigger in background (instantly in our mock logic)
      setTimeout(async () => {
        try {
          const replies = AUTO_REPLIES[receiverId];
          // Get a reply index based on how many messages have been exchanged
          const prevMessages = await db.chatMessage.findMany({
            where: {
              OR: [
                { senderId: authUser.userId, receiverId },
                { senderId: receiverId, receiverId: authUser.userId }
              ]
            }
          });

          // Filter messages sent by the mock profile
          const replyCount = prevMessages.filter((m: any) => m.senderId === receiverId).length;
          const replyText = replies[replyCount % replies.length];

          // Create the automatic reply
          await db.chatMessage.create({
            data: {
              senderId: receiverId,
              receiverId: authUser.userId,
              content: replyText
            }
          });

          // Add a notification for the reply
          const botUser = await db.user.findFirst({ where: { id: receiverId } });
          await db.notification.create({
            data: {
              userId: authUser.userId,
              type: 'CHAT_MESSAGE',
              title: `New message from ${botUser?.name}`,
              content: replyText.substring(0, 50) + (replyText.length > 50 ? '...' : '')
            }
          });
        } catch (botErr) {
          console.error("Bot auto responder failed:", botErr);
        }
      }, 1500); // 1.5 seconds simulated typing gap
    }

    return NextResponse.json(newMsg);
  } catch (err: any) {
    console.error('Send Chat Message Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
