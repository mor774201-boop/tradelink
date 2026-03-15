const OTPHandler = {
    modalId: 'otp-modal',
    verificationCallback: null,
    currentUserId: null,

    translations: {
        ar: {
            title: 'تأكيد العملية',
            message: 'يرجى إدخال رمز التحقق المكون من 6 أرقام المرسل إلى هاتفك.',
            confirm: 'تأكيد الرمز',
            resendTitle: 'لم يصلك الرمز؟',
            resendLink: 'إعادة الإرسال',
            verifying: 'جارٍ التحقق...',
            errorComplete: 'يرجى إدخال الرمز كاملاً',
            errorWrong: 'رمز التحقق غير صحيح',
            errorServer: 'فشل الاتصال بالخادم',
            sentSuccess: 'تم إرسال الرمز الجديد بنجاح',
            debugMode: 'وضع التجربة:',
            debugInfo: 'رمز التحقق هو',
            errorPhone: 'رقم الهاتف غير مسجل لهذا المستخدم'
        },
        en: {
            title: 'Confirm Operation',
            message: 'Please enter the 6-digit verification code sent to your phone.',
            confirm: 'Confirm Code',
            resendTitle: "Didn't receive the code?",
            resendLink: 'Resend',
            verifying: 'Verifying...',
            errorComplete: 'Please enter the complete code',
            errorWrong: 'Incorrect verification code',
            errorServer: 'Server connection failed',
            sentSuccess: 'New code sent successfully',
            debugMode: 'Debug Mode:',
            debugInfo: 'Verification code is',
            errorPhone: 'Phone number not registered for this user'
        }
    },

    getLang() {
        return localStorage.getItem('tl-lang') || 'ar';
    },

    t(key) {
        const lang = this.getLang();
        return this.translations[lang][key] || this.translations['ar'][key];
    },

    isLight() {
        return document.body.classList.contains('light-theme');
    },

    init() {
        if (!document.getElementById(this.modalId)) {
            const lang = this.getLang();
            const dir = lang === 'ar' ? 'rtl' : 'ltr';

            const modalHTML = `
            <div class="modal fade" id="${this.modalId}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" dir="${dir}">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title w-100 text-center mt-3" style="font-weight: 700;">${this.t('title')}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center p-4">
                            <div class="mb-4">
                                <div class="otp-icon-wrapper mb-3" style="width: 80px; height: 80px; background: rgba(239, 68, 68, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                                    <i class="fas fa-mobile-alt" style="font-size: 2.5rem; color: #ef4444;"></i>
                                </div>
                            </div>
                            <p id="otp-message" style="font-size: 0.95rem; margin-bottom: 25px;">${this.t('message')}</p>
                            
                            <div class="mb-4">
                                <input type="text" id="otp-single-input" class="form-control text-center" 
                                       maxlength="6" placeholder="------" 
                                       style="letter-spacing: 12px; font-size: 2rem; font-weight: 700; height: 70px; border-radius: 15px; background: var(--input-bg); color: var(--text-main); border: 2px solid var(--border-color);">
                            </div>

                            <button id="verify-otp-btn" class="btn btn-danger w-100 py-3 mb-3" style="border-radius: 12px; font-weight: 700; font-size: 1.1rem; background: linear-gradient(135deg, #ef4444, #dc2626); border: none; box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3); transition: all 0.3s;">${this.t('confirm')}</button>
                            
                            <div class="text-center mt-2">
                                <span class="text-muted" style="font-size: 0.9rem;">${this.t('resendTitle')} </span>
                                <a href="javascript:void(0)" id="resend-otp-link" class="text-danger text-decoration-none fw-bold" style="font-size: 0.9rem;">${this.t('resendLink')}</a>
                            </div>
                            <div id="otp-error" class="mt-3 text-danger small fw-bold" style="display: none; padding: 10px; background: rgba(239, 68, 68, 0.05); border-radius: 8px;"></div>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            this.setupListeners();
        }
    },

    setupListeners() {
        const input = document.getElementById('otp-single-input');
        if (input) {
            input.addEventListener('input', (e) => {
                // Only allow numbers
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (e.target.value.length === 6) {
                    this.verify();
                }
            });
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.verify();
            });
        }

        document.getElementById('verify-otp-btn').addEventListener('click', () => this.verify());
        document.getElementById('resend-otp-link').addEventListener('click', () => this.resend());
    },

    async show(userId, message, callback) {
        // Remove existing modal to re-init with correct language/theme
        const existing = document.getElementById(this.modalId);
        if (existing) {
            const m = bootstrap.Modal.getInstance(existing);
            if (m) m.dispose();
            existing.remove();
        }
        
        this.init();
        this.currentUserId = userId;
        this.verificationCallback = callback;
        if (message) document.getElementById('otp-message').innerText = message;
        
        const input = document.getElementById('otp-single-input');
        if (input) input.value = '';
        
        document.getElementById('otp-error').style.display = 'none';
        
        const success = await this.resend(true); 
        if (success) {
            const modal = new bootstrap.Modal(document.getElementById(this.modalId));
            modal.show();
            setTimeout(() => input?.focus(), 500);
        }
    },

    async resend(silent = false) {
        try {
            const r = await fetch('/api/otp/request', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ user_id: this.currentUserId })
            });
            const j = await r.json();
            if (j.success) {
                if (j.otp_debug) {
                    const msgEl = document.getElementById('otp-message');
                    if (msgEl) {
                        msgEl.innerHTML = `${this.t('message')}<br>
                        <div class="mt-3 p-2 rounded" style="background: rgba(239, 68, 68, 0.1); border: 1px dashed #ef4444; color: #ef4444; font-size: 0.85rem;">
                            <i class="fas fa-bug me-1"></i><b>${this.t('debugMode')}</b> ${this.t('debugInfo')} <b style="font-size: 1.1rem; letter-spacing: 2px;">${j.otp_debug}</b>
                        </div>`;
                    }
                    console.log(`%c[TradeLink OTP DEBUG] Code: ${j.otp_debug}`, 'color: #ef4444; font-weight: bold; font-size: 14px;');
                }

                if (j.otp_debug && typeof toast === 'function') {
                    toast(`${this.t('debugMode')} ${j.otp_debug}`, 'info');
                } else if (!silent) {
                    toast(this.t('sentSuccess'));
                }
                return true;
            } else {
                const errorMsg = j.error || this.t('errorWrong');
                if (!silent) toast(errorMsg, 'error');
                return false;
            }
        } catch (e) {
            console.error('OTP Request Error:', e);
            if (!silent) toast(this.t('errorServer'), 'error');
            return false;
        }
    },

    async verify() {
        const input = document.getElementById('otp-single-input');
        const code = input ? input.value : '';
        if (code.length < 6) {
            this.showError(this.t('errorComplete'));
            return;
        }

        const btn = document.getElementById('verify-otp-btn');
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${this.t('verifying')}`;

        try {
            const r = await fetch('/api/otp/verify', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ user_id: this.currentUserId, code })
            });
            const j = await r.json();
            if (j.success) {
                bootstrap.Modal.getInstance(document.getElementById(this.modalId)).hide();
                if (this.verificationCallback) this.verificationCallback();
            } else {
                this.showError(j.error || this.t('errorWrong'));
            }
        } catch (e) {
            this.showError(this.t('errorServer'));
        } finally {
            btn.disabled = false;
            btn.innerText = this.t('confirm');
        }
    },

    showError(msg) {
        const err = document.getElementById('otp-error');
        err.innerText = msg;
        err.style.display = 'block';
    }
};

