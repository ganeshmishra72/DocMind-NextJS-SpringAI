import type { PromptTemplate } from "./types";

export const promptTemplates: PromptTemplate[] = [
  {
    id: "summarize",
    icon: "file",
    title: "Summarize key points",
    description: "Summarize the key points and executive highlights of this document.",
    prompt: "Summarize the key points and executive highlights of this document.",
  },
  {
    id: "qa",
    icon: "help",
    title: "Interview / Q&A insights",
    description: "What are the most critical questions and answers covered in this text?",
    prompt: "What are the most critical questions and answers covered in this text?",
  },
  {
    id: "actions",
    icon: "list",
    title: "Action items & deadlines",
    description: "List all actionable takeaways, deadlines, and responsibilities mentioned.",
    prompt: "List all actionable takeaways, deadlines, and responsibilities mentioned.",
  },
  {
    id: "concepts",
    icon: "search",
    title: "Technical concepts",
    description: "Explain the main technical concepts and architecture described in this document.",
    prompt: "Explain the main technical concepts and architecture described in this document.",
  },
];
