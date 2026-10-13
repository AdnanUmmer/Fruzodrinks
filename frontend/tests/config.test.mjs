import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateOrigin, jsonLd } from '../lib/origin.mjs';
test('one canonical origin, normalized and HTTPS in production',()=>{
  assert.equal(validateOrigin('https://fruzodrinks.com/',true),'https://fruzodrinks.com');
  assert.equal(validateOrigin('http://127.0.0.1:3000'),'http://127.0.0.1:3000');
  for(const value of ['http://fruzodrinks.com','https://localhost','https://a.com,https://b.com','https://u:p@a.com','https://a.com/path','https://a.com?q=1','https://a.com#x',''])assert.throws(()=>validateOrigin(value,true));
});
test('structured data cannot terminate its script element',()=>{
  const payload={name:'</script><script>alert(1)</script>'};
  assert.ok(!jsonLd(payload).includes('<'));
  assert.deepEqual(JSON.parse(jsonLd(payload)),payload);
});
