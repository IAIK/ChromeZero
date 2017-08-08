var _addEventListener = window.addEventListener;

function nullEvent(type, event) {
    if (type === "deviceorientation") {
        window._policy = true;
        Object.defineProperty(event, 'alpha', { value: 0 });
        Object.defineProperty(event, 'beta', { value: 0 });
        Object.defineProperty(event, 'gamma', { value: 0 });
    } else if(type === "devicemotion") {
        window._policy = true;
        Object.defineProperty(event.rotationRate, 'alpha', { value: 0 });
        Object.defineProperty(event.rotationRate, 'beta', { value: 0 });
        Object.defineProperty(event.rotationRate, 'gamma', { value: 0 });
        Object.defineProperty(event.acceleration, 'x', { value: 0 });
        Object.defineProperty(event.acceleration, 'y', { value: 0 });
        Object.defineProperty(event.acceleration, 'z', { value: 0 });
    } else if(type === "devicelight") {
        window._policy = true;
        Object.defineProperty(event, 'value', { value: 0 });
    }

    return event;
}

function addEventListener(type, handler, useCapture) {
    _addEventListener(type, function(event) {
        event = nullEvent(type, event);
        handler(event);
    }, useCapture);
}

window.addEventListener = addEventListener;
