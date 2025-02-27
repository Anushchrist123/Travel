import { Groq } from "groq-sdk";
import { batch1Schema, batch2Schema, batch3Schema } from "./schemas";

// Initialize Groq AI client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const promptSuffix = `Generate travel data according to the schema in JSON format.
                      Do not return anything outside of curly braces.
                      Generate the response as per the function schema provided.
                      Dates given, activity preference, and travelling with should influence at least 50% while generating the plan.`;

// Function to call Groq AI API
const callGroqApi = async (
  prompt: string,
  schema: any,
  description: string
) => {
  console.log({ prompt, schema });

  try {
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b",
      messages: [
        { role: "system", content: "You are a helpful travel assistant." },
        { role: "user", content: prompt },
      ],
      functions: [
        { name: "set_travel_details", parameters: schema, description },
      ],
      function_call: { name: "set_travel_details" },
    });

    return response;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw error;
  }
};

// Generate travel description
export const generatebatch1 = (promptText: string) => {
  const prompt = `${promptText}, ${promptSuffix}`;
  const description = `Generate information about a place according to the following schema:

  - About the Place:
    - A string containing details about the place, at least 50 words.

  - Best Time to Visit:
    - A string specifying the best time to visit.

  Ensure the response adheres to the schema in JSON format.`;

  return callGroqApi(prompt, batch1Schema, description);
};

type GroqAIInputType = {
  userPrompt: string;
  activityPreferences?: string[] | undefined;
  fromDate?: number | undefined;
  toDate?: number | undefined;
  companion?: string | undefined;
};

// Generate adventure recommendations
export const generatebatch2 = (inputParams: GroqAIInputType) => {
  const description = `Generate recommendations for an adventure trip based on the schema:

  - Top Adventures Activities:
    - At least 5 activities, each with a location.

  - Local Cuisine Recommendations:
    - A list of local foods to try.

  - Packing Checklist:
    - Items to pack for the trip.

  Ensure the response follows the schema in JSON format.`;

  return callGroqApi(getPrompt(inputParams), batch2Schema, description);
};

// Generate itinerary and top places to visit
export const generatebatch3 = (inputParams: GroqAIInputType) => {
  const description = `Generate a travel itinerary and top places to visit based on the schema:

  - Itinerary:
    - List of daily activities (morning, afternoon, evening).

  - Top Places to Visit:
    - List of places with name and coordinates (latitude, longitude).

  Ensure the response follows the schema in JSON format.`;

  return callGroqApi(getPrompt(inputParams), batch3Schema, description);
};

// Generate prompt dynamically
const getPrompt = ({
  userPrompt,
  activityPreferences,
  companion,
  fromDate,
  toDate,
}: GroqAIInputType) => {
  let prompt = `${userPrompt}, from date-${fromDate} to date-${toDate}`;

  if (companion && companion.length > 0)
    prompt += `, travelling with-${companion}`;

  if (activityPreferences && activityPreferences.length > 0)
    prompt += `, activity preferences-${activityPreferences.join(",")}`;

  return `${prompt}, ${promptSuffix}`;
};
