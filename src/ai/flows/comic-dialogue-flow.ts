'use server';
/**
 * @fileOverview An AI flow for generating a short comic dialogue.
 *
 * This file defines the AI logic for a dialogue generation agent that creates
 * a simple, 3-line conversation in Egyptian Arabic based on a given scene.
 *
 * - ComicDialogueInputSchema: The Zod schema for the flow's input.
 * - ComicDialogueOutputSchema: The Zod schema for the flow's output.
 * - getComicDialogueFlow: The main server action that invokes the Genkit flow.
 */

import { ai } from '@/ai/index';
import { z } from 'zod';

// Define the input schema for the comic dialogue flow.
export const ComicDialogueInputSchema = z.object({
  scene: z.string().describe("The scene for the dialogue (e.g., 'market', 'school')."),
});
export type ComicDialogueInput = z.infer<typeof ComicDialogueInputSchema>;

// Define the output schema for the comic dialogue flow.
export const ComicDialogueOutputSchema = z.object({
  dialogue: z.array(z.string()).length(3).describe('A three-line dialogue in Egyptian Arabic.'),
});
export type ComicDialogueOutput = z.infer<typeof ComicDialogueOutputSchema>;

/**
 * Defines a Genkit prompt for generating the comic dialogue.
 * The prompt instructs the AI to create a short, simple, and potentially funny
 * dialogue in Egyptian Arabic suitable for the provided scene.
 */
const dialoguePrompt = ai.definePrompt({
  name: 'comicDialoguePrompt',
  input: { schema: ComicDialogueInputSchema },
  output: { schema: ComicDialogueOutputSchema },
  prompt: `You are a creative writer specializing in short, simple, and funny dialogues in Egyptian Arabic.
Your task is to write a 3-line dialogue for a comic strip.
The scene is: A "{{scene}}" in Egypt.

- The dialogue must be exactly 3 lines long.
- The language must be simple, modern Egyptian Colloquial Arabic.
- The dialogue should be suitable for a beginner learner.
- Make it a little bit humorous or charming if possible.

Example for scene "market":
- "بكام التفاح ده يا عمو؟"
- "كيلو التفاح بعشرين جنيه يا ست الكل."
- "غالي أوي! خلاص هاخد كيلو خيار."

Your response must be in the specified JSON format, with the dialogue as an array of 3 strings.`,
});

/**
 * Defines the main Genkit flow for generating the comic dialogue.
 * This flow takes the scene, calls the prompt, and returns the generated dialogue.
 */
const comicDialogueFlow = ai.defineFlow(
  {
    name: 'comicDialogueFlow',
    inputSchema: ComicDialogueInputSchema,
    outputSchema: ComicDialogueOutputSchema,
  },
  async (input) => {
    const { output } = await dialoguePrompt(input);
    return output!;
  }
);

/**
 * The server action wrapper for the Genkit flow.
 * This function is called from the client-side to execute the dialogue generation.
 * @param input The scene for which to generate a dialogue.
 * @returns The AI-generated dialogue.
 */
export async function getComicDialogueFlow(input: ComicDialogueInput): Promise<ComicDialogueOutput> {
    return await comicDialogueFlow(input);
}
