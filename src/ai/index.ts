
'use server';
/**
 * @fileoverview This file initializes the Genkit AI instance and configures it with the necessary plugins.
 * It exports a singleton `ai` object that should be used across the application for any AI-related tasks.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the Genkit AI instance with Google AI plugin.
// This configuration allows Genkit to use Google's generative models.
export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  // Log metadata and streaming events for debugging purposes in a development environment.
  logSinks: [],
  // Enable tracing to monitor and debug flows.
  traceStore: 'local',
  // Allow running flows in a development environment without explicit environment checks.
  flowStateStore: 'local',
});

    