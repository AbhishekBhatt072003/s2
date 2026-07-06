// ============================================================
// EDIT THIS FILE TO PERSONALIZE THE ENTIRE EXPERIENCE ✨
// Every text, image, memory, stat and question lives here.
// You can also drop songs into /public/assets/music and list
// them below (filename + title).
// ============================================================

export const loveData = {
  // Names
  yourName: "Sonu",         // Abhishek (Sonu) — the creator
  herName: "Sameer",         // her boyfriend
  coupleName: "Abheer",      // ship name: Abh(ishek) + (Sam)eer

  // Intro (typed one after another)
  introLines: [
    "Hey,",
    "I made something for you...",
    "For the person who came into my life and made it happy.",
    "I hope this makes you smile.",
  ],

  // Love stats (animated counters)
  stats: [
    { label: "Days Together", value: 184, icon: "calendar" },
    { label: "Hours Together", value: 4416, icon: "clock" },
    { label: "Messages Sent", value: 99999, icon: "message" },
    { label: "Photos Taken", value: 400, icon: "camera" },
    { label: "Calls", value: 415, icon: "phone" },
    { label: "Trips Together", value: 0, icon: "map" },
    { label: "Laughs Shared", value: 999999, icon: "smile" },
    { label: "Times I Missed You", value: 999999, icon: "heart" },
  ],

  // Memory Timeline — add as many as you want
  memories: [
    {
      id: "m1",
      date: "May 12, 2023",
      title: "Our First Talk",
      emoji: "💬",
      description: "The night the universe rearranged itself just so we would type 'hi' at the same second. I still remember your first message. I read it 40 times before replying.",
      photos: [
        "https://images.unsplash.com/photo-1524186459554-56f1f87a24e9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwzfHxyb21hbnRpYyUyMGNvdXBsZSUyMHN1bnNldHxlbnwwfHx8cHVycGxlfDE3ODMzMjI3ODB8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1639684194148-04e827632e08?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwxfHxjb3p5JTIwbG92ZSUyMG1vbWVudHN8ZW58MHx8fHB1cnBsZXwxNzgzMzIyNzgwfDA&ixlib=rb-4.1.0&q=85",
      ],
      location: "Somewhere in the internet",
      color: "from-pink-300 to-rose-400",
    },
    {
      id: "m2",
      date: "June 3, 2023",
      title: "Our First Call",
      emoji: "📞",
      description: "Three hours turned into six. Six turned into 'don't hang up'. Your voice is my favorite sound and my favorite silence.",
      photos: [
        "https://images.unsplash.com/photo-1641923543573-384c510b68ab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMGNvdXBsZSUyMHN1bnNldHxlbnwwfHx8cHVycGxlfDE3ODMzMjI3ODB8MA&ixlib=rb-4.1.0&q=85",
      ],
      location: "3 AM under our own moons",
      color: "from-purple-300 to-fuchsia-400",
    },
    {
      id: "m3",
      date: "July 21, 2023",
      title: "Our First Meet",
      emoji: "🫶",
      description: "I forgot every sentence I had practiced. You looked at me and my brain went 'stop.exe has crashed'. Best crash of my life.",
      photos: [
        "https://images.unsplash.com/photo-1718875000022-77157eb6b926?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwzfHxjb3VwbGUlMjBoYW5kc3xlbnwwfHx8cHVycGxlfDE3ODMzMjI3OTJ8MA&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1465779116288-c65090f8ad80?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwyfHxjb3VwbGUlMjBoYW5kc3xlbnwwfHx8cHVycGxlfDE3ODMzMjI3OTJ8MA&ixlib=rb-4.1.0&q=85",
      ],
      location: "The little café on the corner",
      color: "from-rose-300 to-pink-400",
    },
    {
      id: "m4",
      date: "October 14, 2023",
      title: "Our First Trip",
      emoji: "✈️",
      description: "You fell asleep on my shoulder and I forgot how to breathe. I hope every future flight is with you.",
      photos: [
        "https://images.unsplash.com/photo-1635257153190-6313ae8a9fdc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHxkcmVhbXklMjBzY2VuZXJ5fGVufDB8fHxwdXJwbGV8MTc4MzMyMjc4MHww&ixlib=rb-4.1.0&q=85",
        "https://images.pexels.com/photos/8096287/pexels-photo-8096287.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      ],
      location: "That mountain town we can't pronounce",
      color: "from-indigo-300 to-purple-400",
    },
    {
      id: "m5",
      date: "December 25, 2023",
      title: "Our Favorite Place",
      emoji: "🌅",
      description: "Anywhere is favorite when you're beside me. But this one — the little bench where you laughed until you cried — that one wins.",
      photos: [
        "https://images.unsplash.com/photo-1582549495898-a9a6bbe036da?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxjb3p5JTIwbG92ZSUyMG1vbWVudHN8ZW58MHx8fHB1cnBsZXwxNzgzMzIyNzgwfDA&ixlib=rb-4.1.0&q=85",
        "https://images.pexels.com/photos/8096318/pexels-photo-8096318.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      ],
      location: "Our secret spot",
      color: "from-amber-300 to-rose-400",
    },
  ],

  // Love letter (supports simple markdown: **bold**, *italic*, and \n for new lines)
  loveLetter: {
    title: "A letter, from Sonu — to Sameer",
    body: "My dearest Sameer,\n\nIf love had a shape, it would look exactly like the way you laugh with your whole face.\n\nEvery ordinary day became a chapter the moment you walked into it. Coffee tastes better. Songs make more sense. Mondays are survivable. And silence — the kind of silence I sit in with you — feels like the safest place on earth.\n\nI don't have poems big enough for you, so I built this instead. A tiny universe. Every pixel here whispers the same three words.\n\nYours, endlessly,\n— Sonu ❤️",
  },

  // Open when envelopes
  openWhen: [
    { id: "sad", title: "You're sad", emoji: "🥺", message: "Close your eyes. Imagine me holding your hand. I'm right there. You're not alone — you never were, and never will be. Breathe. Slowly. I love you." },
    { id: "miss", title: "You miss me", emoji: "💌", message: "Look up at the moon tonight. I'm probably looking at the same one thinking about you. Miss you back — always more than you think." },
    { id: "angry", title: "You're angry", emoji: "🔥", message: "Scream into a pillow. Then eat something sweet. Then remember: I am always on your team. Whatever it is — we'll beat it together." },
    { id: "sleep", title: "You can't sleep", emoji: "🌙", message: "Pretend my arm is around you. Match your breathing to mine — in, out, in, out. Dream about that trip we still owe each other." },
    { id: "motivation", title: "You need motivation", emoji: "⚡", message: "You are the strongest, softest, smartest, most stubborn person I have ever met. Whatever this is — you were built to beat it. Go get it, tiger." },
    { id: "lonely", title: "You feel lonely", emoji: "🫂", message: "You are so loved. Not just by me — by everyone who has ever met that beautiful heart of yours. Come back to me when you can. I'll wait." },
    { id: "smile", title: "You want to smile", emoji: "😊", message: "Remember that time you snorted while laughing and then laughed at your own snort? Yeah. I think about it weekly. Smile now — I'm smiling too." },
  ],

  // Bucket list
  bucketList: [
   { text: "Take a spontaneous weekend trip", done: false },
{ text: "Watch the sunrise together", done: false },
{ text: "Watch the stars far away from city lights", done: false },
    { text: "Go on a trip together", done: false },
{ text: "Go camping for a night", done: false },
{ text: "Take a train journey with no fixed plan", done: false },
{ text: "Visit a hill station during winter", done: false },
{ text: "Spend a day exploring a city we've never been to", done: false },
{ text: "Ride a Ferris wheel together", done: false },
{ text: "Have a picnic in a park", done: false },
{ text: "Cook dinner together", done: false },
{ text: "Watch a movie together", done: false },
{ text: "Sleep Together", done: false },
{ text: "Play some online games", done: false },
{ text: "Visit an arcade and play like kids", done: false },
    { text: "Travel to another country together", done: false },
    { text: "Never stop going on dates", done: false },

  ],

  // Proposal
  proposal: {
    question: "Will you always be mine?",
    yesButton: "YES 💖",
    noTexts: [
      "No", "Are you sure?", "Really?", "Think Again", "Last Chance",
      "Surely Not?", "Please?", "You'll Regret This", "I Don't Believe You",
      "Read The Question Again", "Wrong Button", "Seriously?", "Fine...",
      "Don't Break My Heart", "No Doesn't Suit You", "Try Again",
    ],
    celebration: "I knew you'd choose me, Sameer ❤️",
  },

  // Music (drop mp3 files into /public/assets/music and list them here)
  playlist: [
    // Example:
    // { title: "Our Song", src: "/assets/music/our-song.mp3" },
  ],
};

export default loveData;
