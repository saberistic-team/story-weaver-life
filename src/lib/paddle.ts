const clientToken = import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"];

type PaddleCheckoutOptions = {
  items: Array<{ priceId: string; quantity: number }>;
  customer?: { email?: string };
  customData?: Record<string, string>;
  settings?: {
    displayMode?: string;
    successUrl?: string;
    allowLogout?: boolean;
    variant?: string;
  };
};

type PaddleSdk = {
  Environment: { set: (env: string) => void };
  Initialize: (opts: { token: string }) => void;
  Checkout: { open: (opts: PaddleCheckoutOptions) => void };
};

declare global {
  interface Window {
    Paddle?: PaddleSdk;
  }
}



export function getPaddleEnvironment(): "sandbox" | "live" {
  return clientToken?.startsWith("test_") ? "sandbox" : "live";
}

let paddleInitialized = false;

export async function initializePaddle() {
  if (paddleInitialized) return;

  if (!clientToken) {
    throw new Error("VITE_PAYMENTS_CLIENT_TOKEN is not set");
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      const paddle = window.Paddle;
      if (!paddle) {
        reject(new Error("Paddle.js failed to load"));
        return;
      }
      const paddleJsEnvironment = getPaddleEnvironment() === "sandbox" ? "sandbox" : "production";
      paddle.Environment.set(paddleJsEnvironment);
      paddle.Initialize({ token: clientToken });
      paddleInitialized = true;
      resolve();
    };

    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function getPaddlePriceId(priceId: string): Promise<string> {
  const environment = getPaddleEnvironment();
  const { resolvePaddlePrice } = await import("@/utils/payments.functions");
  return resolvePaddlePrice({ data: { priceId, environment } });
}
