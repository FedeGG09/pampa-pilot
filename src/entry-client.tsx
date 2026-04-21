// src/entry-client.tsx
import { StartClient } from "@tanstack/react-start";
import { router } from "./router";
import { hydrateRoot } from "react-dom/client";

hydrateRoot(document, <StartClient router={router} />);