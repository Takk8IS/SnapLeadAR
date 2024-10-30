// /SnapLeadAR/src/services/analyticsService.js
class AnalyticsService {
    constructor() {
        this.enabled = process.env.NODE_ENV === "production";
        this.events = {
            FORM_SUBMIT: "form_submit",
            FORM_ERROR: "form_error",
            CAMERA_START: "camera_start",
            CAMERA_ERROR: "camera_error",
            LENS_APPLIED: "lens_applied",
            LENS_ERROR: "lens_error",
            SHEETS_SAVE: "sheets_save",
            SHEETS_ERROR: "sheets_error",
            LANGUAGE_CHANGE: "language_change",
        };
        this.sessionId = this.generateSessionId();
    }

    generateSessionId() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    trackEvent(eventName, eventData = {}) {
        if (!this.enabled) return;

        const event = {
            eventName,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            data: {
                ...eventData,
                url: window.location.href,
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            },
        };

        // Log events in development
        if (process.env.NODE_ENV === "development") {
            console.log("Analytics Event:", event);
        }

        // In production, you would send this to your analytics service
        if (process.env.NODE_ENV === "production") {
            this.sendToAnalyticsService(event);
        }
    }

    trackFormSubmit(formData) {
        this.trackEvent(this.events.FORM_SUBMIT, {
            formId: "lead-capture",
            hasName: !!formData.name,
            hasEmail: !!formData.email,
            hasColor: !!formData.favoriteColor,
        });
    }

    trackFormError(error) {
        this.trackEvent(this.events.FORM_ERROR, {
            errorType: error.type,
            errorMessage: error.message,
            formId: "lead-capture",
        });
    }

    trackCameraStart(deviceInfo) {
        this.trackEvent(this.events.CAMERA_START, {
            deviceId: deviceInfo.deviceId,
            facingMode: deviceInfo.facingMode,
            resolution: `${deviceInfo.width}x${deviceInfo.height}`,
        });
    }

    trackCameraError(error) {
        this.trackEvent(this.events.CAMERA_ERROR, {
            errorType: error.type,
            errorMessage: error.message,
        });
    }

    trackLensApplied(lensId) {
        this.trackEvent(this.events.LENS_APPLIED, {
            lensId,
            timestamp: new Date().toISOString(),
        });
    }

    trackLensError(error, lensId) {
        this.trackEvent(this.events.LENS_ERROR, {
            lensId,
            errorType: error.type,
            errorMessage: error.message,
        });
    }

    trackSheetsSave(success, details = {}) {
        this.trackEvent(this.events.SHEETS_SAVE, {
            success,
            ...details,
        });
    }

    trackSheetsError(error) {
        this.trackEvent(this.events.SHEETS_ERROR, {
            errorType: error.type,
            errorMessage: error.message,
        });
    }

    trackLanguageChange(fromLanguage, toLanguage) {
        this.trackEvent(this.events.LANGUAGE_CHANGE, {
            from: fromLanguage,
            to: toLanguage,
        });
    }

    // Método para enviar eventos para o serviço de analytics (implementação fictícia)
    async sendToAnalyticsService(event) {
        // Esta é uma implementação simulada
        // Na produção, você implementaria a integração real com seu serviço de analytics
        try {
            if (process.env.NODE_ENV === "production") {
                console.log("Analytics event sent:", event);
            }
        } catch (error) {
            console.error("Error sending analytics:", error);
        }
    }

    // Métodos auxiliares para processamento de dados
    sanitizeEventData(data) {
        const sanitized = {};
        Object.keys(data).forEach((key) => {
            // Remove dados sensíveis e valores undefined/null
            if (data[key] != null && !this.isSensitiveData(key)) {
                sanitized[key] = data[key];
            }
        });
        return sanitized;
    }

    isSensitiveData(key) {
        const sensitiveKeys = ["password", "token", "secret", "credential"];
        return sensitiveKeys.some((sensitive) =>
            key.toLowerCase().includes(sensitive),
        );
    }
}

// Criar e exportar uma instância singleton
const analyticsService = new AnalyticsService();
export default analyticsService;
