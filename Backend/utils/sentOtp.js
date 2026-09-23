const sentOtp = async (email, otp) => {
  try {
    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_SENDER_NAME,
            email: process.env.BREVO_SENDER_EMAIL,
          },

          to: [
            {
              email: email,
            },
          ],

          subject: "Shopara OTP Verification",

          htmlContent: `
            <div style="font-family: Arial; padding: 20px;">
              <h2>Shopara</h2>

              <p>Your OTP for verification is:</p>

              <h1 style="letter-spacing: 6px;">
                ${otp}
              </h1>

              <p>This OTP is valid for 10 minutes.</p>

              <p>
                If you did not request this OTP,
                please ignore this email.
              </p>
            </div>
          `,
        }),
      }
    );

    const data = await response.json();

    console.log("Brevo status:", response.status);
    console.log("Brevo response:", data);

    if (!response.ok) {
      console.error("Brevo Error:", data);
      return false;
    }

    console.log("OTP sent successfully");

    return true;

  } catch (error) {
    console.error("OTP sending error:", error);
    return false;
  }
};

// done
export default sentOtp;