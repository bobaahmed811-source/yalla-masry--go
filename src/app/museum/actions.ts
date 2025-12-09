'use server';

import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { z } from 'zod';

const InputSchema = z.object({
  text: z.string(),
});

/**
 * Server action to get audio for a given text.
 * It uses a Genkit flow to convert text to speech.
 */
export async function getSpeechAudio(values: z.infer<typeof InputSchema>) {
  const validatedFields = InputSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }

  const { text } = validatedFields.data;

  try {
    const result = await textToSpeech({ text });
    return { success: result.audio };
  } catch (error) {
    console.error('Error generating speech audio:', error);
    return { error: 'Failed to get audio from the AI. Please try again.' };
  }
}
