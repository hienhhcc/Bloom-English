// Read the binary data from the "Read topics.json" node
const buffer = await this.helpers.getBinaryDataBuffer(0, "data");
const fileContent = buffer.toString("utf8");

let topicsJson;
try {
  topicsJson = JSON.parse(fileContent);
} catch (e) {
  throw new Error("Failed to parse topics.json");
}

// Validate structure
if (!Array.isArray(topicsJson)) {
  throw new Error("topics.json is not an array");
}

// Find the highest day number from existing topics
const dayTopics = topicsJson
  .filter((topic) => /^day_\d+$/.test(topic.id))
  .map((topic) => parseInt(topic.id.split("_")[1], 10));

const highestDay = dayTopics.length > 0 ? Math.max(...dayTopics) : 0;
const nextDay = highestDay + 1;
const topicId = `day_${nextDay}`;

// Return as JSON so it can be referenced by subsequent nodes
return [
  {
    json: {
      topicId: topicId,
      dayNumber: nextDay,
    },
  },
];
