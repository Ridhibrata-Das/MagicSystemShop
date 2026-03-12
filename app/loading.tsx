export default function Loading() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mb-4"></div>
      <p className="text-gray-500 font-medium animate-pulse">Loading MagicSystem...</p>
    </div>
  );
}
