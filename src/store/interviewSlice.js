import { create } from 'zustand';

const useInterviewStore = create((set) => ({
    interviews: [],
    activeInterview: null,

    setInterviews: (list) => set({ interviews: list }),
    setActiveInterview: (interview) => set({ activeInterview: interview }),
    addInterview: (interview) =>
        set((s) => ({ interviews: [interview, ...s.interviews] })),
    updateInterview: (id, updates) =>
        set((s) => ({
            interviews: s.interviews.map((i) => i.id === id ? { ...i, ...updates } : i),
        })),
    removeInterview: (id) =>
        set((s) => ({ interviews: s.interviews.filter((i) => i.id !== id) })),
    clear: () => set({ interviews: [], activeInterview: null }),
}));

export default useInterviewStore;
