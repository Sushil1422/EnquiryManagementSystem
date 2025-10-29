export const isElectron = (): boolean => {
  return !!(
    typeof window !== "undefined" &&
    (window as any).electronAPI &&
    (window as any).process?.versions?.electron
  );
};
