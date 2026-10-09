import type { AuthTokenPurpose } from '@prisma/client';

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Plain layout that renders in every mail client: one message, one button, the raw link as a fallback. */
function layout(greeting: string, body: string, action: string, link: string, footer: string): EmailContent['html'] {
  const url = escapeHtml(link);
  return `<!doctype html>
<html lang="vi">
<body style="margin:0;padding:24px;background:#F7F5F0;font-family:Arial,Helvetica,sans-serif;color:#1C1917">
  <table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#FDFBF7;border:1px solid #E8D8C8;border-radius:16px">
    <tr><td style="padding:32px">
      <p style="margin:0 0 8px;font-size:20px;font-weight:bold;color:#1A362B">WrapFit</p>
      <p style="margin:0 0 16px">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 24px;line-height:1.5">${escapeHtml(body)}</p>
      <p style="margin:0 0 24px"><a href="${url}" style="display:inline-block;padding:12px 24px;background:#1A362B;color:#FDFBF7;text-decoration:none;border-radius:999px">${escapeHtml(action)}</a></p>
      <p style="margin:0 0 8px;font-size:13px;color:#57534E">Nút không bấm được? Mở liên kết này:</p>
      <p style="margin:0 0 24px;font-size:13px;word-break:break-all"><a href="${url}" style="color:#1E56A0">${url}</a></p>
      <p style="margin:0;font-size:13px;color:#57534E">${escapeHtml(footer)}</p>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Someone registered with the address of an existing account: the owner learns it, the requester learns nothing. */
export function accountExistsEmail(name: string | null, loginUrl: string, forgotUrl: string): EmailContent {
  const greeting = name ? `Chào ${name},` : 'Chào bạn,';
  const body =
    'Vừa có người dùng email này để đăng ký WrapFit, nhưng email đã có tài khoản. Nếu là bạn, hãy đăng nhập; nếu quên mật khẩu, hãy đặt lại tại: ' +
    forgotUrl;
  const footer = 'Nếu không phải bạn, hãy bỏ qua email này: tài khoản của bạn không bị thay đổi.';
  return {
    subject: 'Email của bạn đã có tài khoản WrapFit',
    text: `${greeting}\n\n${body}\n\n${loginUrl}\n\n${footer}\n`,
    html: layout(greeting, body, 'Đăng nhập', loginUrl, footer),
  };
}

/** Message of `npm run mail:test`: checks delivery and spam placement with the real settings. */
export function testEmail(target: string, sentAt: Date, frontendUrl: string): EmailContent {
  const greeting = 'Chào bạn,';
  const body = `Đây là email thử của WrapFit, gửi qua ${target} lúc ${sentAt.toISOString()}. Nếu email này nằm trong hộp thư đến (không phải Spam), cấu hình gửi mail đã đúng.`;
  const footer = 'Email này chỉ dùng để kiểm tra cấu hình, không cần trả lời.';
  return {
    subject: 'WrapFit: email thử cấu hình',
    text: `${greeting}\n\n${body}\n\n${footer}\n`,
    html: layout(greeting, body, 'Mở WrapFit', frontendUrl, footer),
  };
}

/** Content of the email that carries a one-time link. `name` is the account's full name, if any. */
export function authEmail(purpose: AuthTokenPurpose, link: string, name: string | null): EmailContent {
  const greeting = name ? `Chào ${name},` : 'Chào bạn,';
  if (purpose === 'VERIFY_EMAIL') {
    const body = 'Cảm ơn bạn đã đăng ký WrapFit. Xác nhận địa chỉ email này để bắt đầu thiết kế hộp quà của bạn.';
    const footer = 'Liên kết có hiệu lực trong 24 giờ. Nếu bạn không đăng ký WrapFit, hãy bỏ qua email này.';
    return {
      subject: 'Xác nhận email WrapFit của bạn',
      text: `${greeting}\n\n${body}\n\n${link}\n\n${footer}\n`,
      html: layout(greeting, body, 'Xác nhận email', link, footer),
    };
  }
  if (purpose === 'COMPLETE_SIGNUP') {
    const body =
      'Email này vừa được dùng để đăng ký WrapFit nhưng tài khoản chưa được xác nhận. Đặt mật khẩu của bạn để hoàn tất đăng ký.';
    const footer =
      'Liên kết có hiệu lực trong 30 phút và chỉ dùng được một lần. Nếu bạn không đăng ký WrapFit, hãy bỏ qua email này: không ai đăng nhập được bằng địa chỉ của bạn khi chưa có liên kết này.';
    return {
      subject: 'Hoàn tất đăng ký WrapFit',
      text: `${greeting}\n\n${body}\n\n${link}\n\n${footer}\n`,
      html: layout(greeting, body, 'Đặt mật khẩu', link, footer),
    };
  }
  const body = 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản WrapFit gắn với email này.';
  const footer =
    'Liên kết có hiệu lực trong 30 phút và chỉ dùng được một lần. Nếu bạn không yêu cầu, hãy bỏ qua email này: mật khẩu hiện tại vẫn giữ nguyên.';
  return {
    subject: 'Đặt lại mật khẩu WrapFit',
    text: `${greeting}\n\n${body}\n\n${link}\n\n${footer}\n`,
    html: layout(greeting, body, 'Đặt mật khẩu mới', link, footer),
  };
}
