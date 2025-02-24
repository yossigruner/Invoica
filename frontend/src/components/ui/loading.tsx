import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface LoadingProps {
  message?: string;
}

export const Loading = ({ message = "Loading..." }: LoadingProps) => {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 90) {
          return prevProgress;
        }
        const diff = Math.random() * 10;
        return Math.min(prevProgress + diff, 90);
      });
    }, 500);

    return () => { clearInterval(timer); };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Progress value={progress} className="w-[60%] max-w-md" />
      <p className="text-gray-500">{message}</p>
    </div>
  );
}; 