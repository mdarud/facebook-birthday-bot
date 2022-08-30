process.env.VERIFY_TOKEN = "birthday-bot";
process.env.DB_URI =
  "mongodb+srv://daru:daru@cluster0.jggoz.mongodb.net/BirthdayBot?retryWrites=true&w=majority";
const request = require("supertest");
const { daysToBirthdate } = require("./controller/messageController");
const app = require("./app");
const mongoose = require("mongoose");

describe("GET /", () => {
  it("GET /messages => all messages", async () => {
    return await request(app)
      .get("/messages")

      .expect("Content-Type", /json/)

      .expect(200)

      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              message: expect.any(Object),
            }),
          ])
        );
      });
  });

  it("GET /messages/:id => get message by id", async () => {
    return await request(app)
      .get("/messages/630c97d6bb9f0a8b7a98fcea")

      .expect("Content-Type", /json/)

      .expect(200)

      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              _id: "630c97d6bb9f0a8b7a98fcea",
            }),
          ])
        );
      });
  });

  it("GET /summary => view summary", async () => {
    return await request(app)
      .get("/summary")

      .expect("Content-Type", /json/)

      .expect(200)

      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              user: expect.any(String),
              name: expect.any(String),
              messages: expect.any(Object),
            }),
          ])
        );
      });
  });
});

describe("Webhook /", () => {
  it("GET /webhook => subscribe to webhook", async () => {
    return await request(app)
      .get(
        `/webhook?hub.verify_token=${process.env.VERIFY_TOKEN}&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe`
      )
      .expect(200);
  });
  it("POST /webhook => bot flow", async () => {
    return await request(app)
      .post("/webhook")
      .send({
        object: "page",
        entry: [
          {
            messaging: [
              {
                sender: { id: "5351645508205080" },
                recipient: { id: "109260241911509" },
                timestamp: 200,
                message: {
                  mid: "m_B6Lkv21KEfAc7DZjRF8Eu8iGSqByRsOESJeNsn_6P9prQvDuVlLOTIOFVWhgnC35dR8eK9Bb5uhypBZMb4-w5a",
                  text: "Hello",
                },
              },
            ],
          },
        ],
      })
      .expect(200);
  });
});

test("counts days properly", () => {
  expect(daysToBirthdate(new Date("2002-10-29"))).toBeLessThan(366);
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) await mongoose.disconnect();
});
