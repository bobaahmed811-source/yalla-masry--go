'use server';
/**
 * @fileOverview Server actions for the Comic Studio feature.
 */

import { z } from 'zod';
import { getComicDialogueFlow, ComicDialogueInputSchema } from '@/ai/flows/comic-dialogue-flow';

/**
 * Server action to get a comic dialogue from the AI.
 * It uses a Genkit flow to generate the dialogue based on a scene description.
 * @param values The scene identifier.
 * @returns A promise that resolves to the generated dialogue or an error.
 */
export async function getComicDialog(values: z.infer<typeof ComicDialogueInputSchema>) {
  try {
    const result = await getComicDialogueFlow(values);
    return { success: true, dialogue: result.dialogue };
  } catch (e: any) {
    console.error("Error in getComicDialog action:", e);
    return { error: "Failed to get dialogue from the AI. " + (e.message || "Please try again later.") };
  }
}
