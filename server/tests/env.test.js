import { spawnSync } from 'node:child_process';

const checkConfig = (values) => {
  const configEnv = { ...process.env, NODE_ENV: 'production', ...values };
  delete configEnv.JWT_SECRET;
  delete configEnv.JWT_REFRESH_SECRET;
  Object.assign(configEnv, values);
  return spawnSync(process.execPath, ['--input-type=module', '-e', "await import('./server/src/config/env.js')"], { cwd: new URL('../..', import.meta.url), env: configEnv, encoding: 'utf8' });
};

test('production configuration rejects missing and public signing secrets', () => {
  expect(checkConfig({}).status).not.toBe(0);
  expect(checkConfig({ JWT_SECRET: 'super_quizclash_jwt_secret_key_12345_!@#$%^', JWT_REFRESH_SECRET: 'super_quizclash_refresh_secret_key_67890_!@#$%^' }).status).not.toBe(0);
  const secret = 'A'.repeat(40);
  expect(checkConfig({ JWT_SECRET: secret, JWT_REFRESH_SECRET: secret }).status).not.toBe(0);
  expect(checkConfig({ JWT_SECRET: 'A'.repeat(40), JWT_REFRESH_SECRET: 'B'.repeat(40) }).status).toBe(0);
});
