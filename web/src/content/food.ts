import type { FoodItem, Market, ShoppingGuide } from "./types";

// Food & Shopping. Areas only — never shop or stall names, ratings or hygiene
// claims, and nothing is described as "verified" or "certified" unless the
// platform has actually checked it (product/03-content-strategy.md).

/* -------------------------------------------------------------------- food */

export const FOOD: FoodItem[] = [
  {
    slug: "kachori-sabzi",
    title: "Kachori-sabzi & jalebi",
    summary: "The Banarasi breakfast: crisp kachori with spiced potato curry, followed by hot jalebi straight from the oil.",
    image: { src: "/img/street_food.jpg", alt: "A kachori served with fried green chillies" },
    status: "review",
    availability: "Mornings, year-round; most stalls sell out by late morning",
    dietary: "Vegetarian. Deep-fried, made with wheat flour; the curry is often spicy. Jalebi is very sweet.",
    whereToFind: "Breakfast stalls around Godowlia, the lanes near Vishwanath Gali (including the lane known as Kachori Gali) and Chowk",
    tips: [
      "Go early — breakfast stalls are busiest before 9am and many close once sold out",
      "Choose stalls where the food is freshly fried and the turnover is high",
      "Ask for the curry less spicy if you're not used to chilli",
      "Eat with your right hand, using the kachori to scoop the curry",
    ],
    sections: [
      {
        heading: "What it is",
        body: "Banarasi breakfast kachoris are usually small, puffed pastries — some plain, some stuffed with spiced lentil — served with a thin, tangy potato curry (*sabzi*) and often a little chutney. They are eaten standing at the stall, from leaf plates or bowls.",
      },
      {
        heading: "Why it matters in Banaras",
        body: "For many Banarasis, the day begins with a dip in the Ganga or a temple visit followed by kachori-sabzi and jalebi at a favourite stall. It's an easy, inexpensive way into the city's everyday life.",
      },
    ],
    faqs: [
      { q: "Is kachori-sabzi vegetarian?", a: "Yes. Many old-city stalls also avoid onion and garlic — ask if that matters to you." },
      { q: "Is it safe to eat street food in Varanasi?", a: "Choose busy stalls where food is cooked fresh in front of you, avoid raw garnishes if your stomach is sensitive, and drink bottled or filtered water." },
    ],
  },
  {
    slug: "tamatar-chaat",
    title: "Tamatar chaat",
    summary: "Varanasi's own chaat: tomatoes and potatoes cooked down with spices and ghee, topped with crunchy sev and served in a clay bowl.",
    status: "review",
    availability: "Afternoons and evenings, year-round",
    dietary: "Vegetarian. Contains ghee (dairy) and fried gram-flour sev; can be spicy and sweet-sour.",
    whereToFind: "Chaat stalls around Godowlia, Dashashwamedh Road and the old-city lanes",
    tips: [
      "Evenings are the best time — chaat stalls get going after 4pm",
      "Ask for less chilli if you prefer milder food",
      "It's often served in a small clay cup (kulhad) — part of the experience",
    ],
    sections: [
      {
        heading: "What it is",
        body: "Unlike most chaats, which are cold and crisp, tamatar chaat is served hot. Tomatoes, potatoes and spices are cooked together into a soft, tangy mix, finished with ghee, a sweet syrup or chutney, and topped with *namkeen* (crunchy fried snacks).",
      },
      {
        heading: "Why it's a Banarasi speciality",
        body: "Tamatar chaat is closely associated with Varanasi and is rarely made the same way elsewhere. Every stall has its own spice mix, so locals have strong opinions about their favourite.",
      },
    ],
  },
  {
    slug: "chooda-matar",
    title: "Chooda matar",
    summary: "A winter favourite: flattened rice cooked with fresh green peas, ghee and gentle spices.",
    status: "review",
    availability: "Winter (when fresh peas are in season), mostly mornings and evenings",
    dietary: "Vegetarian. Made with flattened rice (gluten-free), peas and often ghee and nuts.",
    whereToFind: "Snack stalls in the old city and around Godowlia and Lanka during winter",
    tips: [
      "Look for it in the colder months — it's a seasonal dish",
      "A good, lighter alternative to fried breakfasts",
    ],
    sections: [
      {
        heading: "What it is",
        body: "*Chooda* is flattened rice (poha); *matar* is green peas. In Banaras the two are cooked together with ghee, spices and sometimes milk, nuts or a touch of sweetness, making a soft, comforting dish.",
      },
      {
        heading: "When to try it",
        body: "Chooda matar is tied to winter, when fresh peas arrive in the markets. You'll find it more easily from around November to February.",
      },
    ],
  },
  {
    slug: "malaiyo",
    title: "Malaiyo",
    summary: "An airy winter-morning dessert of whipped, saffron-scented milk foam — gone as soon as the sun warms up.",
    status: "review",
    availability: "Winter mornings only, roughly November to February; sold out by mid-morning",
    dietary: "Vegetarian. Milk-based (dairy) with sugar, saffron, cardamom and nuts — avoid if lactose-intolerant or allergic to nuts.",
    whereToFind: "Sweet sellers and street vendors in the old-city lanes, especially around Chowk and Godowlia, on winter mornings",
    tips: [
      "Go early — malaiyo melts as the day warms and vendors pack up",
      "Eat it right away; it doesn't travel",
      "It's light and sweet — a small cup is enough",
    ],
    sections: [
      {
        heading: "What it is",
        body: "Malaiyo is milk that has been churned into a light froth, flavoured with saffron and cardamom, and topped with nuts. It's served in small clay cups and has an almost cloud-like texture.",
      },
      {
        heading: "A winter tradition",
        body: "**Tradition holds** that the milk is left out overnight in the cold so the winter dew helps it set before it is churned at dawn — which is why malaiyo is only made in the colder months and only in the morning.",
      },
    ],
  },
  {
    slug: "lassi-and-thandai",
    title: "Lassi and thandai",
    summary: "Thick, creamy lassi in a clay cup, and thandai — a cool, spiced milk drink. Know what's in your thandai before you drink it.",
    status: "review",
    availability: "Year-round; most refreshing in the hot months (April–June). Thandai is especially popular around Holi and Mahashivratri.",
    dietary: "Vegetarian. Both are dairy-based and often very sweet; thandai contains nuts and seeds. Some thandai contains bhang (a cannabis preparation).",
    whereToFind: "Lassi and sweet shops around Godowlia, Chowk, the lanes near the ghats and the Lanka area near BHU",
    tips: [
      "Ask whether thandai is plain or contains bhang before you order — and say clearly if you don't want it",
      "Bhang can affect people strongly and slowly; it's not suitable if you're unfamiliar with it, pregnant, or taking medication",
      "Lassi is often topped with thick malai (cream) and fruit — order a small one first",
      "Clay cups (kulhad) are used once and discarded — part of the tradition",
    ],
    sections: [
      {
        heading: "Lassi, Banarasi style",
        body: "Banarasi lassi is thick yoghurt churned with sugar and served in a clay cup, often topped with a layer of malai, dry fruit or rabri. It's almost a meal.",
      },
      {
        heading: "Thandai — and a word about bhang",
        body: "Thandai is chilled milk blended with nuts, seeds, rose and spices such as fennel and pepper. It's associated with Shiva and with festivals like Holi and Mahashivratri. Some sellers offer thandai with *bhang*, a preparation of cannabis leaves that has a long tradition in parts of North India. Its effects can be strong and delayed. If you're curious, read the local rules first [VERIFY: current legal status of bhang sale and consumption in Uttar Pradesh], and if in doubt, ask for plain thandai.",
      },
    ],
    faqs: [
      { q: "Does all thandai contain bhang?", a: "No. Plain thandai is widely available. Always ask, and say clearly that you want it without bhang if you prefer." },
      { q: "Is lassi safe to drink?", a: "Choose busy shops with high turnover. If you have a sensitive stomach, start with a small serving." },
    ],
  },
  {
    slug: "banarasi-paan",
    title: "Banarasi paan",
    summary: "The famous after-meal betel-leaf parcel — sweet or plain. Know what goes in it before you try one.",
    status: "review",
    availability: "Year-round, especially after meals and in the evening",
    dietary: "Betel leaf with areca nut, slaked lime, catechu and sweet fillings. Some versions contain tobacco (zarda). Areca nut and tobacco carry health risks.",
    whereToFind: "Paan stalls throughout the city — around Godowlia, Chowk, the lanes near the ghats and every busy market",
    tips: [
      "Ask for meetha (sweet) paan without tobacco if you just want to taste it",
      "Say clearly \"no zarda, no tobacco\" if you want to avoid it",
      "It's chewed slowly — and the red juice stains, so find somewhere to dispose of it properly",
      "Pregnant travellers and anyone with health concerns may prefer to skip it",
    ],
    sections: [
      {
        heading: "What it is",
        body: "Paan is a betel leaf wrapped around fillings — slaked lime and catechu paste, areca nut, and, in sweet versions, rose-petal preserve (*gulkand*), fennel, coconut and more. Banarasi paan is known for the care the paan-maker takes in preparing the leaf.",
      },
      {
        heading: "Part of city life",
        body: "Paan is a long-standing part of Banarasi culture, celebrated in songs and stories. The paan stall is a neighbourhood meeting point as much as a shop.",
      },
    ],
  },
  {
    slug: "baati-chokha",
    title: "Baati chokha",
    summary: "Hearty wheat balls roasted over a fire, served with smoky mashed vegetables — a taste of rural Purvanchal.",
    status: "review",
    availability: "Year-round, usually from lunchtime into the evening",
    dietary: "Vegetarian. Wheat-based (contains gluten); baati are often dipped in ghee. The chokha usually contains raw onion, garlic and mustard oil.",
    whereToFind: "Roadside stalls and simple eateries across the city, including around Lanka and near the main roads",
    tips: [
      "Ask for it with or without ghee",
      "A filling, inexpensive meal — one plate is usually enough",
    ],
    sections: [
      {
        heading: "What it is",
        body: "*Baati* are balls of wheat dough, often stuffed with spiced roasted gram flour (*sattu*), roasted over coals or a wood fire. *Chokha* is a smoky mash of roasted aubergine, tomato and potato with mustard oil, garlic and green chilli.",
      },
      {
        heading: "Where it comes from",
        body: "Baati chokha is a traditional dish of eastern Uttar Pradesh and Bihar. In Varanasi it's everyday comfort food rather than a speciality of the old city.",
      },
    ],
  },
  {
    slug: "sweets",
    title: "Rabri and traditional sweets",
    summary: "Rich, milky Banarasi sweets — rabri, malai-based treats and the city's many kinds of laddoo and peda.",
    status: "review",
    availability: "Year-round; some sweets are seasonal or made for festivals",
    dietary: "Vegetarian but heavily milk-based (dairy) and very sweet; many contain nuts.",
    whereToFind: "Sweet shops around Chowk, Godowlia, Thatheri Bazaar and the Lanka area",
    tips: [
      "Buy small quantities to taste several kinds",
      "Milk sweets don't keep long in the heat — eat them the same day",
      "Ask whether a sweet contains nuts if you have an allergy",
    ],
    sections: [
      {
        heading: "Rabri and milk sweets",
        body: "Rabri is milk simmered for hours until thick, layered with cream and flavoured with cardamom and saffron. Banaras has a strong tradition of milk sweets, many made from *khoya* (reduced milk) and *chhena* (fresh curd cheese).",
      },
      {
        heading: "Sweets to look out for",
        body: "Look for rabri, malai-based sweets, *lavang lata* (a pastry sealed with a clove), peda and festival sweets. Shops display them openly, so you can point and ask.",
      },
    ],
  },
  {
    slug: "vegetarian-meals",
    title: "Local vegetarian meals",
    summary: "A simple thali of dal, sabzi, rice and roti — the everyday food of Banaras, much of it prepared without onion or garlic.",
    image: { src: "/img/street_food.jpg", alt: "A kachori served with fried green chillies" },
    status: "review",
    availability: "Lunch and dinner, year-round",
    dietary: "Vegetarian. Some places serve sattvik food without onion or garlic; most use ghee or oil and wheat.",
    whereToFind: "Simple eateries and dining halls across the old city, near the ghats and around Lanka and BHU",
    tips: [
      "A thali often comes with refills — say when you've had enough",
      "Look for places busy with local families at mealtimes",
      "Near the old city and temples, food is almost always vegetarian; many places don't serve eggs or alcohol",
    ],
    sections: [
      {
        heading: "A Banarasi thali",
        body: "A typical meal is a *thali* — a plate with dal, one or two vegetable dishes, rice, roti or puri, pickle and sometimes curd and a sweet. It's filling, balanced and inexpensive.",
      },
      {
        heading: "Sattvik food",
        body: "Many households and some eateries in the old city cook sattvik food — vegetarian dishes without onion or garlic, linked to religious practice. If you have dietary needs, ask; people are used to the question.",
      },
    ],
  },
  {
    slug: "food-areas",
    title: "Where to eat in Varanasi",
    summary: "The neighbourhoods where Varanasi eats — from old-city breakfast lanes to student cafés near BHU — and how to choose well.",
    image: { src: "/img/market.jpg", alt: "Rows of boats on the Ganga beside the busy riverfront, in haze" },
    status: "review",
    availability: "Breakfast lanes are busiest in the morning; chaat areas from late afternoon",
    dietary: "Most food in the old city is vegetarian; non-vegetarian food is easier to find away from the ghats and temples.",
    whereToFind: "Godowlia and Dashashwamedh Road; the lanes around Vishwanath Gali; Chowk and Thatheri Bazaar; Assi and the Lanka area near BHU",
    tips: [
      "Eat where it's busy and food is cooked fresh",
      "Carry small change and use UPI where accepted",
      "Drink bottled or filtered water and skip ice if your stomach is sensitive",
      "Consider a food walk with a local guide for your first evening",
    ],
    sections: [
      {
        heading: "Old city: Godowlia, Vishwanath Gali and Chowk",
        body: "The densest cluster of breakfast stalls, chaat sellers, lassi shops and sweet shops. Busy, narrow and full of life — best on foot. See [Godowlia](/markets/godowlia) and [Chowk](/markets/chowk).",
      },
      {
        heading: "Assi and Lanka",
        body: "Near the southern ghats and Banaras Hindu University, with a younger crowd, cafés alongside traditional stalls, and a slightly calmer pace.",
      },
      {
        heading: "Choosing well",
        body: "We don't list or rate individual stalls. A good rule: follow the crowds of local families, watch the food being cooked, and try things a little at a time. A [food walk](/things-to-do/food-walks) with a local is the easiest way to start.",
      },
    ],
  },
];

/* ----------------------------------------------------------------- markets */

export const MARKETS: Market[] = [
  {
    slug: "godowlia",
    title: "Godowlia",
    summary: "The busy crossroads of the old city — the way in to Dashashwamedh Ghat, Vishwanath Gali and the food lanes.",
    status: "review",
    knownFor: ["Street food and sweets", "Everyday shopping, clothes and household goods", "Access to Dashashwamedh Ghat and the old city"],
    tips: [
      "Vehicles are usually stopped around here — expect to walk the last stretch to the ghats",
      "It's very crowded in the evening around Aarti time; keep phones and wallets secure",
      "Agree a price before taking a rickshaw from here",
    ],
    sections: [
      {
        heading: "About Godowlia",
        body: "Godowlia is the main crossing where the newer city meets the old. Roads lead down to [Dashashwamedh Ghat](/places/ghats/dashashwamedh), and lanes branch off towards [Vishwanath Gali](/markets/vishwanath-gali) and the temple.",
      },
      {
        heading: "Getting around",
        body: "Traffic restrictions often apply near Godowlia, especially in the evening and on festival days [VERIFY: current restrictions from Varanasi traffic police]. Plan to walk from here.",
      },
    ],
  },
  {
    slug: "vishwanath-gali",
    title: "Vishwanath Gali",
    summary: "The narrow lane to Kashi Vishwanath, lined with stalls selling flowers, offerings, bangles, rudraksha and Banarasi textiles.",
    status: "review",
    knownFor: ["Religious goods and offerings", "Bangles, beads and small souvenirs", "Banarasi saree and textile shops"],
    tips: [
      "Expect crowds and security checks near the temple",
      "Shop owners may offer to keep your bags or phone for the temple — you are not obliged to buy anything",
      "Prices for souvenirs are usually negotiable; for offerings, buy only what you need",
      "Watch for pickpockets in the densest stretches",
    ],
    sections: [
      {
        heading: "About the lane",
        body: "Vishwanath Gali is one of the old city's best-known lanes, leading towards [Shri Kashi Vishwanath Temple](/places/temples/kashi-vishwanath). It's a mix of devotional shopping and everyday trade.",
      },
      {
        heading: "Shopping tips",
        body: "Look around before you buy and compare a few shops. Be polite but firm if you're not interested. Nothing here is checked or endorsed by us — buy what you like at a price you're comfortable with.",
      },
    ],
  },
  {
    slug: "chowk",
    title: "Chowk",
    summary: "The historic commercial heart of the old city — textiles, wholesale trade and traditional sweets in dense, lively lanes.",
    status: "review",
    knownFor: ["Textiles and Banarasi silk", "Wholesale trade", "Traditional sweets and snacks"],
    tips: [
      "Go on foot — the lanes are too narrow and busy for vehicles",
      "Many shops are wholesale; ask whether they sell single pieces",
      "Mornings are calmer than evenings",
    ],
    sections: [
      {
        heading: "About Chowk",
        body: "Chowk has long been one of the main trading areas of Banaras, with lanes specialising in different goods. It's a good place to see the city's working markets rather than tourist shops.",
      },
      {
        heading: "What to look for",
        body: "Fabric and saree traders, brass and household goods towards [Thatheri Bazaar](/markets/thatheri-bazaar), and sweet shops. Ask before photographing shopkeepers or workshops.",
      },
    ],
  },
  {
    slug: "thatheri-bazaar",
    title: "Thatheri Bazaar",
    summary: "The metalworkers' market — brass and copper pots, lamps and utensils, made and sold in the same lanes.",
    status: "review",
    knownFor: ["Brass and copper utensils", "Lamps and puja items", "Traditional metalwork"],
    tips: [
      "Metal goods are sold by weight — ask how the price is calculated",
      "Heavy items are bulky to carry home; ask about packing",
      "The lanes are noisy and busy — mind your step",
    ],
    sections: [
      {
        heading: "About Thatheri Bazaar",
        body: "The name comes from the *thatheras*, the community of metalworkers traditionally associated with this market. Brass and copper vessels, lamps and puja items are sold here, and you may hear metal being worked in nearby lanes.",
      },
      {
        heading: "Buying metalware",
        body: "Check the weight and the finish, compare a few shops, and ask whether an item is solid brass or plated. Prices are usually negotiable.",
      },
    ],
  },
  {
    slug: "madanpura",
    title: "Madanpura",
    summary: "A weaving neighbourhood where handlooms still work in family homes — the place to understand how Banarasi silk is made.",
    status: "review",
    knownFor: ["Banarasi silk weaving", "Sarees and fabric direct from workshops", "Family handloom traditions"],
    tips: [
      "Ask before entering homes or workshops, and before taking photos",
      "Go with a local guide if you want to visit working looms",
      "Buying is never compulsory — a visit is not a promise to purchase",
    ],
    sections: [
      {
        heading: "About Madanpura",
        body: "Madanpura is one of the neighbourhoods long associated with Banarasi silk weaving. Many families have worked looms for generations, and some sell sarees and fabric directly.",
      },
      {
        heading: "Visiting respectfully",
        body: "These are homes and workplaces, not showrooms. A [silk weaving visit](/things-to-do/silk-weaving-visits) with a local guide is the most respectful way in. Read our [silk buying guide](/shopping/banarasi-silk-sarees) before you shop.",
      },
    ],
  },
  {
    slug: "lahurabir",
    title: "Lahurabir",
    summary: "A busy commercial area of the newer city — everyday shopping, clothing and household goods away from the tourist lanes.",
    status: "review",
    knownFor: ["Clothing and everyday shopping", "Household goods", "Local markets away from the ghats"],
    tips: [
      "Accessible by road, unlike the old-city lanes",
      "Prices are usually more fixed than in tourist areas",
      "Busy in the evenings; keep valuables secure",
    ],
    sections: [
      {
        heading: "About Lahurabir",
        body: "Lahurabir is part of Varanasi's newer commercial city. It's where many locals shop for clothes and everyday needs, so it gives a different view from the riverfront markets.",
      },
      {
        heading: "When to go",
        body: "Useful if you need everyday items, or want to see local shopping beyond souvenirs. Combine it with errands rather than making a special trip.",
      },
    ],
  },
];

/* ---------------------------------------------------------------- shopping */

export const SHOPPING: ShoppingGuide[] = [
  {
    slug: "banarasi-silk-sarees",
    title: "Buying a Banarasi silk saree",
    summary: "How Banarasi silk is woven, how to tell handloom from powerloom, and how to buy fairly from the people who make it.",
    image: { src: "/img/banaras_silk.jpg", alt: "A woman wearing a purple silk saree with a wide gold zari border" },
    status: "review",
    sections: [
      {
        heading: "Why Banarasi silk is special",
        body: "Banarasi sarees are known for their brocade — patterns woven into fine silk with *zari*, a metallic thread. Motifs include flowers, leaves, paisleys and trellis-like designs. Weaving a single elaborate saree by hand can take weeks. Banaras brocades and sarees are protected by Geographical Indication registration [VERIFY: GI registration details and year].",
      },
      {
        heading: "Handloom or powerloom?",
        body: "Many sarees sold as \"Banarasi\" are made on power looms. Handloom pieces usually cost more and show signs of handwork:\n\n- **Look at the back.** On many handwoven brocades, the reverse shows floats of thread between motifs, sometimes trimmed by hand. Powerloom backs are often very uniform.\n- **Look for small irregularities.** Handwoven motifs can vary slightly; perfectly identical repeats suggest a machine.\n- **Ask questions.** A seller who knows the weaver, area and time taken is a good sign.\n\nNone of these signs is foolproof — they help you ask better questions.",
      },
      {
        heading: "Zari and silk",
        body: "Traditional zari was made with silver and gold; most zari today uses metallic or plated thread. Both are legitimate — what matters is that you're told honestly what you're buying. For pure silk, look for an official silk-quality label where offered [VERIFY: Silk Mark scheme details from the Silk Mark Organisation of India], and ask for it in writing on the bill.",
      },
      {
        heading: "How to buy fairly",
        body: "- Visit two or three shops before deciding.\n- Ask for a written bill describing the fabric (silk type, zari, handloom or powerloom).\n- Be wary of anyone who offers to take you to a \"factory\" or \"government shop\" — they may be paid a commission on what you buy.\n- Bargaining is common but keep it friendly; a fair price respects the weaver's time.",
      },
      {
        heading: "Supporting artisans",
        body: "Buying directly from weaving families or cooperatives means more of the price reaches the people who made it. A guided [silk weaving visit](/things-to-do/silk-weaving-visits) in [Madanpura](/markets/madanpura) lets you see the craft first. We don't take commissions on shopping and we don't endorse individual shops.",
      },
    ],
    faqs: [
      { q: "How much does a real Banarasi saree cost?", a: "It varies hugely with silk, zari and the complexity of the weave. We don't quote prices; compare a few sellers and ask for a written description on the bill." },
      { q: "Can shops ship a saree abroad?", a: "Many do. Get the shipping cost, insurance and expected delivery in writing, and keep the bill." },
    ],
  },
  {
    slug: "brocade-and-handloom",
    title: "Brocade, handloom and textiles",
    summary: "Beyond sarees: Banarasi brocade fabrics, stoles, dupattas and furnishing textiles, and how the weaving works.",
    image: { src: "/img/banaras_silk.jpg", alt: "A woman wearing a purple silk saree with a wide gold zari border" },
    status: "review",
    sections: [
      {
        heading: "What's on offer",
        body: "Alongside sarees, weavers produce brocade fabric by the metre, dupattas, stoles, cushion covers and other furnishings. These make lighter, easier-to-carry souvenirs than a full saree.",
      },
      {
        heading: "How brocade is woven",
        body: "In brocade weaving, extra threads are woven in to create raised patterns on the base fabric. Traditionally patterns are set up on the loom with punched cards (a jacquard mechanism) before weaving begins.",
      },
      {
        heading: "Buying tips",
        body: "Ask what the fabric is made of (silk, cotton, blends), whether it's handloom, and how it should be cleaned. Many fine brocades need dry cleaning. See our [silk buying guide](/shopping/banarasi-silk-sarees) for handloom tips.",
      },
    ],
  },
  {
    slug: "handicrafts",
    title: "Handicrafts, wooden toys and souvenirs",
    summary: "Lacquered wooden toys, pink enamel work, stone carving and more — Varanasi's crafts and how to find genuine pieces.",
    image: { src: "/img/market.jpg", alt: "Rows of boats on the Ganga beside the busy riverfront, in haze" },
    status: "review",
    sections: [
      {
        heading: "Crafts to look for",
        body: "- **Lacquered wooden toys** — brightly coloured, turned wooden toys and figures [VERIFY: GI status of Varanasi wooden lacquerware and toys].\n- **Gulabi meenakari** — delicate pink enamel work on metal, used in jewellery and small decorative pieces [VERIFY: GI status].\n- **Stone carving and inlay**, glass beads and brass figures.\n- **Hand-knotted carpets** from the nearby Bhadohi–Mirzapur region.",
      },
      {
        heading: "Finding genuine work",
        body: "Ask who made a piece and where. Workshop visits with a local guide are the best way to meet makers. Very cheap, identical items in bulk are often mass-produced.",
      },
      {
        heading: "Carrying them home",
        body: "Wooden toys and enamel work are light but fragile — ask for padding. For larger items, get shipping costs and timelines in writing.",
      },
    ],
  },
  {
    slug: "religious-goods",
    title: "Religious goods",
    summary: "Rudraksha beads, brass lamps, idols, prayer beads and containers for Ganga water — what they are and how to buy thoughtfully.",
    image: { src: "/img/ganga_aarti.jpg", alt: "Priests performing the Ganga Aarti with raised brass lamps at night" },
    status: "review",
    sections: [
      {
        heading: "What you'll find",
        body: "Shops near the temples and ghats sell puja items: brass lamps and bells, small idols, rudraksha and other prayer beads, sacred threads, vermilion, incense, and small sealed containers for carrying Ganga water home.",
      },
      {
        heading: "Buying thoughtfully",
        body: "Rudraksha beads vary widely in quality and price, and imitations exist — buy for meaning rather than as an investment, and be cautious of claims about rare or \"special\" beads. Compare shops, and don't feel pressured to buy expensive items in the name of blessings.",
      },
      {
        heading: "Respect",
        body: "These are sacred objects for many people. Handle them with care in shops, and ask before photographing shrines or worship.",
      },
    ],
  },
  {
    slug: "musical-instruments",
    title: "Traditional musical instruments",
    summary: "Sitar, tabla, harmonium and more from a city with a celebrated musical tradition — what to know before buying.",
    status: "review",
    sections: [
      {
        heading: "A city of music",
        body: "Banaras has a renowned tradition of Hindustani classical music, including its own styles of tabla playing and vocal music. Instrument makers and repairers have long worked in the city.",
      },
      {
        heading: "Buying an instrument",
        body: "If you play, try instruments before buying and ask about the wood, skins or strings, and tuning. If you're buying as a gift or souvenir, smaller instruments are easier to transport. Ask the maker about care in different climates.",
      },
      {
        heading: "Shipping",
        body: "Large instruments such as sitars need professional packing. Get shipping costs, insurance and delivery time in writing, and check your country's import rules for wood and animal-skin products.",
      },
    ],
  },
  {
    slug: "jewellery",
    title: "Traditional jewellery",
    summary: "Silver work, pink enamel (gulabi meenakari) and bead jewellery — and how to buy precious metals with confidence.",
    image: { src: "/img/market.jpg", alt: "Rows of boats on the Ganga beside the busy riverfront, in haze" },
    status: "review",
    sections: [
      {
        heading: "What to look for",
        body: "Varanasi is known for *gulabi meenakari*, a pink enamel technique on silver or gold, alongside traditional silver jewellery and beadwork.",
      },
      {
        heading: "Buying precious metals",
        body: "For gold and silver, ask for hallmarking and a detailed bill showing weight, purity and making charges [VERIFY: current BIS hallmarking requirements]. Compare prices with the day's metal rate before you buy.",
      },
      {
        heading: "Costume and bead jewellery",
        body: "Bangles, beads and costume pieces are inexpensive souvenirs found throughout the markets. Bargaining is normal for these.",
      },
    ],
  },
  {
    slug: "etiquette-and-authenticity",
    title: "Shopping etiquette, bargaining and authenticity",
    summary: "How to shop fairly in Varanasi — bargaining, avoiding commission touts, getting a proper bill and supporting real artisans.",
    image: { src: "/img/market.jpg", alt: "Rows of boats on the Ganga beside the busy riverfront, in haze" },
    status: "review",
    sections: [
      {
        heading: "Bargaining",
        body: "Bargaining is normal in markets and souvenir shops, less so in fixed-price stores. Keep it friendly, decide what something is worth to you, and be ready to walk away politely. Once you agree a price, it's courteous to buy.",
      },
      {
        heading: "Avoiding commission touts",
        body: "Some guides, drivers and strangers earn commission by taking visitors to particular shops, which can raise prices. Be cautious of invitations to a \"factory\", \"government emporium\" or \"special sale\" you didn't ask for. Our partners are not permitted to take shopping commissions.",
      },
      {
        heading: "Get it in writing",
        body: "For anything valuable — silk, jewellery, instruments — ask for a bill describing exactly what you're buying (material, handloom or not, weight for metals) and keep it. Ask for shipping terms in writing too.",
      },
      {
        heading: "Paying",
        body: "Cash is still common in the old city; many shops also accept UPI and cards. Count your change, and avoid paying large deposits for goods to be delivered later unless you trust the seller.",
      },
      {
        heading: "Supporting genuine artisans",
        body: "Buying directly from makers or cooperatives keeps more money with the people who make things. We don't list or endorse shops; a local guide can introduce you to workshops without pressure to buy.",
      },
    ],
    faqs: [
      { q: "Is bargaining rude?", a: "No — in markets and souvenir shops it's expected. Keep it friendly and don't bargain over very small amounts with small vendors." },
      { q: "Someone offered to take me to a cheap silk factory. Should I go?", a: "Be cautious. Unsolicited offers like this often involve commissions. If you want to see weaving, book a visit with a guide you chose yourself." },
    ],
  },
];
