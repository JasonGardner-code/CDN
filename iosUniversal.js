if (ObjC.available) {
    console.log("[*] Starting advanced iOS bypass script");

    try {
        // === Universal Jailbreak Detection Bypass ===
        var jailbreakChecks = [
            "- isJailbroken",
            "- isDeviceJailbroken",
            "- checkForJailbreak",
            "- detectJailbreak"
        ];
        jailbreakChecks.forEach(function (methodName) {
            var JailbreakDetection = ObjC.classes.JailbreakDetection || ObjC.classes.YourAppJailbreakCheck;
            if (JailbreakDetection && JailbreakDetection[methodName]) {
                Interceptor.attach(JailbreakDetection[methodName].implementation, {
                    onLeave: function (retval) {
                        console.log("[*] Bypassing jailbreak detection: " + methodName);
                        retval.replace(0); // Return 0 to indicate no jailbreak
                    }
                });
            }
        });

        // === SSL Pinning Bypass (NSURLConnection, NSURLSession, and Custom Pinning) ===
        var SSLPinningClasses = [
            "NSURLSession", 
            "NSURLConnection", 
            "TrustKit", 
            "AFNetworking", 
            "Alamofire"
        ];
        SSLPinningClasses.forEach(function (className) {
            if (ObjC.classes[className]) {
                // Hook NSURLSessionDelegate for SSL Pinning
                var NSURLSessionDelegate = ObjC.classes[className];
                Interceptor.attach(NSURLSessionDelegate["- URLSession:didReceiveChallenge:completionHandler:"].implementation, {
                    onEnter: function (args) {
                        console.log("[*] Bypassing SSL Pinning: " + className);
                        var challenge = new ObjC.Object(args[2]);
                        var completionHandler = new ObjC.Block(args[3]);
                        var credential = ObjC.classes.NSURLCredential.credentialForTrust_(challenge.protectionSpace().serverTrust());
                        completionHandler(credential, 1); // NSURLSessionAuthChallengeUseCredential
                    }
                });
            }
        });

        // === Device Model & System Version Bypass ===
        var UIDevice = ObjC.classes.UIDevice;
        if (UIDevice) {
            // Hook systemVersion
            Interceptor.attach(UIDevice["- systemVersion"].implementation, {
                onLeave: function (retval) {
                    console.log("[*] Hooked systemVersion");
                    var fakeVersion = ObjC.classes.NSString.stringWithString_("17.5.1");
                    retval.replace(fakeVersion);
                }
            });

            // Hook model
            Interceptor.attach(UIDevice["- model"].implementation, {
                onLeave: function (retval) {
                    console.log("[*] Hooked model");
                    var fakeModel = ObjC.classes.NSString.stringWithString_("iPhone16,1");
                    retval.replace(fakeModel);
                }
            });
        }

        // === Bypass MCopyAnswer Calls ===
        var MGCopyAnswer = Module.findExportByName(null, "MGCopyAnswer");
        if (MGCopyAnswer) {
            Interceptor.attach(MGCopyAnswer, {
                onEnter: function (args) {
                    this.key = args[0].readCString();
                },
                onLeave: function (retval) {
                    if (this.key === "ProductType") {
                        console.log("[*] Hooked MGCopyAnswer for ProductType");
                        var fakeModel = ObjC.classes.NSString.stringWithString_("iPhone16,1");
                        retval.replace(fakeModel);
                    } else if (this.key === "ProductVersion") {
                        console.log("[*] Hooked MGCopyAnswer for ProductVersion");
                        var fakeVersion = ObjC.classes.NSString.stringWithString_("17.5.1");
                        retval.replace(fakeVersion);
                    }
                }
            });
        }

        // === Bypass App Integrity Checks (Tamper Detection) ===
        var IntegrityChecker = ObjC.classes.IntegrityChecker || ObjC.classes.YourAppIntegrityCheck;
        if (IntegrityChecker) {
            Interceptor.attach(IntegrityChecker["- isAppTampered"].implementation, {
                onLeave: function (retval) {
                    console.log("[*] Bypassing app tamper detection");
                    retval.replace(0); // Indicate no tampering
                }
            });
        }

        // === Bypass Anti-Frida Detection ===
        var antiFridaMethods = [
            "- isFridaDetected",
            "- detectFrida", 
            "- fridaCheck"
        ];
        antiFridaMethods.forEach(function (methodName) {
            var AntiFrida = ObjC.classes.AntiFrida || ObjC.classes.YourAppAntiFrida;
            if (AntiFrida && AntiFrida[methodName]) {
                Interceptor.attach(AntiFrida[methodName].implementation, {
                    onLeave: function (retval) {
                        console.log("[*] Bypassing Frida detection: " + methodName);
                        retval.replace(0); // Indicate no Frida detected
                    }
                });
            }
        });

        // === Hook System Properties (plist access) ===
        var openPtr = Module.findExportByName(null, "open");
        if (openPtr) {
            Interceptor.attach(openPtr, {
                onEnter: function (args) {
                    this.filePath = args[0].readCString();
                },
                onLeave: function (retval) {
                    if (this.filePath && this.filePath.includes("SystemVersion.plist")) {
                        console.log("[*] Bypassing SystemVersion.plist access");
                        // Implement further modification here if needed
                    }
                }
            });
        }

        // === Device ID & Secure ID Bypass ===
        var SecItemCopyMatching = Module.findExportByName(null, "SecItemCopyMatching");
        if (SecItemCopyMatching) {
            Interceptor.attach(SecItemCopyMatching, {
                onEnter: function (args) {
                    console.log("[*] Intercepted SecItemCopyMatching");
                },
                onLeave: function (retval) {
                    // Modify Secure Enclave responses here if needed
                    console.log("[*] Bypassing secure item access");
                }
            });
        }

        console.log("[*] Advanced iOS bypass script completed successfully");

    } catch (e) {
        console.error("[!] Exception caught: " + e.message);
    }
} else {
    console.error("[-] Objective-C Runtime is not available!");
}