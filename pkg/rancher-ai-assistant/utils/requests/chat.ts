import { LoremIpsum } from 'lorem-ipsum';
import axios from 'axios';

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

export interface Response {
  response: string;
}

export interface History {
  type: 'ai' | 'human';
  content: string;
}

const NAMESPACE = 'default';
const SERVICE_NAME = 'openai-microservice';
const PORT = '8001';
const PATH = '/generate_response';
const CLUSTER_ID = 'c-rnv52';
const HEADERS = { 'X-API-KEY': 'test_key' };
const NEW_HEADERS = { 'X-API-KEY': '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' };

export async function sendMessage(message: string, history: History[]): Promise<string> {
  try {
    const payload = {
      text:         message,
      chat_history: history
    };

    // const result = (await axios.post<Response>(`/k8s/clusters/${ CLUSTER_ID }/api/v1/namespaces/${ NAMESPACE }/services/http:${ SERVICE_NAME }:${ PORT }/proxy${ PATH }`, payload, { headers: HEADERS })).data.response;
    const result = (await axios.post<Response>(`https://chatbot.opni.org/generate_response_new`, payload, { headers: NEW_HEADERS })).data.response;

    if (message.includes('Can you give me some insights about')) {
      return `Here's my analysis of this pod:\n\n{{alert}}It looks like {{pod}} has high CPU usage. \n\n The {{deployment}} deployment appears to be using the most CPU.\n\n![Chart](${ require('../../assets/chart.png') })\n\nWould you like to increase the scale of the deployment {{deployment}}? {{scale}}`;
    }

    return result;
  } catch (ex) {
    console.error(ex);

    return lorem.generateParagraphs(Math.floor((Math.random() * 2) + 1)).replace('\n', '\n\n');
  }
}
