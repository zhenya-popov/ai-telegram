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

 bot.command("currencies", (ctx) => {
    const options = {
        headers: { 'apikey': "Ryos1vyserhf4nKUgEHIAqAcN2Fzl3LM" }
    };
    let symbols = null;

    ctx.reply('Please wait for answer');

    https.get('https://api.apilayer.com/fixer/symbols', options, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
          });
        resp.on('end', () => {
            symbols = Object.keys(JSON.parse(data).symbols);
            ctx.reply(symbols.join(','));
            console.log(symbols);
          });
    })
 })

 bot.command('convert', (ctx) => {
    const amount = ctx.match.split(' ')[0];
    const from = ctx.match.split(' ')[1];
    const to = ctx.match.split(' ')[2];
    const parameters = {
        amount,
        from,
        to
    }
    const queryParams = querystring.stringify(parameters);

    const options = {
        headers: { 'apikey': "Ryos1vyserhf4nKUgEHIAqAcN2Fzl3LM" }
    };

    ctx.reply('Please wait for the answer');

    https.get('https://api.apilayer.com/fixer/convert?' + queryParams, options, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
          });
        resp.on('end', () => {
            const result = JSON.parse(data).result;
            console.log(`${amount} ${from} equals to ${result} ${to}`);
            ctx.reply(`${amount} ${from} equals to ${result} ${to}`);
          });
    })
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

