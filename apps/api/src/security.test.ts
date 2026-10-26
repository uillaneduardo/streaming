import {test} from "node:test";
import {strict as assert} from "node:assert";
import {hashPassword,verifyPassword,hashToken,csrfForToken,tokenMatch,normalizeEmail,validateArtwork} from "./security.js";
test("password hash is salted and verifiable",async()=>{
 const a=await hashPassword("long-test-password-2026");
 const b=await hashPassword("long-test-password-2026");
 assert.notEqual(a,b);assert.equal(await verifyPassword("long-test-password-2026",a),true);
 assert.equal(await verifyPassword("another-long-password",a),false);
});
test("reject short password",()=>assert.rejects(hashPassword("short"),/password_length/));
test("hash token and CSRF are independent",()=>{
 assert.notEqual(hashToken("abc"),csrfForToken("abc"));
 assert.equal(tokenMatch(csrfForToken("abc"),csrfForToken("abc")),true);
 assert.equal(tokenMatch("x",csrfForToken("abc")),false);
});
test("emails and artwork URLs are constrained",()=>{
 assert.equal(normalizeEmail(" Admin@Example.COM "), "admin@example.com");
 assert.equal(normalizeEmail("invalid"),null);
 assert.equal(validateArtwork("assets/orbital-poster.svg"),"assets/orbital-poster.svg");
 assert.equal(validateArtwork("javascript:alert(1)"),null);
 assert.equal(validateArtwork("http://example.com/image.jpg"),null);
});
