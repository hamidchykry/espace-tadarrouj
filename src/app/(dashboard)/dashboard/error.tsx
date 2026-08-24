"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-5 bg-red-100 rounded-full">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">خطأ في لوحة التحكم</h2>
          <p className="text-muted-foreground text-sm">
            {error.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."}
          </p>
        </div>
        <Button onClick={reset}>
          <RefreshCcw className="ml-2 h-4 w-4" />
          المحاولة مرة أخرى
        </Button>
      </div>
    </div>
  );
}
