import OpenAI from "openai";

const openai = new OpenAI();

export const checkTextForScam = async (textToCheck: string) => {
  // TODO: put in some content limiting...
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant, and your purpose is to inform people politely of what text inputs are potential scams.",
      },
      {
        role: "user",
        content: `Is the following text a scam? ${textToCheck}`,
      },
      {
        role: "assistant",
        content:
          "I think this text is a scam because it asks for personal information and promises a reward in return. I recommend not engaging with this text",
      },
    ],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0];
};
