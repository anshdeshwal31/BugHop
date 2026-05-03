import { Webhooks } from "@octokit/webhooks";

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET!,
});

const handleWebhook = async (req: any, res: any) => {
  const signature = req.headers["x-hub-signature-256"];
  const body = await req.text();

  if (!(await webhooks.verify(body, signature))) {
    res.status(401).send("Unauthorized");
    return;
  }

  // The rest of your logic here
};

//https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
