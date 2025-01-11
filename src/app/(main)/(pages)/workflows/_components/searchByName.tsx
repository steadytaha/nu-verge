import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { onGetWorkflowsByName } from "../_actions/workflow-connections";
import { Input } from "@/components/ui/input";

type Props = {
  onClick: (id: string) => void;
};

export default function SearchByName({ onClick }: Props) {
  const [searchResult, setSearchResult] = useState<
    {
      name: string;
      id: string;
      nodes: string | null;
      edges: string | null;
      discordTemplate: string | null;
      notionTemplate: string | null;
      slackTemplate: string | null;
      slackChannels: string[];
      userId: string;
    }[]
  >([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Loader state
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setSearchResult([]);
      setIsOpen(false);
      return;
    }

    setLoading(true); // Start loading
    const res = await onGetWorkflowsByName(value);
    setSearchResult(res || []);
    setIsOpen(true);
    setLoading(false); // Stop loading
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="flex items-center justify-center rounded-full bg-muted px-4 relative"
      ref={containerRef}
    >
      <Search className="mr-2 text-gray-500" />
      <Input
        value={query}
        placeholder="Search workflows..."
        onChange={(e) => handleSearch(e.target.value)}
        className="flex-1"
      />
      {isOpen && (
        <ul className="flex flex-col gap-2 absolute bg-background/50 backdrop-blur-lg p-2 rounded-md top-full mt-2 left-0 w-full max-h-48 overflow-auto shadow-lg z-50">
          {loading ? ( // Show loader when loading
            <li className="text-center py-2">Loading...</li>
          ) : searchResult.length > 0 ? (
            searchResult.sort((a,b)=>a.name.localeCompare(b.name)).map((result) => (
              <li
                key={result.id}
                className="px-2 py-1 cursor-pointer hover:bg-muted rounded-md"
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                  onClick(result.id);
                }}
              >
                {result.name}
              </li>
            ))
          ) : (
            <li className="text-center py-2">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
}
