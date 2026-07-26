const fs = require('fs');
let content = fs.readFileSync('src/components/JoinTheBand.tsx', 'utf-8');

// Replace public_souls fallback
content = content.replace(
`            name: data.name || "Real Coven Soul",
            title: data.title || "Arcane Practitioner",
            avatarSigil: data.avatarSigil || "bg-purple-950/80 border-purple-500 text-purple-300",
            avatarImage: data.avatarImage,
            bio: data.bio || "Registered real soul seeking coven members.",
            compatibility: data.compatibility || 95,
            favoriteGenre: data.favoriteGenre || "Dark Fantasy & Horror",
            streamingAccounts: data.streamingAccounts || ["Netflix"],`,
`            name: data.name || "Unknown Soul",
            title: data.title || "",
            avatarSigil: data.avatarSigil || "bg-gray-800 border-gray-600 text-gray-400",
            avatarImage: data.avatarImage,
            bio: data.bio || "",
            compatibility: data.compatibility || 0,
            favoriteGenre: data.favoriteGenre || "",
            streamingAccounts: data.streamingAccounts || [],`
);

// Replace default band name
content = content.replace(
`    return {
      id: "band-coven-1",
      name: "The Obsidian Covenant",
      sigilColor: "#d4af37",
      members: [],
      maxMembers: 10,
      createdDate: new Date().toLocaleDateString()
    };`,
`    return {
      id: "band-coven-1",
      name: "My Coven",
      sigilColor: "#d4af37",
      members: [],
      maxMembers: 10,
      createdDate: new Date().toLocaleDateString()
    };`
);

// Replace default bio when publishing my profile
content = content.replace(
`      bio: myProfileBio.trim() || "Real necromancer active in the Nigromancy Covenant.",`,
`      bio: myProfileBio.trim(),`
);

fs.writeFileSync('src/components/JoinTheBand.tsx', content);
