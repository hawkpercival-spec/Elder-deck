import re

with open('src/components/JoinTheBand.tsx', 'r') as f:
    content = f.read()

# Pattern to find the whole showAddCandidateModal block
pattern = re.compile(r'\{showAddCandidateModal && \(\s*<div.*?\{/\* INVITE MEMBER BY EMAIL MODAL \*/\}', re.DOTALL)

replacement = """{showAddCandidateModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#181310] border border-emerald-500/80 rounded-lg w-full max-w-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <h3 className="font-serif text-sm font-bold text-emerald-200 uppercase tracking-wider">
                    AI 2-Day Soul Match Selection
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddCandidateModal(false)}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="font-serif text-xs text-[#c5b396] leading-relaxed">
                Out of all published user profiles in the Coven directory, the AI algorithm pairs each user with four matched souls every two days (48 hours)! Publish thy soul profile to enter the selection process.
              </p>
              
              <div className="space-y-4 mt-2">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      handlePerformAiSelection();
                    }}
                    className="px-3 py-1.5 bg-emerald-950/40 text-emerald-300 font-serif text-xs uppercase tracking-wider font-bold border border-emerald-500/50 rounded flex items-center space-x-1.5 cursor-pointer hover:bg-emerald-900 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Algorithm</span>
                  </button>
                </div>
                {aiSelectedDailySouls.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiSelectedDailySouls.map((soul) => (
                      <div key={soul.id} className="p-3 bg-black/60 border border-emerald-500/30 rounded flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded shadow-md shrink-0 border border-white/10 flex items-center justify-center text-lg ${soul.avatarSigil || 'bg-gray-800'}`}>
                          {soul.avatarImage ? (
                            <img src={soul.avatarImage} alt={soul.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <span>{soul.necromanticAvatarIcon || "🔮"}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-serif text-xs font-bold text-[#f1e5ac] truncate">{soul.name}</h5>
                          <span className="font-mono text-[9px] text-[#c5b396] block truncate">{soul.title}</span>
                          <p className="font-sans text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                            {soul.bio}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddAiSelectedSoul(soul)}
                          className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-500/50 hover:bg-emerald-600 flex items-center justify-center text-emerald-300 hover:text-white transition-colors cursor-pointer shrink-0"
                          title="Add Soul to Daily Candidates"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500 text-xs font-serif uppercase tracking-wider border border-white/5 rounded">
                    No souls found in the public coven registry.
                  </div>
                )}
                {aiSelectedDailySouls.length > 0 && (
                  <div className="pt-2 border-t border-emerald-500/20">
                    <button
                      onClick={handleAddAllAiSelectedSouls}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-serif font-bold uppercase tracking-widest rounded transition-colors shadow-lg cursor-pointer"
                    >
                      Add All {aiSelectedDailySouls.length} AI Matches to Candidates
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* INVITE MEMBER BY EMAIL MODAL */}"""

content = pattern.sub(replacement, content)

with open('src/components/JoinTheBand.tsx', 'w') as f:
    f.write(content)

