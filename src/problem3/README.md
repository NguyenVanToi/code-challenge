# Problem 3: Code Review & Refactoring Guide

This folder contains a code review and refactoring challenge. The file `improvement.ts` includes both the original logic and a series of comments and suggestions for improvement. This README explains the special tags used in the comments and how to interpret them.

## Comment Tags Used in `improvement.ts`

You will see comments in the code prefixed with the following tags:

### `[ERROR]`
- **Indicates a clear bug, missing variable, or incorrect logic.**
- These are issues that would cause the code to break, behave incorrectly, or fail type checking.
- **Example:**
  ```ts
  // [ERROR]: The `lhsPriority` is used in the filter condition, but not defined => it should be `balancePriority`
  ```

### `[IMPROVEMENT]`
- **Highlights areas where the code can be made more readable, maintainable, or idiomatic.**
- These are not necessarily bugs, but are best practices or refactorings that make the code better.
- **Example:**
  ```ts
  // [IMPROVEMENT]: Using MAP constant instead of switch case to improve readability and performance
  ```

### `[SUGGESTION]`
- **Provides optional advice or context for further optimization or design choices.**
- These are not required changes, but things to consider for future-proofing or performance.
- **Example:**
  ```ts
  // [SUGGESTION]: If balances and prices are large arrays or the computation is expensive, useMemo can prevent unnecessary work and improve performance.
  ```

## How to Use This File

- **Read through the code and comments in `improvement.ts`.**
- Use the tags to quickly identify critical errors, best practice improvements, and optional suggestions.
- The comments are designed to help both the code author and the reviewer understand the rationale for each change.
- You can use this structure as a template for your own code reviews in the future.

**This README is intended to help reviewers and interviewers quickly understand the review methodology and the meaning of each tag in the code comments.** 