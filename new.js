if (ObjC.available) {
    // === Hook UIDevice systemVersion ===
    var systemVersionHook = ObjC.classes.UIDevice["- systemVersion"];
    Interceptor.attach(systemVersionHook.implementation, {
        onLeave: function (retval) {
            // Change the iOS version to 17.1
            var fakeVersion = ObjC.classes.NSString.stringWithString_("17.1");
            retval.replace(fakeVersion);
            console.log("[*] Hooked systemVersion, set to 17.1");
        }
    });

    // === Hook UIDevice model ===
    var modelHook = ObjC.classes.UIDevice["- model"];
    Interceptor.attach(modelHook.implementation, {
        onLeave: function (retval) {
            // Change the device model to iPad10,1
            var fakeModel = ObjC.classes.NSString.stringWithString_("iPad10,1");
            retval.replace(fakeModel);
            console.log("[*] Hooked model, set to iPad10,1");
        }
    });

    // === Hook MGCopyAnswer if available ===
    var mgCopyAnswerPtr = Module.findExportByName(null, "MGCopyAnswer");
    if (mgCopyAnswerPtr !== null) {
        Interceptor.attach(mgCopyAnswerPtr, {
            onEnter: function (args) {
                this.key = args[0].readCString();
            },
            onLeave: function (retval) {
                if (this.key === "ProductType") {
                    var fakeModel = ObjC.classes.NSString.stringWithString_("iPad16");
                    retval.replace(fakeModel);
                    console.log("[*] Hooked MGCopyAnswer for ProductType, set to iPad16");
                } else if (this.key === "ProductVersion") {
                    var fakeVersion = ObjC.classes.NSString.stringWithString_("17.1");
                    retval.replace(fakeVersion);
                    console.log("[*] Hooked MGCopyAnswer for ProductVersion, set to 17.1");
                }
            }
        });
    }

    // === Hook open syscall to monitor access to SystemVersion.plist ===
    var openPtr = Module.findExportByName(null, "open");
    if (openPtr !== null) {
        Interceptor.attach(openPtr, {
            onEnter: function (args) {
                this.filePath = args[0].readCString();
            },
            onLeave: function (retval) {
                if (this.filePath && this.filePath.includes("SystemVersion.plist")) {
                    console.log("[+] SystemVersion.plist was opened.");
                }
            }
        });
    }

    // === Hook read syscall ===
    var readPtr = Module.findExportByName(null, "read");
    if (readPtr !== null) {
        Interceptor.attach(readPtr, {
            onEnter: function (args) {
                this.buf = args[1];
                this.len = args[2].toInt32();
            },
            onLeave: function (retval) {
                if (this.filePath && this.filePath.includes("SystemVersion.plist")) {
                    var data = Memory.readCString(this.buf, this.len);
                    console.log("[+] Read operation performed on SystemVersion.plist.");
                    console.log("[+] Data: " + data);
                }
            }
        });
    }

    // === Hook close syscall ===
    var closePtr = Module.findExportByName(null, "close");
    if (closePtr !== null) {
        Interceptor.attach(closePtr, {
            onEnter: function (args) {
                this.fd = args[0].toInt32();
            },
            onLeave: function (retval) {
                if (this.filePath && this.filePath.includes("SystemVersion.plist")) {
                    console.log("[+] SystemVersion.plist was closed.");
                }
            }
        });
    }
} else {
    console.error("[-] Objective-C runtime is not available!");
}