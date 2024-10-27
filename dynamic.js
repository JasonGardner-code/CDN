Java.perform(function () {
    console.log("[*] Starting dynamic Android bypass and interception script for Samsung Galaxy S22 on Android 13");

    // Get the current application context
    var activityThread = Java.use("android.app.ActivityThread");
    var appContext = activityThread.currentApplication().getApplicationContext();
    var packageName = appContext.getPackageName();
    
    console.log("[*] Target package name: " + packageName);

    // Function to find a specific class and method dynamically
    function findAndHook(className, methodName, callback) {
        try {
            var clazz = Java.use(className);
            if (clazz && clazz[methodName]) {
                clazz[methodName].implementation = callback(clazz[methodName]);
                console.log("[*] Hooked " + className + "." + methodName);
            } else {
                console.log("[!] Class or method not found: " + className + "." + methodName);
            }
        } catch (e) {
            console.log("[!] Error hooking " + className + "." + methodName + ": " + e);
        }
    }

    // === Bypass Integrity Checks ===
    findAndHook(packageName + ".security.IntegrityChecker", "checkIntegrity", function(original) {
        return function() {
            console.log("[*] Bypassing integrity check");
            return true; // Simulate integrity check as valid
        };
    });

    // === Bypass Google Play Integrity (GPI) Checks ===
    findAndHook(packageName + ".gpi.GPIClient", "getIntegrityToken", function(original) {
        return function() {
            console.log("[*] Intercepted GPI API call");

            // Create a modified response indicating integrity is valid
            var modifiedResponse = {
                "status": "VALID",
                "data": {
                    "integrity": "VALID",
                    "timestamp": Date.now(),
                    "appId": packageName,
                    "packageName": packageName
                }
            };

            console.log("[*] Returning modified GPI response");
            return JSON.stringify(modifiedResponse);
        };
    });

    // === Intercepting Network Calls ===
    findAndHook("okhttp3.OkHttpClient", "newCall", function(original) {
        return function(request) {
            console.log("[*] Intercepted network call: " + request.url().toString());
            return original.call(this, request); // Proceed with the original call
        };
    });

    // === Fake Device Information ===
    var Build = Java.use("android.os.Build");
    Build.MODEL.value = "Samsung Galaxy S22";
    Build.MANUFACTURER.value = "Samsung";
    Build.VERSION.RELEASE.value = "13";

    // === Hook for Secure Settings ===
    findAndHook("android.provider.Settings$Secure", "getString", function(original) {
        return function(contentResolver, name) {
            console.log("[*] Intercepted Settings.Secure.getString for key: " + name);
            if (name === "ANDROID_ID") {
                return "1234567890abcdef"; // Fake Android ID
            }
            return original.call(this, contentResolver, name);
        };
    });

    // === Bypass App Tamper Detection ===
    findAndHook(packageName + ".security.AppIntegrity", "isAppTampered", function(original) {
        return function() {
            console.log("[*] Bypassing app tamper detection");
            return false; // Indicate no tampering
        };
    });

    console.log("[*] Dynamic Android bypass and interception script setup complete");
});
