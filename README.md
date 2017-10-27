# Chrome Zero

*Chrome Zero* is a Google Chrome extension to protect users from microarchitectural and side-channel attacks.

*ChromeZero* implements *JavaScript Zero*, a fine-grained policy-based system which allows to change the behavior of standard JavaScript interfaces and functions.
Using so-called policies, *Chrome Zero* enforces certain restrictions to a website to protect users from malicious JavaScript.
The policies allow to quickly adapt the permission system to protect against any newly discovered attack.

The following videos show two short demos of *Chrome Zero*.

The first video demonstrates an interrupt attack mounted from JavaScript. Without *Chrome Zero*, interrupts can be clearly seen in the trace. Enabling *Chrome Zero* prevents this microarchitectural side-channel attack such that an attacker cannot detect interrupts anymore.

![interrupt.js Demo](./_images/interruptjs.gif)

The second video demonstrates the user interaction of *Chrome Zero*. The website wants to access the battery status. Without *Chrome Zero*, the website has full access to this data. With *Chrome Zero* enabled, the user is asked whether the website is allowed to access this data.

![Battery API Demo](./_images/battery.gif)

# Prerequisites

*Chrome Zero* is a browser extension for **Google Chrome 49** and later.

We recommend the latest stable or beta release of Google Chrome, as it has the best support for the Proxy object.

# Installation

We provide a ready-to-use Chrome extension

To install, open Chrome, click on the menu (three dots at the top right corner) -> More tools -> Extensions.
Then, simply drag and drop the extension file (*chromezero.crx*) onto this page.

Alternatively, you can also load the unpacked extension by going to the extension page, activate the checkbox for "Developer mode" and select the *chromezero* folder using "Load unpacked extension..."

# Usage

After installation, *Chrome Zero* is disabled by default.
To enable *Chrome Zero*, click on the icon of the extension (right of the address bar).
In the popup which appears after the click, you can select a paranoia level (*JavaScript Zero* defines it as protection level):

## Paranoia levels

Requirement      | Off | Low         | Medium                   | High                    | Tin Foil Hat
---------------- | --- | ----------- | ------------------------ | ----------------------- | -------------------------
Memory addresses | -   | Buffer ASLR | Array preloading         | Non-deterministic array | Array index randomization
Accurate Timing  | -   | Ask         | Low-resolution timestamp | Fuzzy time              | Disable
Multithreading   | -   | -           | Message delay            | WebWorker polyfill      | Disable
Shared data      | -   | -           | Slow SharedArrayBuffer   | Disable                 | Disable
Sensor API       | -   | -           | Ask                      | Fixed value             | Disable

* **Off**: The extension is disabled, all JavaScript functions are enabled
* **Low**: Most features are enabled, but require permission from the user; the sensor API is allowed.
* **Medium**: Most features are enabled, user permission is required for sensors.
* **High**: Protects against all currently known microarchitectural and side-channel attacks.
* **Tin Foil Hat**: Same as **high**, but additionally blocks even more functions that we consider a danger to a user's security or privacy.


The paranoia level applies to every page which is opened *after* the level was changed. The current page will reload when changing the level.

# Limitations and TODOs

This is still a proof-of-concept implementation which is continuously updated. Some of the things we plan to add are

* Save settings per domain
* Allow users to create their own paranoia level by combining existing policies
* A central repository of policies, including an automatic update function
* Statistics to log which website uses which policy

As this is an ongoing project, we are happy if you submit bug reports and pull requests.
