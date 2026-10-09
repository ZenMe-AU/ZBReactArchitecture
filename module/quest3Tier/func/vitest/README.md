# Vitest

The workspace-level `vitest.config.ts` registers this folder's `vitest.setup.mts` as a setup file. Before tests run, that setup loads `../local.settings.json` and copies its `Values` into `process.env`.

API tests such as `testQuestion.test.mts` get `QUESTION_URL` from those local settings, so no separate environment-variable override is needed when running them through the workspace Vitest configuration. Direct test invocations that bypass this configuration may not load the setup file.
