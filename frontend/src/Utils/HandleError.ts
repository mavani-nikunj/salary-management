"use client";

import { signOut } from "next-auth/react";
import { toast } from "@/Utils/toast";

const handleCommonErrors = (error: any) => {
  const errorMessage = error;
  if (errorMessage === "Unauthorized") {
    setTimeout(() => {
      toast.error("Token Expired");
      signOut();
    }, 1000);
  } else {
    console.error("An error occurred:", errorMessage);
    if (errorMessage) toast.error(errorMessage);
  }
};

export { handleCommonErrors };
