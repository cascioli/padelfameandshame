import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export async function POST(request: Request) {
  try {
    const { score, winners, losers, vibe, beerDebtor, grudgeCount } = await request.json()

    const vibeStyle: Record<string, string> = {
      epic: 'legendary, over-the-top dramatic',
      roast: 'brutally sarcastic, roasting the losers',
      friendly: 'lighthearted and fun',
    }

    const grudgeLine = grudgeCount > 0
      ? ` This is the ${grudgeCount + 1}${grudgeCount === 0 ? 'st' : grudgeCount === 1 ? 'nd' : grudgeCount === 2 ? 'rd' : 'th'} time ${winners[0]} & ${winners[1]} have dominated ${losers[0]} & ${losers[1]}.`
      : ''

    const prompt = `You are a snarky padel sports journalist. Write a ${vibeStyle[vibe] ?? 'fun'} match summary in max 280 characters.
Match: ${winners[0]} & ${winners[1]} crushed ${losers[0]} & ${losers[1]} with score ${score}.${grudgeLine}
${beerDebtor} owes the round of beers.
Use 1-2 emojis. Be punchy. Max 280 chars. No hashtags.`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text().slice(0, 280)

    return NextResponse.json({ chronicle: text })
  } catch (err) {
    console.error('Chronicle error:', err)
    return NextResponse.json({ chronicle: null }, { status: 500 })
  }
}
