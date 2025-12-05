import * as React from 'react';

export default function Email_Template({vin , email, carModel}) {
  const paymentLink = "https://pay.paddle.io/hsc_01k34catt2jk8687d4myd9c1nw_7nacyast8w4bwcs65b81ep50f0ysnpj3";

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', color: '#333' }}>
      <h2 style={{ color: '#111' }}>Payment Pending</h2>
      <p>
        We have received your order for the <strong>VinXtract Report</strong>, but we have not yet received your payment.
        Kindly complete the payment so that we can process and send your report without any delay.
      </p>
      <p>You can complete your payment using the link below:</p>
      {/* <p>VIN : {vin}</p>
      <p>Email : {email}</p>
      <p>CarModel : {carModel}</p> */}
      <p>
        <a
          href={paymentLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '10px 16px',
            backgroundColor: '#16a34a',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          🔗 Complete Payment
        </a>
      </p>
      {/* <p><a href={paymentLink}>{paymentLink}</a></p> */}
      <p style={{ fontWeight: 'bold' }}>
        If you have already paid, please ignore this message.
      </p>
      <p>
        If you face any issues while making the payment, please let us know, and we will be happy to assist you.
      </p>
      <p>Thank you for your prompt attention.</p>
      <p>Best regards,<br/>VinXtract Team</p>
    </div>
  );
}
