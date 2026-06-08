declare const PracticeQuizPdfView: React.ComponentType<{
  source: number | { uri?: string; cache?: boolean };
  style?: object;
  onOpenExternal?: () => void;
}>;

export default PracticeQuizPdfView;
