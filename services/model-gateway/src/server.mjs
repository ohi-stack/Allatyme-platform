import http from "node:http";

const port = Number(process.env.PORT || 4200);
const provider = process.env.MODEL_PROVIDER || "local";
const runtimeUrl = process.env.MODEL_RUNTIME_URL || "";

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return json(res, 200, {
      service: "model-gateway",
      status: "ok",
      provider,
      runtimeConfigured: Boolean(runtimeUrl),
    });
  }

  if (req.method === "GET" && req.url === "/v1/models") {
    return json(res, 200, {
      provider,
      models: [],
      note: "Model manifests are registered separately; large model weights are never stored in this repository.",
    });
  }

  if (req.method === "POST" && req.url === "/v1/inference") {
    if (!runtimeUrl) {
      return json(res, 503, {
        error: "model_runtime_not_configured",
        message: "Set MODEL_RUNTIME_URL before inference can be dispatched.",
      });
    }

    return json(res, 501, {
      error: "provider_adapter_not_implemented",
      provider,
      message: "Add the selected model-runtime adapter behind this gateway before enabling inference.",
    });
  }

  return json(res, 404, { error: "not_found" });
});

server.listen(port, () => {
  console.log(`model-gateway listening on :${port}`);
});
