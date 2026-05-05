import { Headphones } from "lucide-react";
import PlaceholderPage from "./PlaceholderPage";

export default function Listening() {
  return (
    <PlaceholderPage
      title="Listening Module"
      description="IELTS-style listening tests with adaptive difficulty and instant AI evaluation"
      icon={Headphones}
      color="from-ielts-green to-green-500"
    />
  );
}
