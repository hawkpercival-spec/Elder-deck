const fs = require('fs');
let content = fs.readFileSync('src/components/JoinTheBand.tsx', 'utf-8');

// Replace Add Real Candidate button and modal contents
content = content.replace(
`  // Form state for manually adding a real soul candidate
  const [addCandName, setAddCandName] = useState("");
  const [addCandTitle, setAddCandTitle] = useState("");
  const [addCandBio, setAddCandBio] = useState("");
  const [addCandSigil, setAddCandSigil] = useState("bg-purple-950/80 border-purple-500 text-purple-300");
  const [addCandGenre, setAddCandGenre] = useState("Dark Fantasy & Horror");
  const [addCandStreaming, setAddCandStreaming] = useState<Array<"Netflix" | "HBO Max" | "Disney+" | "Prime Video">>(["Netflix"]);`,
`  // Manual addition removed as per constraints`
);

content = content.replace(/  const handleAddCandidate = async \(\) => \{[\s\S]*?setShowAddCandidateModal\(false\);\n  \};\n/m, '');

fs.writeFileSync('src/components/JoinTheBand.tsx', content);
