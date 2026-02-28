/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Define the Profile interface
export interface Profile {
  id: string;
  name: string;
  avatar: string | null;
  role?: string;
}

export interface Question {
  id: string;
  title: string;
  questionText: string;
  option: string[] | null;
  profileId: string;
}

export interface Answer {
  id: string;
  profileId: string;
  optionId: string | null;
  answerText: string | null;
}
