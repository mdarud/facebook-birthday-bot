const request = require("supertest");

const app = require("./app");

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
      .get("/messages/630c201de00d8f662ee8e6c5")

      .expect("Content-Type", /json/)

      .expect(200)

      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              _id: "630c201de00d8f662ee8e6c5",
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

describe("Webhook /", () => {});
