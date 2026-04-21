// src/entry-server.tsx
import { createRequestHandler } from "@tanstack/react-start/server";
import { router } from "./router";

export default {
  fetch: createRequestHandler({ router }),
};