import { NextRequest, NextResponse } from 'next/server';

// Credits costs per operation
const COSTS = {
  generate_copy: 1,
  generate_image: 3,
  generate_video: 5,
};

// In-memory credits store (use Supabase in production)
const creditsStore: Record<string, number> = {
  'demo@user.com': 100, // Demo user with 100 credits
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  const credits = creditsStore[email] || 0;
  return NextResponse.json({ email, credits });
}

export async function POST(request: NextRequest) {
  try {
    const { email, action, amount } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    // Initialize credits if not exists
    if (!creditsStore[email]) {
      creditsStore[email] = 0;
    }

    if (action === 'add') {
      // Add credits (purchase)
      creditsStore[email] += amount || 0;
      return NextResponse.json({ 
        email, 
        credits: creditsStore[email],
        message: `Added ${amount} credits`
      });
    }

    if (action === 'deduct') {
      // Deduct credits (usage)
      const cost = COSTS[amount as keyof typeof COSTS] || 1;
      
      if (creditsStore[email] < cost) {
        return NextResponse.json({ 
          error: 'Insufficient credits',
          current: creditsStore[email],
          required: cost 
        }, { status: 402 });
      }

      creditsStore[email] -= cost;
      return NextResponse.json({ 
        email, 
        credits: creditsStore[email],
        deducted: cost,
        action: amount
      });
    }

    if (action === 'set') {
      // Set specific amount (admin)
      creditsStore[email] = amount || 0;
      return NextResponse.json({ 
        email, 
        credits: creditsStore[email] 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Credits error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
