import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";

export default function TOSPage() {
  const filePath = path.join(process.cwd(), "public/legal/terms_of_service.md");
  const markdown = fs.readFileSync(filePath, "utf8");

  return (
    <div className="prose mx-auto p-8">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}