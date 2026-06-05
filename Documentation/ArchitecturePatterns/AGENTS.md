# Scope

This guidance applies only to files in Documentation/ArchitecturePatterns.

# Purpose

Ensure architecture patterns are documented consistently, are easy to navigate, and remain maintainable over time.

# Source of Truth

Index file: README.md in this folder.
Rule: README.md is an index only, with short summaries for each pattern.
Rule: Each pattern has its own markdown file in this folder.
Rule: This folder contains "patterns" and "composite patterns".
Rule: Patterns have clear alignment to wikipedia articles, while "composite patterns" are composed of "patterns" and do not have clear alignment to wikipedia articles.
Rule: Composite patterns refer to local pattern files and not Wikipedia articles.
Rule: Architecture decisions that are not a "pattern" or "composite pattern" are stored in the workspace's Documentation/Decisions folder.

# Index Rules for README.md

Keep summaries short, 1 to 3 sentences per pattern.
Include a direct relative link to each pattern file.
Do not duplicate full pattern details in README.md.

# Pattern File Naming Rules

Use lowercase kebab-case.
One pattern or composite pattern per file.
Pattern file name aligns with wikipedia article name which is also referenced from within the document.
Composite patterns have composite- at the start of the file name and do not follow Wikipedia naming requirement.

# Pattern File Structure

Each pattern file should include sections in this order:

- Title
- Overview
  Describe under subheadings the Intent, Problem, Trade-Offs (if any).
  If a "pattern" end the section with a Wikipedia Reference.
- Implementation
  Describe how the pattern is currently implemented.
  Where the pattern is implemented in different ways in different code areas, create implementation sections for each specialisation and describe the implementation for that specialisation. Include references to the code for each implementation.
  Implementation evidence in this section must refer to code, not documentation.
- Future enhancements
  If the pattern is not fully implemented, list what changes may be required to align the implementation with the pattern standard.
- Related Decisions and Patterns
  List decisions that are directly related to this pattern and provide a relative link to each decision file.
  List patterns that are related to this pattern and provide a relative link to each pattern file.

# Writing Style

Be precise and implementation-aware.
Use concise paragraphs and scannable headings.
Prefer concrete statements over generic best-practice language.
Avoid marketing tone.
Use active voice.

# Repository Anchoring Requirements

When describing implementation, reference actual repo paths and components where relevant.
Do not invent components that do not exist in the repository.

# Quality Checklist

Before finalizing a pattern document, verify:

1. README.md links to the file.
2. Summary exists and is concise.
3. Required sections are present.
4. Repo-specific implementation notes are included.
5. For "pattern" files, ensure the wikipedia link in the Overview is resolvable. If the Wikipedia article name do not match the pattern file name, offer to correct it.
6. Test all links in the file for resolvability.
