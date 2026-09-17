# AI-assisted contribution policy

AI coding assistants may be used to help explore the codebase, develop changes, create tests and support code reviews. These tools can improve productivity, but they do not reduce the contributor's responsibility for the quality, correctness or compliance of a change.
This policy defines the requirements for using AI-assisted tooling when contributing to the project. It should be read in conjunction with `AGENTS.md` (solution architecture, build, test and deployment guidance).


## Accountability

Contributors remain fully accountable for any content generated with AI assistance.

AI-generated output must be treated the same as any other third-party input. Before submitting a change, contributors must:

- understand the implementation and design decisions;
- be able to explain and justify the change during review;
- verify the correctness of the code and associated artefacts; and
- ensure all licensing and attribution obligations have been met.


## Code

- **Understand it.** 
Contributors must understand all code included in a pull request. You are expected to explain the purpose and behaviour of any code included in the change, regardless of whether it was written manually or generated with AI assistance.
- **Validate it.** 
AI-generated code must be compiled, tested and reviewed before submission. Review the generated output for correctness, maintainability and security. Verify that the implementation meets the intended requirements.
- **Own it.** 
Pull request titles and descriptions must be written by a human contributor to succinctly describe the business need, change intent and code implementation, AI-generated summaries are usually too verbose.
- **Keep it lean.** AI tools generate unnecessary complexity, abstraction and boilerplate. Keep pull requests small, focused and ensure tests provide genuine value.
- **Copyright.** Ensure AI-generated content does not include unattributed third-party or copyrighted material.

## Reviews

- **Responsible.** Every finding must be verified against the code before it is posted. Do not submit speculative or low-confidence feedback. A missing comment is better than an incorrect one.
- **Disclose AI use.** If a review comment is substantially AI-generated, disclose this in the pull request or review discussion. Labelling comments as `(AI-assisted)` is encouraged.
- **No Auto posting.** AI review findings can be used as draft comments or reviewer notes. A human reviewer must decide, comment by comment, what is posted to the pull request. Do not automate the publication of AI-generated findings.
- **Humans decide.** AI may summarise changes or identify potential issues, but approval and merge decisions are made by a human.
