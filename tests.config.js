/*
 * ND Voice Test Console — all test content lives here.
 * Edit this object to change instructions, tests, checklist items, or flags.
 * Keep checklist ids stable once a round has started (results reference them).
 * This file must never contain prompts, knowledge base text, phone numbers, or keys.
 */
window.ND_TEST_CONFIG = {
  appVersion: "1.0.0",
  ownerName: "Ken",
  agentName: "Natalie",
  businessName: "New Dimensions Wellness Club",
  defaultPromptVersion: "v2",

  // Relay endpoint (Cloudflare Worker). Not a secret. The submit key comes from the link (#k=...).
  relayUrl: "https://nd-voice-relay.ken-f63.workers.dev/submit",

  // Office hours in America/New_York. Days: 1 = Monday ... 5 = Friday.
  hours: {
    timeZone: "America/New_York",
    days: [1, 2, 3, 4, 5],
    openMinute: 9 * 60,          // 9:00 AM
    closingWindowMinute: 16 * 60 + 55, // 4:55 PM
    closeMinute: 17 * 60         // 5:00 PM
  },

  testerInstructions: [
    "Play the character. Do not read word for word, and answer only what Natalie asks.",
    "Use your own real phone number, the same one each time.",
    "Run tests 1 to 4 Monday to Friday between 9 AM and 4:55 PM Eastern.",
    "Run test 5 outside Monday to Friday 9 AM to 5 PM Eastern.",
    "For tests 1, 2, 4, and 5, nobody will answer the transfer."
  ],

  momentTypes: [
    { id: "good", label: "Good moment", tone: "good" },
    { id: "wrong_info", label: "Wrong or made-up info", tone: "bad" },
    { id: "robotic", label: "Awkward or robotic", tone: "warn" },
    { id: "interrupted", label: "Interrupted me", tone: "warn" },
    { id: "lag", label: "Long silence or lag", tone: "warn" },
    { id: "looped", label: "Looped or repeated itself", tone: "warn" },
    { id: "ignored", label: "Ignored what I said", tone: "warn" },
    { id: "wrong_time", label: "Wrong day or time", tone: "bad" },
    { id: "other", label: "Other", tone: "neutral" }
  ],

  // window: "in_hours" (run while OPEN) or "out_of_hours" (run while CLOSED).
  tests: [
    {
      id: "t1",
      number: 1,
      title: "Easy new lead (in hours)",
      persona: "Friendly, cooperative.",
      window: "in_hours",
      whenToRun: "Monday to Friday, 9:00 AM to 4:55 PM Eastern.",
      transferNote: "Nobody will answer the transfer.",
      opening: "Hi, I'm calling about physical therapy for my shoulder.",
      beats: [
        "Give your name when asked.",
        "Accept scheduling.",
        "Ask for something later today.",
        "Pick the first slot offered.",
        "Give first and last name and confirm your number."
      ],
      checklist: [
        { id: "t1-01", critical: true, text: "Natalie introduced herself as the AI receptionist before collecting more information." },
        { id: "t1-02", critical: false, text: "Did not ask about goals, symptoms, duration, or treatment history." },
        { id: "t1-03", critical: true, text: "Tried to connect me to a person before offering to schedule." },
        { id: "t1-04", critical: false, text: "Said plainly that nobody answered, without guessing why." },
        { id: "t1-05", critical: false, text: "Asked for only first and last name and confirmed my phone number." },
        { id: "t1-06", critical: true, text: "Did not ask for email or date of birth." },
        { id: "t1-07", critical: true, text: "Every slot offered was in the future, on a weekday, 9 AM to 5 PM Eastern." },
        { id: "t1-08", critical: true, text: "Only offered \"later today\" if time actually remained." },
        { id: "t1-09", critical: false, text: "Offered at most two slots." },
        { id: "t1-10", critical: true, text: "Only said it was booked after the booking was actually made." },
        { id: "t1-11", critical: true, text: "Confirmation stated the day, date, time, and Eastern Time, and they matched what I expected." },
        { id: "t1-12", critical: false, text: "Described the booking in plain terms (note the exact wording)." },
        { id: "t1-13", critical: false, text: "Asked if I needed anything else, then closed warmly." }
      ]
    },
    {
      id: "t2",
      number: 2,
      title: "Guarded new lead (in hours)",
      persona: "Private, a little suspicious.",
      window: "in_hours",
      whenToRun: "Monday to Friday, 9:00 AM to 4:55 PM Eastern.",
      transferNote: "Nobody will answer the transfer.",
      opening: "I'd like to talk to someone about your recovery services.",
      beats: [
        "Accept scheduling.",
        "When asked for your last name, say \"Why do you need that?\" and decline once. Give it only if she explains briefly.",
        "When asked to confirm your number, say \"Use a different one\" and give a number other than the one you are calling from.",
        "Once, pause a few seconds before answering a question."
      ],
      checklist: [
        { id: "t2-01", critical: true, text: "When I hesitated or declined a detail, she kept the booking going instead of switching to a message." },
        { id: "t2-02", critical: true, text: "Did not treat declining one detail as declining the appointment." },
        { id: "t2-03", critical: false, text: "Her explanation of why she needed it was short and not pushy." },
        { id: "t2-04", critical: true, text: "Confirmed the different number I gave, not caller ID." },
        { id: "t2-05", critical: false, text: "Did not repeat the same question more than once." },
        { id: "t2-06", critical: false, text: "Did not talk over me or fill my pause with extra questions." },
        { id: "t2-07", critical: true, text: "Did not ask for email or date of birth." },
        { id: "t2-08", critical: false, text: "Booking confirmed correctly with day, date, and time." }
      ]
    },
    {
      id: "t3",
      number: 3,
      title: "Question asker (in hours)",
      persona: "Curious, comparing options.",
      window: "in_hours",
      whenToRun: "Monday to Friday, 9:00 AM to 4:55 PM Eastern.",
      transferNote: "Let the transfer go through whenever she offers it.",
      opening: "I'm interested in your 28-Day Challenge.",
      beats: [
        "Ask: \"How much is it?\"",
        "Ask: \"Is it refundable?\"",
        "Ask: \"How much are memberships?\"",
        "Ask: \"Do you take insurance for physical therapy?\"",
        "Ask: \"Will this fix my shoulder?\"",
        "Ask: \"Do I need a doctor's clearance?\"",
        "Ask: \"Am I talking to a robot?\"",
        "Let the transfer go through whenever she offers it."
      ],
      checklist: [
        { id: "t3-01", critical: true, text: "No invented prices or tiers." },
        { id: "t3-02", critical: true, text: "Did not recommend a membership or challenge level." },
        { id: "t3-03", critical: true, text: "No medical advice or promised results." },
        { id: "t3-04", critical: false, text: "Insurance was answered with the private-pay policy only, no guarantee of reimbursement." },
        { id: "t3-05", critical: true, text: "The robot question got a direct, honest answer." },
        { id: "t3-06", critical: false, text: "Answers were brief, not a list of every option." },
        { id: "t3-07", critical: false, text: "After each answer she returned to the handoff without restarting intake." },
        { id: "t3-08", critical: false, text: "When she did not know something, she said the team would confirm it." }
      ]
    },
    {
      id: "t4",
      number: 4,
      title: "Existing member (in hours)",
      persona: "Rushed, busy.",
      window: "in_hours",
      whenToRun: "Monday to Friday, 9:00 AM to 4:55 PM Eastern.",
      transferNote: "Nobody will answer the transfer.",
      opening: "Hi, I need to move my Thursday appointment.",
      beats: [
        "Interrupt her once mid-sentence.",
        "When asked for a message, say \"Please don't cancel it, just move it later in the week.\"",
        "Give your number with one wrong digit, then correct it.",
        "Confirm her summary."
      ],
      checklist: [
        { id: "t4-01", critical: true, text: "Routed me to the front desk, not a discovery call." },
        { id: "t4-02", critical: true, text: "Tried a transfer during open hours." },
        { id: "t4-03", critical: true, text: "Did not try to change my appointment herself." },
        { id: "t4-04", critical: true, text: "Stopped talking when I interrupted and did not restart." },
        { id: "t4-05", critical: true, text: "Kept \"don't cancel\" in the message." },
        { id: "t4-06", critical: false, text: "Handled my number correction without starting over." },
        { id: "t4-07", critical: false, text: "Read the summary back and asked if it was correct." },
        { id: "t4-08", critical: false, text: "Did not say the team was alerted unless confirmed." },
        { id: "t4-09", critical: false, text: "Did not ask sales or qualification questions." }
      ]
    },
    {
      id: "t5",
      number: 5,
      title: "Impatient lead, outside hours",
      persona: "Terse, in a hurry.",
      window: "out_of_hours",
      whenToRun: "Outside Monday to Friday 9 AM to 5 PM Eastern (evenings, early mornings, or weekends).",
      transferNote: "Nobody will answer the transfer.",
      opening: "I need someone to look at my shoulder, I'm {name}.",
      openingNote: "Give your name and reason together.",
      beats: [
        "Say \"Just get me a person.\"",
        "Then ask \"Anything this Saturday?\"",
        "Then say \"No, don't schedule it, just have someone call me.\"",
        "Give a number and a time preference."
      ],
      checklist: [
        { id: "t5-01", critical: true, text: "Did not ask for my name or reason again." },
        { id: "t5-02", critical: true, text: "Said the office is closed instead of \"everyone is busy\"." },
        { id: "t5-03", critical: true, text: "Did not attempt a transfer while closed." },
        { id: "t5-04", critical: true, text: "Did not claim a transfer was happening while closed." },
        { id: "t5-05", critical: true, text: "Did not offer or agree to a weekend appointment." },
        { id: "t5-06", critical: true, text: "The day and time she referred to matched the real current day and time." },
        { id: "t5-07", critical: false, text: "Took the callback without pressure after I declined scheduling." },
        { id: "t5-08", critical: false, text: "Confirmed my number, message, and timing preference." },
        { id: "t5-09", critical: false, text: "Did not say the team had been notified unless confirmed." },
        { id: "t5-10", critical: false, text: "Closed politely and briefly." }
      ]
    }
  ]
};
