interface EmailTemplateProps {
  email: string
  resetLink: string
  expirationTime: string
}

export default function PasswordResetEmailTemplate({ email, resetLink, expirationTime }: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#4F46E5", fontSize: "28px", marginBottom: "10px" }}>Harmoni AI</h1>
        <p style={{ color: "#6B7280", fontSize: "16px" }}>Your AI therapist, always here to listen</p>
      </div>

      <div style={{ backgroundColor: "#F9FAFB", padding: "30px", borderRadius: "8px", marginBottom: "20px" }}>
        <h2 style={{ color: "#1F2937", fontSize: "24px", marginBottom: "20px" }}>Reset Your Password</h2>

        <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>Hello,</p>

        <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "1.5", marginBottom: "20px" }}>
          We received a request to reset the password for your Harmoni AI account associated with{" "}
          <strong>{email}</strong>.
        </p>

        <p style={{ color: "#4B5563", fontSize: "16px", lineHeight: "1.5", marginBottom: "30px" }}>
          Click the button below to reset your password:
        </p>

        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <a
            href={resetLink}
            style={{
              backgroundColor: "#4F46E5",
              color: "white",
              padding: "12px 24px",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              display: "inline-block",
            }}
          >
            Reset My Password
          </a>
        </div>

        <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: "1.5", marginBottom: "10px" }}>
          This link will expire in <strong>{expirationTime}</strong> for security reasons.
        </p>

        <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px" }}>
          If you can't click the button, copy and paste this link into your browser:
        </p>

        <p
          style={{
            color: "#4F46E5",
            fontSize: "14px",
            wordBreak: "break-all",
            backgroundColor: "#EEF2FF",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          {resetLink}
        </p>
      </div>

      <div style={{ backgroundColor: "#FEF3C7", padding: "20px", borderRadius: "6px", marginBottom: "20px" }}>
        <p style={{ color: "#92400E", fontSize: "14px", lineHeight: "1.5", margin: "0" }}>
          <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your
          account remains secure and no changes have been made.
        </p>
      </div>

      <div style={{ textAlign: "center", color: "#6B7280", fontSize: "12px", lineHeight: "1.5" }}>
        <p>Need help? Contact our support team at support@harmoni-ai.com</p>
        <p style={{ marginTop: "10px" }}>© 2024 Harmoni AI. All rights reserved.</p>
      </div>
    </div>
  )
}
