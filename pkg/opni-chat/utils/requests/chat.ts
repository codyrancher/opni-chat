import { LoremIpsum } from 'lorem-ipsum';
import { delayRandom } from '../time';

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

export async function sendMessage(message: string): Promise<string> {
  await delayRandom(750, 3500);

  return lorem.generateParagraphs(Math.floor((Math.random() * 2) + 1)).replace('\n', '\n\n');
}
