// Get inputs by index (connection order)
const existingFileInput = $input.all(1);

if (!existingFileInput.length) {
  throw new Error("Existing file JSON must be connected");
}

// Existing file (binary) – assume binary property name is 'data'
const buffer = await this.helpers.getBinaryDataBuffer(0, "data"); // from second input
const existingFileContent = buffer.toString("utf8");

let existingJson;
try {
  existingJson = JSON.parse(existingFileContent);
} catch (e) {
  throw new Error("Failed to parse existing file JSON");
}

// Validate structure
if (!Array.isArray(existingJson)) {
  throw new Error("Existing file is missing items array");
}

// Get topicId from the "Extract new topic name" node (already calculated earlier)
const topicId = $("Extract new topic name").first().json.topicId;
const nextDay = $("Extract new topic name").first().json.dayNumber;

// Get topic theme from webhook (optional, defaults to generic)
const topicTheme = $("Webhook").first().json.topic || "";
const description = topicTheme
  ? `Vocabulary about ${topicTheme} - Day ${nextDay}`
  : `Learned vocabulary for Day ${nextDay}`;

const combinedItems = [
  ...existingJson,
  {
    id: topicId,
    name: `Day ${nextDay}`,
    nameVietnamese: `Ngày ${nextDay}`,
    description: description,
    icon: "🌟",
    wordCount: Number($("On form submission").first().json.vocabulariesCount),
    difficulty: "intermediate",
    createdAt: new Date(),
  },
];
// 4. Convert to pretty JSON string
const jsonString = JSON.stringify(combinedItems, null, 2);

// 5. Convert string to binary (base64)
const binaryData = Buffer.from(jsonString, "utf-8").toString("base64");

// 6. Return with binary in n8n format
return [
  {
    binary: {
      data: {
        data: binaryData,
        mimeType: "application/json",
        fileExtension: "json",
      },
    },
  },
];
