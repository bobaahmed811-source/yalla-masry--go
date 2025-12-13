
'use server';
/**
 * @fileOverview An AI flow for evaluating a user's choice in a dialogue challenge.
 *
 * This file defines the AI logic for a dialogue evaluation agent that provides
 * feedback and a score based on a student's answer in a conversational scenario.
 *
 * - DialogueEvaluationInputSchema: The Zod schema for the flow's input.
 * - DialogueEvaluationOutputSchema: The Zod schema for the flow's output.
 * - getDialogueEvaluationFlow: The main server action that invokes the Genkit flow.
 */

import { ai } from '@/ai/index';
import { z } from 'zod';

// Define the input schema for the dialogue evaluation flow.
export const DialogueEvaluationInputSchema = z.object({
  userAnswer: z.string().describe("The user's selected answer in the dialogue."),
  choiceType: z
    .enum(['correct', 'wrong', 'good', 'excellent'])
    .describe('The pre-determined category of the user\'s choice.'),
});
export type DialogueEvaluationInput = z.infer<typeof DialogueEvaluationInputSchema>;

// Define the output schema for the dialogue evaluation flow.
export const DialogueEvaluationOutputSchema = z.object({
  score: z.number().describe('The score awarded for the answer, can be positive or negative.'),
  feedback: z.string().describe('Constructive feedback for the user about their answer.'),
  isPositive: z.boolean().describe('Whether the feedback is generally positive or negative.'),
});
export type DialogueEvaluationOutput = z.infer<typeof DialogueEvaluationOutputSchema>;

/**
 * Defines a Genkit prompt for the dialogue evaluation.
 * The prompt instructs the AI to act as a friendly Egyptian Arabic teacher,
 * providing a score and feedback based on the correctness and politeness of the answer.
 */
const evaluationPrompt = ai.definePrompt({
  name: 'dialogueEvaluationPrompt',
  input: { schema: DialogueEvaluationInputSchema },
  output: { schema: DialogueEvaluationOutputSchema },
  prompt: `You are a friendly and encouraging Egyptian Arabic teacher.
Your role is to evaluate a student's answer in a dialogue scenario.
The student's answer is: "{{userAnswer}}".
This answer has been categorized as: "{{choiceType}}".

Based on the choiceType, provide a score and constructive feedback in Arabic.
- If 'excellent': Give a high score (e.g., 75 points) and praise the user for a perfect, polite, and natural response. Explain *why* it's excellent. Set isPositive to true.
- If 'good': Give a decent score (e.g., 50 points). Acknowledge the answer is correct but suggest a more polite or natural alternative. Set isPositive to true.
- If 'correct': Give a standard score (e.g., 50 points). Confirm the answer is correct and briefly explain why. Set isPositive to true.
- If 'wrong': Give a negative score (e.g., -20 points). Explain why the answer is wrong in the context of the dialogue and gently correct the user. Set isPositive to false.

Keep the feedback concise, friendly, and encouraging. Address the user directly.
Example for 'good': "إجابة صحيحة ومفهومة. لكن تذكّر أن استخدام كلمة 'شكراً' يزيد من طلاقتك الاجتماعية في مصر. حصلت على نقاط الإجابة الصحيحة."

Your response must be in the specified JSON format.`,
});

/**
 * Defines the main Genkit flow for dialogue evaluation.
 * This flow takes the user's answer and choice type, calls the prompt,
 * and returns the generated evaluation.
 */
const dialogueEvaluationFlow = ai.defineFlow(
  {
    name: 'dialogueEvaluationFlow',
    inputSchema: DialogueEvaluationInputSchema,
    outputSchema: DialogueEvaluationOutputSchema,
  },
  async (input) => {
    const { output } = await evaluationPrompt(input);
    return output!;
  }
);

/**
 * The server action wrapper for the Genkit flow.
 * This function is called from the client-side to execute the dialogue evaluation.
 * @param input The user's answer and the type of choice made.
 * @returns The AI-generated evaluation (score and feedback).
 */
export async function getDialogueEvaluationFlow(input: DialogueEvaluationInput): Promise<DialogueEvaluationOutput> {
    return await dialogueEvaluationFlow(input);
}

    