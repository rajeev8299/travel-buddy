import type { Activity } from "./types";

// Things to Do — neutral activity guides (knowledge pages, not offers).
// Long-form bodies, when present, live in content/things-to-do/<slug>.md.
// Durations and times of day are suggestions. Costs are never stated here:
// they are "Quoted on enquiry" or marked [VERIFY: …] until confirmed.

export const ACTIVITIES: Activity[] = [
  {
    slug: "sunrise-boat-ride",
    title: "Sunrise boat ride",
    summary: "Row along the ghats as the city wakes — the classic first morning in Varanasi.",
    image: { src: "/img/ganga_sunrise.jpg", alt: "Bathers and wooden boats on the Ganga, with the ghats behind" },
    status: "review",
    interests: ["river", "spiritual", "photography"],
    typicalDuration: "1–2 hours",
    timeOfDay: "Before sunrise",
    suitableFor: ["First-time visitors", "Photographers", "Families"],
    related: { places: ["assi", "dashashwamedh", "manikarnika"], experiences: ["sunrise-rowing-boat-assi"], services: ["river"] },
  },
  {
    slug: "sunset-boat-ride",
    title: "Sunset boat ride",
    summary: "Drift along the riverfront in the golden hour and stay on the water for the lamps of the evening Aarti.",
    image: { src: "/img/boats.jpg", alt: "Boats moored along the ghats of Varanasi in the evening" },
    status: "review",
    interests: ["river", "spiritual", "photography"],
    typicalDuration: "1–2 hours",
    timeOfDay: "Late afternoon into evening",
    suitableFor: ["First-time visitors", "Couples", "Families", "Senior travellers"],
    sections: [
      {
        heading: "What it is",
        body: "An evening boat ride follows the curve of the ghats as the light softens over the river. Many visitors time it so the boat finishes near Dashashwamedh Ghat, where the evening Ganga Aarti can be watched from the water. It is a calmer alternative to standing in the crowd on the steps, and a good choice for anyone who finds long walks or steep steps difficult.",
      },
      {
        heading: "How to do it well",
        body: "Agree the route, the duration and the price with the boatman before you board, and confirm whether the boat will stay for the Aarti. Rowing boats are quieter and slower; motor boats cover more of the riverfront. Bring a light layer — it can be cool on the water in winter. Cost is quoted on enquiry and depends on boat type, group size and season [VERIFY: whether an official fare chart is published by the district administration].",
      },
      {
        heading: "Respectful conduct",
        body: "Many people on the ghats are bathing, praying or performing rites for family members. Keep voices low near the cremation ghats and do not photograph cremations or mourners. Ask before photographing people on the steps or other boats.",
      },
      {
        heading: "When to go",
        body: "The river is calmest and the light softest from October to March. Boats are suspended when the Ganga is in flood, usually during the monsoon [VERIFY: current boating status with the district administration]. On festival evenings the river is very crowded and boats book out early.",
      },
    ],
    safety: [
      "Ask for a life jacket and wear it.",
      "Board and step off only when the boat is held steady against the ghat.",
      "Do not overload the boat — agree the number of passengers in advance.",
      "Boats do not run when the river is in flood.",
    ],
    faqs: [
      { q: "Can I watch the Ganga Aarti from a boat?", a: "Yes, boats gather off Dashashwamedh Ghat during the Aarti. Confirm with the boatman that the boat will wait for it, and expect a crowded river on festival evenings." },
      { q: "Is a rowing boat or a motor boat better?", a: "Rowing boats are quieter and better for photography and conversation; motor boats cover more of the riverfront in the same time. Both are fine for most visitors." },
      { q: "Is it suitable for senior travellers?", a: "Usually yes — you sit for most of it. The hard part is getting on and off at the ghat steps, so ask for help and choose a ghat with gentler steps." },
      { q: "How much does it cost?", a: "Prices vary with the boat, group size, duration and season, so we quote them on enquiry rather than publish a figure we haven't verified." },
    ],
    related: { places: ["dashashwamedh", "assi", "manikarnika"], experiences: ["evening-aarti-from-a-boat"], services: ["river"] },
  },
  {
    slug: "ganga-aarti",
    title: "Watching the Ganga Aarti",
    summary: "The evening river ceremony of fire, bells and chant at Dashashwamedh — how to watch it well and respectfully.",
    image: { src: "/img/ganga_aarti.jpg", alt: "Priests performing the Ganga Aarti with raised brass lamps at night" },
    status: "review",
    interests: ["spiritual", "culture", "river", "photography"],
    typicalDuration: "1–2 hours including arriving early",
    timeOfDay: "Around sunset",
    suitableFor: ["First-time visitors", "Families", "Pilgrims", "Photographers"],
    sections: [
      {
        heading: "What it is",
        body: "Every evening, priests at Dashashwamedh Ghat perform an *aarti* — an offering of light — to the river Ganga, with large brass lamps, conch shells, bells and chanted hymns. Neighbouring ghats hold their own ceremonies too. For devotees it is an act of worship; for visitors it is one of the most memorable sights in Varanasi. The exact start time changes through the year with sunset [VERIFY: current Aarti timing with the organisers].",
      },
      {
        heading: "Where to watch from",
        body: "You can watch from the steps of the ghat, from the rooftops and balconies of buildings nearby, or from a boat on the river. The steps give the closest view but are the most crowded. A boat gives an uninterrupted view of the whole ceremony and is easier for anyone who cannot stand for long. Arrive early for a good place on the steps.",
      },
      {
        heading: "Respectful conduct",
        body: "This is a religious ceremony, not a show. Sit or stand quietly, keep your phone's flash off, and do not push to the front. If you are offered a lamp or flowers to float on the river, it is entirely your choice whether to take part. Some people may ask for a donation; only give if you wish to.",
      },
      {
        heading: "Festival evenings and the monsoon",
        body: "On major festival days — Dev Deepawali, Ganga Dussehra and others — crowds are very large, roads near the ghats may be closed and boats book out early. When the river is high in the monsoon, the ceremony usually moves to higher steps or nearby rooftops [VERIFY: monsoon arrangements with the organisers].",
      },
    ],
    safety: [
      "Keep phones and wallets secure — crowds are dense.",
      "Agree a meeting point with your group in case you are separated.",
      "If you have small children or limited mobility, consider watching from a boat.",
      "Leave slowly once it ends; the steps are crowded and can be slippery.",
    ],
    faqs: [
      { q: "What time does the Ganga Aarti start?", a: "Around sunset, so the time changes through the year. Check the organisers' current timing on the day — we show it here only once verified." },
      { q: "Do I need a ticket?", a: "Watching from the public steps does not require a ticket. Boat viewing and reserved seating, where offered, are arranged separately." },
      { q: "Is it better to watch from a boat or the steps?", a: "The steps feel closer to the ceremony; a boat gives a full, uncrowded view and is easier for children and senior travellers." },
      { q: "Can I take photos?", a: "Photography of the ceremony from a respectful distance is generally accepted. Avoid flash, don't block others' view, and ask before photographing individuals." },
    ],
    related: { places: ["dashashwamedh", "assi", "kashi-vishwanath"], experiences: ["evening-aarti-from-a-boat"], services: ["river", "guides"] },
  },
  {
    slug: "morning-ghat-walk",
    title: "Morning walk along the ghats",
    summary: "Walk the riverfront on foot at first light — bathers, prayers, yoga, wrestlers and chai, from Assi northwards.",
    image: { src: "/img/varanasi.jpg", alt: "Stone ghat steps beside the Ganga in Varanasi" },
    status: "review",
    interests: ["river", "spiritual", "culture", "photography"],
    typicalDuration: "1.5–3 hours",
    timeOfDay: "Early morning",
    suitableFor: ["First-time visitors", "Photographers", "Solo travellers"],
    sections: [
      {
        heading: "What it is",
        body: "The ghats form a continuous riverfront of steps, temples and old buildings. Walking them early in the morning is the best way to see the city's daily rhythm: people bathing and praying in the river, yoga and music on the steps, laundry being washed, boats setting out. A common route starts at Assi Ghat in the south and heads north towards Dashashwamedh, stopping wherever something catches your eye.",
      },
      {
        heading: "How to do it well",
        body: "Start early, wear shoes with good grip, and carry water. Take your time — there is no need to cover the whole riverfront. A local guide can explain the stories behind each ghat and its temples. Most stretches are walkable along the steps, but a few sections may be blocked by construction or water [VERIFY: current walkable stretches].",
      },
      {
        heading: "Respectful conduct",
        body: "Walk around, not through, people performing rituals. Dress modestly. At Manikarnika and Harishchandra, the cremation ghats, walk past quietly, keep your distance and do not take photographs. Politely decline anyone who offers unsolicited guiding or asks for money for wood.",
      },
      {
        heading: "When to go",
        body: "October to March is the most comfortable season. In summer, finish before the heat builds by mid-morning. In the monsoon, high water often covers the lower steps and parts of the walk may not be possible.",
      },
    ],
    safety: [
      "Steps can be steep, uneven and slippery — wear shoes with grip.",
      "Carry water, especially from April to June.",
      "Keep away from the water's edge when the river is high.",
      "Stray animals share the ghats — give cows and dogs space.",
    ],
    faqs: [
      { q: "Can I walk the whole riverfront?", a: "Much of it is connected by steps, but some stretches may be blocked by water or works. Walk a section rather than trying to cover everything." },
      { q: "Do I need a guide?", a: "No, but a local guide adds the stories, history and context you won't find on signs." },
      { q: "Is it safe for solo travellers?", a: "The ghats are busy and public in the morning. Use normal caution, keep valuables secure, and decline unsolicited offers firmly." },
    ],
    related: { places: ["assi", "dashashwamedh", "manikarnika", "kedar", "harishchandra"], experiences: ["morning-ghat-heritage-walk"], services: ["guides"] },
  },
  {
    slug: "heritage-walks",
    title: "Heritage walking tours",
    summary: "Explore the old city's lanes, mansions, shrines and stories on foot with someone who knows them.",
    image: { src: "/img/mural.jpg", alt: "Steps and a painted wall on a ghat in Varanasi" },
    status: "review",
    interests: ["heritage", "culture", "photography"],
    typicalDuration: "2–3 hours",
    timeOfDay: "Morning or late afternoon",
    suitableFor: ["History lovers", "First-time visitors", "Solo travellers"],
    sections: [
      {
        heading: "What it is",
        body: "Behind the ghats lies a maze of narrow lanes — *galis* — lined with old houses, small shrines, workshops and tea stalls. A heritage walk follows a route through this old city with a guide who explains its architecture, its communities and the stories attached to particular buildings and temples.",
      },
      {
        heading: "How to do it well",
        body: "Walk with a guide the first time; the lanes are easy to get lost in. Wear comfortable, closed shoes. Expect to share the lanes with motorbikes, cows and people going about their day, and to stop often. Costs are quoted on enquiry and depend on group size and route.",
      },
      {
        heading: "Respectful conduct",
        body: "These are homes and places of worship. Ask before entering any temple or courtyard, remove shoes where asked, and ask before photographing people or the inside of homes.",
      },
      {
        heading: "When to go",
        body: "Mornings and late afternoons are cooler and the lanes are lively. Avoid the hottest part of the day in summer.",
      },
    ],
    safety: [
      "Watch for motorbikes in narrow lanes.",
      "Keep valuables secure in crowded areas.",
      "Carry water and take breaks in the heat.",
    ],
    faqs: [
      { q: "How much walking is involved?", a: "Usually a couple of hours on foot at an easy pace with frequent stops. Tell us about any mobility needs and we can suggest a shorter route." },
      { q: "Can I do it without a guide?", a: "You can wander, but the lanes are confusing and much of the history isn't signposted. A guide makes the walk far richer." },
      { q: "Is it suitable for children?", a: "Older children usually enjoy it. The lanes are busy, so keep small children close." },
    ],
    related: { places: ["kashi-vishwanath", "dashashwamedh", "panchganga", "scindia"], experiences: ["morning-ghat-heritage-walk"], services: ["guides"] },
  },
  {
    slug: "temple-circuits",
    title: "Temple pilgrimage circuits",
    summary: "Plan a sequence of Varanasi's major temples — Kashi Vishwanath, Kaal Bhairav, Sankat Mochan, Durga Kund and more.",
    image: { src: "/img/ganga_aarti.jpg", alt: "Priests performing the Ganga Aarti with raised brass lamps at night" },
    status: "review",
    interests: ["spiritual", "heritage"],
    typicalDuration: "Half a day to a full day",
    timeOfDay: "Early morning start recommended",
    suitableFor: ["Pilgrims", "Families", "Senior travellers (with planning)"],
    sections: [
      {
        heading: "What it is",
        body: "Many pilgrims visit several temples in one day. Tradition associates particular temples with particular blessings, and families often follow a sequence passed down to them. A practical circuit groups temples by area — for example, the old-city temples around Kashi Vishwanath and Kaal Bhairav, and the southern temples of Sankat Mochan and Durga Kund near BHU.",
      },
      {
        heading: "How to do it well",
        body: "Start early; queues tend to grow as the day goes on. Check each temple's rules on phones, bags and dress before you go [VERIFY: current rules with each temple's management]. Keep footwear easy to slip on and off. Build in breaks and water, especially for senior travellers. Mondays and festival days are typically busier at Shiva temples.",
      },
      {
        heading: "Respectful conduct",
        body: "Follow the instructions of temple staff and security. Dress modestly, remove footwear where required, and be patient in queues. Photography is often restricted inside temples — look for signs and ask.",
      },
      {
        heading: "Getting around",
        body: "Vehicles cannot reach many old-city temples, which are approached on foot through narrow lanes. Southern temples near BHU are easier to reach by road. Our transport and guide partners can help plan the order and the last-mile walking.",
      },
    ],
    safety: [
      "Use official lockers or leave valuables at your hotel where phones and bags are not allowed.",
      "Keep your group together in crowded queues.",
      "Plan rests and water for senior travellers.",
    ],
    faqs: [
      { q: "Which temples can be visited in one day?", a: "Several, if grouped by area. A typical day pairs the old-city temples with the southern temples near BHU, with a break in between." },
      { q: "Can senior travellers do a temple circuit?", a: "Yes, with planning: fewer temples, an early start, transport between areas and help with the last stretch on foot." },
      { q: "Are phones allowed inside the temples?", a: "Rules differ by temple and can change. Some do not allow phones or bags past security; check before you go." },
      { q: "Can a guide arrange special darshan?", a: "We don't promise special or VIP darshan. Where an official paid option exists, a guide can explain how it works." },
    ],
    related: { places: ["kashi-vishwanath", "kaal-bhairav", "sankat-mochan", "durga-kund", "new-vishwanath-bhu", "annapurna"], experiences: ["kashi-vishwanath-with-local-guide"], services: ["guides", "transport"] },
  },
  {
    slug: "sarnath-buddhist-tour",
    title: "Sarnath heritage & Buddhist tours",
    summary: "Where the Buddha taught for the first time — stupas, ruins, the museum and monasteries, a short trip from the city.",
    image: { src: "/img/stupa.jpg", alt: "The Dhamek Stupa at Sarnath" },
    status: "review",
    interests: ["buddhist", "heritage", "family"],
    typicalDuration: "Half a day including travel",
    timeOfDay: "Morning or afternoon",
    suitableFor: ["History lovers", "Buddhist pilgrims", "Families", "Senior travellers"],
    sections: [
      {
        heading: "What it is",
        body: "Sarnath, north-east of Varanasi, is where — according to Buddhist tradition — the Buddha gave his first teaching after his enlightenment. Today the site includes the Dhamek Stupa, the ruins of ancient monasteries, the Sarnath Museum with the Lion Capital of Ashoka, the Chaukhandi Stupa, and temples built by Buddhist communities from across Asia.",
      },
      {
        heading: "How to do it well",
        body: "Allow at least half a day including travel. Visit the archaeological site and the museum together, and leave time to sit quietly in the deer park or at one of the temples. A guide who knows the archaeology and the Buddhist traditions makes the ruins far easier to read. Site and museum hours, tickets and the museum's weekly closing day must be checked before you go [VERIFY: with the Archaeological Survey of India].",
      },
      {
        heading: "Respectful conduct",
        body: "Sarnath is an active place of pilgrimage. Walk clockwise around stupas as pilgrims do, keep voices low, remove shoes where asked, and do not climb on ruins or monuments.",
      },
      {
        heading: "Combining with the city",
        body: "Sarnath pairs well with a calmer morning, followed by the evening Ganga Aarti back in Varanasi. Transport is arranged on enquiry [VERIFY: travel time from the ghats by road].",
      },
    ],
    safety: [
      "The site is spread out — wear comfortable shoes and carry water.",
      "Use sun protection; there is limited shade in places.",
      "Agree transport arrangements and return time in advance.",
    ],
    faqs: [
      { q: "How far is Sarnath from Varanasi?", a: "It is a short drive north-east of the city. We'll add the verified distance and typical travel time once checked." },
      { q: "Is the museum open every day?", a: "The museum has a weekly closing day. Check with the Archaeological Survey of India before you plan your visit." },
      { q: "Is Sarnath good for families and senior travellers?", a: "Yes — it is calm, green and mostly level, though the site is spread out. Plan rests and bring water." },
    ],
    related: { places: ["sarnath", "dhamek-stupa", "sarnath-museum", "chaukhandi-stupa", "mulagandha-kuti-vihara"], experiences: ["sarnath-half-day-with-transport"], services: ["transport", "guides"] },
  },
  {
    slug: "food-walks",
    title: "Traditional food walks",
    summary: "Kachori, chaat, lassi, sweets and paan in the old city's lanes, with someone who knows which stall is best.",
    image: { src: "/img/street_food.jpg", alt: "A kachori served with fried green chillies" },
    status: "review",
    interests: ["food", "culture"],
    typicalDuration: "2–3 hours",
    timeOfDay: "Morning or evening",
    suitableFor: ["Food lovers", "First-time visitors", "Solo travellers"],
    sections: [
      {
        heading: "What it is",
        body: "Banarasi food is overwhelmingly vegetarian and much of it is eaten standing at small stalls in the lanes. A food walk visits a handful of these — breakfast kachori and jalebi in the morning, or chaat, lassi, sweets and paan in the evening — with stories about each dish and the families who make them.",
      },
      {
        heading: "How to do it well",
        body: "Go hungry and pace yourself; portions add up. Tell your guide about allergies and dietary needs in advance. Seasonal dishes such as malaiyo appear only in winter. Costs are quoted on enquiry and usually depend on group size and what is eaten.",
      },
      {
        heading: "Eating safely",
        body: "Choose busy stalls where food is cooked fresh and hot. Drink bottled or filtered water, and be cautious with raw garnishes and ice if you have a sensitive stomach. Some thandai contains bhang — ask before you drink it [VERIFY: current legal and licensing position].",
      },
      {
        heading: "Respectful conduct",
        body: "Many stalls are small family businesses working at speed. Ask before photographing the cooks, and don't block narrow lanes while you eat.",
      },
    ],
    safety: [
      "Tell your guide about allergies before the walk.",
      "Prefer freshly cooked, hot food at busy stalls.",
      "Drink bottled or filtered water.",
      "Ask whether thandai contains bhang before drinking it.",
    ],
    faqs: [
      { q: "Is a food walk vegetarian?", a: "Mostly, yes — traditional old-city food is largely vegetarian. Tell us your dietary needs and we'll plan around them." },
      { q: "Is street food safe to eat?", a: "Busy stalls with freshly cooked, hot food are generally the safest choice. A local guide knows which places to trust." },
      { q: "Can it be done with children?", a: "Yes. Let us know their ages and we'll suggest a gentler route and milder dishes." },
    ],
    related: { places: ["kashi-vishwanath", "dashashwamedh"], experiences: ["old-city-food-walk"], services: ["guides"] },
  },
  {
    slug: "silk-weaving-visits",
    title: "Banarasi silk weaving visits",
    summary: "Meet handloom weavers, see how brocade patterns are set up and woven, and learn to tell genuine Banarasi silk.",
    image: { src: "/img/banaras_silk.jpg", alt: "A woman wearing a purple silk saree with a wide gold zari border" },
    status: "review",
    interests: ["culture", "shopping", "heritage"],
    typicalDuration: "2–3 hours",
    timeOfDay: "Late morning or afternoon",
    suitableFor: ["Craft and textile lovers", "Shoppers", "Families"],
    sections: [
      {
        heading: "What it is",
        body: "Varanasi is known for its silk brocades, in which patterns of *zari* (metallic thread) are woven into fine silk. A weaving visit takes you to workshops — often in family homes — where you can watch handlooms at work and learn how a design is prepared, set up on the loom and woven, sometimes over weeks for a single sari.",
      },
      {
        heading: "How to do it well",
        body: "Go with someone who knows the weavers, rather than a shop that brings visitors to a showroom. Ask questions — weavers are often happy to explain their craft. Learn the difference between handloom and powerloom before you buy anything [VERIFY: Geographical Indication status and how to check authenticity marks].",
      },
      {
        heading: "Respectful conduct",
        body: "Many workshops are inside homes. Ask before taking photographs, and don't touch looms or threads. You are never obliged to buy.",
      },
      {
        heading: "Buying fairly",
        body: "If you wish to buy, buying directly from weavers or trusted cooperatives keeps more money with the artisan. Our partners take no shopping commission; prices are between you and the seller.",
      },
    ],
    safety: [
      "Decline any pressure to buy — a genuine visit never requires a purchase.",
      "Ask for a written description of any silk you buy.",
    ],
    faqs: [
      { q: "Will I be taken to a shop?", a: "Not with our partners. The visit is about the craft; buying is optional and directly from the weaver if you choose." },
      { q: "How do I know the silk is genuine?", a: "Ask about handloom versus powerloom and any authenticity marks, and buy from people you trust. Our shopping guide explains what to look for." },
      { q: "Can I photograph the looms?", a: "Usually yes, if you ask first. Some families prefer not to have their homes photographed." },
    ],
    related: { places: [], experiences: ["madanpura-weavers-visit"], services: ["guides"] },
  },
  {
    slug: "handicraft-workshops",
    title: "Handicraft workshops",
    summary: "Hands-on sessions with local artisans — a way to understand the city's crafts and take home something you made.",
    image: { src: "/img/market.jpg", alt: "Rows of boats on the Ganga beside the busy riverfront, in haze" },
    status: "review",
    interests: ["culture", "shopping", "family"],
    typicalDuration: "1.5–3 hours",
    timeOfDay: "Daytime",
    suitableFor: ["Families", "Craft lovers", "Small groups"],
    sections: [
      {
        heading: "What it is",
        body: "Varanasi has long traditions of craftsmanship beyond silk, including wooden toys, metalwork and other local crafts [VERIFY: which crafts currently offer visitor workshops]. A workshop is a short, hands-on session with an artisan who shows you the basics of their craft and lets you try it yourself.",
      },
      {
        heading: "How to do it well",
        body: "Book in advance so the artisan can prepare. Tell us the ages of any children taking part. Workshops are arranged on enquiry, and costs — including materials — are quoted before you confirm.",
      },
      {
        heading: "Respectful conduct",
        body: "Workshops often take place in working studios or homes. Follow the artisan's instructions with tools, and ask before photographing their work or workspace.",
      },
    ],
    safety: [
      "Follow the artisan's instructions when using tools.",
      "Supervise children closely.",
    ],
    faqs: [
      { q: "Are workshops suitable for children?", a: "Many are, with supervision. Tell us their ages and we'll suggest a suitable craft." },
      { q: "Can I buy the artisan's work?", a: "Often yes, directly from the artisan. Buying is entirely optional." },
      { q: "How far in advance should I book?", a: "A few days ahead is best so the artisan can prepare materials." },
    ],
    related: { places: [], experiences: [], services: ["guides", "assistance"] },
  },
  {
    slug: "classical-music",
    title: "Classical music experiences",
    summary: "Hear Hindustani classical music in the city of great musicians — recitals, morning programmes and introductions to the instruments.",
    status: "review",
    interests: ["culture", "heritage"],
    typicalDuration: "1–2 hours",
    timeOfDay: "Morning or evening, depending on the programme",
    suitableFor: ["Music lovers", "Culture seekers", "Couples"],
    sections: [
      {
        heading: "What it is",
        body: "Varanasi has a deep tradition of Hindustani classical music, associated with renowned musicians and its own styles of singing and playing. Visitors can attend recitals, morning music programmes on the ghats, or sessions where a musician introduces an instrument and plays for a small group [VERIFY: current regular programmes and venues].",
      },
      {
        heading: "How to do it well",
        body: "Look out for recitals during festivals, when performances are more frequent. For a more personal experience, a small private session can be arranged on enquiry. Costs are quoted before you confirm.",
      },
      {
        heading: "Respectful conduct",
        body: "Stay quiet during performances, silence your phone, and ask before recording. Arrive on time — it is considered disrespectful to walk in mid-performance.",
      },
    ],
    safety: ["Keep valuables secure at crowded public programmes."],
    faqs: [
      { q: "Do I need to know classical music to enjoy it?", a: "Not at all. Many musicians are happy to explain what you're about to hear." },
      { q: "Can I record a performance?", a: "Always ask first. Some musicians and venues do not allow recording." },
      { q: "Are there free performances?", a: "Some public programmes and festival events are free. Check current listings — we'll add verified details as we confirm them." },
    ],
    related: { places: ["assi", "dashashwamedh"], experiences: [], services: ["guides", "assistance"] },
  },
  {
    slug: "photography-walks",
    title: "Photography walks with cultural guidelines",
    summary: "Photograph the ghats, lanes and river respectfully — the best light, the best places, and the places where cameras stay down.",
    image: { src: "/img/harbour.jpg", alt: "Boats on the Ganga at Varanasi" },
    status: "review",
    interests: ["photography", "river", "culture"],
    typicalDuration: "2–3 hours",
    timeOfDay: "Sunrise or late afternoon",
    suitableFor: ["Photographers", "Solo travellers", "Small groups"],
    sections: [
      {
        heading: "What it is",
        body: "A photography walk follows the ghats and lanes at the times of day when the light is best — first light and the golden hour before sunset — with someone who knows the city's viewpoints and its etiquette. The aim is good photographs taken in a way that respects the people in them.",
      },
      {
        heading: "Cultural guidelines",
        body: "**Never photograph cremations, the cremation grounds or mourners**, at Manikarnika, Harishchandra or anywhere else — not even from a boat. **Ask before photographing people**, especially close up, and respect a refusal. Be careful with photographs of people bathing or performing rituals; many people do not want to be photographed at these moments. Follow photography rules inside temples, where cameras are often not allowed. Do not pay people to pose for 'staged' photographs at religious sites.",
      },
      {
        heading: "How to do it well",
        body: "Start before sunrise for soft light over the river, or go out in the late afternoon. A boat gives a classic view of the whole riverfront. Carry a small kit — the lanes are narrow and crowded. Drone flying is restricted in many areas [VERIFY: current drone rules with the district administration].",
      },
      {
        heading: "When to go",
        body: "October to March brings clear light and comfortable mornings; winter mornings can be misty. Festival evenings offer extraordinary scenes but very large crowds.",
      },
    ],
    safety: [
      "Watch your footing on steps while looking through a viewfinder.",
      "Keep equipment secure in crowds.",
      "Do not fly drones without checking current rules and permissions.",
    ],
    faqs: [
      { q: "Can I photograph the cremation ghats?", a: "No. Photographing cremations or mourners is deeply disrespectful and often actively prohibited. Keep your camera down at Manikarnika and Harishchandra." },
      { q: "Is it okay to photograph sadhus?", a: "Only if you ask first and they agree. Some may ask for money; it's your choice, but never photograph anyone who declines." },
      { q: "Can I fly a drone?", a: "Drone flying is restricted in many parts of the city. Check the current rules and permissions before bringing one." },
      { q: "What's the best time for photographs?", a: "Sunrise and the hour before sunset, from October to March." },
    ],
    related: { places: ["assi", "dashashwamedh", "kedar", "panchganga"], experiences: ["morning-ghat-heritage-walk"], services: ["guides", "river"] },
  },
  {
    slug: "yoga-and-meditation",
    title: "Yoga and meditation",
    summary: "Morning yoga by the river, meditation in quiet ashrams and Sarnath's monasteries — find a practice that suits you.",
    image: { src: "/img/monks.jpg", alt: "Two monks in maroon robes seated near the Dhamek Stupa at Sarnath" },
    status: "review",
    interests: ["wellness", "spiritual", "buddhist"],
    typicalDuration: "1–2 hours per session",
    timeOfDay: "Early morning",
    suitableFor: ["Solo travellers", "Wellness seekers", "Couples"],
    sections: [
      {
        heading: "What it is",
        body: "Yoga and meditation are part of everyday life on the ghats. Visitors can join open morning sessions by the river, take classes with established teachers, or spend quiet time in ashrams and in the Buddhist monasteries and temples of Sarnath [VERIFY: current regular sessions and teachers].",
      },
      {
        heading: "How to do it well",
        body: "Choose a teacher or centre with a good reputation and ask about their experience and the style they teach. Tell the teacher about any injuries or health conditions. Bring your own mat if you prefer. Costs for classes are quoted on enquiry.",
      },
      {
        heading: "Respectful conduct",
        body: "Ashrams and monasteries are places of practice. Follow their rules on dress, silence and photography, and ask before joining any session.",
      },
    ],
    safety: [
      "Tell your teacher about injuries or health conditions.",
      "Stay hydrated, especially in warmer months.",
    ],
    faqs: [
      { q: "Are there free yoga sessions on the ghats?", a: "Some open morning sessions exist; details change, so check current schedules before you go." },
      { q: "Can beginners join?", a: "Yes — tell the teacher you're new and they'll adapt the session." },
      { q: "Can I meditate at Sarnath?", a: "Many visitors sit quietly in the deer park or temples. Some monasteries offer sessions; ask locally." },
    ],
    related: { places: ["assi", "sarnath"], experiences: [], services: ["assistance"] },
  },
  {
    slug: "market-exploration",
    title: "Local market exploration",
    summary: "Browse Godowlia, Vishwanath Gali and the old bazaars for religious goods, brassware, silk and souvenirs.",
    image: { src: "/img/market.jpg", alt: "Rows of boats on the Ganga beside the busy riverfront, in haze" },
    status: "review",
    interests: ["shopping", "culture", "food"],
    typicalDuration: "2–3 hours",
    timeOfDay: "Late morning or evening",
    suitableFor: ["Shoppers", "First-time visitors", "Families"],
    sections: [
      {
        heading: "What it is",
        body: "Varanasi's markets are part of its character: the busy crossroads of Godowlia, the temple lane of Vishwanath Gali with its religious goods, the old bazaars of Chowk and Thatheri Bazaar known for metalware, and Madanpura with its weavers. Exploring them is as much about the life of the city as about shopping.",
      },
      {
        heading: "How to do it well",
        body: "Go with an idea of what you want and a rough budget. Compare prices before buying anything significant, and bargain politely where it is customary. A local guide can help you find genuine artisans and avoid commission-driven shops.",
      },
      {
        heading: "Respectful conduct",
        body: "Lanes near temples are crowded with pilgrims; move aside for processions and don't block the way. Ask before photographing shopkeepers.",
      },
    ],
    safety: [
      "Keep wallets and phones secure in crowded lanes.",
      "Be wary of anyone who insists on taking you to a particular shop.",
      "Ask for a receipt for expensive purchases.",
    ],
    faqs: [
      { q: "Should I bargain?", a: "In many small shops and markets, polite bargaining is normal. Fixed-price shops will tell you." },
      { q: "Can I pay by UPI or card?", a: "Many shops accept UPI; smaller stalls may prefer cash. Carry some cash just in case." },
      { q: "How do I avoid commission shops?", a: "Be cautious with anyone who insists on taking you somewhere. Our partners take no shopping commission." },
    ],
    related: { places: ["kashi-vishwanath", "dashashwamedh"], experiences: ["old-city-food-walk"], services: ["guides"] },
  },
  {
    slug: "festival-experiences",
    title: "Festival experiences",
    summary: "Dev Deepawali, Mahashivratri, Holi and more — how to experience Varanasi's festivals safely and respectfully.",
    image: { src: "/img/dev_diwali.jpg", alt: "Ghats lit up with strings of lights at night" },
    status: "review",
    interests: ["spiritual", "culture", "river", "photography"],
    typicalDuration: "From an evening to several days",
    timeOfDay: "Depends on the festival",
    suitableFor: ["Culture seekers", "Pilgrims", "Photographers"],
    sections: [
      {
        heading: "What it is",
        body: "Varanasi's festivals transform the city. On Dev Deepawali the ghats are lit with lamps; on Mahashivratri the Shiva temples draw huge crowds; Holi fills the lanes with colour. Experiencing a festival here can be the highlight of a trip — with good planning.",
      },
      {
        heading: "How to plan",
        body: "Check our festival pages for each festival's typical season; exact dates are shown only once confirmed from official sources. Book accommodation and boats well in advance, expect road closures and diversions near the ghats, and allow much more time to get anywhere.",
      },
      {
        heading: "Respectful conduct",
        body: "Festivals are religious occasions. Follow the lead of local people, dress modestly, and respect any restrictions at temples. During Holi, ask before applying colour to anyone and be prepared to be included yourself.",
      },
    ],
    safety: [
      "Crowds can be extremely dense — agree a meeting point with your group.",
      "Keep valuables to a minimum.",
      "At Holi, protect eyes, phones and cameras from colour and water.",
      "Follow police and organiser instructions.",
    ],
    faqs: [
      { q: "When is Dev Deepawali?", a: "On Kartik Purnima, typically in October or November. We show the exact date only once officially confirmed." },
      { q: "Is it safe to visit during Holi?", a: "Many visitors enjoy it, with care. Join with people you trust, protect your eyes and devices, and avoid isolated areas." },
      { q: "Do I need to book early for festivals?", a: "Yes — rooms and boats for major festivals often book out well in advance." },
    ],
    related: { places: ["dashashwamedh", "assi", "kashi-vishwanath"], experiences: ["evening-aarti-from-a-boat"], services: ["river", "assistance"] },
  },
];
