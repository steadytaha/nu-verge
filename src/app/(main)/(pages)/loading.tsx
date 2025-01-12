import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 w-screen h-screen z-50">
      <Loader className="animate-spin" size={40} />
    </div>
  );
}