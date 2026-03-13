import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

export async function requestOTP(req: Request, res: Response, next: NextFunction) {
    try {
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ success: false, error: "user_id مطلوب" });

        const user = await User.findByPk(user_id);
        if (!user) return res.status(404).json({ success: false, error: "المستخدم غير موجود" });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 5); // 5 minutes expiry

        await user.update({ 
            otp_code: otp, 
            otp_expiry: expiry 
        });

        // Send SMS via configured provider
        const provider = process.env.SMS_PROVIDER || 'none';
        let smsSent = false;
        let smsError = null;

        if (provider !== 'none') {
            try {
                if (!user.phone) throw new Error("رقم الهاتف غير مسجل لهذا المستخدم");
                smsSent = await sendSMS(user.phone, `TradeLink OTP: ${otp}`);
            } catch (err: any) {
                smsError = err.message;
                console.error(`[SMS ERROR] ${err.message}`);
            }
        }

        console.log(`[OTP DEBUG] To: ${user.phone}, Code: ${otp}, Provider: ${provider}, Sent: ${smsSent}`);

        res.json({ 
            success: true, 
            message: smsSent ? "تم إرسال رمز التحقق إلى هاتفك المسجل" : "تم إنشاء رمز التحقق (لم يتم الإرسال عبر SMS)",
            sms_sent: smsSent,
            sms_error: smsError,
            // Always return OTP if not in production for easier testing
            otp_debug: process.env.NODE_ENV !== 'production' ? otp : undefined
        });
    } catch (err) { next(err); }
}

async function sendSMS(to: string, message: string): Promise<boolean> {
    const provider = process.env.SMS_PROVIDER;
    
    if (provider === 'smsmisr') {
        const username = process.env.SMSMISR_USERNAME;
        const password = process.env.SMSMISR_PASSWORD;
        const sender = process.env.SMSMISR_SENDER;
        
        const url = `https://smsmisr.com/api/v2/send.aspx?username=${username}&password=${password}&language=2&sender=${sender}&mobile=${to}&message=${encodeURIComponent(message)}`;
        
        const response = await fetch(url, { method: 'POST' });
        const result: any = await response.json();
        // SMS Misr returns { code: "1901", ... } for success
        return result.code === "1901" || result.status === "success";
    } 
    
    if (provider === 'twilio') {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;
        const from = process.env.TWILIO_PHONE_NUMBER;
        
        const auth = Buffer.from(`${sid}:${token}`).toString('base64');
        const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                To: to,
                From: from as string,
                Body: message
            })
        });
        
        const result: any = await response.json();
        return response.ok && result.sid ? true : false;
    }

    return false;
}

export async function verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
        const { user_id, code } = req.body;
        if (!user_id || !code) return res.status(400).json({ success: false, error: "بيانات ناقصة" });

        const user = await User.findByPk(user_id);
        if (!user) return res.status(404).json({ success: false, error: "المستخدم غير موجود" });

        if (!user.otp_code || !user.otp_expiry || new Date() > new Date(user.otp_expiry)) {
            return res.status(400).json({ success: false, error: "رمز التحقق انتهت صلاحيته أو غير موجود" });
        }

        if (user.otp_code === code) {
            // Success - clear OTP so it can't be used again
            await user.update({ 
                otp_code: null, 
                otp_expiry: null,
                is_phone_verified: true
            });
            res.json({ success: true, message: "تم التحقق بنجاح" });
        } else {
            res.status(400).json({ success: false, error: "رمز التحقق غير صحيح" });
        }
    } catch (err) { next(err); }
}
