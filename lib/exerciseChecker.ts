export type ExerciseStatus = "correct" | "incorrect" | "book_error";

export interface ExerciseResult {
  number: string;
  type: string;
  userAnswer: string;
  bookAnswer: string;
  status: ExerciseStatus;
  explanation: string;
  correctedAnswer?: string;
}

export interface CheckResult {
  summary: {
    total: number;
    correct: number;
    incorrect: number;
    bookErrors: number;
  };
  exercises: ExerciseResult[];
}

export interface ExerciseCheckInput {
  mode: "image" | "text";
  // Image mode
  questionImage?: string;
  answersImage?: string;
  answerKeyImage?: string;
  // Text mode
  questionsText?: string;
  answersText?: string;
  answerKeyText?: string;
}

const SYSTEM_PROMPT = `You are an expert English language exercise checker. You will receive the student's answers and the textbook's answer key (and optionally the original questions) as either images or text.

Your task:
- Extract all exercises, matching them by exercise number
- Compare the student's answers against the answer key
- If the original questions are provided, use them to understand context and determine which answer is actually correct when there's ambiguity
- Be generous with alternative valid answers — English often has multiple correct phrasings
- Flag potential book errors: grammar mistakes in the key, overly restrictive single answers when alternatives are valid, or outright wrong answers
- If handwriting is unclear, note it rather than guessing wrong
- For each exercise, determine the type (fill-in-the-blank, multiple-choice, sentence-rewriting, matching, true-false, etc.)

Output ONLY valid JSON with this exact structure:
{
  "exercises": [
    {
      "number": "1",
      "type": "fill-in-the-blank",
      "userAnswer": "what the student wrote",
      "bookAnswer": "what the answer key says",
      "status": "correct" | "incorrect" | "book_error",
      "explanation": "brief explanation of why it's correct/incorrect/a book error",
      "correctedAnswer": "the actually correct answer (only if status is incorrect or book_error)"
    }
  ]
}

Status guide:
- "correct": student's answer matches or is a valid alternative to the book answer
- "incorrect": student's answer is wrong and the book answer is correct
- "book_error": the book's answer key appears to be wrong, too restrictive, or contains errors

Important:
- Include ALL exercises visible in the input
- Number them exactly as they appear in the book
- If an exercise has sub-parts (a, b, c), list each as a separate entry (e.g., "1a", "1b")
- Keep explanations concise but helpful
- Output ONLY the JSON, no other text`;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface AnthropicMessage {
  content: Array<{ type: "text"; text: string }>;
}

interface AnthropicResponse {
  content: AnthropicMessage["content"];
}

function parseCheckResponse(responseText: string): CheckResult {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const exercises: ExerciseResult[] = Array.isArray(parsed.exercises)
      ? parsed.exercises.map(
          (e: Record<string, unknown>) => ({
            number: typeof e.number === "string" ? e.number : String(e.number ?? "?"),
            type: typeof e.type === "string" ? e.type : "unknown",
            userAnswer: typeof e.userAnswer === "string" ? e.userAnswer : "",
            bookAnswer: typeof e.bookAnswer === "string" ? e.bookAnswer : "",
            status: ["correct", "incorrect", "book_error"].includes(e.status as string)
              ? (e.status as ExerciseStatus)
              : "incorrect",
            explanation: typeof e.explanation === "string" ? e.explanation : "",
            ...(typeof e.correctedAnswer === "string" && e.correctedAnswer
              ? { correctedAnswer: e.correctedAnswer }
              : {}),
          })
        )
      : [];

    const correct = exercises.filter((e) => e.status === "correct").length;
    const incorrect = exercises.filter((e) => e.status === "incorrect").length;
    const bookErrors = exercises.filter((e) => e.status === "book_error").length;

    return {
      summary: {
        total: exercises.length,
        correct,
        incorrect,
        bookErrors,
      },
      exercises,
    };
  } catch (error) {
    console.error("Failed to parse exercise check response:", responseText);
    throw new Error(
      `Failed to parse AI response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function buildMessageContent(input: ExerciseCheckInput): Array<Record<string, unknown>> {
  const content: Array<Record<string, unknown>> = [];

  if (input.mode === "text") {
    let textContent = "";
    if (input.questionsText) {
      textContent += `=== ORIGINAL QUESTIONS ===\n${input.questionsText}\n\n`;
    }
    textContent += `=== STUDENT'S ANSWERS ===\n${input.answersText}\n\n`;
    textContent += `=== ANSWER KEY ===\n${input.answerKeyText}`;

    const intro = input.questionsText
      ? "Here are the original questions, the student's answers, and the answer key. Use the questions for context to determine correctness."
      : "Here are the student's answers and the answer key. Please compare them and check each exercise.";

    content.push({ type: "text", text: `${intro}\n\n${textContent}` });
  } else {
    if (input.questionImage) {
      content.push({
        type: "text",
        text: "Here are three images. The first is the original exercise questions, the second is the student's completed answers, and the third is the answer key. Use the questions for context to determine correctness.",
      });
      content.push({
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data: input.questionImage },
      });
    } else {
      content.push({
        type: "text",
        text: "Here are two images. The first is the student's completed exercise page. The second is the textbook's answer key. Please compare them and check each exercise.",
      });
    }

    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: input.answersImage },
    });
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: input.answerKeyImage },
    });
  }

  return content;
}

export async function checkExercises(input: ExerciseCheckInput): Promise<CheckResult> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildMessageContent(input),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const data: AnthropicResponse = await response.json();
  const text = data.content?.[0]?.text || "";

  return parseCheckResponse(text);
}
