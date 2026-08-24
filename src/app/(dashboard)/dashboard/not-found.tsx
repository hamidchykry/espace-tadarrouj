import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-5 bg-muted rounded-full">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-xl font-bold">الصفحة غير موجودة</h2>
          <p className="text-muted-foreground">
            الصفحة المطلوبة غير موجودة في لوحة التحكم.
          </p>
        </div>
        <Link href="/dashboard">
          <Button>
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للوحة القيادة
          </Button>
        </Link>
      </div>
    </div>
  );
}
