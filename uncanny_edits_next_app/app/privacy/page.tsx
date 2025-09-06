import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";

export default function PrivacyPage() {
  const filePath = path.join(process.cwd(), "public/legal/privacy_policy.md");
  const markdown = fs.readFileSync(filePath, "utf8");

  return (
    <div className="prose mx-auto p-8">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}