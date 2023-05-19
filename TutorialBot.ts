import { Bot, InlineKeyboard } from "grammy";
import { Configuration, OpenAIApi } from "openai";
import https from "https";
import querystring from 'querystring';
import * as dotenv from 'dotenv'

dotenv.config();

//Create a new bot
const bot = new Bot(process.env.BOT_ID as string);

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

bot.command("ai", async (ctx) => {
  //  ctx.reply('Please wait for answer');

    const message = ctx.match;

    try {
        const response = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{ role: 'user', content: message }],
          max_tokens: 2000,
          temperature: 1,
          stream: false,
        });
    
        console.log(
          'Full response: ', response,
          'Choices: ', ...response.data.choices
        );
        console.log(response.data.choices[0].message?.content);
        ctx.reply(response.data.choices[0].message?.content as string);
      } catch (err) {
        console.log('ChatGPT error: ' + err);
      }
 })

//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on("message", async (ctx) => {
  //Print to console
  console.log(
    `${ctx.from.first_name} wrote ${
      "text" in ctx.message ? ctx.message.text : ""
    }`,
  );

  if (ctx.message.text) {
    //Scream the message
    await ctx.reply(ctx.message.text.toUpperCase(), {
      entities: ctx.message.entities,
    });
  } else {
    //This is equivalent to forwarding, without the sender's name
    await ctx.copyMessage(ctx.message.chat.id);
  }
});

//Start the Bot
bot.start();

