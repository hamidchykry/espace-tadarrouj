"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="p-6 bg-red-100 rounded-full">
                <AlertTriangle className="h-16 w-16 text-red-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-red-600">خطأ</h1>
              <h2 className="text-xl font-bold">حدث خطأ غير متوقع</h2>
              <p className="text-muted-foreground">
                {error.message || "عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى."}
              </p>
            </div>
            <Button onClick={reset} size="lg">
              <RefreshCcw className="ml-2 h-4 w-4" />
              المحاولة مرة أخرى
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
