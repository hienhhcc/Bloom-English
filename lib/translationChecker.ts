// Translation checker with support for multiple LLM providers (Ollama, OpenAI)

export interface GrammarError {
  message: string;
  context: string;
  suggestion: string;
}

export interface TranslationCheckResult {
  grammarCorrect: boolean;
  grammarErrors: GrammarError[];
  isCorrect: boolean;
  score: number; // 0-100, -1 if unavailable
  feedback: string;
  suggestions: string[];
  referenceTranslation: string;
}

type LLMProvider = "ollama" | "openai";

// Configuration from environment variables
const LLM_PROVIDER: LLMProvider =
  (process.env.LLM_PROVIDER as LLMProvider) || "ollama";
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

// Shared prompt for translation evaluation
function getEvaluationPrompt(
  vietnameseSentence: string,
  userTranslation: string,
  vocabularyWord: string
): string {
  return `Evaluate this English translation of a Vietnamese sentence.

Vietnamese: "${vietnameseSentence}"
English translation to evaluate: "${userTranslation}"
Required vocabulary word that MUST appear in reference: "${vocabularyWord}"

=== MOST IMPORTANT RULE ===
Your referenceTranslation MUST contain the EXACT word "${vocabularyWord}".
DO NOT use synonyms like "delicious" instead of "scrumptious", or "happy" instead of "joyful".
The word "${vocabularyWord}" MUST appear exactly as written in your referenceTranslation.

Task: Create a reference translation using "${vocabularyWord}" and evaluate the user's attempt.

Output valid JSON only:
{
  "referenceTranslation": "your translation that MUST include the exact word '${vocabularyWord}'",
  "grammarCorrect": true or false,
  "grammarErrors": [{"message": "error description", "context": "problematic text", "suggestion": "fix"}],
  "isCorrect": true or false,
  "score": 0-100,
  "feedback": "one sentence about the translation quality",
  "suggestions": ["improvement suggestion"] or []
}

Scoring guide:
- 95-100: Perfect or nearly identical to reference
- 85-94: Same meaning, minor word choice differences (synonyms OK for non-vocabulary words)
- 70-84: Correct meaning but awkward phrasing
- 50-69: Some meaning conveyed but significant issues
- Below 50: Wrong meaning, major errors, or misspellings of key words

CRITICAL REQUIREMENTS:
1. referenceTranslation MUST contain "${vocabularyWord}" - NOT a synonym! This is mandatory.
2. SPELLING ERRORS: Misspelled words like "chicket" instead of "chicken" MUST be marked as grammarCorrect: false
3. ALWAYS provide a referenceTranslation - never leave it empty
4. If user correctly uses "${vocabularyWord}" and the translation is accurate, score should be 85+

Important:
- If user's translation has ANY misspelled words, set grammarCorrect to false and list the spelling error
- Translate the Vietnamese accurately - pay attention to specific terms
- If user's translation uses "${vocabularyWord}" correctly with accurate meaning, reward that with a high score`;
}

// ============ OLLAMA PROVIDER ============

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

async function checkWithOllama(
  vietnameseSentence: string,
  userTranslation: string,
  vocabularyWord: string
): Promise<TranslationCheckResult> {
  const prompt = getEvaluationPrompt(vietnameseSentence, userTranslation, vocabularyWord);

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const data: OllamaResponse = await response.json();
  return parseJSONResponse(data.response, vietnameseSentence);
}

export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ============ OPENAI PROVIDER ============

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function checkWithOpenAI(
  vietnameseSentence: string,
  userTranslation: string,
  vocabularyWord: string
): Promise<TranslationCheckResult> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required when using OpenAI provider");
  }

  const systemPrompt = `You are an expert Vietnamese-English translation evaluator.
You have deep knowledge of Vietnamese language, including regional terms and specific vocabulary.
Always provide accurate translations - for example:
- "Cá voi lưng gù" = "Humpback whale" (NOT dolphin)
- "Cá heo" = "Dolphin"
- "Voi" = "Elephant"
Be precise with animal names, technical terms, and cultural references.

MANDATORY RULE FOR REFERENCE TRANSLATIONS:
When a vocabulary word is specified (like "scrumptious", "beverage", etc.), your referenceTranslation MUST use that EXACT word.
DO NOT substitute synonyms! If the vocabulary word is "scrumptious", use "scrumptious" NOT "delicious".
If the vocabulary word is "beverage", use "beverage" NOT "drink".
This is a vocabulary learning app - the whole point is to practice using the specific word.

CRITICAL: You must carefully check for SPELLING ERRORS in the user's translation.
- "chicket" is a misspelling of "chicken" - mark as grammar error
- "reciepe" is a misspelling of "recipe" - mark as grammar error
- Any misspelled word should set grammarCorrect to false and be listed in grammarErrors
- ALWAYS provide a non-empty referenceTranslation that includes the required vocabulary word`;

  const userPrompt = getEvaluationPrompt(vietnameseSentence, userTranslation, vocabularyWord);

  const messages: OpenAIMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: messages,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data: OpenAIResponse = await response.json();
  const content = data.choices[0]?.message?.content || "";
  return parseJSONResponse(content, vietnameseSentence);
}

export async function isOpenAIAvailable(): Promise<boolean> {
  return !!OPENAI_API_KEY;
}

// ============ SHARED UTILITIES ============

function parseJSONResponse(
  response: string,
  vietnameseSentence: string
): TranslationCheckResult {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const grammarErrors: GrammarError[] = Array.isArray(parsed.grammarErrors)
      ? parsed.grammarErrors
          .filter((e: unknown) => typeof e === "object" && e !== null)
          .map(
            (e: { message?: string; context?: string; suggestion?: string }) => ({
              message: typeof e.message === "string" ? e.message : "Grammar issue",
              context: typeof e.context === "string" ? e.context : "",
              suggestion: typeof e.suggestion === "string" ? e.suggestion : "",
            })
          )
          .slice(0, 5)
      : [];

    return {
      grammarCorrect:
        typeof parsed.grammarCorrect === "boolean" ? parsed.grammarCorrect : true,
      grammarErrors,
      isCorrect:
        typeof parsed.isCorrect === "boolean" ? parsed.isCorrect : true,
      score:
        typeof parsed.score === "number"
          ? Math.min(100, Math.max(0, parsed.score))
          : 50,
      feedback:
        typeof parsed.feedback === "string"
          ? parsed.feedback
          : "Translation evaluated.",
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions
            .filter((s: unknown) => typeof s === "string")
            .slice(0, 3)
        : [],
      referenceTranslation:
        typeof parsed.referenceTranslation === "string" && parsed.referenceTranslation.trim()
          ? parsed.referenceTranslation.trim()
          : `(Translation of: ${vietnameseSentence})`,
    };
  } catch {
    console.error("Failed to parse LLM response:", response);
    return {
      grammarCorrect: true,
      grammarErrors: [],
      isCorrect: true,
      score: -1,
      feedback: "Could not parse evaluation result",
      suggestions: [],
      referenceTranslation: "",
    };
  }
}

function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateSimilarity(text1: string, text2: string): number {
  const words1 = normalizeForComparison(text1).split(" ");
  const words2 = normalizeForComparison(text2).split(" ");

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  let matches = 0;
  for (const word of set1) {
    if (set2.has(word)) matches++;
  }

  const union = new Set([...words1, ...words2]).size;
  return Math.round((matches / union) * 100);
}

/**
 * Filter out suggestions that recommend something the user already wrote
 * e.g., "Use 'bald eagle'" when user already wrote "bald eagle"
 */
function filterContradictorySuggestions(
  userTranslation: string,
  suggestions: string[]
): string[] {
  const normalizedUser = normalizeForComparison(userTranslation);

  return suggestions.filter((suggestion) => {
    // Extract quoted terms from the suggestion (e.g., 'bald eagle' or "bald eagle")
    const quotedTerms = suggestion.match(/['"]([^'"]+)['"]/g);
    if (!quotedTerms) return true;

    // Check if any suggested term already exists in user's translation
    for (const quoted of quotedTerms) {
      const term = quoted.replace(/['"]/g, "").toLowerCase();
      if (normalizedUser.includes(term)) {
        // User already has this term, filter out this contradictory suggestion
        return false;
      }
    }
    return true;
  });
}

/**
 * Filter out grammar errors that are contradictory
 * e.g., "Replace X with Y" when user already has Y
 */
function filterContradictoryGrammarErrors(
  userTranslation: string,
  errors: GrammarError[]
): GrammarError[] {
  const normalizedUser = normalizeForComparison(userTranslation);

  return errors.filter((error) => {
    // Check if the suggestion contains a term the user already has
    const suggestion = error.suggestion.toLowerCase();
    const quotedTerms = suggestion.match(/['"]([^'"]+)['"]/g);

    if (quotedTerms) {
      for (const quoted of quotedTerms) {
        const term = quoted.replace(/['"]/g, "");
        if (normalizedUser.includes(term)) {
          return false;
        }
      }
    }

    // Also check if the suggestion itself (without quotes) is in user's text
    const cleanSuggestion = normalizeForComparison(error.suggestion);
    if (cleanSuggestion.length > 3 && normalizedUser.includes(cleanSuggestion)) {
      return false;
    }

    return true;
  });
}

function correctScoreIfSimilar(
  userTranslation: string,
  result: TranslationCheckResult
): TranslationCheckResult {
  // First, filter out contradictory suggestions and grammar errors
  const filteredSuggestions = filterContradictorySuggestions(
    userTranslation,
    result.suggestions
  );
  const filteredGrammarErrors = filterContradictoryGrammarErrors(
    userTranslation,
    result.grammarErrors
  );

  // Update result with filtered values
  let correctedResult: TranslationCheckResult = {
    ...result,
    suggestions: filteredSuggestions,
    grammarErrors: filteredGrammarErrors,
    grammarCorrect: filteredGrammarErrors.length === 0,
  };

  // If we filtered out all suggestions/errors, boost the score
  const removedSuggestions = result.suggestions.length - filteredSuggestions.length;
  const removedErrors = result.grammarErrors.length - filteredGrammarErrors.length;

  if (removedSuggestions > 0 || removedErrors > 0) {
    // LLM made contradictory claims, boost the score
    const scoreBoost = (removedSuggestions + removedErrors) * 5;
    correctedResult = {
      ...correctedResult,
      score: Math.min(100, correctedResult.score + scoreBoost),
      feedback: filteredSuggestions.length === 0 && filteredGrammarErrors.length === 0
        ? "Good translation!"
        : correctedResult.feedback,
    };
  }

  if (!result.referenceTranslation) return correctedResult;

  const similarity = calculateSimilarity(
    userTranslation,
    result.referenceTranslation
  );

  if (similarity >= 90 && correctedResult.score < 90) {
    return {
      ...correctedResult,
      score: Math.max(correctedResult.score, 95),
      isCorrect: true,
      feedback: "Excellent! Your translation matches the reference very closely.",
      suggestions: [],
      grammarErrors: [],
      grammarCorrect: true,
    };
  }

  if (similarity >= 80 && correctedResult.score < 80) {
    return {
      ...correctedResult,
      score: Math.max(correctedResult.score, 85),
      isCorrect: true,
      feedback: correctedResult.feedback || "Good translation with minor differences.",
      suggestions:
        correctedResult.suggestions.length > 2
          ? correctedResult.suggestions.slice(0, 1)
          : correctedResult.suggestions,
    };
  }

  return correctedResult;
}

// ============ MAIN EXPORT ============

/**
 * Check translation using configured LLM provider
 * Provider is selected via LLM_PROVIDER environment variable
 */
export async function checkTranslation(
  vietnameseSentence: string,
  userTranslation: string,
  vocabularyWord: string
): Promise<TranslationCheckResult> {
  try {
    let result: TranslationCheckResult;

    if (LLM_PROVIDER === "openai") {
      result = await checkWithOpenAI(vietnameseSentence, userTranslation, vocabularyWord);
    } else {
      result = await checkWithOllama(vietnameseSentence, userTranslation, vocabularyWord);
    }

    // Post-process to fix inconsistent scores
    return correctScoreIfSimilar(userTranslation, result);
  } catch (error) {
    console.error("Translation check failed:", error);
    return {
      grammarCorrect: true,
      grammarErrors: [],
      isCorrect: true,
      score: -1,
      feedback: `Translation check unavailable (${LLM_PROVIDER})`,
      suggestions: [],
      referenceTranslation: "",
    };
  }
}

/**
 * Check if the configured LLM provider is available
 */
export async function isLLMAvailable(): Promise<boolean> {
  if (LLM_PROVIDER === "openai") {
    return isOpenAIAvailable();
  }
  return isOllamaAvailable();
}

/**
 * Get the current LLM provider name
 */
export function getCurrentProvider(): LLMProvider {
  return LLM_PROVIDER;
}
