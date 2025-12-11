
'use server';
/**
 * @fileOverview An AI flow for narrating a museum artifact's story.
 *
 * This file defines the AI logic for a storyteller agent that takes an artifact's
 * title and description and generates a compelling narrative, then converts
 * that narrative into speech.
 *
 * - StorytellerInputSchema: Zod schema for the flow's input.
 * - StorytellerOutputSchema: Zod schema for the flow's output.
 * - getStorytellerAudioFlow: The main server action that invokes the Genkit flow.
 */

import { ai } from '@/ai/index';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

// === Schemas ===

export const StorytellerInputSchema = z.object({
  title: z.string().describe("The title of the artifact."),
  description: z.string().describe("A brief description of the artifact."),
});
export type StorytellerInput = z.infer<typeof StorytellerInputSchema>;

const NarrativeOutputSchema = z.object({
    narrative: z.string().describe("A compelling, story-like narrative about the artifact in Arabic, suitable for a museum audio guide."),
});

const SpeechOutputSchema = z.object({
  media: z.string().describe("The base64 encoded WAV audio data URI of the narrative."),
});
export type SpeechOutput = z.infer<typeof SpeechOutputSchema>;

// === Prompts ===

/**
 * Prompt to generate a compelling narrative from a simple description.
 */
const narrativePrompt = ai.definePrompt({
  name: 'storytellerNarrativePrompt',
  input: { schema: StorytellerInputSchema },
  output: { schema: NarrativeOutputSchema },
  prompt: `You are a master storyteller and expert Egyptologist, creating an audio guide for a world-class museum.
Your task is to take the following artifact information and expand it into a short, engaging, and captivating narrative in Arabic.
Make it sound professional, awe-inspiring, and educational.

Artifact Title: "{{title}}"
Artifact Description: "{{description}}"

- Start with an intriguing hook.
- Weave the description into a story.
- Use rich, descriptive language.
- Keep the narrative concise (2-3 sentences).
- The language must be formal Arabic, clear and easy to understand.
- DO NOT add any titles or labels, just the narrative text.

Example:
Input: { title: "قناع توت عنخ آمون", description: "أشهر قطعة أثرية في العالم. مصنوع من الذهب الخالص ومطعم بالأحجار الكريمة." }
Output: { "narrative": "تأملوا في عظمة الفن الملكي. هذا هو قناع الملك الشاب، توت عنخ آمون، تحفة فنية لا مثيل لها، صُنعت من أحد عشر كيلوغرامًا من الذهب الخالص ورُصّعت بأندر الأحجار الكريمة لتحمي الفرعون في رحلته الأبدية." }

Your response must be in the specified JSON format.`,
});

// === Utility Functions ===

/**
 * Converts raw PCM audio buffer to a base64 encoded WAV data URI.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}

// === Flows ===

/**
 * Main Genkit flow to generate the storyteller audio.
 * This flow first generates a narrative, then converts it to speech.
 */
const storytellerAudioFlow = ai.defineFlow(
  {
    name: 'storytellerAudioFlow',
    inputSchema: StorytellerInputSchema,
    outputSchema: SpeechOutputSchema,
  },
  async (input) => {
    // Step 1: Generate the narrative text.
    const narrativeResponse = await narrativePrompt(input);
    const narrative = narrativeResponse.output?.narrative;

    if (!narrative) {
      throw new Error('Failed to generate a narrative for the artifact.');
    }

    // Step 2: Convert the narrative to speech.
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Arcturus' }, // A deep, authoritative voice
          },
        },
      },
      prompt: narrative,
    });

    if (!media) {
      throw new Error('No media was returned from the TTS model.');
    }

    // Step 3: Convert the raw PCM audio to WAV format.
    const pcmAudioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(pcmAudioBuffer);

    return {
      media: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

/**
 * The server action wrapper for the Genkit flow.
 * @param input The artifact's title and description.
 * @returns The AI-generated audio as a data URI.
 */
export async function getStorytellerAudioFlow(input: StorytellerInput): Promise<SpeechOutput> {
    return await storytellerAudioFlow(input);
}
