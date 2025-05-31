import { atom } from 'jotai'

// Example atoms for demonstration
export const countAtom = atom(0)
export const nameAtom = atom('World')

// Derived atom example
export const greetingAtom = atom((get) => `Hello, ${get(nameAtom)}!`)

// Async atom example
export const asyncCountAtom = atom(
  (get) => get(countAtom),
  async (get, set, newValue: number) => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    set(countAtom, newValue)
  }
)
