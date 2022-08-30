const request = require("request");
const UserInfo = require("../models/userInfo");
const Message = require("../models/messages");
var stringSimilarity = require("string-similarity");

const answerDict = [
  "yes",
  "y",
  "yeah",
  "yup",
  "okay",
  "go",
  "do",
  "start",
  "alright",
  "no",
  "nah",
  "nope",
  "n",
  "meh",
  "dont",
  "stop",
];

const daysToBirthdate = (bday) => {
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  bday = new Date(today.getFullYear(), bday.getUTCMonth(), bday.getUTCDate());
  if (today > bday) {
    bday.setFullYear(today.getFullYear() + 1);
  }
  return Math.round((bday - today) / 8.64e7);
};

const senderAction = (recipientId) => {
  // Sending typing action to user
  request(
    {
      url: "https://graph.facebook.com/v14.0/me/messages",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: {
        recipient: { id: recipientId },
        sender_action: "typing_on",
      },
    },
    function (error, response, body) {
      if (error) {
        console.log("Error sending message: " + response.error);
      }
    }
  );
};

const sendMessage = (messageText, recipientId) => {
  // Sending message to user
  request(
    {
      url: "https://graph.facebook.com/v14.0/me/messages",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: {
        recipient: { id: recipientId },
        message: messageText,
      },
    },
    function (error, response, body) {
      if (error) {
        console.log("Error sending message: " + response.error);
      }
    }
  );
};

const messageController = async (event) => {
  const message = event.message;
  const senderID = event.sender.id;
  let qIndex = 0;
  let userName = "";
  let birthDate = "";

  // Saving message to database
  let messageUser = await new Message({
    message: event,
  });
  await messageUser.save();

  // Get user data
  request(
    {
      url: "https://graph.facebook.com/v14.0/" + senderID,
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN, fields: "first_name" },
      method: "GET",
    },
    async function (error, response, body) {
      if (error) {
        console.log("Error getting user name: " + response.error);
      } else {
        let bodyObject = JSON.parse(body);

        // Check if user already exist

        let user = await UserInfo.findOne({ userId: senderID });
        if (user) {
          // Continue the question from prev session
          userName = user.name ? user.name : user.userName;
          birthDate = user.birthDate;
          qIndex = user.qIndex;
        } else {
          // Create new user
          let userInfo = await new UserInfo({
            userName: bodyObject.first_name,
            qIndex: 0,
            userId: senderID,
          });
          await userInfo.save();
        }

        let messageText = "Hello!";

        // Validate date input
        if (qIndex === 2 || qIndex === -1) {
          if (
            new Date(message.text) !== "Invalid Date" &&
            !isNaN(new Date(message.text))
          ) {
            birthDate = new Date(message.text);
          } else qIndex = -1;
        }

        // Message state
        if (!qIndex) {
          messageText = { text: "Hi! What is your first name?" };
        } else if (qIndex === 1) {
          userName = message.text;
          messageText = {
            text: userName + ", What a lovely name! When is your birthday?",
          };
        } else if (qIndex === 2) {
          messageText = {
            text:
              userName +
              ", do you want to know how many days until your birthday from now?",
            quick_replies: [
              {
                content_type: "text",
                title: "Yes",
                payload: "YES",
              },
              {
                content_type: "text",
                title: "No",
                payload: "NO",
              },
            ],
          };
        } else if (qIndex === 3) {
          if (
            message.payload === "YES" ||
            stringSimilarity.findBestMatch(message.text, answerDict)
              .bestMatchIndex < 9
          ) {
            messageText = {
              text: `There are ${daysToBirthdate(
                birthDate
              )} days left until your next birthday`,
            };
          } else {
            messageText = { text: "Goodbye 👋" };
            qIndex = 4;
          }
        } else if (qIndex === -1) {
          messageText = {
            text: "Sorry, the date you have entered is invalid. Please resend the valid date...",
          };
        } else {
          messageText = { text: "Goodbye 👋" };
        }

        senderAction(senderID);
        sendMessage(messageText, senderID);
        if (qIndex === 3 && daysToBirthdate(birthDate) === 0)
          sendMessage({ text: "Happy Birthday 🎈" }, senderID);

        // Saving user information
        user = await UserInfo.findOne({ userId: senderID });
        if (user) {
          if (qIndex === 1) {
            user.name = message.text;
            qIndex += 1;
          } else if (qIndex === 2) {
            user.birthDate = birthDate;
            qIndex += 1;
          } else if (qIndex > 3) qIndex = 0;
          else if (qIndex === -1) qIndex = 2;
          else qIndex += 1;

          user.qIndex = qIndex;
          await user.save();
        }
      }
    }
  );
};

module.exports = { messageController, daysToBirthdate };
