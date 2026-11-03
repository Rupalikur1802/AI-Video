import {planSchema, type Language} from './model';

export function fixturePlan(language: Language) {
  const rows = language === 'en' ? [
    ['The water cycle', 'Water travels around our planet in a repeating cycle. Let us follow its journey.', 'A repeating journey', 'Water'],
    ['Evaporation', 'The sun warms water in lakes and oceans. Water evaporates and rises as invisible water vapor.', 'Water vapor rises', 'Water evaporates'],
    ['Condensation', 'Higher up, water vapor cools. It condenses into tiny water droplets that gather into clouds.', 'Droplets form clouds', 'It condenses'],
    ['Precipitation', 'Cloud droplets grow larger. When they become heavy enough, water falls as rain or snow.', 'Water falls as rain', 'water falls'],
    ['Collection', 'Water collects in rivers, lakes, and oceans. Some soaks into the ground. The cycle continues.', 'The cycle continues', 'Water collects'],
  ] : [
    ['जल चक्र', 'पानी हमारी पृथ्वी पर एक चक्र में घूमता रहता है। आइए इसकी यात्रा को समझें।', 'पानी की यात्रा', 'पानी'],
    ['वाष्पीकरण', 'सूरज झीलों और समुद्र के पानी को गर्म करता है। पानी भाप बनकर ऊपर उठता है।', 'भाप ऊपर उठती है', 'पानी भाप'],
    ['संघनन', 'ऊपर जाकर जलवाष्प ठंडी होती है। यह छोटी बूंदों में बदल जाती है। इनसे बादल बनते हैं।', 'बूंदों से बादल', 'यह छोटी'],
    ['वर्षण', 'बादल की बूंदें मिलकर बड़ी होती हैं। भारी होने पर पानी बारिश या बर्फ बनकर नीचे गिरता है।', 'बारिश नीचे गिरती है', 'पानी बारिश'],
    ['जल संग्रह', 'पानी नदियों, झीलों और समुद्र में जमा होता है। कुछ पानी जमीन में समा जाता है। चक्र चलता रहता है।', 'चक्र चलता रहता है', 'पानी नदियों'],
  ];
  return planSchema.parse({language, title: language === 'en' ? 'The Water Cycle' : 'जल चक्र', scenes: rows.map((r, i) => ({kind: ['intro','evaporation','condensation','precipitation','collection'][i], title:r[0], narration:r[1], label:r[2], cuePhrase:r[3]}))});
}
