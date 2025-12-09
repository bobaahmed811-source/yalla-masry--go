'use server';
/**
 * @fileOverview Server actions for the Comic Studio feature.
 */

import { comicDialogFlow } from '@/ai/flows/comic-dialog-flow';
import { z } from 'zod';

const InputSchema = z.object({
  scene: z.string(),
});

/**
 * Server action to get a comic dialogue from the AI.
 * It uses a Genkit flow to generate the dialogue based on a scene description.
 * @param values The scene identifier.
 * @returns A promise that resolves to the generated dialogue or an error.
 */
export async function getComicDialog(values: z.infer<typeof InputSchema>) {
  const validatedFields = InputSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }

  const { scene } = validatedFields.data;

  try {
    const result = await comicDialogFlow({ scene });
    return { success: result.dialogue };
  } catch (error) {
    console.error('Error generating comic dialogue:', error);
    return { error: 'Failed to get dialogue from the AI. Please try again.' };
  }
}
