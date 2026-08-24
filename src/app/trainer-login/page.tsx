"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrainerLoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}
