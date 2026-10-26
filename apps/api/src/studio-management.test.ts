import {test} from "node:test";
import {strict as assert} from "node:assert";
import {youtubeId} from "./studio-management.js";
test("YouTube standard URLs and IDs normalize to video ID",()=>{
 for(const input of [
 "dQw4w9WgXcQ","https://youtu.be/dQw4w9WgXcQ?t=10",
 "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
 "https://youtube.com/shorts/dQw4w9WgXcQ",
 "https://youtube.com/embed/dQw4w9WgXcQ"
 ])assert.equal(youtubeId(input),"dQw4w9WgXcQ");
});
test("Disallow unsupported video origins and invalid IDs",()=>{
 for(const v of ["https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ",
 "javascript:alert(1)","https://evil.example/watch?v=dQw4w9WgXcQ",
 "invalid","https://youtube.com/watch?v=bad"]){
 assert.equal(youtubeId(v),undefined);
 }
 assert.equal(youtubeId(""),null);
});
