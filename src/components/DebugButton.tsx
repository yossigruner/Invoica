import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";

export const DebugButton = () => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => logger.downloadLogs()}
      className="fixed bottom-4 right-4 opacity-50 hover:opacity-100"
    >
      Download Logs
    </Button>
  );
}; 