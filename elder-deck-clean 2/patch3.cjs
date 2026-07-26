const fs = require('fs');
let content = fs.readFileSync('src/components/JoinTheBand.tsx', 'utf-8');

// Strip out addCandidateTab entirely
content = content.replace(/const \[addCandidateTab[\s\S]*?;\n/g, '');

content = content.replace(/const \[addCandName[\s\S]*?;\n/g, '');
content = content.replace(/const \[addCandTitle[\s\S]*?;\n/g, '');
content = content.replace(/const \[addCandBio[\s\S]*?;\n/g, '');
content = content.replace(/const \[addCandGenre[\s\S]*?;\n/g, '');
content = content.replace(/const \[addCandSigil[\s\S]*?;\n/g, '');
content = content.replace(/const \[addCandStreaming[\s\S]*?;\n/g, '');

// Strip handleAddCandidate
content = content.replace(/  \/\/ Handle Adding a Real Soul Candidate[\s\S]*?setShowAddCandidateModal\(false\);\n  \};\n/g, '');

// Strip modal JSX section
content = content.replace(/              \{\/\* TAB NAVIGATION \*\/\}[\s\S]*?\{addCandidateTab === "manual" && \([\s\S]*?\}\)\}\n/g, '');

fs.writeFileSync('src/components/JoinTheBand.tsx', content);
