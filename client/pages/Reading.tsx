import { BookOpen } from "lucide-react";
import PlaceholderPage from "./PlaceholderPage";

export default function Reading() {
  return (
    <PlaceholderPage
      title="Reading Module"
      description="Reading comprehension practice with AI-generated questions from any passage"
      icon={BookOpen}
      color="from-ielts-orange to-orange-500"
    />
  );
}
