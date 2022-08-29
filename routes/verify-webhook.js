const messageController = require("../controller/messageController");
const UserInfo = require("../models/userInfo");
const Message = require("../models/messages");

module.exports = function (app, chalk) {
  app.get("/webhook", (req, res) => {
    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
      // Check the mode and token sent is correct
      if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
        // Respond with the challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  });

  app.get("/messages", async (req, res) => {
    let messages = await Message.find();
    res.send(messages);
  });

  app.get("/messages/:id", async (req, res) => {
    let messages = await Message.find({ _id: req.params.id });
    res.send(messages);
  });

  app.get("/summary", async (req, res) => {
    let messages = await Message.find();
    let users = await UserInfo.find();
    let summary = [];
    users.forEach(function (u) {
      let userMessages = messages.filter(
        (m) => m.message.sender.id === u.userId
      );
      summary.push({
        user: u.userId,
        name: u.name,
        messages: userMessages,
      });
    });
    res.send(summary);
  });

  app.post("/webhook", (req, res) => {
    //checking for page subscription.
    if (req.body.object === "page") {
      // Iterate over each entry
      req.body.entry.forEach(function (entry) {
        // Iterate over each messaging event
        entry.messaging.forEach(function (event) {
          if (event.message) {
            console.log("message", event);
            messageController(event);
          }
        });
      });
      res.sendStatus(200);
    }
  });
};
