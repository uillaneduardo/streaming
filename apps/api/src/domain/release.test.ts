import { test } from "node:test";
import { strict as assert } from "node:assert";
import { publicEpisodeState, sanitizedYoutubeId } from "./release.js";
const now = new Date("2026-10-25T20:00:00.000Z");
test("draft and suspended never surface publicly", () => {
  for (const status of ["draft", "suspended"] as const) {
    assert.equal(publicEpisodeState({status,releaseAt:"2020-01-01T00:00:00Z",endAt:null},now),"hidden");
  }
});
test("upcoming episodes do not become playable", () => {
  assert.equal(publicEpisodeState({status:"scheduled",releaseAt:"2026-11-01T00:00:00Z",endAt:null},now),"upcoming");
});
test("availability includes start time but excludes end time", () => {
  assert.equal(publicEpisodeState({status:"published",releaseAt:"2026-10-25T20:00:00Z",endAt:"2026-10-26T20:00:00Z"},now),"available");
  assert.equal(publicEpisodeState({status:"published",releaseAt:"2026-10-01T00:00:00Z",endAt:"2026-10-25T20:00:00Z"},now),"ended");
});
test("missing schedule does not expose video",()=>{
  assert.equal(publicEpisodeState({status:"published",releaseAt:null,endAt:null},now),"hidden");
});
test("youtube IDs are validated before being exposed",()=>{
  assert.equal(sanitizedYoutubeId("dQw4w9WgXcQ"),"dQw4w9WgXcQ");
  assert.equal(sanitizedYoutubeId("https://example.com"),null);
});
