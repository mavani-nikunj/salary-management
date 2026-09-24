"use client";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { SessionProvider } from "next-auth/react";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";

function Provider({ children }: any) {
  return (
    <Suspense>
      <SessionProvider>
        <HeroUIProvider>
          <NextTopLoader
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            showSpinner={false}
            easing="ease"
            speed={200}
          />
          <ToastProvider
            placement="top-right"
            toastOffset={20}
            toastProps={{
              variant: "bordered",
            }}
          />
          {children}
        </HeroUIProvider>
      </SessionProvider>
    </Suspense>
  );
}
export default Provider;
