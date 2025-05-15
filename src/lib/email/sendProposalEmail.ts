import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY); // ✅ runs server-side

export async function sendProposalEmail({ to, first_name, proposal_1, proposal_2, proposal_3 }: {
  to: string;
  first_name: string;
  proposal_1: string;
  proposal_2: string;
  proposal_3: string;
}) {
 
    const html = `
   <div style="background-color: #f4f4f5; padding: 32px; font-family: Arial, sans-serif;">
  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 10px; overflow: hidden;">
    <tr>
      <td style="padding: 24px 32px;">
        <h2 style="margin: 0 0 12px; font-size: 22px; color: #1f2937;">Hi ${first_name},</h2>
        <p style="margin: 0 0 16px; font-size: 16px; color: #4b5563;">
          We’ve found <strong style="color: #67b9cd;">3 Property Management companies</strong> that match your property listing.
        </p>

        <ul style="padding-left: 20px; margin: 0 0 16px; color: #4b5563;">
          <li>${proposal_1}</li>
          <li>${proposal_2}</li>
          <li>${proposal_3}</li>
        </ul>

        <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563;">
          Review them and let us know which you'd like to move forward with. We’re here to help!
        </p>

        <a href="https://www.hostswitch.com/" 
           style="display: inline-block; padding: 12px 24px; background-color: #ef999a; color: white; font-weight: 600; text-decoration: none; border-radius: 6px;">
          View Proposals (coming soon..)
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 32px; background-color: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af;">
        Sent by Host Switch 
    `;


  return await resend.emails.send({
    from: "noreply@syncworkflow.com",
    to,
    subject: `${first_name} – 3 picks for your property`,
    html,
  });
}
