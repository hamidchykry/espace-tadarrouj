import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-6 bg-muted rounded-full">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-bold">الصفحة غير موجودة</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى عنوان آخر.
          </p>
        </div>
        <Link href="/">
          <Button size="lg">
            <Home className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
}
