/*

DO NOT CHANGE THIS FILE

*/
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
require("dotenv").config();
const request = require("supertest");
const app = require("../../app");

describe("/api/unknown", () => {
  it("should return a 404", async (done) => {
    const response = await request(app).get("/api/unknown");
    expect(response.status).toEqual(404);
    // the 404 response returns an object with a message property
    expect(typeof response.body.message).toEqual("string");
    done();
  });
});
