import express from 'express';
import httpServer from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as elastic from '@elastic/elasticsearch';
import { setupElasticsearch } from './setupElasticSearch.js';
import {profanities} from 'profanities';
import wash from 'washyourmouthoutwithsoap'
import { generateHumorousResponse, isGreeting, isQuestion, getRandomGreetingResponse, getProfanityResponse } from './generateResponse.js';
import { toSvg } from "jdenticon";
import crypto from 'crypto';
const elasticClient = new elastic.Client({
  node: 'https://ednfvgeikh:joufotk16p@hrishi-search-2813699401.us-east-1.bonsaisearch.net:443'
},
);

// Check connection
elasticClient.ping({}, { requestTimeout: 30000 }, function (error) {
  if (error) {
    console.error('Elasticsearch cluster is down!');
  } else {
    console.log('Elasticsearch is ok');
  }
});

const app = express();

app.use(cors());
const http = httpServer.createServer(app);

http.listen(3000, async () => {
  await setupElasticsearch();
  console.log('listening on *:3000');
});

const io = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
});

async function searchQuestionInDatabase(question) {
  try {
    const { body } = await elasticClient.search({
      index: 'question-messages',
      body: {
        query: {
          match_phrase: {
            question: question
          }
        }
      }
    });
    return body.hits.hits;
  } catch (error) {
    console.error('Error searching question in ElasticSearch:', error);
    return [];
  }
}

const generateRandomUsername = () => {
  const adjectives = ["Quick", "Lazy", "Jolly", "Funny", "Brave", "Clever"];
  const nouns = ["Panda", "Fox", "Rabbit", "Dragon", "Tiger", "Bear"];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 99) + 1;
  return `${adjective}${noun}${number}`;
};

let users = {};

io.on('connection', (socket) => {

  const randomUsername = generateRandomUsername();
  console.log(`${randomUsername} connected`);

  // Generate a hash of the user ID
  const hash = crypto.createHash('sha256').update(randomUsername).digest('hex');
    
  // Generate an SVG avatar from the hash
  const size = 50; // Size of the avatar image
  const avatarSvg = toSvg(hash, size);

  users[socket.id] = {userName: randomUsername, avatar: avatarSvg};

  socket.on('disconnect', () => {
    console.log('user disconnected');

    delete users[socket.id];
    io.emit('active users', Object.values(users)); 
  });

  io.emit('active users', Object.values(users));

  // Event to retrieve chat messages
  socket.on('get_messages', async (data) => {
    try {
      // Perform search query in Elasticsearch
      const { body } = await elasticClient.search({
        index: 'question-messages',
        body: {
          query: {
            match_all: {} // or customize your query based on `data` parameter
          },
          sort: [
            { timestamp: { order: 'asc' } } // sorting by timestamp
          ]
        },
        size: 200
      });

      // Extract messages from Elasticsearch response
      const messages = body.hits.hits.map(hit => hit._source);

      // Emit an event with the messages to the client who requested it
      socket.emit('chat_messages', messages, randomUsername);
    } catch (error) {
      console.error('Error retrieving messages from Elasticsearch:', error);
      socket.emit('error', 'Error retrieving messages');
    }
  });

  socket.on('chat message', async (msg) => {

    io.emit('chat message', { user: randomUsername, text: msg });

        if (!isGreeting(msg.question) && !wash.check('en', msg.question) && isQuestion(msg.question)) {
          let similarQuestions = await searchQuestionInDatabase(msg.question);
          similarQuestions = similarQuestions.sort((a, b) => b.timestamp - a.timestamp);
          similarQuestions = similarQuestions.filter((question) => question._source.bot !== true);

          if (similarQuestions.length > 0 && !msg.answer) {
            const previousAnswer = similarQuestions.filter((question) => question._source.answer !== '')[0]?._source.answer;
            if (previousAnswer) {
              await elasticClient.index({
                index: 'question-messages',
                body: {
                  question: msg.question,
                  answer: previousAnswer,
                  bot: true,
                  user: randomUsername,
                  timestamp: new Date()
                }
              });
            } else {
              await elasticClient.index({
                index: 'question-messages',
                body: {
                  question: msg.question,
                  answer: msg.answer,
                  user: randomUsername,
                  timestamp: new Date()
                }
              });
            }

            await elasticClient.indices.refresh({ index: 'question-messages' });
          } else if (msg.question || msg.answer) {
            await elasticClient.index({
              index: 'question-messages',
              body: {
                question: msg.question,
                answer: msg.answer,
                user: randomUsername,
                timestamp: new Date()
              }
            });
            await elasticClient.indices.refresh({ index: 'question-messages' });

          }
        } else if (isGreeting(msg.question)) {
          let randomGreeting = getRandomGreetingResponse();
          await elasticClient.index({
            index: 'question-messages',
            body: {
              question: msg.question,
              answer: randomGreeting,
              conversation: true,
              bot: true,
              user: randomUsername,
              timestamp: new Date()
            }
          });
        } else if(wash.check('en', msg.question)) {
          let response = getProfanityResponse();

          await elasticClient.index({
            index: 'question-messages',
            body: {
              question: msg.question,
              answer: response,
              conversation: true,
              bot: true,
              profanity: true,
              user: randomUsername,
              timestamp: new Date()
            }
          });

        } else {
          let response = generateHumorousResponse(msg.question);
          await elasticClient.index({
            index: 'question-messages',
            body: {
              question: msg.question,
              answer: response,
              conversation: true,
              bot: true,
              user: randomUsername,
              timestamp: new Date()
            }
          });
    }
  });
});
