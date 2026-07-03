/**
 * Sprint 12 — World milestone definitions (language-neutral structure)
 * German + English target strings only — same beats, same logic.
 */
import type { MilestoneDef } from "../types";

const L = {
  de: (german: string, english: string) => ({ german, english }),
  bi: (native: string, german: string, english: string) => ({
    native,
    target: { german, english },
  }),
};

export const WORLD_MILESTONE_DEFS: MilestoneDef[] = [
  {
    id: "airport",
    icon: "✈️",
    title: L.de("今天 · 落地", "We're here"),
    setting: L.de("Flughafen Berlin", "International Airport"),
    detail: L.bi(
      "传送带走了一圈又一圈。你推着行李车走出到达大厅——第一口德国的空气，有点凉。",
      "Noch am Band. Du schiebst den Wagen.",
      "The carousel spins. You push your trolley through arrivals."
    ),
    opening: L.bi(
      "欢迎来到德国。飞机已经降落。我就在你旁边。今天什么都不用担心。我们慢慢来。",
      "Willkommen. Ich bin da. Heute kein Stress. Langsam.",
      "You're here. I'm beside you. Nothing to worry about today. We take it slow."
    ),
    closing: L.bi(
      "入境办完了。走，去你在德国的第一个住处。",
      "Geschafft. Los zur Wohnung.",
      "You're through. Let's head to your first place."
    ),
    beats: [
      {
        id: "passport",
        npcLine: L.de("Guten Tag. Reisepass, bitte.", "Good morning. Passport, please."),
        phrase: L.de("Hier, bitte.", "Here you go."),
        keyPhrase: L.de("Hier, bitte", "Here you go"),
        bridge: L.bi(
          "看。\n你的行李。\nDas ist dein Koffer.",
          "Schau.\nDein Koffer.\nDas ist dein Koffer.",
          "Look.\nYour bag.\nDas ist dein Koffer."
        ),
        speak: L.bi(
          "说错完全没关系。德国人听得懂。我就在旁边。我们一起。",
          "Falsch ist okay. Ich bin da. Zusammen.",
          "Getting it wrong is fine. They'll understand. I'm right here. Together."
        ),
        continue: L.bi(
          "他翻了翻，抬头问你为什么来德国。",
          "Er blättert und schaut hoch.",
          "He flips through it and looks up."
        ),
      },
      {
        id: "purpose",
        phrase: L.de("Nach Deutschland.", "To Germany."),
        keyPhrase: L.de("Nach Deutschland", "To Germany"),
        bridge: L.bi("他在等你的回答。", "Er wartet.", "He's waiting."),
        speak: L.bi(
          "慢慢来。就说你要来德国生活。",
          "Langsam. Nach Deutschland.",
          "Take your time. Say you're moving here."
        ),
        continue: L.bi("他点点头，盖了章。", "Er nickt und stempelt.", "He nods and stamps it."),
      },
      {
        id: "welcome",
        npcLine: L.de("Willkommen!", "Welcome!"),
        phrase: L.de("Danke!", "Thank you!"),
        keyPhrase: L.de("Danke", "Thank you"),
        bridge: L.bi(
          "章盖好了。\nWir gehen.\n他微笑着说：Willkommen.",
          "Gestempelt.\nWir gehen.\nWillkommen.",
          "Stamped.\nLet's go.\nHe smiles: Welcome."
        ),
        speak: L.bi(
          "笑一下，道谢就好。",
          "Lächeln. Danke.",
          "Smile. Say thanks."
        ),
      },
    ],
  },
  {
    id: "apartment",
    icon: "🏠",
    title: L.de("Renting an Apartment", "Renting an Apartment"),
    setting: L.de("Wohnungsbesichtigung", "Apartment viewing"),
    detail: L.bi(
      "房东站在门口，钥匙在手里转。公寓不大，但窗户朝南。",
      "Der Vermieter steht in der Tür, Schlüssel in der Hand. Nicht groß, aber sonnig.",
      "The landlord stands in the doorway, keys in hand. Not big, but sunny."
    ),
    opening: L.bi(
      "看房。在德国租房子——问你想问的，自然地聊。",
      "Besichtigung. Wohnung mieten — frag, was du willst.",
      "Apartment viewing — ask what you need to ask, keep it natural."
    ),
    closing: L.bi(
      "看房结束了。不管租不租，你今天在德国又往前走了一步。",
      "Besichtigung vorbei. Mietest du oder nicht — ein Schritt weiter.",
      "Viewing done. Rent or not — you took another step today."
    ),
    beats: [
      {
        id: "greet",
        npcLine: L.de("Guten Tag!", "Good morning!"),
        phrase: L.de("Guten Tag!", "Good morning!"),
        keyPhrase: L.de("Guten Tag", "Good morning"),
        bridge: L.bi("房东开门了。", "Der Vermieter öffnet.", "The landlord opens the door."),
        speak: L.bi("打招呼。", "Grüß ihn.", "Say hello."),
      },
      {
        id: "rent",
        phrase: L.de("Wie hoch ist die Miete?", "How much is the rent?"),
        keyPhrase: L.de("Wie hoch ist die Miete", "How much is the rent"),
        bridge: L.bi("你看了看厨房，想问租金。", "Du schaust in die Küche — Miete wissen.", "You look at the kitchen — time to ask about rent."),
        speak: L.bi("问租金多少。", "Frag nach der Miete.", "Ask how much the rent is."),
        continue: L.bi("他说了个数字，等你反应。", "Er nennt eine Zahl.", "He names a figure."),
      },
      {
        id: "thanks",
        phrase: L.de("Vielen Dank für die Besichtigung!", "Thank you for showing me the flat!"),
        keyPhrase: L.de("Vielen Dank", "Thank you"),
        bridge: L.bi("看完了。道个别。", "Fertig. Verabschieden.", "Done. Say goodbye."),
        speak: L.bi("谢谢他带你看房。", "Bedank dich für die Besichtigung.", "Thank him for the viewing."),
      },
    ],
  },
  {
    id: "bus",
    icon: "🚌",
    title: L.de("Take the Bus", "Take the Bus"),
    setting: L.de("Bushaltestelle", "Bus stop"),
    detail: L.bi(
      "站牌下几个人在等。公交车拐弯驶来，刹车有点响。",
      "Ein paar Leute warten. Der Bus kommt um die Ecke, Bremse quietscht.",
      "A few people wait at the stop. The bus rounds the corner, brakes squeaking."
    ),
    opening: L.bi("坐公交——在德国，这是每天的日常。", "Bus fahren — hier Alltag.", "Taking the bus — daily life."),
    closing: L.bi("到站了。你在德国又坐了一趟公交。", "Haltestelle erreicht.", "You made your stop."),
    beats: [
      {
        id: "ticket",
        npcLine: L.de("Ein Ticket, bitte.", "A ticket, please."),
        phrase: L.de("Eine Fahrkarte, bitte.", "One ticket, please."),
        keyPhrase: L.de("Fahrkarte, bitte", "ticket, please"),
        bridge: L.bi("司机看着你。", "Der Fahrer schaut dich an.", "The driver looks at you."),
        speak: L.bi("买一张票。", "Kauf ein Ticket.", "Buy a ticket."),
      },
      {
        id: "stop",
        phrase: L.de(
          "Entschuldigung, wo fährt dieser Bus hin?",
          "Excuse me, where does this bus go?"
        ),
        keyPhrase: L.de("wo fährt dieser Bus", "where does this bus go"),
        bridge: L.bi("你想确认方向。", "Du willst die Richtung wissen.", "You want to confirm the route."),
        speak: L.bi("问这趟车去哪。", "Frag, wohin der Bus fährt.", "Ask where the bus goes."),
        continue: L.bi("他指了指前方。", "Er zeigt nach vorne.", "He points ahead."),
      },
      {
        id: "exit",
        phrase: L.de("An der nächsten Haltestelle, bitte.", "Next stop, please."),
        keyPhrase: L.de("nächsten Haltestelle", "next stop"),
        bridge: L.bi("快到了——跟司机说你要下车。", "Gleich da — sag Bescheid.", "Almost there — tell the driver."),
        speak: L.bi("下一站下车。", "Nächste Haltestelle.", "Your stop is next."),
      },
    ],
  },
  {
    id: "train",
    icon: "🚇",
    title: L.de("First Train Ride", "First Train Ride"),
    setting: L.de("Bahnhof", "Train station"),
    detail: L.bi(
      "大厅里电子屏闪着。人群涌向站台——你也得找到对的火车。",
      "Anzeigetafel blinkt. Leute zum Gleis — du auch.",
      "Departure boards blink. Everyone heads to the platform — you too."
    ),
    opening: L.bi(
      "坐火车——买票、找站台、上车。跟当地人一样。",
      "Zug nehmen — Ticket, Gleis, einsteigen.",
      "Train ride — ticket, platform, board. Like a local."
    ),
    closing: L.bi("下车了。这段路走完了。", "Ausgestiegen.", "You're off. That leg's done."),
    beats: [
      {
        id: "ticket",
        npcLine: L.de("Wohin möchten Sie?", "Where would you like to go?"),
        phrase: L.de("Nach Berlin Hauptbahnhof, bitte.", "Main station, please."),
        keyPhrase: L.de("Hauptbahnhof, bitte", "station, please"),
        bridge: L.bi("售票窗口。轮到你。", "Schalter. Du bist dran.", "Ticket window. Your turn."),
        speak: L.bi("说你要去中央火车站。", "Sag, wohin du willst.", "Say where you're headed."),
      },
      {
        id: "platform",
        phrase: L.de("Entschuldigung, welches Gleis?", "Excuse me, which platform?"),
        keyPhrase: L.de("welches Gleis", "which platform"),
        bridge: L.bi("票有了。找站台。", "Ticket da. Gleis finden.", "Ticket in hand. Find your platform."),
        speak: L.bi("问几号站台。", "Frag nach dem Gleis.", "Ask which platform."),
        continue: L.bi("工作人员指了指：「Gleis 7.」", "„Gleis 7.“", "\"Platform 7.\"")
      },
      {
        id: "board",
        npcLine: L.de("Bitte einsteigen!", "All aboard!"),
        phrase: L.de("Danke!", "Thanks!"),
        keyPhrase: L.de("Danke", "Thanks"),
        bridge: L.bi("车门开了。", "Türen auf.", "Doors open."),
        speak: L.bi("道谢上车。", "Danke sagen und einsteigen.", "Thank them and board."),
      },
    ],
  },
  {
    id: "bank",
    icon: "🏦",
    title: L.de("First Bank Visit", "First Bank Visit"),
    setting: L.de("Bankfiliale", "Bank branch"),
    detail: L.bi(
      "银行大厅很安静。取号机吐了一张纸条——前面还有三个人。",
      "Ruhige Halle. Ticket aus dem Automaten — drei vor dir.",
      "Quiet hall. The machine spits out a ticket — three ahead of you."
    ),
    opening: L.bi(
      "在德国开账户、办业务——银行是绕不开的一站。",
      "Konto eröffnen — Bank gehört dazu.",
      "Opening an account — the bank is part of settling in."
    ),
    closing: L.bi("银行业务办完了。", "Bank erledigt.", "Banking done."),
    beats: [
      {
        id: "greet",
        npcLine: L.de("Guten Tag. Was kann ich für Sie tun?", "Good morning. How can I help?"),
        phrase: L.de("Guten Tag. Ich möchte ein Konto eröffnen.", "Good morning. I'd like to open an account."),
        keyPhrase: L.de("Konto eröffnen", "open an account"),
        bridge: L.bi("轮到你了。", "Du bist dran.", "Your turn."),
        speak: L.bi("说你想开户。", "Sag, dass du ein Konto willst.", "Say you want to open an account."),
      },
      {
        id: "documents",
        phrase: L.de("Hier sind meine Unterlagen.", "Here are my documents."),
        keyPhrase: L.de("Unterlagen", "documents"),
        bridge: L.bi("他要材料。", "Er braucht Unterlagen.", "He needs your documents."),
        speak: L.bi("递上你的材料。", "Gib die Unterlagen.", "Hand over your documents."),
      },
      {
        id: "thanks",
        phrase: L.de("Vielen Dank für Ihre Hilfe!", "Thank you for your help!"),
        keyPhrase: L.de("Vielen Dank", "Thank you"),
        bridge: L.bi("办完了。", "Fertig.", "All done."),
        speak: L.bi("谢谢帮忙。", "Bedank dich.", "Thank them."),
      },
    ],
  },
  {
    id: "doctor",
    icon: "🏥",
    title: L.de("First Doctor Visit", "First Doctor Visit"),
    setting: L.de("Arztpraxis", "Doctor's office"),
    detail: L.bi(
      "候诊室里几个人在等。护士喊了你的名字。",
      "Wartezimmer. Die Schwester ruft deinen Namen.",
      "Waiting room. The nurse calls your name."
    ),
    opening: L.bi("看医生——把症状说清楚就好。", "Beim Arzt — Symptome klar sagen.", "Doctor visit — explain your symptoms clearly."),
    closing: L.bi("看完了。", "Fertig.", "Visit done."),
    beats: [
      {
        id: "symptoms",
        npcLine: L.de("Was fehlt Ihnen?", "What's wrong?"),
        phrase: L.de(
          "Ich habe seit zwei Tagen Kopfschmerzen.",
          "I've had a headache for two days."
        ),
        keyPhrase: L.de("Kopfschmerzen", "headache"),
        bridge: L.bi("医生看着你。", "Der Arzt schaut dich an.", "The doctor looks at you."),
        speak: L.bi("说症状——头疼两天了。", "Sag deine Symptome.", "Describe your symptoms."),
      },
      {
        id: "duration",
        phrase: L.de("Seit zwei Tagen.", "For two days."),
        keyPhrase: L.de("Seit zwei Tagen", "two days"),
        bridge: L.bi("他问多久了。", "Er fragt, wie lange schon.", "He asks how long."),
        speak: L.bi("两天了。", "Seit zwei Tagen.", "Two days."),
      },
      {
        id: "thanks",
        phrase: L.de("Vielen Dank, Herr Doktor.", "Thank you, doctor."),
        keyPhrase: L.de("Vielen Dank", "Thank you"),
        bridge: L.bi("处方开了。", "Rezept da.", "Prescription ready."),
        speak: L.bi("谢谢医生。", "Bedank dich.", "Thank the doctor."),
      },
    ],
  },
  {
    id: "buergeramt",
    icon: "📮",
    title: L.de("Bürgeramt Appointment", "City Hall Appointment"),
    setting: L.de("Bürgeramt", "City hall"),
    detail: L.bi(
      "市政厅走廊很长。你找到了 Anmeldung 的窗口。",
      "Langer Flur. Fenster Anmeldung.",
      "Long corridor. You find the registration window."
    ),
    opening: L.bi("落户登记——在德国住下来，这一步少不了。", "Anmeldung — Pflichtprogramm.", "Registration — you have to do it."),
    closing: L.bi("登记办完了。", "Anmeldung geschafft.", "Registration done."),
    beats: [
      {
        id: "appointment",
        npcLine: L.de("Haben Sie einen Termin?", "Do you have an appointment?"),
        phrase: L.de("Ja, um zehn Uhr.", "Yes, at ten o'clock."),
        keyPhrase: L.de("Termin", "appointment"),
        bridge: L.bi("工作人员抬头。", "Sachbearbeiter schaut auf.", "The clerk looks up."),
        speak: L.bi("说有预约，十点。", "Sag, dass du einen Termin hast.", "Say you have an appointment at ten."),
      },
      {
        id: "address",
        phrase: L.de("Ich wohne in der Hauptstraße 12.", "I live at 12 Main Street."),
        keyPhrase: L.de("wohne in der", "I live at"),
        bridge: L.bi("他要你的地址。", "Er braucht deine Adresse.", "He needs your address."),
        speak: L.bi("报你的地址。", "Sag deine Adresse.", "Give your address."),
      },
      {
        id: "done",
        npcLine: L.de("Alles erledigt. Willkommen!", "All done. Welcome!"),
        phrase: L.de("Vielen Dank!", "Thank you!"),
        keyPhrase: L.de("Vielen Dank", "Thank you"),
        bridge: L.bi("盖章完成。", "Gestempelt.", "Stamped and done."),
        speak: L.bi("道谢。", "Bedank dich.", "Say thanks."),
      },
    ],
  },
  {
    id: "work",
    icon: "🏢",
    title: L.de("First Day at Work", "First Day at Work"),
    setting: L.de("Vorstellungsgespräch", "Job interview"),
    detail: L.bi(
      "办公楼玻璃门。前台打电话确认了你的名字——面试在三楼。",
      "Glastür. Empfang bestätigt deinen Namen — dritter Stock.",
      "Glass doors. Reception confirms your name — third floor."
    ),
    opening: L.bi(
      "面试。在德国找工作——自然地介绍自己。",
      "Vorstellungsgespräch. Dich vorstellen — natürlich.",
      "Job interview — introduce yourself naturally."
    ),
    closing: L.bi("面试结束了。", "Gespräch vorbei.", "Interview done."),
    beats: [
      {
        id: "intro",
        npcLine: L.de("Erzählen Sie mir von sich.", "Tell me about yourself."),
        phrase: L.de(
          "Ich arbeite in einer Fabrik und suche neue Möglichkeiten.",
          "I work in a factory and I'm looking for new opportunities."
        ),
        keyPhrase: L.de("arbeite in einer Fabrik", "work in a factory"),
        bridge: L.bi("面试官看着你。", "Der Personalers schaut dich an.", "The interviewer looks at you."),
        speak: L.bi("介绍自己。", "Stell dich vor.", "Introduce yourself."),
      },
      {
        id: "experience",
        phrase: L.de("Ich habe fünf Jahre Erfahrung.", "I have five years of experience."),
        keyPhrase: L.de("Erfahrung", "experience"),
        bridge: L.bi("他问经验。", "Er fragt nach Erfahrung.", "He asks about experience."),
        speak: L.bi("说五年经验。", "Fünf Jahre Erfahrung.", "Five years of experience."),
      },
      {
        id: "close",
        phrase: L.de("Vielen Dank für das Gespräch.", "Thank you for the conversation."),
        keyPhrase: L.de("Vielen Dank", "Thank you"),
        bridge: L.bi("面试快结束了。", "Fast vorbei.", "Almost done."),
        speak: L.bi("谢谢这次谈话。", "Bedank dich.", "Thank them for the chat."),
      },
    ],
  },
];
