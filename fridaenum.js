if (Java.available || ObjC.available) {
    console.log("[*] Starting multi-feature Frida pentesting script...");

    // === Dynamic Class and Method Enumeration (iOS & Android) ===
    function enumerateClassesAndMethods() {
        if (Java.available) {
            Java.perform(function () {
                console.log("[*] Enumerating Android classes...");
                Java.enumerateLoadedClasses({
                    onMatch: function (className) {
                        if (className.includes("com.yourapp")) {
                            console.log("[+] Found class: " + className);
                            try {
                                var methods = Java.use(className).class.getDeclaredMethods();
                                for (var i in methods) {
                                    console.log("  [*] Method: " + methods[i]);
                                }
                            } catch (err) {
                                console.log("  [!] Error: " + err);
                            }
                        }
                    },
                    onComplete: function () {
                        console.log("[*] Finished Android class enumeration.");
                    }
                });
            });
        } else if (ObjC.available) {
            console.log("[*] Enumerating iOS classes...");
            var classes = ObjC.enumerateLoadedClassesSync();
            for (var clsName in classes) {
                if (clsName.includes("YourApp")) {
                    console.log("[+] Found class: " + clsName);
                    var methods = ObjC.classes[clsName].$methods;
                    methods.forEach(function (methodName) {
                        console.log("  [*] Method: " + methodName);
                    });
                }
            }
            console.log("[*] Finished iOS class enumeration.");
        }
    }

    // === Hook Function Calls and Manipulate Return Values (iOS & Android) ===
    function hookAndManipulate() {
        if (Java.available) {
            Java.perform(function () {
                // Example: Hooking Android login function and manipulating credentials
                var LoginClass = Java.use("com.yourapp.LoginActivity");
                LoginClass.login.overload("java.lang.String", "java.lang.String").implementation = function (username, password) {
                    console.log("[*] Intercepted login attempt");
                    console.log("  [*] Username: " + username);
                    console.log("  [*] Password: " + password);

                    // Modify credentials for testing
                    var modifiedUsername = "admin";
                    var modifiedPassword = "password123";
                    console.log("[*] Modifying login credentials...");
                    return this.login(modifiedUsername, modifiedPassword);
                };
            });
        } else if (ObjC.available) {
            // Example: Hooking iOS login method and manipulating credentials
            var LoginClass = ObjC.classes.LoginController;
            Interceptor.attach(LoginClass["- loginWithUsername:password:"].implementation, {
                onEnter: function (args) {
                    console.log("[*] Intercepted iOS login attempt");
                    var username = ObjC.Object(args[2]);
                    var password = ObjC.Object(args[3]);
                    console.log("  [*] Username: " + username);
                    console.log("  [*] Password: " + password);

                    // Modify credentials for testing
                    var modifiedUsername = ObjC.classes.NSString.stringWithString_("admin");
                    var modifiedPassword = ObjC.classes.NSString.stringWithString_("password123");
                    args[2] = modifiedUsername;
                    args[3] = modifiedPassword;
                }
            });
        }
    }

    // === Intercept and Modify Network Traffic (iOS & Android) ===
    function interceptNetworkTraffic() {
        if (Java.available) {
            Java.perform(function () {
                // Intercepting OkHttpClient requests
                var OkHttpClient = Java.use("okhttp3.OkHttpClient");
                OkHttpClient.newCall.implementation = function (request) {
                    console.log("[*] Intercepted OkHttp request");
                    var url = request.url().toString();
                    console.log("  [*] URL: " + url);

                    // Log headers
                    var headers = request.headers();
                    for (var i = 0; i < headers.size(); i++) {
                        console.log("  [*] Header: " + headers.name(i) + ": " + headers.value(i));
                    }

                    // Modify request
                    var modifiedRequest = request.newBuilder()
                        .url("https://example.com") // Change URL for testing
                        .build();
                    console.log("[*] Modified request URL");

                    return this.newCall(modifiedRequest);
                };
            });
        } else if (ObjC.available) {
            // Intercepting iOS NSURLSession requests
            var NSURLSession = ObjC.classes.NSURLSession;
            Interceptor.attach(NSURLSession["- dataTaskWithRequest:completionHandler:"].implementation, {
                onEnter: function (args) {
                    console.log("[*] Intercepted NSURLSession request");
                    var request = ObjC.Object(args[2]);
                    console.log("  [*] URL: " + request.URL().absoluteString());

                    // Log headers
                    var headers = request.allHTTPHeaderFields();
                    console.log("  [*] Headers: " + headers);

                    // Modify request URL
                    var modifiedURL = ObjC.classes.NSURL.URLWithString_("https://example.com");
                    request.setURL_(modifiedURL);
                    console.log("[*] Modified request URL");
                }
            });
        }
    }

    // === Dynamic Secret/Token Capture (iOS & Android) ===
    function captureSecrets() {
        if (Java.available) {
            Java.perform(function () {
                var SharedPreferences = Java.use("android.content.SharedPreferences");
                var Editor = Java.use("android.content.SharedPreferences$Editor");

                // Hook SharedPreferences getString method
                SharedPreferences.getString.overload("java.lang.String", "java.lang.String").implementation = function (key, defValue) {
                    var result = this.getString(key, defValue);
                    console.log("[*] Captured SharedPreferences key: " + key + ", value: " + result);
                    return result;
                };

                // Hook SharedPreferences$Editor putString method
                Editor.putString.overload("java.lang.String", "java.lang.String").implementation = function (key, value) {
                    console.log("[*] Intercepted SharedPreferences set: key = " + key + ", value = " + value);
                    return this.putString(key, value);
                };
            });
        } else if (ObjC.available) {
            // Hook NSUserDefaults get/set methods
            var NSUserDefaults = ObjC.classes.NSUserDefaults;
            Interceptor.attach(NSUserDefaults["- stringForKey:"].implementation, {
                onLeave: function (retval) {
                    console.log("[*] Captured NSUserDefaults key, value: " + retval);
                }
            });

            Interceptor.attach(NSUserDefaults["- setObject:forKey:"].implementation, {
                onEnter: function (args) {
                    console.log("[*] Intercepted NSUserDefaults set: key = " + ObjC.Object(args[3]) + ", value = " + ObjC.Object(args[2]));
                }
            });
        }
    }

    // === Execute Functions Based on User Input ===
    console.log("[*] Available actions: 1) Enumerate Classes & Methods, 2) Hook & Manipulate, 3) Intercept Network, 4) Capture Secrets");
    rpc.exports = {
        runAction: function (action) {
            switch (action) {
                case "1":
                    enumerateClassesAndMethods();
                    break;
                case "2":
                    hookAndManipulate();
                    break;
                case "3":
                    interceptNetworkTraffic();
                    break;
                case "4":
                    captureSecrets();
                    break;
                default:
                    console.log("[!] Invalid action.");
            }
        }
    };

    console.log("[*] Multi-feature Frida pentesting script ready.");
} else {
    console.error("[-] Neither Java nor ObjC is available!");
}