import { sendOtpEmail } from "@/lib/services/email";

export async function GET(request: Request) {
  try {
    const email = "mr.binod2049@gmail.com";
    const code = "123456";

    const success = await sendOtpEmail(email, code);

    return Response.json({
      status: success ? "success" : "failed",
      message: success ? "Email sent successfully" : "Email failed to send",
      email,
      code,
    });
  } catch (error) {
    return Response.json({
      status: "error",
      message: String(error),
    }, { status: 500 });
  }
}
