let frameId = null;

window.addEventListener("message", function(event) {
    if (!event.data.type || "setFrameId" !== event.data.type) {
        return;
    }

    try {
        if (frameId === null) {
            frameId = event.data.frameId;
            return;
        }

        if ("needsSolving" !== event.data.status && "solving" !== event.data.status) {
            return;
        }

        if (document.querySelector('#recaptcha-anchor[aria-checked="true"]')) {
            window.parent.parent.postMessage({
                type: "setCaptchaStatus",
                frameId,
                status: "solved"
            }, "*");
            return;
        }

        if (document.querySelector('#recaptcha-anchor[aria-checked="false"]')) {
            window.parent.parent.postMessage({
                type: "setCaptchaStatus",
                frameId,
                status: "solving"
            }, "*");
        }
    } catch (error) {
        console.error(error);
    }
});
