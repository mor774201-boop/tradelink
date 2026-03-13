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
            const isLight = this.isLight();
            const bg = isLight ? '#ffffff' : '#0f172a';
            const border = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
            const text = isLight ? '#1e293b' : '#ffffff';
            const inputBg = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)';
            const lang = this.getLang();
            const dir = lang === 'ar' ? 'rtl' : 'ltr';

            const modalHTML = `
            <div class="modal fade" id="${this.modalId}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" dir="${dir}">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="background: ${bg}; border: 1px solid ${border}; border-radius: 16px; color: ${text};">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title w-100 text-center mt-3">${this.t('title')}</h5>
                            <button type="button" class="btn-close ${isLight ? '' : 'btn-close-white'}" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center p-4">
                            <div class="mb-4">
                                <i class="fas fa-shield-alt" style="font-size: 3rem; color: #ef4444; opacity: 0.8;"></i>
                            </div>
                            <p id="otp-message" style="font-size: 0.95rem; color: ${isLight ? '#64748b' : '#94a3b8'};">${this.t('message')}</p>
                            
                            <div class="d-flex justify-content-center gap-2 mb-4" id="otp-inputs" dir="ltr">
                                ${Array(6).fill(0).map(() => `<input type="text" class="form-control text-center otp-input" maxlength="1" style="width: 45px; height: 55px; font-size: 1.5rem; background: ${inputBg}; color: ${text}; border: 1px solid ${border};">`).join('')}
                            </div>

                            <button id="verify-otp-btn" class="btn btn-danger w-100 py-3 mb-3" style="border-radius: 12px; font-weight: 600;">${this.t('confirm')}</button>
                            
                            <div class="text-center">
                                <span style="font-size: 0.85rem; color: ${isLight ? '#94a3b8' : '#64748b'};">${this.t('resendTitle')} </span>
                                <a href="javascript:void(0)" id="resend-otp-link" class="text-danger small text-decoration-none fw-bold" style="font-size: 0.85rem;">${this.t('resendLink')}</a>
                            </div>
                            <div id="otp-error" class="mt-3 text-danger small" style="display: none;"></div>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            this.setupListeners();
        }
    },

    setupListeners() {
        const inputs = document.querySelectorAll('.otp-input');
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });

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
        
        document.querySelectorAll('.otp-input').forEach(i => i.value = '');
        document.getElementById('otp-error').style.display = 'none';
        
        const success = await this.resend(true); 
        if (success) {
            const modal = new bootstrap.Modal(document.getElementById(this.modalId));
            modal.show();
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
                        <div class="mt-2 p-2 rounded" style="background: rgba(239, 68, 68, 0.1); border: 1px dashed #ef4444; color: #fca5a5;">
                            <b>${this.t('debugMode')}</b> ${this.t('debugInfo')} <b>${j.otp_debug}</b>
                        </div>`;
                    }
                    console.log(`%c[TradeLink OTP DEBUG] Code: ${j.otp_debug}`, 'color: #ef4444; font-weight: bold; font-size: 14px;');
                }

                if (j.otp_debug && typeof toast === 'function') {
                    toast(`${this.t('debugMode')} ${j.otp_debug}`, 'info');
                } else if (!silent) {
                    const msg = this.t('sentSuccess');
                    if (typeof toast === 'function') {
                        toast(msg);
                    } else {
                        alert(msg);
                    }
                }
                return true;
            } else {
                const errorMsg = j.error || this.t('errorWrong');
                if (!silent) {
                    if (typeof toast === 'function') {
                        toast(errorMsg, 'error');
                    } else {
                        alert(errorMsg);
                    }
                }
                return false;
            }
        } catch (e) {
            console.error('OTP Request Error:', e);
            if (!silent) alert(this.t('errorServer'));
            return false;
        }
    },

    async verify() {
        const code = Array.from(document.querySelectorAll('.otp-input')).map(i => i.value).join('');
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

