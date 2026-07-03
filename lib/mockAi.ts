import type { FeedbackResult, Language, MockDataMap, ScenarioId } from "./types";

const defaultFeedback = (
  lang: Language,
  corrected: string,
  natural: string,
  chinese: string,
  comparison: string,
  score: number
): FeedbackResult => ({
  correctedSentence: corrected,
  naturalExpression: natural,
  chineseExplanation: chinese,
  comparison,
  confidenceScore: score,
});

export const MOCK_DATA: MockDataMap = {
  german: {
    supermarket: {
      openingLine:
        "Guten Tag! Kann ich Ihnen helfen? Die Äpfel sind heute im Angebot.",
      feedback: defaultFeedback(
        "german",
        "Ich möchte zwei Kilo Äpfel, bitte.",
        "Zwei Kilo Äpfel, bitte — das reicht völlig.",
        "「bitte」放在句末是德语礼貌表达的标准方式。量词「Kilo」不需要冠词。",
        "English: \"I'd like two kilos of apples, please.\"",
        82
      ),
    },
    restaurant: {
      openingLine:
        "Willkommen! Haben Sie schon gewählt, oder soll ich Ihnen die Tageskarte bringen?",
      feedback: defaultFeedback(
        "german",
        "Ich hätte gern die Tageskarte, bitte.",
        "Könnten Sie mir bitte die Tageskarte bringen?",
        "「Ich hätte gern」比「I want」更礼貌，适合餐厅场景。",
        "English: \"Could I see the daily menu, please?\"",
        78
      ),
    },
    doctor: {
      openingLine:
        "Guten Morgen. Was führt Sie heute zu mir? Bitte beschreiben Sie Ihre Beschwerden.",
      feedback: defaultFeedback(
        "german",
        "Ich habe seit drei Tagen Halsschmerzen und leichtes Fieber.",
        "Seit drei Tagen habe ich Halsschmerzen und leichtes Fieber.",
        "时间状语「seit drei Tagen」通常放在句首或动词后，描述持续症状很常用。",
        "English: \"I've had a sore throat and a slight fever for three days.\"",
        85
      ),
    },
    pharmacy: {
      openingLine:
        "Guten Tag! Suchen Sie etwas Bestimmtes, oder brauchen Sie Beratung?",
      feedback: defaultFeedback(
        "german",
        "Ich brauche etwas gegen Kopfschmerzen, bitte.",
        "Haben Sie etwas gegen Kopfschmerzen?",
        "「etwas gegen + 症状」是药店场景的标准表达。",
        "English: \"Do you have something for headaches?\"",
        80
      ),
    },
    landlord: {
      openingLine:
        "Hallo, hier ist Ihr Vermieter. Sie haben wegen der Heizung angerufen — was ist das Problem?",
      feedback: defaultFeedback(
        "german",
        "Die Heizung funktioniert seit gestern Abend nicht mehr.",
        "Seit gestern Abend geht die Heizung nicht mehr.",
        "「geht nicht mehr」是口语中描述设备故障的自然说法。",
        "English: \"The heating hasn't been working since yesterday evening.\"",
        83
      ),
    },
    bank: {
      openingLine:
        "Guten Tag und willkommen bei der Sparkasse. Wie kann ich Ihnen heute helfen?",
      feedback: defaultFeedback(
        "german",
        "Ich möchte ein Girokonto eröffnen, bitte.",
        "Ich würde gern ein Girokonto eröffnen.",
        "「Ich würde gern」是 Konjunktiv II，在银行等正式场合更得体。",
        "English: \"I'd like to open a checking account, please.\"",
        79
      ),
    },
    "business-meeting": {
      openingLine:
        "Guten Morgen allerseits. Shall we start with the quarterly results, oder haben Sie andere Prioritäten?",
      feedback: defaultFeedback(
        "german",
        "Ja, lassen Sie uns mit den Quartalsergebnissen beginnen.",
        "Gerne — fangen wir mit den Quartalsergebnissen an.",
        "会议开场用「Lassen Sie uns … beginnen」或「Fangen wir an mit …」都很专业。",
        "English: \"Yes, let's start with the quarterly results.\"",
        81
      ),
    },
    "phone-call": {
      openingLine:
        "Guten Tag, hier ist die Praxis Dr. Müller. Sie haben wegen eines Termins angerufen?",
      feedback: defaultFeedback(
        "german",
        "Ja, ich möchte einen Termin für nächste Woche vereinbaren.",
        "Ich würde gern einen Termin für nächste Woche machen.",
        "电话预约用「einen Termin vereinbaren/machen」，比「buchen」更常见。",
        "English: \"Yes, I'd like to schedule an appointment for next week.\"",
        84
      ),
    },
  },
  english: {
    supermarket: {
      openingLine:
        "Hi there! Can I help you find anything? The strawberries are on sale today.",
      feedback: defaultFeedback(
        "english",
        "I'd like two pounds of strawberries, please.",
        "Could I get two pounds of strawberries?",
        "购物时用「Could I get …」比直接说「I want」更自然礼貌。",
        "German: \"Zwei Pfund Erdbeeren, bitte.\"",
        83
      ),
    },
    restaurant: {
      openingLine:
        "Good evening! Welcome to our restaurant. Are you ready to order, or would you like a few more minutes?",
      feedback: defaultFeedback(
        "english",
        "We need a few more minutes, please.",
        "Could we have a few more minutes to decide?",
        "「Could we have …」是餐厅里非常地道的请求方式。",
        "German: \"Wir brauchen noch ein paar Minuten, bitte.\"",
        80
      ),
    },
    doctor: {
      openingLine:
        "Good morning. Please have a seat. What brings you in today?",
      feedback: defaultFeedback(
        "english",
        "I've had a cough and a runny nose for about four days.",
        "I've been coughing and have had a runny nose for about four days.",
        "描述持续症状用现在完成进行时或完成时都很自然。",
        "German: \"Ich habe seit vier Tagen Husten und Schnupfen.\"",
        86
      ),
    },
    pharmacy: {
      openingLine:
        "Hello! How can I help you today? Are you looking for something specific?",
      feedback: defaultFeedback(
        "english",
        "I need something for allergies, please.",
        "Do you have anything for allergies?",
        "药店场景用「Do you have anything for …」是最常见的问法。",
        "German: \"Haben Sie etwas gegen Allergien?\"",
        81
      ),
    },
    landlord: {
      openingLine:
        "Hi, this is your landlord. You mentioned a leak in the bathroom — can you tell me more?",
      feedback: defaultFeedback(
        "english",
        "There's a leak under the sink, and it's getting worse.",
        "There's a leak under the sink that's been getting worse.",
        "描述问题时先说明位置（under the sink），再补充严重程度。",
        "German: \"Es gibt ein Leck unter dem Waschbecken, und es wird schlimmer.\"",
        84
      ),
    },
    bank: {
      openingLine:
        "Good afternoon, welcome to First National Bank. How may I assist you today?",
      feedback: defaultFeedback(
        "english",
        "I'd like to open a savings account, please.",
        "I'm interested in opening a savings account.",
        "银行场景用「I'm interested in …」或「I'd like to …」都很正式得体。",
        "German: \"Ich möchte ein Sparkonto eröffnen, bitte.\"",
        79
      ),
    },
    "business-meeting": {
      openingLine:
        "Good morning, everyone. Thanks for joining. Shall we kick off with the project timeline?",
      feedback: defaultFeedback(
        "english",
        "Yes, let's start with the project timeline.",
        "Sounds good — let's begin with the timeline.",
        "会议中「Sounds good — let's begin with …」既确认又推动议程，很专业。",
        "German: \"Ja, fangen wir mit dem Projektzeitplan an.\"",
        82
      ),
    },
    "phone-call": {
      openingLine:
        "Hello, you've reached City Dental Clinic. How can I help you today?",
      feedback: defaultFeedback(
        "english",
        "Hi, I'd like to book a dental check-up for next week.",
        "Hi, I'm calling to schedule a dental check-up for next week.",
        "电话预约用「I'm calling to …」开头，对方立刻明白你的来意。",
        "German: \"Guten Tag, ich möchte einen Zahnarzttermin für nächste Woche vereinbaren.\"",
        85
      ),
    },
  },
};

export function getOpeningLine(language: Language, scenarioId: ScenarioId): string {
  return MOCK_DATA[language][scenarioId].openingLine;
}

export function getMockFeedback(
  language: Language,
  scenarioId: ScenarioId,
  userInput: string
): FeedbackResult {
  const base = MOCK_DATA[language][scenarioId].feedback;

  if (!userInput.trim()) {
    return { ...base, confidenceScore: 45 };
  }

  const wordCount = userInput.trim().split(/\s+/).length;
  const adjustedScore = Math.min(
    95,
    Math.max(55, base.confidenceScore + (wordCount > 3 ? 5 : -5))
  );

  return { ...base, confidenceScore: adjustedScore };
}
