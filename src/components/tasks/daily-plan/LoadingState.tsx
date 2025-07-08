export function LoadingState() {
  return (
    <div className="text-center py-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">
        AI is analyzing your tasks and creating the optimal schedule...
      </p>
    </div>
  );
}