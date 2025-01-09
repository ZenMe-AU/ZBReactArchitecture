// Define the Profile interface
export interface Profile {
  id: number;
  name: string;
  avatar: string | null;
}

export interface Question {
  title: string;
  questionText: string | null;
  option?: string[] | null;
}
