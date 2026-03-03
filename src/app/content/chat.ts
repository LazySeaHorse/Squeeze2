// ── Structured chat data ─────────────────────────────────────────────
// Raw messages + pre-computed per-person summaries for each compression level.
// The component handles rendering: level 0 = all messages, level 1-3 = summary bubbles.

export interface ChatMsg {
  sender: string;
  text: string;
}

export const CHAT_TITLE = "Maya's Birthday Dinner";

export const CHAT_MESSAGES: ChatMsg[] = [
  // ── Group A: Initial Planning (0-9) ────────────────────────────────
  { sender: 'Alex', text: 'hey everyone! so maya\'s bday is next friday and we NEED to plan something 🎂' },
  { sender: 'Alex', text: 'I was thinking dinner somewhere nice? like actually nice, not chipotle lol' },
  { sender: 'Maya', text: 'omg you guys don\'t have to do anything!! but also yes dinner would be amazing 🥹' },
  { sender: 'Sam', text: 'ok wait I have OPINIONS. what kind of food are we thinking? italian? japanese? that new korean bbq place?' },
  { sender: 'Jordan', text: 'friday might be tough for me, I have a work thing that could run late' },
  { sender: 'Alex', text: 'jordan you said that last time and then showed up 20 min early' },
  { sender: 'Jordan', text: '😂 fair. ok I\'ll make it work. probably.' },
  { sender: 'Sam', text: 'what about Nori? that omakase place on 5th? I went last month and it was incredible' },
  { sender: 'Maya', text: 'ooh nori is so good but isn\'t it like $150/person??' },
  { sender: 'Sam', text: 'ok yeah it\'s pricey. but it\'s your 30th!! treat yourself (or let us treat you)' },

  // ── Group B: Budget & Restaurant Decision (10-19) ──────────────────
  { sender: 'Alex', text: 'budget check: is everyone ok with $80-100 range per person?' },
  { sender: 'Jordan', text: 'yeah that works for me' },
  { sender: 'Sam', text: 'absolutely' },
  { sender: 'Maya', text: 'you guys 🥺 that\'s too much' },
  { sender: 'Alex', text: 'it\'s literally your birthday. shut up and accept the love' },
  { sender: 'Sam', text: '😂' },
  { sender: 'Alex', text: 'ok so nori is out at $150. what about Luca? italian, great wine list, mains are like $30-40' },
  { sender: 'Sam', text: 'luca is solid. their pasta is handmade. the cacio e pepe is life-changing' },
  { sender: 'Jordan', text: 'I\'m good with luca. can we do 7:30? gives me buffer after work' },
  { sender: 'Alex', text: '7:30 works. maya?' },

  // ── Group C: Guest List & Scheduling (20-29) ───────────────────────
  { sender: 'Maya', text: 'PERFECT. I love luca!! can we get that table in the back room?' },
  { sender: 'Alex', text: 'I\'ll call and ask. they usually hold it for parties of 6+, we\'re only 4 though' },
  { sender: 'Sam', text: 'should we invite anyone else? what about priya and derek?' },
  { sender: 'Maya', text: 'YES invite them! priya would love it and derek owes me a birthday dinner from last year lol' },
  { sender: 'Alex', text: 'ok so potentially 6 people. I\'ll make the res for 6 at 7:30 at luca. friday the 7th.' },
  { sender: 'Jordan', text: 'locked in. I\'ll leave work at 6:30 no matter what' },
  { sender: 'Alex', text: 'I\'m screenshotting that as evidence' },
  { sender: 'Jordan', text: '😭' },
  { sender: 'Sam', text: 'wait does priya still have that dairy allergy? luca is very cheese-heavy' },
  { sender: 'Alex', text: 'good call. I\'ll ask them about dairy-free options when I book' },

  // ── Group D: Stories & Drinks (30-39) ──────────────────────────────
  { sender: 'Maya', text: 'omg sam that reminds me, remember when we went to that fondue place and priya couldn\'t eat literally anything?' },
  { sender: 'Sam', text: '💀 she just sat there with breadsticks' },
  { sender: 'Jordan', text: 'was that the same night derek spilled wine on that guy\'s jacket?' },
  { sender: 'Alex', text: 'YES and then tried to blame it on the waiter 😂' },
  { sender: 'Maya', text: 'we have the best stories lol. ok but seriously can someone text priya and derek?' },
  { sender: 'Alex', text: 'I already texted both. priya said she\'s in! derek hasn\'t responded yet' },
  { sender: 'Sam', text: 'classic derek. should we do drinks before? or just go straight to dinner' },
  { sender: 'Jordan', text: 'I vote straight to dinner since I\'ll be rushing from work anyway' },
  { sender: 'Alex', text: 'agreed. we can always get cocktails at the restaurant. luca has that aperol spritz everyone raves about' },
  { sender: 'Maya', text: 'ooh yes I want one of those. ok what about cake?' },

  // ── Group E: Cake & Gifts (40-49) ─────────────────────────────────
  { sender: 'Sam', text: 'should we do a cake? or does luca have desserts?' },
  { sender: 'Alex', text: 'they have tiramisu and panna cotta. but I can bring a cake from that bakery on elm?' },
  { sender: 'Maya', text: 'the one with the chocolate raspberry cake?? YES PLEASE' },
  { sender: 'Alex', text: 'done. I\'ll order it tomorrow. how many candles? 😈' },
  { sender: 'Maya', text: 'ZERO. no candles. no singing. I will walk out' },
  { sender: 'Sam', text: 'noted. no singing. we\'ll just aggressively whisper "happy birthday"' },
  { sender: 'Jordan', text: 'lmaooo. also should we do gifts or is dinner the gift?' },
  { sender: 'Alex', text: 'I was thinking we could pool money for something nice? what does maya want' },
  { sender: 'Maya', text: 'you guys seriously dinner is more than enough!!' },
  { sender: 'Sam', text: 'ignore her. she\'s been wanting those noise-canceling headphones forever' },

  // ── Group F: Final Coordination (50-55) ────────────────────────────
  { sender: 'Alex', text: 'perfect. I\'ll set up a venmo pool. $50 each for the headphones? plus we split dinner' },
  { sender: 'Jordan', text: 'I\'m in. venmo me the link' },
  { sender: 'Sam', text: 'same 👍' },
  { sender: 'Alex', text: 'OK FINAL PLAN: Luca, Friday the 7th, 7:30 PM. Party of 6 (us + Priya + Derek). I\'m bringing chocolate raspberry cake from Elm St Bakery. We\'re pooling $50 each for headphones. Jordan WILL be there on time.' },
  { sender: 'Jordan', text: '...probably' },
  { sender: 'Maya', text: 'I love you all so much 😭❤️' },
];

// ── Pre-computed summaries ───────────────────────────────────────────
// Each level groups N messages and produces per-person summary bubbles.
// Level 1: ~10 per group, Level 2: ~19 per group, Level 3: ~28 per group

export const CHAT_SUMMARIES: Record<1 | 2 | 3, ChatMsg[][]> = {
  // ── Level 1: groups of ~10 ─────────────────────────────────────────
  1: [
    // Group 0 (msgs 0-9)
    [
      { sender: 'Alex', text: 'Proposed planning a birthday dinner for Maya. Wanted somewhere nice, not fast food.' },
      { sender: 'Maya', text: 'Excited about dinner but tried to downplay it. Worried Nori might be too expensive at $150/person.' },
      { sender: 'Sam', text: 'Had strong food opinions — suggested Italian, Japanese, Korean BBQ. Specifically recommended Nori omakase on 5th St.' },
      { sender: 'Jordan', text: 'Warned about a work conflict on Friday, but was called out for always making it anyway.' },
    ],
    // Group 1 (msgs 10-19)
    [
      { sender: 'Alex', text: 'Set budget at $80-100/person. Eliminated Nori as too expensive. Proposed Luca (Italian, $30-40 mains, great wine list).' },
      { sender: 'Sam', text: 'Endorsed Luca enthusiastically. Called the handmade cacio e pepe "life-changing."' },
      { sender: 'Maya', text: 'Felt the budget was too much but was lovingly overruled by Alex.' },
      { sender: 'Jordan', text: 'Agreed on budget. Requested 7:30 start time for work buffer.' },
    ],
    // Group 2 (msgs 20-29)
    [
      { sender: 'Maya', text: 'Wanted the back room table. Enthusiastically endorsed inviting Priya and Derek.' },
      { sender: 'Alex', text: 'Will book for 6 at 7:30. Screenshotted Jordan\'s commitment as evidence. Noted Priya\'s dairy allergy for menu planning.' },
      { sender: 'Sam', text: 'Suggested expanding guest list to include Priya and Derek. Flagged Priya\'s dairy allergy since Luca is cheese-heavy.' },
      { sender: 'Jordan', text: 'Committed to leaving work at 6:30 no matter what. Was mildly threatened with screenshots.' },
    ],
    // Group 3 (msgs 30-39)
    [
      { sender: 'Maya', text: 'Reminisced about the fondue incident with Priya. Asked someone to text Priya and Derek. Wants an aperol spritz.' },
      { sender: 'Sam', text: 'Recalled Priya sitting with just breadsticks. Suggested pre-dinner drinks.' },
      { sender: 'Alex', text: 'Already texted Priya (she\'s in) and Derek (no response). Suggested cocktails at Luca instead of pre-drinks.' },
      { sender: 'Jordan', text: 'Voted to skip pre-dinner drinks and go straight to Luca since rushing from work.' },
    ],
    // Group 4 (msgs 40-49)
    [
      { sender: 'Alex', text: 'Will order chocolate raspberry cake from Elm St Bakery. Proposed pooling money for a group gift.' },
      { sender: 'Maya', text: 'Demanded zero candles and absolutely no singing. Insisted dinner was enough for a gift.' },
      { sender: 'Sam', text: 'Offered to "aggressively whisper" happy birthday. Revealed Maya has been wanting noise-canceling headphones.' },
      { sender: 'Jordan', text: 'Asked whether to do separate gifts or group gift.' },
    ],
    // Group 5 (msgs 50-55)
    [
      { sender: 'Alex', text: 'Set up Venmo pool at $50/person for headphones. Delivered final plan with all details locked in.' },
      { sender: 'Jordan', text: 'Confirmed attendance with characteristic "probably."' },
      { sender: 'Sam', text: 'Confirmed in.' },
      { sender: 'Maya', text: 'Got emotional. Loves everyone.' },
    ],
  ],

  // ── Level 2: groups of ~19 ─────────────────────────────────────────
  2: [
    // Group 0 (msgs 0-18)
    [
      { sender: 'Alex', text: 'Organized Maya\'s 30th birthday dinner planning. Set budget at $80-100/person. Eliminated Nori (omakase, too expensive at $150). Chose Luca — Italian, handmade pasta, $30-40 mains.' },
      { sender: 'Maya', text: 'Excited about dinner but kept trying to be modest about cost. Loves Luca.' },
      { sender: 'Sam', text: 'Had strong restaurant opinions. Recommended Nori initially, then enthusiastically backed Luca. Called the cacio e pepe life-changing.' },
      { sender: 'Jordan', text: 'Had work conflict but committed to attending. Requested 7:30 start for buffer time.' },
    ],
    // Group 1 (msgs 19-39)
    [
      { sender: 'Alex', text: 'Booked for 6 at 7:30, noting Priya\'s dairy allergy. Already texted invites — Priya confirmed, Derek pending. Suggested aperol spritz cocktails at Luca.' },
      { sender: 'Maya', text: 'Wanted back room table. Pushed to invite Priya and Derek. Reminisced about the fondue and wine-spilling incidents.' },
      { sender: 'Sam', text: 'Expanded guest list. Flagged Priya\'s dairy allergy with cheese-heavy menu. Recalled past restaurant disasters.' },
      { sender: 'Jordan', text: 'Committed to leaving work at 6:30. Voted to skip pre-drinks since rushing. Contributed to fond disaster memories.' },
    ],
    // Group 2 (msgs 40-55)
    [
      { sender: 'Alex', text: 'Ordering chocolate raspberry cake from Elm St Bakery. Set up Venmo pool at $50/person for noise-canceling headphones. Delivered final plan: Luca, Friday 7th, 7:30 PM, 6 people.' },
      { sender: 'Maya', text: 'Absolutely no candles or singing. Insisted dinner was gift enough. Got emotional at the end.' },
      { sender: 'Sam', text: 'Revealed Maya\'s headphone wish. Suggested "aggressively whispering" happy birthday instead.' },
      { sender: 'Jordan', text: 'Joined gift pool. Confirmed attendance with signature ambiguity.' },
    ],
  ],

  // ── Level 3: groups of ~28 ─────────────────────────────────────────
  3: [
    // Group 0 (msgs 0-27)
    [
      { sender: 'Alex', text: 'Led birthday dinner planning. Set $80-100 budget, chose Luca (Italian) over Nori ($150/person). Booking for 6 at 7:30 on Friday the 7th. Handling Priya\'s dairy allergy.' },
      { sender: 'Maya', text: 'Birthday girl turning 30. Excited but modest about costs. Loves Luca. Wants back room table. Eager to include Priya and Derek.' },
      { sender: 'Sam', text: 'Restaurant expert. Pushed for Nori initially, endorsed Luca\'s handmade pasta. Flagged Priya\'s dairy allergy with cheese-heavy menu.' },
      { sender: 'Jordan', text: 'Work conflict but committed to 7:30. Historically unreliable but always shows up. Requested time buffer.' },
    ],
    // Group 1 (msgs 28-55)
    [
      { sender: 'Alex', text: 'Checked dairy-free options. Texted Priya (confirmed) and Derek (pending). Ordering cake from Elm St Bakery. Set up $50/person Venmo pool for noise-canceling headphones. Delivered comprehensive final plan.' },
      { sender: 'Maya', text: 'Reminisced about past dinner disasters. Wants aperol spritz. Strict no-candles, no-singing policy. Emotional about friends\' generosity.' },
      { sender: 'Sam', text: 'Recalled past incidents. Proposed cocktails at Luca. Revealed Maya\'s headphone wish. Will "aggressively whisper" happy birthday.' },
      { sender: 'Jordan', text: 'Voted straight to dinner (rushing from work). Joined gift pool. Confirmed with characteristic "probably."' },
    ],
  ],
};
